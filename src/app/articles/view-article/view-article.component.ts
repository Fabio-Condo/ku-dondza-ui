import { Component, OnInit } from '@angular/core';
import { Article } from 'src/app/core/model/Article';
import { User } from 'src/app/core/model/User';
import { ArticlesService } from '../articles.service';
import { LikeService } from 'src/app/likes/like.service';
import { UserService } from 'src/app/users/user.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-view-article',
  templateUrl: './view-article.component.html',
  styleUrls: ['./view-article.component.css']
})
export class ViewArticleComponent implements OnInit {

  article: Article = new Article();
  selectedArticle = new Article();
  showConfirmDialog: boolean = false;

  loggedUser: User = new User;

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente


  constructor(
    private articleService: ArticlesService,
    private likeService: LikeService,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const articleId = this.route.snapshot.params['id'];
    if (articleId) {
      this.findById(articleId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  findById(id: string) {

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
  
    this.articleService.getArticleByArticleId(id).subscribe(
      (response) => {
        this.article = response;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
        this.showLoading = false;
      }
    );
  }

  toggleLike(article: Article): void {
    article.showLoadingLike = true;
    this.likeService.toggleLike(article.id).subscribe(
      response => {
        article.likedByUser = !article.likedByUser;
        if (article.likedByUser) {
          article.numberOfLikes = article.numberOfLikes + 1;
        } else {
          article.numberOfLikes = article.numberOfLikes - 1;
        }
        article.showLoadingLike = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        article.showLoadingLike = false;
      }
    );
  }

  toggleSaveArticle(article: Article): void {
    article.showLoadingSave = true;
    console.log(this.loggedUser.id);
    console.log(article.id);
    this.userService.toggleSaveArticle(this.loggedUser.id, article.id).subscribe(
      response => {
        article.savedByUser = !article.savedByUser;
        article.showLoadingSave = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        article.showLoadingSave = false;
      }
    );
  }

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

  //onRemoveArticle(article: Article): void {
  //  this.showConfirmDialog = true;
  //  this.selectedArticle= article;
  //}

  //closeConfirmDialog() {
  //  this.showConfirmDialog = false;
  //}

  //confirmDialog(article: Article) {
  //  this.removeArticleFromSavedArticles(article);
  //  this.closeConfirmDialog();
  //}

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
