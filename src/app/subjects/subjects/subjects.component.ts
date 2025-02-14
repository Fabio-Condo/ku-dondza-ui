import { Component, OnInit } from '@angular/core';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from '../subjects.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { SubjectFilter } from 'src/app/core/interface/SubjectFilter';
import { TopicService } from 'src/app/topics/topicsService.service';
import { Topic } from 'src/app/core/model/Topic';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Role } from 'src/app/enum/role.enum';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent implements OnInit {

  subjects: Subject[] = [];
  subject: Subject = new Subject();
  selectedSubject: Subject = new Subject();
  topics: Topic[] = [];

  showLoading: boolean = false;
  totalRegistros: number = 0;
  totalSubjects: number = 0;
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  displayModalView: boolean = false;
  isDropdownOpen: boolean = false;

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: SubjectFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  };

  constructor(
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.findAll();
    this.buscarTotal();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.subject.id);
  }

  save(subjectForm: NgForm) {
    if (this.editing) {
      this.update(subjectForm);
    } else {
      this.addNew(subjectForm);
    }
  }

  addNew(subjectForm: NgForm) {
    this.showLoading = true;
    this.subjectsService.add(this.subject).subscribe(
      (response) => {
        this.subject = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Disciplina adicionada com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(subjectForm: NgForm) {
    this.showLoading = true;
    this.subjectsService.update(this.subject).subscribe(
      (response) => {
        this.subject = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Disciplina alterada com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(subject: Subject) {
    this.subjectsService.excluir(subject.id).subscribe(() => {
      this.findAll();
      this.buscarTotal();
      this.messageService.add({ severity: 'success', detail: 'Disciplina excluída com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(subject: Subject): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(subject);
      }
    });
  }

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.subjectsService.filter(this.filtro).subscribe(
      (dados: IApiResponse<Subject>) => {
        this.subjects = dados.content;
        this.totalRegistros = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  loadMore(page: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina++;

    this.subjectsService.filter(this.filtro).subscribe(
      (data: IApiResponse<Subject>) => {
        this.subjects = [...this.subjects, ...data.content];

        this.totalRegistros = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  buscarTotal() {
    this.subjectsService.buscarTotal().subscribe(
      (total) => {
        this.totalSubjects = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getTopicsBySubjectId(subjectId: number): void {
    this.topicService.getBySubjectId(subjectId).subscribe(
      (dados: Topic[]) => {
        this.subject.topics = [];
        this.topics = [];
        this.subject.topics = dados;
        this.topics = dados;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdateSubject(subject: Subject): void {
    this.subject = subject;
    this.displayModalSave = true;
  }

  onAddNewSubject(): void {
    this.subject = new Subject();
    this.displayModalSave = true;
  }

  onView(subject: Subject): void {
    this.getTopicsBySubjectId(subject.id);
    this.selectedSubject = subject;
    this.selectedSubject.topics = this.topics;
    this.displayModalView = true;
  }

  toggleDropdown(subject: Subject) {
    subject.isAdminMenuOpen = !subject.isAdminMenuOpen
  }

  closeDropdown(subject: Subject) {
    subject.isAdminMenuOpen = false;
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
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
