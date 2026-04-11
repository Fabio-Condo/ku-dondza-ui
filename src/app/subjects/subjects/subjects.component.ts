import { Component, OnInit } from '@angular/core';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from '../subjects.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { SubjectFilter } from 'src/app/core/interface/SubjectFilter';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Role } from 'src/app/enum/role.enum';
import { Title } from '@angular/platform-browser';
import { User } from 'src/app/core/model/User';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent implements OnInit {

  subjects: Subject[] = [];
  subject: Subject = new Subject();
  selectedSubject: Subject = new Subject();

  showLoading: boolean = false;
  retryVisible: boolean = false;

  totalRecords: number = 0;
  totalSubjects: number = 0;
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  categories = [
    { label: 'Ciências Exatas', value: 'EXACT_SCIENCES' },
    { label: 'Ciências Humanas', value: 'HUMAN_SCIENCES' },
    { label: 'Línguas', value: 'LANGUAGES' },
  ];

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: SubjectFilter = {
    pagina: 0,
    itensPorPagina: 6,
    ordenamento: 'id,asc'
  };

  constructor(
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Subjects page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll();
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

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.subjectsService.filter(this.filtro, this.loggedUser.id).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000)) // 2s → 4s → 8s
        )
      )
    ).subscribe(
      (dados: IApiResponse<Subject>) => {
        if (this.isUserLoggedIn && this.isSuperAdmin) {
          this.subjects = dados.content;
        }else {
          this.subjects = dados.content.filter(subject => subject.courseEnabled);
        }

        this.totalRecords = dados.totalElements;
        if (this.totalSubjects == 0) {
          this.totalSubjects = dados.totalElements;
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  loadMore(page: number = 0): void {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.pagina++;

    this.subjectsService.filter(this.filtro, this.loggedUser.id).subscribe(
      (data: IApiResponse<Subject>) => {
        this.subjects = [...this.subjects, ...data.content];
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  retryGetSubjects(): void {
    this.retryVisible = false;
    this.filtro.pagina = 0;
    this.findAll(this.currentPage);
  }

  get isLoadMoreDisabled(): boolean {
    return this.subjects.length >= this.totalRecords && this.totalRecords > 0;
  }

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  onUpdateSubject(subject: Subject): void {
    this.subject = subject;
    this.displayModalSave = true;
  }

  onAddNewSubject(): void {
    this.subject = new Subject();
    this.displayModalSave = true;
  }

  toggleDropdown(subject: Subject) {
    this.subjects.forEach(s => {
      if (s !== subject) {
        s.isAdminMenuOpen = false;
      }
    });
    subject.isAdminMenuOpen = !subject.isAdminMenuOpen;
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
    return Math.ceil(this.totalRecords / this.filtro.itensPorPagina);
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.name = "";
    this.findAll();
  }

  shareOnSocial(network: string, subjectId: string): void {
    const baseUrl = `${window.location.origin}/subjects/${subjectId}`; // link do item
    let url = '';

    switch (network) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent('Olha isto: ' + baseUrl)}`;
        break;

      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;

      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank'); // abre numa nova aba
    }
  }

  copyLink(subjectId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link + `/${subjectId}`).then(() => {
      console.log(`Link do item ${subjectId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
  }

  getCategoryValue(category: string) {
    switch (category) {
      case 'EXACT_SCIENCES':
        return 'Ciências Exatas';
      case 'HUMAN_SCIENCES':
        return 'Ciências Humanas';
      case 'LANGUAGES':
        return 'Línguas';
    }
    return '';
  }

  getBadgeClass(category: string): string {
    switch (category) {
      case 'EXACT_SCIENCES':
        return 'exact-sciences';
      case 'HUMAN_SCIENCES':
        return 'human-sciences';
      case 'LANGUAGES':
        return 'languages';
      default:
        return '';
    }
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
