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

  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0
  courses: Course[] = [];
  course: Course = new Course;
  displayModalSave: boolean = false;
  totalCourses: number = 0;
  institutions: any[] = [];

  isAdmin: boolean = true;

  //paginaAtual: number = 0;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];


  constructor(
    private courseService: CourseService,
    private institutionService: InstitutionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
    this.carregarInstituicoes();
    this.findAll(0)
  }

  @ViewChild('tabela') grid: any;

  filtro: CourseFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  }

  get editing() {
    return Boolean(this.course.id)
  }

  save(courseForm: NgForm) {
    if (this.editing) {
      this.update(courseForm)
    } else {
      this.addNew(courseForm)
    }
  }

  addNew(courseForm: NgForm) {
    this.showLoading = true;
    this.courseService.add(this.course).subscribe(
      (response) => {
        this.course = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Courso adicionada com sucesso!' });
        //this.findAll(this.paginaAtual)
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
        this.messageService.add({ severity: 'success', detail: 'Courso alterado com sucesso!' });
        //this.findAll(this.paginaAtual)
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    //this.filtro.pagina = pagina;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.courseService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Course>) => {
        this.courses = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
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

  onUpdateCourse(course: Course): void {
    this.course = course
    this.course.id = course.id
    this.displayModalSave = true;
  }

  onAddNewCourse(): void {
    this.course = new Course();
    this.displayModalSave = true;
  }

  excluir(course: Course) {
    this.courseService.excluir(course.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll()
      } else {
        //this.grid.reset();
        //this.findAll(this.paginaAtual)
      }
      this.messageService.add({ severity: 'success', detail: 'Courso excluído com sucesso!' })
      this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(course: Course): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(course);
      }
    });
  }

  
  carregarInstituicoes() {
    return this.institutionService.listarTodos().subscribe(
      dados => {
        this.institutions = dados.content.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  //aoMudarPagina(event: LazyLoadEvent) {
  //  const pagina = event!.first! / event!.rows!;
  //  this.filtro.itensPorPagina = event!.rows!;
  //  this.findAll(pagina);
  //  this.paginaAtual = pagina;
  //}

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

  limparCampos() {
    this.filtro.name = "";
    this.filtro.pagina = 0;
    this.filtro.itensPorPagina = 10;
    this.filtro.ordenamento = "id,desc"
    this.findAll();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
