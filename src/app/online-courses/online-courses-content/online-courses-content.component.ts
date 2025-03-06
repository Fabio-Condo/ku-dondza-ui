import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OnlineCourse } from 'src/app/core/model/Online-course';
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
import { OnlineCourseRequirement } from 'src/app/core/model/OnlineCourseRequirement';
import { NgForm } from '@angular/forms';
import { Role } from 'src/app/enum/role.enum';

@Component({
  selector: 'app-online-courses-content',
  templateUrl: './online-courses-content.component.html',
  styleUrls: ['./online-courses-content.component.css']
})
export class OnlineCoursesContentComponent implements OnInit {

  course: OnlineCourse = new OnlineCourse();
  onlineCourseContentList: OnlineCourseContent[] = [];
  courseContentFile!: File;

  modulo: Module = new Module();
  modulos: Module[] = [];
  //listModulos: Module[] = [];

  onlineCourseContent: OnlineCourseContent = new OnlineCourseContent();
  onlineSelectedCourseContent: OnlineCourseContent = new OnlineCourseContent();
  showLesson: boolean = false;

  displayModalSaveContent: boolean = false;
  displayModalSaveModule: boolean = false;
  displayModalUpateRequirements: boolean = false;

  requirement?: OnlineCourseRequirement;
  requirements: Array<OnlineCourseRequirement> = [];
  requirementIndex?: number;
  showRequirementForm = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  totalRegistros: number = 0
  showLoading: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  loggedUser: User = new User;
  selectedOnlineCourse = new OnlineCourse();

  showConfirmDialog: boolean = false;

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

  activeTab: number = 1;

  constructor(
    private onlineCoursesService: OnlineCoursesService,
    private moduleService: ModuleService,
    private onlineCoursesContentService: OnlineCoursesContentService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
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
    this.showLoading = true;
    this.onlineCoursesContentService.save(this.onlineCourseContent, this.courseContentFile).subscribe(
      response => {
        this.onlineCourseContent = response
        this.messageService.add({ severity: 'success', detail: 'Courso salva com sucesso!' });
        this.showLoading = false;
        this.getModulesByCourseById(this.course.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  updateModule() {
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
    this.showLoading = true;
    this.modulo.onlineCourse = this.course;
    this.moduleService.save(this.modulo).subscribe(
      response => {
        this.modulo = response
        this.messageService.add({ severity: 'success', detail: 'Module salvo com sucesso!' });
        this.showLoading = false;
        this.getModulesByCourseById(this.course.id);
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
    this.loadingMessage = "Gerrando questões..."
    this.showLoading = true;

    this.onlineCoursesService.getOnlineCourseByOnlineCourseId(onlineCourseId).subscribe(
      (response) => {
        this.course = response;
        this.getModulesByCourseById(this.course.id);
        this.getStudentsByCourseId(this.course.id);
        this.checkIfSubscribed(this.course);
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

  onUpdateRequirements(): void {
    this.displayModalUpateRequirements = true;
  }

  //Requirements
  openAddNewRequirementModal() {
    this.showRequirementForm = true;
    this.requirement = new OnlineCourseRequirement();
    this.requirementIndex = this.course.requirements.length;
  }

  confirmRequirement(frm: NgForm) {
    this.course.requirements[this.requirementIndex!] = this.cloneRequirement(this.requirement!);
    this.showRequirementForm = false;
    frm.reset();
  }

  cloneRequirement(requirement: OnlineCourseRequirement): OnlineCourseRequirement {
    return new OnlineCourseRequirement(requirement.id, requirement.designation);
  }

  get editingRequirement() {  // show the title in modal
    return this.requirement && this.requirement?.id;
  }

  removeRequirement(index: number) {
    this.course.requirements.splice(index, 1);
  }

  getReadEditRequirement(requirement: OnlineCourseRequirement, index: number) {
    this.requirement = this.cloneRequirement(requirement);
    this.showRequirementForm = true;
    this.requirementIndex = index;
  }

  updateRequirements(courseForm: NgForm) {
    this.onlineCoursesService.updateRequirements(this.course).subscribe(
      (response) => {
        //this.course = response;
        this.messageService.add({ severity: 'success', detail: 'Curso alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getModulesByCourseById(onlineCourseId: number): void {
    this.showLoading = true;
    this.moduleService.findByOnlineCourseId(onlineCourseId).subscribe(
      (dados: Module[]) => {
        this.modulos = dados;
        this.modulos.forEach((modulo) => {
          modulo.courseContents.forEach((content) => {
            this.checkIfMarkedCourseContent(content);
          });
        });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
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
    this.filtroStudents.page++;
    this.onlineCoursesService.getStudentsByCourseId(onlineCourseId, this.filtroStudents).subscribe(
      (dados: IApiResponse<User>) => {
        this.students = [...this.students, ...dados.content];
        this.totalRegistrosStudents = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
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
        this.getModulesByCourseById(this.course.id);
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

  checkIfSubscribed(course: OnlineCourse): void {
    this.userService.doesUserSubscribedOnlineCourse(this.loggedUser.id, course.id).subscribe(response => {
      course.isSubscribed = response;
    });
  }

  addCourseToSubscribedOnlineCourses(course: OnlineCourse): void {
    this.userService.addCourseToSubscribedOnlineCourses(this.loggedUser.id, course.id).subscribe(() => {
      course.isSubscribed = true;
    });
  }

  removeCourseFromSubscribedOnlineCourses(course: OnlineCourse): void {
    this.userService.removeCourseFromSubscribedOnlineCourses(this.loggedUser.id, course.id).subscribe(() => {
      course.isSubscribed = false;
    });
  }

  onRemoveCourse(course: OnlineCourse): void {
    this.showConfirmDialog = true;
    this.selectedOnlineCourse = course;
  }

  closeConfirmDialog() {
    this.showConfirmDialog = false;
  }

  confirmDialog(course: OnlineCourse) {
    this.removeCourseFromSubscribedOnlineCourses(course);
    this.closeConfirmDialog();
  }

  addContentToMarkedCourseContents(content: OnlineCourseContent): void {
    this.userService.addContentToMarkedCourseContents(this.loggedUser.id, content.id).subscribe(() => {
      content.isMarked = true;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  removeContentFromMarkedCourseContents(content: OnlineCourseContent): void {
    this.userService.removeContentFromMarkedCourseContents(this.loggedUser.id, content.id).subscribe(() => {
      content.isMarked = false;
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  checkIfMarkedCourseContent(content: OnlineCourseContent): void {
    this.userService.checkIfMarkedCourseContent(this.loggedUser.id, content.id).subscribe(
      response => {
        content.isMarked = response;
      },
      (errorResponse: HttpErrorResponse) => {
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
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
