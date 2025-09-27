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

  displayModalSubscriptionInfo: boolean = false;

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

    if (!this.subject.currentUserSubscribed) {
      this.displayModalSubscriptionInfo = true;
      return;
    }

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

  download(content: TopicContent, filename: string): void {

    if (!this.subject.currentUserSubscribed) {
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

  startPractice(topic: any) {
    console.log('Iniciando exercícios do tópico:', topic.name);
    // Aqui você pode navegar para a página de exercícios ou abrir um modal
    // this.router.navigate(['/exercises', topic.id]);
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
