import { Component, OnInit } from '@angular/core';
import { Article } from 'src/app/core/model/Article';
import { User } from 'src/app/core/model/User';
import { ArticlesService } from '../articles.service';
import { LikeService } from 'src/app/likes/like.service';
import { UserService } from 'src/app/users/user.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { Role } from 'src/app/enum/role.enum';
import { MessageService } from 'primeng/api';
import { ArticleFilter } from 'src/app/core/interface/ArticleFilter';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  articles: Article[] = [];
  totalRecords: number = 0;
  showLoading: boolean = false;
  selectedArticle: Article =  new Article();
  showConfirmDialog: boolean = false;
  showDeleteConfirmDialog: boolean = false;

  loggedUser: User = new User();
  imagePath = './assets/images/funcao do grau 2.png';

  filter: ArticleFilter = {
    page: -1,
    itemsPerPage: 10,
    sort: 'id,desc',
    title: '', // Filtro por título
  };

  constructor(
    private articleService: ArticlesService,
    private likeService: LikeService,
    private userService: UserService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.loadMore();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMore(): void {
    this.showLoading = true;
    this.filter.page++;
    this.articleService.findAll(this.filter).subscribe(
      (data: IApiResponse<Article>) => {
        this.totalRecords = data.totalElements;
        this.showLoading = false;
        data.content.forEach(article => {
        //  this.checkIfLiked(article);
        //  this.checkIfSaved(article);
        });
        this.articles = [...this.articles, ...data.content]; // Adiciona novos artigos à lista existente
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  applyFilters(): void {
    this.filter.page = -1; // Reinicia a paginação
    this.articles = []; // Limpa a lista de artigos
    this.loadMore(); // Carrega os artigos com os novos filtros
  }

  //toggleLike(article: Article): void {
  //  this.likeService.toggleLike(article.id).subscribe(
  //    response => {
  //      article.isLiked = !article.isLiked;
  //      if (article.isLiked) {
  //        article.numberOfLikes = article.numberOfLikes + 1;
  //      } else {
  //        article.numberOfLikes = article.numberOfLikes - 1;
  //      }
  //    },
  //    (errorResponse: HttpErrorResponse) => {
  //      this.sendErrorNotification(errorResponse.error.message);
  //    }
  //  );
  //}

  //checkIfLiked(article: Article): void {
  //  this.likeService.checkIfLiked(article.id).subscribe(
  //    response => {
  //      article.isLiked = response;
  //    },
  //    (errorResponse: HttpErrorResponse) => {
  //      this.sendErrorNotification(errorResponse.error.message);
  //    }
  //  );
  //}

  //checkIfSaved(article: Article): void {
  //  this.userService.checkIfUserSavedArticle(this.loggedUser.id, article.id).subscribe(response => {
  //    article.isSaved = response;
  //  });
  //}

  //addArticleToSavedArticles(article: Article): void {
  //  this.userService.addArticleToSavedArticles(this.loggedUser.id, article.id).subscribe(() => {
  //    article.isSaved = true;
  //  });
  //}

  //removeArticleFromSavedArticles(article: Article): void {
  //  this.userService.removeArticleFromSavedArticles(this.loggedUser.id, article.id).subscribe(() => {
  //    article.isSaved = false;
  //  });
  //}

  onRemoveArticle(article: Article): void {
    this.showConfirmDialog = true;
    this.selectedArticle = article;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  //confirmDialog(article: Article) {
  //  this.removeArticleFromSavedArticles(article);
  //  this.closeConfirmDialog();
  //}

  deleteArticle(article: Article) {
    this.articleService.excluir(article.id!).subscribe(() => {
      this.articles = this.articles.filter(b => b.id !== article.id);
      this.messageService.add({ severity: 'success', detail: 'Article excluído com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onDeleteBArticle(article: Article): void {
    this.showDeleteConfirmDialog = true;
    this.selectedArticle = article;
  }

  closeDeleteConfirmDialog() {
    this.showDeleteConfirmDialog = false;
  }

  deleteConfirmDialog(article: Article) {
    this.deleteArticle(article);
    this.closeDeleteConfirmDialog();
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}