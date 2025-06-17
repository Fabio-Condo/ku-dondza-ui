import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OnlineCourseContent } from 'src/app/core/model/Online-course-content';
import { OnlineCoursesService } from '../OnlineCoursesService.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { OnlineCoursesContentService } from '../OnlineCoursesContentService.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { ModuleService } from '../module.service';
import { Module } from 'src/app/core/model/Module';
import { NgForm } from '@angular/forms';
import { Role } from 'src/app/enum/role.enum';
import { Course } from 'src/app/core/model/Course';
import { UserCourseService } from 'src/app/core/user-courses/UserCourseService';
import { UserCourse } from 'src/app/core/model/UserCourse';
import { UserCourseFilter } from 'src/app/core/interface/UserCourseFilter';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { HeaderType } from 'src/app/enum/header-type.enum';

@Component({
  selector: 'app-online-courses-content',
  templateUrl: './online-courses-content.component.html',
  styleUrls: ['./online-courses-content.component.css']
})
export class OnlineCoursesContentComponent implements OnInit {

  //expandedModule: number | null = 1;
  expandedModules: number[] = [];

  course: Course = new Course();
  onlineCourseContentList: OnlineCourseContent[] = [];
  courseContentFile!: File;

  userCourse: UserCourse = new UserCourse();

  modulo: Module = new Module();
  //modulos: Module[] = [];
  //listModulos: Module[] = [];

  onlineCourseContent: OnlineCourseContent = new OnlineCourseContent();
  onlineSelectedCourseContent: OnlineCourseContent = new OnlineCourseContent();
  showLesson: boolean = false;

  displayModalSaveContent: boolean = false;
  displayModalSaveModule: boolean = false;
  displayModalUpateRequirements: boolean = false;

  loadingMessage = "Carregando"; // Alterar dinamicamente

  totalRegistros: number = 0
  showLoading: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  loggedUser: User = new User;
  isUserLoggedIn: boolean = false;

  selectedOnlineCourse = new Course();

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;

  user = new User();
  activeLoginTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  //totalStudents: number = 0;

  students: User[] = [];
  totalRegistrosStudents: number = 0;

  isDropdownOpen: boolean = false;

  imagePath = './assets/images/feed-5.jpg';


  @ViewChild('tabela') grid: any;
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef | undefined;

  contentType = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'File', value: 'FILE' },
  ];

  filtroStudents: IUserFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  filterUserCourses: UserCourseFilter = {
    page: 0,
    itemsPerPage: 20,
    sort: 'id,asc',
  }

  activeTab: number = 1;

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private onlineCoursesService: OnlineCoursesService,
    private moduleService: ModuleService,
    private onlineCoursesContentService: OnlineCoursesContentService,
    private userService: UserService,
    private userCourseService: UserCourseService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const onlineCourseId = this.route.snapshot.params['id'];
    if (onlineCourseId) {
      this.getOnlineCourseByOnlineCourseId(onlineCourseId);
    }
    this.scrollToTop();
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  get editingContent() {
    return Boolean(this.onlineCourseContent.id)
  }

  get editingModule() {
    return Boolean(this.modulo.id)
  }

  saveContent() {
    if (this.editingContent) {
      this.updateContent()
    } else {
      this.addNewContent()
    }
  }

  saveModule() {
    if (this.editingModule) {
      this.updateModule()
    } else {
      this.addNewModule()
    }
  }

  updateContent() {
    this.loadingMessage = "Atualizando o conteúdo";
    this.showLoading = true;
    this.onlineCoursesContentService.update(this.onlineCourseContent, this.courseContentFile).subscribe(
      response => {
        this.onlineCourseContent = response
        this.messageService.add({ severity: 'success', detail: 'Courso actualizada com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewContent() {
    this.loadingMessage = "Adicionando o conteúdo";
    this.showLoading = true;
    this.onlineCoursesContentService.save(this.onlineCourseContent, this.courseContentFile).subscribe(
      response => {
        this.onlineCourseContent = response
        this.messageService.add({ severity: 'success', detail: 'Courso salva com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  updateModule() {
    this.loadingMessage = "Atualizando o módulo";
    this.showLoading = true;
    this.modulo.onlineCourse = this.course;
    this.moduleService.update(this.modulo).subscribe(
      response => {
        this.modulo = response
        this.messageService.add({ severity: 'success', detail: 'Module actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewModule() {
    this.loadingMessage = "Adicionando o módulo";
    this.showLoading = true;
    this.modulo.onlineCourse = this.course;
    this.moduleService.save(this.modulo).subscribe(
      response => {
        this.modulo = response
        this.messageService.add({ severity: 'success', detail: 'Module salvo com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onCourseContenFileSelected(event: any) {
    this.courseContentFile = event.target.files[0];
  }

  getOnlineCourseByOnlineCourseId(onlineCourseId: string) {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.onlineCoursesService.getOnlineCourseByOnlineCourseId(onlineCourseId, this.loggedUser.id).subscribe(
      (response) => {
        this.course = response;
        this.getStudentsByCourseId(this.course.id);
        if (this.course.modules.length > 0) {
          this.expandedModules = [this.course.modules[0].id];
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status == 400) { // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  onUpdateModule(modulo: Module): void {
    this.modulo = modulo;
    this.displayModalSaveModule = true;
  }

  onAddNewModule(): void {
    this.modulo = new Module();
    this.displayModalSaveModule = true;
  }

  onUpdateOnlineCourseContent(content: OnlineCourseContent, module: Module, file: File): void {
    this.onlineCourseContent = content;
    this.onlineCourseContent.contentType = content.contentType;
    this.onlineCourseContent.time = content.time;
    this.onlineCourseContent.module = module;
    this.courseContentFile = file;
    this.displayModalSaveContent = true;
  }

  onAddNewOnlineCourseContent(): void {
    this.onlineCourseContent = new OnlineCourseContent();
    this.displayModalSaveContent = true;
  }

  onSelectContent(content: OnlineCourseContent): void {
    this.showLesson = true;
    this.onlineSelectedCourseContent = content;

    // Verifique se a referência ao vídeo foi inicializada corretamente
    if (this.videoPlayer) {
      const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;

      // Forçar atualização do vídeo, redefinindo o `src` e recarregando
      videoElement.src = content.urlFile;
      videoElement.load();
      videoElement.play();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStudentsByCourseId(onlineCourseId: number): void {
    this.loadingMessage = "Buscando alunos"
    this.showLoading = true;
    this.filtroStudents.page++;
    this.userCourseService.getEnrolledUsersByCourseId(onlineCourseId, this.filtroStudents).subscribe(

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
    this.getStudentsByCourseId(this.course.id);
  }

  confirmarExclusao(content: OnlineCourseContent): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(content);
      }
    });
  }

  excluir(content: OnlineCourseContent) {
    this.onlineCoursesContentService.excluir(content.id).subscribe(() => {
      if (this.grid.first === 0) {
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Instituição excluída com sucesso!' })
      //this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onCourseSubscription(course: Course) {
    this.course = course;
    if (this.isUserLoggedIn) {
      this.toggleCourseSubscription(course);
    }

    if (!this.isUserLoggedIn) {
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  toggleCourseSubscription(course: Course): void {
    course.showLoadingSubscription = true;
    this.userCourse.course = course;
    this.userCourse.user = this.loggedUser;
    this.userCourseService.addCourseToUser(this.userCourse).subscribe(() => {
      course.currentUserSubscribed = true;
      course.showLoadingSubscription = false;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        course.showLoadingSubscription = false;
      }
    );
  }

  toggleMarkedContent(content: OnlineCourseContent): void {
    content.showLoadingMarked = true;
    this.userService.toggleMarkedContent(this.loggedUser.id, content.id).subscribe(
      response => {
        content.markedByUser = !content.markedByUser;
        content.showLoadingMarked = false;
      },
      (errorResponse: HttpErrorResponse) => {
        content.showLoadingMarked = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  download(content: OnlineCourseContent, filename: string): void {
    content.showLoadingDownload = true;
    this.onlineCoursesContentService.download(content.id, filename).subscribe((data: Blob) => {
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
    if (!this.course || !this.course.modules) {
      return 0;
    }

    return this.course.modules.reduce((total, module) => {
      return total + (module.contents ? module.contents.length : 0);
    }, 0);
  }

  getTotalVideos(): number {
    if (!this.course || !this.course.modules) {
      return 0;
    }

    return this.course.modules.reduce((total, module) => {
      const videoCount = module.contents?.filter(content => content.contentType === 'VIDEO').length || 0;
      return total + videoCount;
    }, 0);
  }

  isModuleExpanded(moduleId: number): boolean {
    return this.expandedModules.includes(moduleId);
  }

  expandAllModules(): void {
    this.expandedModules = this.course.modules.map(m => m.id);
  }

  collapseAllModules(): void {
    this.expandedModules = [];
  }

  areAllModulesExpanded(): boolean {
    return this.course?.modules?.every(module => this.expandedModules.includes(module.id));
  }

  toggleExpandCollapseAll(): void {
    if (this.areAllModulesExpanded()) {
      this.collapseAllModules();
    } else {
      this.expandAllModules();
    }
  }

  toggleModule(moduleId: number): void {
    const index = this.expandedModules.indexOf(moduleId);
    if (index > -1) {
      this.expandedModules.splice(index, 1); // Recolher
    } else {
      this.expandedModules.push(moduleId); // Expandir
    }
  }

  getVideoCount(module: any): number {
    if (!module || !module.contents) return 0;
    return module.contents.filter((content: any) => content.contentType === 'VIDEO').length;
  }

  getFileCount(module: any): number {
    if (!module || !module.contents) return 0;
    return module.contents.filter((content: any) => content.contentType === 'FILE').length;
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

        this.getOnlineCourseByOnlineCourseId(this.course.onlineCourseId);
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

        this.getOnlineCourseByOnlineCourseId(this.course.onlineCourseId);
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
          this.getOnlineCourseByOnlineCourseId(this.course.onlineCourseId);
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

  setActiveLoginTab(tabIndex: number) {
    this.activeLoginTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
