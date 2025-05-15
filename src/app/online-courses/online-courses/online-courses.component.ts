import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { OnlineCoursesService } from '../OnlineCoursesService.service';
import { OnlineCourseFilter } from 'src/app/core/interface/OnlineCourseFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { QuestionService } from 'src/app/questions/question.service';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Role } from 'src/app/enum/role.enum';
import { Course } from 'src/app/core/model/Course';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-online-courses',
  templateUrl: './online-courses.component.html',
  styleUrls: ['./online-courses.component.css']
})
export class OnlineCoursesComponent implements OnInit {

  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0
  courses: Course[] = [];
  course: Course = new Course;
  displayModalSave: boolean = false;
  isDropdownOpen: boolean = false;
  file!: File;
  totalCourses: number = 0;
  displayModalFilter: boolean = false;
  users: User[] = [];

  selectedCourse: Course = new Course();

  loadingMessage = "Carregando"; // Alterar dinamicamente

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  selectCourseOption: string = 'ALL_COURSES';

  courseFilterOptions = [
    { label: 'Mostrar todos cursos', value: 'ALL_COURSES' },
    { label: 'Mostrar meus cursos', value: 'MY_COURSES' },
  ];

  @ViewChild('tabela') grid: any;

  filtro: OnlineCourseFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc',
    user: 0
  }

  filtroQuestions: QuestionFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  loggedUser: User = new User;

  constructor(
    private onlineCoursesService: OnlineCoursesService,
    private questionService: QuestionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private title: Title, 
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Courses page');
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll();
    this.getUsersInstrutors();
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
    this.loadingMessage = "Carregando dados"

    if (this.selectCourseOption == 'MY_COURSES') {
      this.filtro.user = this.loggedUser.id;
    }

    if (this.selectCourseOption == 'ALL_COURSES') {
      this.filtro.user = 0;
    }

    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0

    this.onlineCoursesService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Course>) => {
        this.courses = dados.content
        this.totalRegistros = dados.totalElements;
        if(this.totalCourses == 0){
          this.totalCourses = dados.totalElements;
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

    if (this.selectCourseOption == 'MY_COURSES') {
      this.filtro.user = this.loggedUser.id;
    }

    if (this.selectCourseOption == 'ALL_COURSES') {
      this.filtro.user = 0;
    }

    this.showLoading = true;
    this.filtro.pagina++;

    this.onlineCoursesService.findAll(this.filtro).subscribe(
      (data: IApiResponse<Course>) => {
        this.courses = [...this.courses, ...data.content];
        this.totalRegistros = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  toggleDropdown(course: Course) {
    course.isAdminMenuOpen = !course.isAdminMenuOpen
  }

  closeDropdown(course: Course) {
    course.isAdminMenuOpen = false;
  }

  onUpdateOnlineCourse(course: Course, file: File): void {
    this.course = course
    this.file = file;
    this.displayModalSave = true;
  }

  onAddNewOnlineCourse(): void {
    this.course = new Course();
    this.displayModalSave = true;
  }

  excluir(course: Course) {
    this.onlineCoursesService.excluir(course.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Instituição excluída com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  getUsersInstrutors() {
    this.userService.getAllInstrutors().subscribe({
      next: (dados) => {
        this.users = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
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

  confirmarExclusao(course: Course): void {
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

  // Método para limpar campos
  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.instrutor = undefined;
    this.filtro.pagina = 0;
    this.filtro.itensPorPagina = 10;
    this.filtro.ordenamento = "id,desc"
    this.selectCourseOption = 'ALL_COURSES';
    this.findAll();
  }

  onFilter(): void {
    this.displayModalFilter = true;
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
