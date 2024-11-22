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
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getInstitutionById(id);
      this.findCoursesByInstitutionId(0, id);
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

  instituicao = {
    nome: 'Universidade Exemplo',
    descricao:
      'Uma das melhores instituições do país, oferecendo uma ampla gama de cursos e oportunidades.',
    website: 'https://www.universidadeexemplo.com',
    emblema: 'assets/emblema-universidade.png', // Caminho local ou URL externa
    cursos: [
      { nome: 'Engenharia de Software', duracao: '4 anos' },
      { nome: 'Ciência da Computação', duracao: '4 anos' },
      { nome: 'Administração de Empresas', duracao: '3 anos' },
    ],
  };

  abrirWebsite() {
    window.open(this.instituicao.website, '_blank');
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
