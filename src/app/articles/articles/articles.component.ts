import { Component, NgZone, OnInit } from '@angular/core';
import { Article } from 'src/app/core/model/Article';
import { User } from 'src/app/core/model/User';
import { ArticlesService } from '../articles.service';
import { LikeService } from 'src/app/likes/like.service';
import { UserService } from 'src/app/users/user.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Role } from 'src/app/enum/role.enum';
import { MessageService } from 'primeng/api';
import { ArticleFilter } from 'src/app/core/interface/ArticleFilter';
import { LikeFilter } from 'src/app/core/interface/LikeFilter';
import { Like } from 'src/app/core/model/Like';
import { IfStmt } from '@angular/compiler';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  articles: Article[] = [];
  totalRecords: number = 0;
  totalArticles: number = 0;
  showLoading: boolean = false;
  selectedArticle: Article = new Article();
  showConfirmDialog: boolean = false;
  showDeleteConfirmDialog: boolean = false;
  displayModalFilter: boolean = false;
  displayModalLikes: boolean = false;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;
  imagePath = './assets/images/funcao do grau 2.png';

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  action: string = 'Like'; // Like ou Save ou ViewLikes

  loadingMessage = "Carregando"; // Alterar dinamicamente

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  selectArticleOption: string = 'ALL_ARTICLES';

  articleFilterOptions = [
    { label: 'Mostrar todos artigos', value: 'ALL_ARTICLES' },
    { label: 'Mostrar artigos salvos', value: 'MY_SAVED_ARTICLES' },
  ];

  categoryTypes = [
    { label: 'Matemática', value: 'MATH' },
    { label: 'Ciência', value: 'SCIENCE' },
    { label: 'História', value: 'HISTORY' },
    { label: 'Língua', value: 'LANGUAGE' },
    { label: 'Tecnologia', value: 'TECHNOLOGY' },
  ];

  likes: Like[] = [];
  totalLikesRecord: number = 0;

  likeFilter: LikeFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  filter: ArticleFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,desc',
    title: '', // Filtro por título
  };

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private articleService: ArticlesService,
    private likeService: LikeService,
    private userService: UserService,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Articles page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll();
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  findAll(pagina: number = 0): void {

    if (this.selectArticleOption == 'MY_SAVED_ARTICLES') {
      this.filter.userId = this.loggedUser.id;
    }

    if (this.selectArticleOption == 'ALL_ARTICLES') {
      this.filter.userId = 0;
    }

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.articleService.findAll(this.filter, this.loggedUser.id).subscribe(
      (dados: IApiResponse<Article>) => {
        this.articles = dados.content
        this.totalRecords = dados.totalElements;
        if (this.totalArticles == 0) {
          this.totalArticles = dados.totalElements;
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  loadMore(page: number = 0): void {

    if (this.selectArticleOption == 'MY_SAVED_ARTICLES') {
      this.filter.userId = this.loggedUser.id;
    }

    if (this.selectArticleOption == 'ALL_ARTICLES') {
      this.filter.userId = 0;
    }

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.showLoading = true;
    this.filter.page++;

    this.articleService.findAll(this.filter, this.loggedUser.id).subscribe(
      (data: IApiResponse<Article>) => {
        this.articles = [...this.articles, ...data.content];

        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  get isLoadMoreDisabled(): boolean {
    return this.articles.length >= this.totalRecords && this.totalRecords > 0;
  }

  applyFilters(): void {
    this.filter.page = -1; // Reinicia a paginação
    this.articles = []; // Limpa a lista de artigos
    this.findAll(); // Carrega os artigos com os novos filtros
  }

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

  onDeleteArticle(article: Article): void {
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

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
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

  onSelectArticle(article: Article): void {
    this.selectedArticle = article;
    if (this.isUserLoggedIn) {
      this.displayModalLikes = true;
      this.selectedArticle = article;
      this.likes = [];
      this.likeFilter.page = -1; // Reinicia a paginação
      this.totalLikesRecord = 0; // Reinicia o total de likes
      this.getLikesByArticleId(article.id);
    }

    if (!this.isUserLoggedIn) {
      this.action = 'ViewLikes';
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  getLikesByArticleId(articleId: number): void {
    this.loadingMessage = "Buscando alunos..."
    this.showLoading = true;
    this.likeFilter.page++;
    this.likeService.findLikesByArticleId(articleId, this.likeFilter).subscribe(
      (dados: IApiResponse<Like>) => {
        this.likes = [...this.likes, ...dados.content];
        this.totalLikesRecord = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onShowMoreLikes(): void {
    this.getLikesByArticleId(this.selectedArticle.id);
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

  limparCampos() {
    this.filter.searchParam = "";
    this.filter.category = "";
    this.filter.page = 0;
    this.filter.itemsPerPage = 10;
    this.filter.sort = "id,desc";
    this.selectArticleOption = 'ALL_ARTICLES';
    this.findAll();
  }

  changePageSize(event: any): void {
    this.filter.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.findAll();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findAll();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findAll();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / this.filter.itemsPerPage);
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

        this.findAll();
        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
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

        this.findAll();
        this.showLoading = false;
        this.displayModalLogin = false; this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
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
          this.findAll();
          this.showLoading = false;
          this.displayModalLogin = false;
          document.body.classList.remove('no-scroll');
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