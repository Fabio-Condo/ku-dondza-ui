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
import { UserSubjectSubscriptionService } from 'src/app/subjects/user-subjects-subscription.service';
import { Subject } from 'src/app/core/model/Subject';
import { UserSubjectSubscription } from 'src/app/core/model/UserSubjectSubscription';

@Component({
  selector: 'app-topic-view',
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.css']
})
export class TopicViewComponent implements OnInit {

  topic: Topic = new Topic();
  showLoading: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;


  private subscriptions: Subscription[] = [];

  displayModalLogin: boolean = false;

  displayModalSaveContent: boolean = false;
  topicContent: TopicContent = new TopicContent();
  topicContentFile!: File;

  displayModalSubscriptionInfo: boolean = false;

  userSubjectSubscription: UserSubjectSubscription = new UserSubjectSubscription();

  showLesson: boolean = false;
  selectedContent!: TopicContent;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef | undefined;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  contentType = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'File', value: 'FILE' },
  ];


  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private topicService: TopicService,
    private topicContentService: TopicContentService,
    private userSubjectSubscriptionService: UserSubjectSubscriptionService,
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
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startQuestions() {

    // Embaralhar primeiro
    this.shuffleQuestions(this.topic.questions);

    this.router.navigate(['/questions', this.topic.questions[0].questionId], {
      queryParams: {
        from: 'topics',
        topicId: this.route.snapshot.paramMap.get('id')  // o ID do tópico atual
      }
    });
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

    this.topicService.getTopicByTopicId(id, this.loggedUser.id).subscribe(
      (response) => {
        this.topic = response;
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

  onSubjectSubscription() {
    this.toggleSubjectSubscription();
  }

  toggleSubjectSubscription(): void {
    this.topic.subject.showLoadingSubscription = true;
    this.userSubjectSubscription.subject = this.topic.subject;
    this.userSubjectSubscription.user = this.loggedUser;
    this.userSubjectSubscriptionService.addSubjectToUser(this.userSubjectSubscription).subscribe(() => {
      this.topic.subject.currentUserSubscribed = true;
      this.topic.subject.showLoadingSubscription = false;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.topic.subject.showLoadingSubscription = false;
      }
    );
  }

  download(content: TopicContent, filename: string): void {

    if (!this.topic.subject.currentUserSubscribed) {
      this.displayModalSubscriptionInfo = true;
      return;
    }

    content.showLoadingDownload = true;
    this.topicContentService.download(content.id, filename, this.loggedUser.id).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = filename;

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
          this.sendErrorNotification(errorResponse.error?.message || "Erro ao fazer o download.");
        }
      }
    );
  }

  onDownload(content: TopicContent, filename: string) {
    //this.selectedContent = content;
    if (this.isUserLoggedIn) {
      this.download(content, filename);
    }

    if (!this.isUserLoggedIn) {
      document.body.classList.add('no-scroll');
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  onPlayVideo(content: TopicContent) {
    //this.selectedContent = content;
    if (this.isUserLoggedIn) {
      this.playVideo(content);
    }

    if (!this.isUserLoggedIn) {
      document.body.classList.add('no-scroll');
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  playVideo(content: TopicContent): void {

    if (!this.topic.subject.currentUserSubscribed) {
      this.displayModalSubscriptionInfo = true;
      return;
    }

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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
