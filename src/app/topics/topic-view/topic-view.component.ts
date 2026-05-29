import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Topic } from 'src/app/core/model/Topic';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicService } from '../topicsService.service';
import { TopicContent } from 'src/app/core/model/Topic-content';
import { TopicContentService } from '../TopicContentService.service';
import { Role } from 'src/app/enum/role.enum';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Subscription } from 'rxjs';
import { Question } from 'src/app/core/model/Question';
import { Wallet } from 'src/app/core/model/Wallet';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/users/user.service';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';

@Component({
  selector: 'app-topic-view',
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.css']
})
export class TopicViewComponent implements OnInit {

  topic: Topic = new Topic();
  showLoading: boolean = false;
  retryVisible: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  origem: string = '';
  topicId: string = '';
  subjectId: string = '';

  private subscriptions: Subscription[] = [];

  displayModalLogin: boolean = false;

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  displayModalQuestionsList: boolean = false;
  displayModalUpgradePlan: boolean = false;
  displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  displayModalSaveContent: boolean = false;
  topicContent: TopicContent = new TopicContent();
  topicContentFile!: File;

  showLesson: boolean = false;
  selectedContent!: TopicContent;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef | undefined;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  googleAuthReady = true;

  contentType = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'File', value: 'FILE' },
  ];


  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private topicService: TopicService,
    private topicContentService: TopicContentService,
    private walletService: WalletService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }


  ngOnInit(): void {
    this.title.setTitle('Topic view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const questionId = this.route.snapshot.params['id'];
    if (questionId) {
      this.findById(questionId);
    }
    this.scrollToTop();

    this.route.queryParams.subscribe(params => {
      this.origem = params['from'];
      this.subjectId = params['subjectId'];
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    if (this.origem === 'subjects' && this.subjectId) {
      this.router.navigate(['/subjects', this.subjectId]);
    } else {
      this.router.navigate(['/topics']);
    }
  }

  // Embaralhar a ordem
  shuffleQuestions(questions: Question[]): Question[] {
    return questions.sort(() => Math.random() - 0.5);
  }

  findById(id: string) {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.topicService.getTopicByTopicId(id, this.loggedUser.id).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (response) => {
        this.topic = response;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  retryGetTopic(): void {
    this.retryVisible = false;
    this.findById(this.route.snapshot.params['id']);
  }

  get editingContent() {
    return Boolean(this.topicContent.id)
  }

  saveContent() {
    if (this.editingContent) {
      this.updateContent()
    } else {
      this.addNewContent()
    }
  }

  updateContent() {
    if (this.topicContent.contentType === 'FILE') {
      this.topicContent.time = '0';
    }
    this.loadingMessage = "Atualizando o conteúdo";
    this.showLoading = true;
    this.topicContent.topic = this.topic;
    this.topicContentService.update(this.topicContent, this.topicContentFile).subscribe(
      response => {
        this.topicContent = response
        this.messageService.add({ severity: 'success', detail: 'Conteúdo actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewContent() {
    if (this.topicContent.contentType === 'FILE') {
      this.topicContent.time = '0';
    }
    this.loadingMessage = "Adicionando o conteúdo";
    this.showLoading = true;
    this.topicContent.topic = this.topic;
    this.topicContentService.save(this.topicContent, this.topicContentFile).subscribe(
      response => {
        this.topicContent = response
        this.messageService.add({ severity: 'success', detail: 'Conteúdo salvo com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onAddNewTopicContent(): void {
    this.topicContent = new TopicContent();
    this.displayModalSaveContent = true;
  }

  onUpdateTopicContent(content: TopicContent, file: File): void {
    this.topicContent = content;
    this.topicContent.contentType = content.contentType;
    this.topicContent.time = content.time;
    this.topicContent.topic = this.topic;
    this.topicContentFile = file;
    this.displayModalSaveContent = true;
  }

  onTopicContentFileSelected(event: any) {
    this.topicContentFile = event.target.files[0];
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

        if (errorResponse.status === 429) {
          this.sendErrorNotification("Você atingiu o limite de downloads. Tente novamente em instantes.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  onDownload(content: TopicContent) {
    this.download(content);
  }

  onPlayVideo(content: TopicContent) {
    this.playVideo(content);
  }

  playVideo(content: TopicContent): void {

    this.showLesson = true;
    this.selectedContent = content;

    // Verifique se a referência ao vídeo foi inicializada corretamente
    if (this.videoPlayer) {
      const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;

      // Forçar atualização do vídeo, redefinindo o `src` e recarregando
      videoElement.src = content.urlFile;
      videoElement.load();
      videoElement.play();
    }
  }

  confirmarExclusao(content: TopicContent): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(content);
      }
    });
  }

  excluir(content: TopicContent) {
    this.topicContentService.excluir(content.id).subscribe(() => {
      this.messageService.add({ severity: 'success', detail: 'Instituição excluída com sucesso!' })
      //this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  toggleTopicContentDropdown(content: TopicContent) {
    this.topic.contents.forEach(t => {
      if (t !== content) {
        t.isAdminMenuOpen = false;
      }
    });
    content.isAdminMenuOpen = !content.isAdminMenuOpen;
  }

  closeTopicContentDropdown(content: TopicContent) {
    content.isAdminMenuOpen = false;
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumTopic(topic: Topic): boolean {
    if (!topic.premium) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser();
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const planExpiresAt = this.loggedUser.planExpiresAt ? new Date(this.loggedUser.planExpiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !planExpiresAt || planExpiresAt <= new Date();
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
    try {
      const setupButton =
        await this.googleAuthService.initializeGoogleButton('google-signin-button');

      setupButton((credential) => this.handleGoogleCredential(credential));

      // só ativa o botão se tudo correr bem
      this.googleAuthReady = true;

    } catch (error) {
      this.googleAuthReady = false;

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

  onCloseLoginPopout() {
    this.displayModalLogin = false;
    document.body.classList.remove('no-scroll');
  }

  toggleDropdown(topic: Topic) {
    topic.isAdminMenuOpen = !topic.isAdminMenuOpen;
  }

  closeDropdown(topic: Topic) {
    topic.isAdminMenuOpen = false;
  }

  shareOnSocial(network: string, topicId: string): void {
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

  copyLink(topicId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link).then(() => {
      console.log(`Link do item ${topicId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
  }

  getCategoryValue(category: string) {
    switch (category) {
      case 'EXACT_SCIENCES':
        return 'Ciências Exatas';
      case 'HUMAN_SCIENCES':
        return 'Ciências Humanas';
      case 'LANGUAGES':
        return 'Línguas';
    }
    return '';
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

    this.loadingMessage = "Processando o pagamento";
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
