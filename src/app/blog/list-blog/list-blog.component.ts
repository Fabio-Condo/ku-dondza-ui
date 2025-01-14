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
import { SubjectsService } from 'src/app/core/subjects/subjects.service';

@Component({
  selector: 'app-list-blog',
  templateUrl: './list-blog.component.html',
  styleUrls: ['./list-blog.component.css']
})
export class ListBlogComponent implements OnInit {

  feeds: Blog[] = [];
  totalRecords: number = 0
  showLoading: boolean = false;
  selectedBlog = new Blog();
  showConfirmDialog: boolean = false;

  loggedUser: User = new User;

  subjects: any[] = [];


  filter: BlogFilter = {
    page: -1,
    itemsPerPage: 5,
    sort: 'id,desc',
  }

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
        this.feeds = [...this.feeds, ...data.content]; // Adicionar cada vez que se faz o load
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
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
        console.log(response)
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
    return this.subjectsService.findAll().subscribe(
      dados => {
        this.subjects = dados.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
