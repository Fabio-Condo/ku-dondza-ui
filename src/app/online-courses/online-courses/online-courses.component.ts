import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { OnlineCourse } from 'src/app/core/model/Online-course';
import { OnlineCoursesService } from '../OnlineCoursesService.service';
import { OnlineCourseFilter } from 'src/app/core/interface/OnlineCourseFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';

@Component({
  selector: 'app-online-courses',
  templateUrl: './online-courses.component.html',
  styleUrls: ['./online-courses.component.css']
})
export class OnlineCoursesComponent implements OnInit {

  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0
  courses: OnlineCourse[] = [];
  course: OnlineCourse = new OnlineCourse;
  displayModalSave: boolean = false;
  file!: File;
  totalCourses: number = 0;
  displayModalFilter: boolean = false;
  isAdmin: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  @ViewChild('tabela') grid: any;

  filtro: OnlineCourseFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  }

  loggedUser: User = new User;

  constructor(
    private onlineCoursesService: OnlineCoursesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.buscarTotal();
    this.findAll();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.course.id)
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
    this.onlineCoursesService.update(this.course, this.file).subscribe(
      response => {
        this.course = response
        this.messageService.add({ severity: 'success', detail: 'Courso actualizada com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.onlineCoursesService.save(this.course, this.file).subscribe(
      response => {
        this.course = response
        this.messageService.add({ severity: 'success', detail: 'Courso salva com sucesso!' });
        this.showLoading = false;
        this.findAll();
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

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0

    this.onlineCoursesService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<OnlineCourse>) => {
        this.courses = dados.content
        dados.content.forEach(course => {
          this.checkIfSubscribed(course);
          this.countOnlineCourseStudentsByCourseId(course);
        });
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  buscarTotal() {
    this.showLoading = true;
    this.onlineCoursesService.buscarTotal().subscribe(
      (total) => {
        this.totalCourses = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdateOnlineCourse(course: OnlineCourse, file: File): void {
    this.course = course
    this.file = file;
    this.displayModalSave = true;
  }

  onAddNewOnlineCourse(): void {
    this.course = new OnlineCourse();
    this.displayModalSave = true;
  }

  excluir(course: OnlineCourse) {
    this.onlineCoursesService.excluir(course.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Instituição excluída com sucesso!' })
      this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  changePageSize(event: any): void {
    this.filtro.itensPorPagina = +event.target.value;
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
    return Math.ceil(this.totalRegistros / this.filtro.itensPorPagina);
  }

  confirmarExclusao(course: OnlineCourse): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(course);
      }
    });
  }

  aoMudarPagina(event: LazyLoadEvent) {
    const pagina = event!.first! / event!.rows!;
    this.filtro.itensPorPagina = event!.rows!;
    this.findAll(pagina);
  }

  checkIfSubscribed(course: OnlineCourse): void {
    this.userService.doesUserSubscribedOnlineCourse(this.loggedUser.id, course.id).subscribe(response => {
      course.isSubscribed = response;
    });
  }

  countOnlineCourseStudentsByCourseId(course: OnlineCourse) {
    this.showLoading = true;
    this.onlineCoursesService.countOnlineCourseStudentsByCourseId(course.id,).subscribe(
      (total) => {
        course.totalStudents = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
