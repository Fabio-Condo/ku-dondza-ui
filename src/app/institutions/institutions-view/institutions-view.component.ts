import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Institution } from 'src/app/core/model/Institution';
import { InstitutionService } from '../InstitutionService.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseFilter } from 'src/app/core/interface/CourseFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Course } from 'src/app/core/model/Course';
import { CourseService } from 'src/app/courses/courseService.service';

@Component({
  selector: 'app-institutions-view',
  templateUrl: './institutions-view.component.html',
  styleUrls: ['./institutions-view.component.css']
})
export class InstitutionsViewComponent implements OnInit {

  institution: Institution = new Institution();
  courses: Course[] = [];
  totalRegistros: number = 0
  showLoading: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  constructor(
    private institutionService: InstitutionService,
    private courseService: CourseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getInstitutionById(id);
      this.findByInstitutionId(0, id);
    }
  }
  
  @ViewChild('tabela') grid: any;

  filtro: CourseFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  }

  getInstitutionById(id: number) {
    this.institutionService.findById(id).subscribe(
      (response) => {
        this.institution = response;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  findByInstitutionId(pagina: number = 0, institutionId: number): void {
    this.showLoading = true;
    //this.filtro.pagina = pagina;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.courseService.findByInstitutionId(institutionId, this.filtro).subscribe(
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

  changePageSize(event: any): void {
    this.filtro.itensPorPagina = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.findByInstitutionId(0, this.institution.id);
  }


  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findByInstitutionId(0, this.institution.id);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findByInstitutionId(0, this.institution.id);
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRegistros / this.filtro.itensPorPagina);
  }

  //aoMudarPagina(event: LazyLoadEvent) {
  //  const pagina = event!.first! / event!.rows!;
  //  this.filtro.itensPorPagina = event!.rows!;
  //  this.findByInstitutionId(pagina, this.route.snapshot.params['id']);
  //}
  
  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
