import { Component, NgZone, ElementRef, ViewChild } from '@angular/core';
import { SubjectsService } from '../subjects.service';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { TopicContent } from 'src/app/core/model/Topic-content';
import { TopicContentService } from 'src/app/topics/TopicContentService.service';
import { UserSubjectSubscription } from 'src/app/core/model/UserSubjectSubscription';
import { UserSubjectSubscriptionService } from '../user-subjects-subscription.service';
import { UserService } from 'src/app/users/user.service';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Question } from 'src/app/core/model/Question';
import { Topic } from 'src/app/core/model/Topic';
import { Wallet } from 'src/app/core/model/Wallet';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-subjects-view',
  templateUrl: './subjects-view.component.html',
  styleUrls: ['./subjects-view.component.css']
})
export class SubjectsViewComponent {

  subject: Subject = new Subject();
  showLoading: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  userSubjectSubscription: UserSubjectSubscription = new UserSubjectSubscription();

  showLesson: boolean = false;
  //selectedContent!: TopicContent;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef | undefined;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  expandedTopics: number[] = [];

  //onlineCourseContent: OnlineCourseContent = new OnlineCourseContent();
  selectedTopicContent: TopicContent = new TopicContent();
  //showLesson: boolean = false;

  private subscriptions: Subscription[] = [];

  displayModalLogin: boolean = false;

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  displayModalQuestionsList: boolean = false;
  displayModalUpgradePlan: boolean = false;
  displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  students: User[] = [];
  totalRegistrosStudents: number = 0;

  filtroStudents: IUserFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private subjectsService: SubjectsService,
    private walletService: WalletService,
    private userSubjectSubscriptionService: UserSubjectSubscriptionService,
    private topicContentService: TopicContentService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Subject view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const subjectId = this.route.snapshot.params['id'];
    if (subjectId) {
      this.getSubjectBySubjectId(subjectId);
    }
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getSubjectBySubjectId(subjectId: string) {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.subjectsService.getSubjectBySubjectId(subjectId, this.loggedUser.id).subscribe(
      (response) => {
        this.subject = response;
        if (this.subject.topics.length > 0) {
          this.expandedTopics = [this.subject.topics[0].id];
        }
        if (this.isUserLoggedIn && this.isSuperAdmin) {
          this.getStudentsBySubjectId(this.subject.id);
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  onPlayVideo(content: TopicContent) {
    this.playVideo(content);
  }

  playVideo(content: TopicContent): void {

    this.showLesson = true;
    this.selectedTopicContent = content;

    // Verifique se a referência ao vídeo foi inicializada corretamente
    if (this.videoPlayer) {
      const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;

      // Forçar atualização do vídeo, redefinindo o `src` e recarregando
      videoElement.src = content.urlFile;
      videoElement.load();
      videoElement.play();
    }
  }

  onSubjectSubscription(subject: Subject) {

    if (subject.currentUserSubscribed) {
      this.messageService.add({
        severity: 'info',
        summary: 'Já inscrito',
        detail: 'Você já está inscrito nesta disciplina.',
        life: 3000
      });
      return;
    }

    this.subject = subject;
    if (this.isUserLoggedIn) {
      this.toggleSubjectSubscription(subject);
    }

    if (!this.isUserLoggedIn) {
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  toggleSubjectSubscription(subject: Subject): void {
    subject.showLoadingSubscription = true;
    this.userSubjectSubscription.subject = subject;
    this.userSubjectSubscription.user = this.loggedUser;
    this.userSubjectSubscriptionService.addSubjectToUser(this.userSubjectSubscription).subscribe(() => {
      subject.currentUserSubscribed = true;
      subject.showLoadingSubscription = false;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        subject.showLoadingSubscription = false;
      }
    );
  }

  toggleMarkedContent(content: TopicContent): void {
    content.showLoadingMarked = true;
    this.userService.toggleMarkedTopicContent(this.loggedUser.id, content.id).subscribe(
      response => {
        content.markedByUser = !content.markedByUser;
        this.subject.currentUserMarkedContentRate = response.markedContentRate;
        content.showLoadingMarked = false;
      },
      (errorResponse: HttpErrorResponse) => {
        content.showLoadingMarked = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  onDownload(content: TopicContent) {
    this.download(content);
  }

  download(content: TopicContent): void {

    content.showLoadingDownload = true;
    this.topicContentService.download(content.id, content.fileName).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = content.fileName;

      // Simular um clique no link para iniciar o download
      link.click();

      // Limpar o link após o download iniciar
      window.URL.revokeObjectURL(link.href);
      //this.findAll(this.paginaAtual)
      content.showLoadingDownload = false;
    },
      (errorResponse: HttpErrorResponse) => {
        content.showLoadingDownload = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getTotalContents(): number {
    if (!this.subject || !this.subject.topics) {
      return 0;
    }

    return this.subject.topics.reduce((total, topic) => {
      return total + (topic.contents ? topic.contents.length : 0);
    }, 0);
  }

  getTotalVideos(): number {
    if (!this.subject || !this.subject.topics) {
      return 0;
    }

    return this.subject.topics.reduce((total, topic) => {
      const videoCount = topic.contents?.filter(topic => topic.contentType === 'VIDEO').length || 0;
      return total + videoCount;
    }, 0);
  }

  isTopicExpanded(topicId: number): boolean {
    return this.expandedTopics.includes(topicId);
  }

  expandAllTopics(): void {
    this.expandedTopics = this.subject.topics.map(t => t.id);
  }

  collapseAllTopics(): void {
    this.expandedTopics = [];
  }

  areAllTopicsExpanded(): boolean {
    return this.subject?.topics?.every(topic => this.expandedTopics.includes(topic.id));
  }

  toggleExpandCollapseAll(): void {
    if (this.areAllTopicsExpanded()) {
      this.collapseAllTopics();
    } else {
      this.expandAllTopics();
    }
  }

  toggleModule(topicId: number): void {
    const index = this.expandedTopics.indexOf(topicId);
    if (index > -1) {
      this.expandedTopics.splice(index, 1); // Recolher
    } else {
      this.expandedTopics.push(topicId); // Expandir
    }
  }

  getLimitedDescription(topic: any): string {
    const maxLength = 60;
    const isExpanded = this.isTopicExpanded(topic.id);

    if (isExpanded) return topic.description;

    if (!topic.description) return '';
    if (topic.description.length <= maxLength) return topic.description;

    // corta sem quebrar palavras
    const truncated = topic.description.substr(0, maxLength);
    return truncated.substr(0, truncated.lastIndexOf(' ')) + '...';
  }

  toggleDescription(event: Event, topic: any): void {
    event.preventDefault(); // evita reload da página
    topic.showFullDescription = !topic.showFullDescription;
  }

  goToTopic(topic: any): void {
    this.router.navigate(['/topics', topic.topicId], {
      queryParams: {
        from: 'subjects',
        subjectId: this.route.snapshot.paramMap.get('id')
      }
    });
  }

  // Embaralhar a ordem
  shuffleQuestions(questions: Question[]): Question[] {
    return questions.sort(() => Math.random() - 0.5);
  }

  getVideoCount(topic: any): number {
    if (!topic || !topic.contents) return 0;
    return topic.contents.filter((content: any) => content.contentType === 'VIDEO').length;
  }

  getFileCount(topic: any): number {
    if (!topic || !topic.contents) return 0;
    return topic.contents.filter((content: any) => content.contentType === 'FILE').length;
  }

  getStudentsBySubjectId(subjectId: number): void {
    this.loadingMessage = "Buscando alunos"
    this.showLoading = true;
    this.filtroStudents.page++;
    this.userSubjectSubscriptionService.getEnrolledUsersBySubjectId(subjectId, this.filtroStudents).subscribe(

      (dados: IApiResponse<User>) => {
        this.students = [...this.students, ...dados.content];
        this.totalRegistrosStudents = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onShowMoreStudents(): void {
    this.getStudentsBySubjectId(this.subject.id);
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumTopic(topic: Topic): boolean {
    if (!topic.premium) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser();
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const expiresAt = this.loggedUser.expiresAt ? new Date(this.loggedUser.expiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !expiresAt || expiresAt <= new Date();
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

  sendOtp() {
    this.showLoading = true;
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

        this.getSubjectBySubjectId(this.subject.subjectId);
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

        this.getSubjectBySubjectId(this.subject.subjectId);
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

  private async initializeGoogleAuth(): Promise<void> {

    if (this.isMobileWebView()) {
      console.log('Mobile WebView detected — Google Auth skipped.');
      return; // não inicializa SDK
    }

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
          this.getSubjectBySubjectId(this.subject.subjectId);
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

  public isMobileWebView(): boolean {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent) && this.isWebView();
  }

  public isWebView(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    // Android WebView ou iOS WKWebView
    return /wv|Android.*Version\/|iPhone.*AppleWebKit\/.*Mobile/i.test(userAgent);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  onCloseLoginPopout() {
    this.displayModalLogin = false;
    document.body.classList.remove('no-scroll');
  }

  toggleDropdown(subject: Subject) {
    subject.isAdminMenuOpen = !subject.isAdminMenuOpen;
  }

  closeDropdown(subject: Subject) {
    subject.isAdminMenuOpen = false;
  }

  shareOnSocial(network: string, subjectId: string): void {
    const baseUrl = window.location.href; // link do item
    let url = '';

    switch (network) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent('Olha isto: ' + baseUrl)}`;
        break;

      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;

      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank'); // abre numa nova aba
    }
  }

  copyLink(subjectId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link).then(() => {
      console.log(`Link do item ${subjectId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
  }

  getWalletsByUser(userId: number): void {
    this.loadingMessage = "Obtendo dados"
    this.showLoading = true;
    this.walletService.getWalletsByUser(userId).subscribe(
      (dados: Wallet[]) => {
        this.userWallets = dados;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewWlletType(walletTypeForm: NgForm) {

    //this.wallet.user = this.loggedUser;

    this.detectWalletType(); // força atualização e validação

    const phone = this.wallet.phoneNumber || '';

    if (!this.wallet.type) {
      this.sendErrorNotification("Número inválido: prefixo deve ser 84, 85, 86 ou 87.");
      return;
    }

    if (phone.length !== 9) {
      this.sendErrorNotification("Número inválido: deve conter exatamente 9 dígitos.");
      return;
    }

    // Evitar duplicados
    const exists = this.userWallets.some(
      w => w.phoneNumber === phone
    );

    if (exists) {
      this.sendErrorNotification("Este número já está registado nas suas carteiras.");
      return;
    }

    // Definir como default se for a primeira carteira
    if (this.userWallets.length === 0) {
      this.wallet.default = true;
    } else {
      this.wallet.default = false;
    }

    this.loadingMessage = "Adicionando carteira"
    this.showLoading = true;
    this.walletService.add(this.loggedUser.id, this.wallet).subscribe(
      (response) => {
        console.log(response);
        this.wallet = response;

        this.userWallets.push(this.wallet);
        this.showLoading = false;
        this.displayModalAddPaymentOption = false;
        //this.messageService.add({ severity: 'success', detail: 'Disciplina adicionada com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpgradePlan(): void {
    if (this.isUserLoggedIn) {
      //this.upgradePlan();
      this.openModalPaymentOptions();
      return;
    }

    this.displayModalLogin = true;
    setTimeout(() => {
      this.displayModalUpgradePlan = false;
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  upgradePlan() {
    // Se não tiver carteira selecionada, pega a default
    if (!this.selectedWalletId) {
      const defaultWallet = this.userWallets.find(w => w.default);
      if (defaultWallet) {
        this.selectedWalletId = defaultWallet.id!;
      } else {
        this.sendErrorNotification("Nenhuma carteira selecionada ou definida como principal.");
        return;
      }
    }

    this.loadingMessage = "Carregando dados";
    this.showLoading = true;

    this.userService.activatePlan(this.loggedUser.id, 'PREMIUM', this.selectedWalletId).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.onCloseUpgradeModal();
        this.onCloseModalPaymentOptions();
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  setDefaultWallet(wallet: Wallet) {

    if (!wallet.id) {
      this.sendErrorNotification('Carteira inválida: ID não definido');
      return;
    }

    this.userWallets.forEach(w => w.default = false); // limpa anterior
    wallet.default = true;

    this.walletService.setDefault(wallet.id).subscribe({
      next: (updatedWallet) => {
        // Atualiza visualmente todas as carteiras
        this.userWallets.forEach(w => w.default = w.id === updatedWallet.id);
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  openUpgradeModal() {
    this.displayModalUpgradePlan = true;
    document.body.classList.add('no-scroll');
  }

  onCloseUpgradeModal() {
    this.displayModalUpgradePlan = false;
    document.body.classList.remove('no-scroll');
  }

  openModalPaymentOptions() {

    if (this.userWallets.length === 0) {
      this.getWalletsByUser(this.loggedUser.id);
    }

    this.displayModalPaymentOptions = true;
    this.onCloseUpgradeModal();
    document.body.classList.add('no-scroll');
  }

  onCloseModalPaymentOptions() {
    this.displayModalPaymentOptions = false;
    document.body.classList.remove('no-scroll');
  }

  openModalAddPaymentOption() {
    this.displayModalAddPaymentOption = true;
  }

  onCloseModalAddPaymentOption() {
    this.displayModalAddPaymentOption = false;
  }

  detectWalletType(): void {
    const phone = this.wallet.phoneNumber ? this.wallet.phoneNumber.trim() : '';

    // Remove espaços e caracteres não numéricos
    const digitsOnly = phone.replace(/\D/g, '');

    // Define o telefone limpo
    this.wallet.phoneNumber = digitsOnly;

    // Validação do tamanho
    if (digitsOnly.length !== 9) {
      this.wallet.type = '';
      return;
    }

    // Verificação de prefixos válidos
    const prefix = digitsOnly.substring(0, 2);
    if (prefix === '84' || prefix === '85') {
      this.wallet.type = 'MPESA';
    } else if (prefix === '86' || prefix === '87') {
      this.wallet.type = 'EMOLA';
    } else {
      this.wallet.type = '';
    }
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
