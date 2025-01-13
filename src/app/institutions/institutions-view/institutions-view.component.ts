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

  activeTab: number = 1;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  @ViewChild('tabela') grid: any;

  filtro: CourseFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc',
    name: ''
  }


  constructor(
    private institutionService: InstitutionService,
    private courseService: CourseService,
    private messageService: MessageService,
    private route: ActivatedRoute, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    const institutionId = this.route.snapshot.params['id'];
    if (institutionId) {
      this.getInstitutionByInstitutionId(institutionId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Função para alterar a aba ativa
  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }
  
  getInstitutionByInstitutionId(id: string) {
    this.institutionService.getInstitutionByInstitutionId(id).subscribe(
      (response) => {
        this.institution = response;
        this.findCoursesByInstitutionId(0, this.institution.id);
      },
      (errorResponse: HttpErrorResponse) => {
        if(errorResponse.status == 400){ // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        }else{
          this.sendErrorNotification(errorResponse.error.message);
        } 
      }
    );
  }

  findCoursesByInstitutionId(pagina: number = 0, institutionId: number): void {
    this.showLoading = true;
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

  getAdministrationTypeValue(type: string) {
    switch (type) {
      case 'PUBLIC':
        return 'Pública';
      case 'PRIVATE':
        return 'Privada';
    }
    return '';
  }

  getAdministrationType(type: string) {
    switch (type) {
      case 'PUBLIC':
        return 'primmary';
      case 'PRIVATE':
        return 'info';
    }
    return '';
  }
  
  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
