import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Course } from 'src/app/core/model/Course';
import { CourseFilter } from 'src/app/core/interface/CourseFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { InstitutionService } from 'src/app/institutions/InstitutionService.service';
import { CourseService } from '../courseService.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  // Variáveis de controle de estado
  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0;
  totalCourses: number = 0;
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  isAdmin: boolean = false;

  // Dados dos cursos
  courses: Course[] = [];
  course: Course = new Course();
  institutions: any[] = [];

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: CourseFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  };

  @ViewChild('tabela') grid: any;

  constructor(
    private courseService: CourseService,
    private institutionService: InstitutionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
    this.carregarInstituicoes();
    this.findAll(0);
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.course.id);
  }

  // Métodos de CRUD
  save(courseForm: NgForm) {
    if (this.editing) {
      this.update(courseForm);
    } else {
      this.addNew(courseForm);
    }
  }

  addNew(courseForm: NgForm) {
    this.showLoading = true;
    this.courseService.add(this.course).subscribe(
      (response) => {
        this.course = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Curso adicionado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(courseForm: NgForm) {
    this.showLoading = true;
    this.courseService.update(this.course).subscribe(
      (response) => {
        this.course = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Curso alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(course: Course) {
    this.courseService.excluir(course.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      }
      this.messageService.add({ severity: 'success', detail: 'Curso excluído com sucesso!' });
      this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(course: Course): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(course);
      }
    });
  }

  buscarTotal() {
    this.showLoading = true;
    this.courseService.buscarTotal().subscribe(
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

  toggleDropdown(course: Course) {
    course.isAdminMenuOpen = !course.isAdminMenuOpen
  }

  closeDropdown(course: Course) {
    course.isAdminMenuOpen = false;
  }

  // Métodos de carregamento
  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.courseService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Course>) => {
        this.courses = dados.content;
        this.totalRegistros = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  carregarInstituicoes() {
    return this.institutionService.listarTodos().subscribe(
      dados => {
        this.institutions = dados.content.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          };
        });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Métodos de paginação
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

  // Método para limpar campos
  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.institution = undefined;
    this.filtro.pagina = 0;
    this.filtro.itensPorPagina = 10;
    this.filtro.ordenamento = "id,desc"
    this.findAll();
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  // Métodos para abrir o modal
  onUpdateCourse(course: Course): void {
    this.course = course;
    this.displayModalSave = true;
  }

  onAddNewCourse(): void {
    this.course = new Course();
    this.displayModalSave = true;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
