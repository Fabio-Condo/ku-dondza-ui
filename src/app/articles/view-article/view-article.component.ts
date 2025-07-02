import { Component, NgZone, OnInit } from '@angular/core';
import { Article } from 'src/app/core/model/Article';
import { User } from 'src/app/core/model/User';
import { ArticlesService } from '../articles.service';
import { LikeService } from 'src/app/likes/like.service';
import { UserService } from 'src/app/users/user.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

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
  isUserLoggedIn: boolean = false;

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  action: string = 'Like'; // Like ou Save ou ViewLikes


  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private articleService: ArticlesService,
    private likeService: LikeService,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private router: Router,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Article view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
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

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.articleService.getArticleByArticleId(id, this.loggedUser.id).subscribe(
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

  onLike(article: Article) {
    this.selectedArticle = article;
    if (this.isUserLoggedIn) {
      this.toggleLike(article);
    }

    if (!this.isUserLoggedIn) {
      this.action = 'Like';
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  toggleLike(article: Article): void {
    article.showLoadingLike = true;
    this.likeService.toggleLike(article.id, this.loggedUser.id).subscribe(
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

  onSave(article: Article) {
    this.selectedArticle = article;
    if (this.isUserLoggedIn) {
      this.toggleSaveArticle(article);
    }

    if (!this.isUserLoggedIn) {
      this.action = 'Save';
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  toggleSaveArticle(article: Article): void {
    article.showLoadingSave = true;
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

  sendOtp() {
    this.showLoading = true;
    //const email = this.otpForm.value.email!;
    this.authenticationService.generateOtp(this.user.email).subscribe({
      next: () => {
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  validateOtp() {
    this.showLoading = true;
    this.authenticationService.validateOtp(this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        if (this.action === 'Like') {
          this.toggleLike(this.selectedArticle)
        }
        if (this.action === 'Save') {
          this.toggleSaveArticle(this.selectedArticle);
        }
        this.showLoading = false;
        this.displayModalLogin = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  startRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.startRegistrationViaOtp(this.user.email).subscribe({
      next: (response) => {
        console.log(response.body)
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  completeRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.completeRegistrationViaOtp(this.user.fullName, this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        if (this.action === 'Like') {
          this.toggleLike(this.selectedArticle)
        }
        if (this.action === 'Save') {
          this.toggleSaveArticle(this.selectedArticle);
        }
        this.showLoading = false;
        this.displayModalLogin = false; this.showLoading = false;
        this.displayModalLogin = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  private async initializeGoogleAuth(): Promise<void> {
    try {
      const setupButton = await this.googleAuthService.initializeGoogleButton('google-signin-button');
      setupButton((credential) => this.handleGoogleCredential(credential));
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar autenticação Google',
        life: 5000
      });
    }
  }

  private handleGoogleCredential(googleCredential: string): void {
    this.ngZone.run(() => {
      this.loadingMessage = "Estamos quase lá";
      this.showLoading = true;
    });

    const sub = this.authenticationService.loginWithGoogle(googleCredential).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.ngZone.run(() => {
          this.findById(this.article.articleId);
          //  if (this.action === 'Like' && !this.article.likedByUser) {
          //    this.toggleLike(this.article)
          //  }
          //  if (this.action === 'Save' && !this.article.savedByUser) {
          //    this.toggleSaveArticle(this.article);
          //  }
          this.showLoading = false;
          this.displayModalLogin = false;
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
        this.showLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  getCategoryTypeLabel(type: string) {
    switch (type) {
      case 'MATH':
        return 'Matemática';
      case 'SCIENCE':
        return 'Ciência';
      case 'HISTORY':
        return 'História';
      case 'LANGUAGE':
        return 'Língua';
      case 'TECHNOLOGY':
        return 'Tecnologia';
    }
    return '';
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
