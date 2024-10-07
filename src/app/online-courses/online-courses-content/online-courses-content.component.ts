import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OnlineCourse } from 'src/app/core/model/Online-course';
import { OnlineCourseContent } from 'src/app/core/model/Online-course-content';
import { OnlineCoursesService } from '../OnlineCoursesService.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseFilter } from 'src/app/core/interface/CourseFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { OnlineCoursesContentService } from '../OnlineCoursesContentService.service';

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

  imagePath = './assets/test.mp4'

  constructor(
    private onlineCoursesService: OnlineCoursesService,
    private onlineCoursesContentService: OnlineCoursesContentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getOnlineCourseById(id);
      this.findCourseContentByCourseById(0, id);
    }
  }

  @ViewChild('tabela') grid: any;

  filtro: CourseFilter = {
    pagina: 0,
    itensPorPagina: 10,
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

  
  //onSelectContent(content: OnlineCourseContent): void {
  //  this.onlineSelectedCourseContent = content;
  //}

  // Referência ao vídeo no template
  @ViewChild('videoPlayer', { static: false }) videoPlayer: ElementRef | undefined;

  onSelectContent(content: OnlineCourseContent): void {
    this.onlineSelectedCourseContent = content;

    // Verifique se a referência ao vídeo foi inicializada corretamente
    if (this.videoPlayer) {
      const videoElement = this.videoPlayer.nativeElement as HTMLVideoElement;

      // Forçar atualização do vídeo, redefinindo o `src` e recarregando
      videoElement.src = content.urlFile;
      videoElement.load();
    }
  }

  changePageSize(event: any): void {
    this.filtro.itensPorPagina = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.findCourseContentByCourseById(0, this.course.id);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findCourseContentByCourseById(0, this.course.id);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findCourseContentByCourseById(0, this.course.id);
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRegistros / this.filtro.itensPorPagina);
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
