import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OnlineCourse } from 'src/app/core/model/Online-course';
import { OnlineCourseContent } from 'src/app/core/model/Online-course-content';
import { OnlineCoursesService } from '../OnlineCoursesService.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseFilter } from 'src/app/core/interface/CourseFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { OnlineCoursesContentService } from '../OnlineCoursesContentService.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-online-courses-content',
  templateUrl: './online-courses-content.component.html',
  styleUrls: ['./online-courses-content.component.css']
})
export class OnlineCoursesContentComponent implements OnInit {

  course: OnlineCourse = new OnlineCourse();
  onlineCourseContentList: OnlineCourseContent[] = [];
  onlineCourseContent: OnlineCourseContent = new OnlineCourseContent();
  onlineSelectedCourseContent: OnlineCourseContent = new OnlineCourseContent();
  displayModalSave: boolean = false;
  file!: File;
  totalRegistros: number = 0
  showLoading: boolean = false;

  isAdmin: boolean = true;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  loggedUser: User = new User;
  selectedOnlineCourse = new OnlineCourse();

  showConfirmDialog: boolean = false;

  imagePath = './assets/test.mp4'

  constructor(
    private onlineCoursesService: OnlineCoursesService,
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
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getOnlineCourseById(id);
      this.findCourseContentByCourseById(0, id);
    }

  }

  // Variável para controlar a aba ativa
  activeTab: number = 1;

  // Função para alterar a aba ativa
  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  @ViewChild('tabela') grid: any;

  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef | undefined;

  filtro: CourseFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc',
    name: ''
  }

  get editing() {
    return Boolean(this.onlineCourseContent.id)
  }

  save() {
    if (this.editing) {
      this.update()
    } else {
      this.addNew()
    }
  }

  update() {
    this.showLoading = true;
    this.onlineCoursesContentService.update(this.onlineCourseContent, this.course.id, this.file).subscribe(
      response => {
        this.onlineCourseContent = response
        this.messageService.add({ severity: 'success', detail: 'Courso actualizada com sucesso!' });
        this.showLoading = false;
        this.findCourseContentByCourseById(0, this.course.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.onlineCoursesContentService.save(this.onlineCourseContent, this.course.id, this.file).subscribe(
      response => {
        this.onlineCourseContent = response
        this.messageService.add({ severity: 'success', detail: 'Courso salva com sucesso!' });
        this.showLoading = false;
        this.findCourseContentByCourseById(0, this.course.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  getOnlineCourseById(id: number) {
    this.onlineCoursesService.findById(id).subscribe(
      (response) => {
        this.course = response;
        this.checkIfSubscribed(this.course);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  findCourseContentByCourseById(pagina: number = 0, onlineCourseId: number): void {
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.onlineCoursesContentService.findByOnlineCourseId(onlineCourseId, this.filtro).subscribe(
      (dados: IApiResponse<OnlineCourseContent>) => {
        this.onlineCourseContentList = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdateOnlineCourseContent(content: OnlineCourseContent, file: File): void {
    this.onlineCourseContent = content
    this.file = file;
    this.displayModalSave = true;
  }

  onAddNewOnlineCourseContent(): void {
    this.onlineCourseContent = new OnlineCourseContent();
    this.displayModalSave = true;
  }

  onSelectContent(content: OnlineCourseContent): void {
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
        this.findCourseContentByCourseById(0, this.course.id);
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
