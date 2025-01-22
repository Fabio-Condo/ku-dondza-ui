import { Component, OnInit } from '@angular/core';
import { BlogFilter } from 'src/app/core/interface/BlogFilter';
import { Blog } from 'src/app/core/model/Blog';
import { BlogService } from '../blog.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from 'src/app/core/model/User';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { BlogLikeService } from 'src/app/core/blog-likes/blog-like.service';
import { UserService } from 'src/app/users/user.service';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from 'src/app/subjects/subjects.service';

@Component({
  selector: 'app-list-blog',
  templateUrl: './list-blog.component.html',
  styleUrls: ['./list-blog.component.css']
})
export class ListBlogComponent implements OnInit {
  feeds: Blog[] = [];
  totalRecords: number = 0;
  showLoading: boolean = false;
  selectedBlog = new Blog();
  showConfirmDialog: boolean = false;
  showDeleteConfirmDialog: boolean = false;

  loggedUser: User = new User();
  subjects: Subject[] = [];
  imagePath = './assets/images/funcao do grau 2.png';

  filter: BlogFilter = {
    page: -1,
    itemsPerPage: 10,
    sort: 'id,desc',
    title: '', // Filtro por título
  };

  constructor(
    private blogService: BlogService,
    private blogLikeService: BlogLikeService,
    private subjectsService: SubjectsService,
    private userService: UserService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.loadMore();
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMore(): void {
    this.showLoading = true;
    this.filter.page++;
    this.blogService.findAll(this.filter).subscribe(
      (data: IApiResponse<Blog>) => {
        this.totalRecords = data.totalElements;
        this.showLoading = false;
        data.content.forEach(blog => {
          this.checkIfLiked(blog);
          this.checkIfSaved(blog);
        });
        this.feeds = [...this.feeds, ...data.content]; // Adiciona novos blogs à lista existente
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  applyFilters(): void {
    this.filter.page = -1; // Reinicia a paginação
    this.feeds = []; // Limpa a lista de blogs
    this.loadMore(); // Carrega os blogs com os novos filtros
  }

  toggleLike(blog: Blog): void {
    this.blogLikeService.toggleLike(blog.id).subscribe(
      response => {
        blog.isLiked = !blog.isLiked;
        if (blog.isLiked) {
          blog.numberOfLikes = blog.numberOfLikes + 1;
        } else {
          blog.numberOfLikes = blog.numberOfLikes - 1;
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  checkIfLiked(blog: Blog): void {
    this.blogLikeService.checkIfLiked(blog.id).subscribe(
      response => {
        blog.isLiked = response;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  checkIfSaved(blog: Blog): void {
    this.userService.checkIfUserSavedBlog(this.loggedUser.id, blog.id).subscribe(response => {
      blog.isSaved = response;
    });
  }

  addBlogToSavedBlogs(blog: Blog): void {
    this.userService.addBlogToSavedBlogs(this.loggedUser.id, blog.id).subscribe(() => {
      blog.isSaved = true;
    });
  }

  removeBlogFromSavedBlogs(blog: Blog): void {
    this.userService.removeBlogFromSavedBlogs(this.loggedUser.id, blog.id).subscribe(() => {
      blog.isSaved = false;
    });
  }

  onRemoveBlog(blog: Blog): void {
    this.showConfirmDialog = true;
    this.selectedBlog = blog;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(blog: Blog) {
    this.removeBlogFromSavedBlogs(blog);
    this.closeConfirmDialog();
  }

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  deleteBlog(blog: Blog) {
    this.blogService.excluir(blog.id!).subscribe(() => {
      this.feeds = this.feeds.filter(b => b.id !== blog.id);
      this.messageService.add({ severity: 'success', detail: 'Blog excluído com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onDeleteBlog(blog: Blog): void {
    this.showDeleteConfirmDialog = true;
    this.selectedBlog = blog;
  }

  closeDeleteConfirmDialog() {
    this.showDeleteConfirmDialog = false;
  }

  deleteConfirmDialog(blog: Blog) {
    this.deleteBlog(blog);
    this.closeDeleteConfirmDialog();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}