import { Component, OnInit, ViewChild } from '@angular/core';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Role } from 'src/app/enum/role.enum';
import { Exam } from 'src/app/core/model/Exame';
import { ExameFilter } from 'src/app/core/interface/ExameFilter';
import { ExamesService } from '../exames.service';
import { User } from 'src/app/core/model/User';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-exames',
  templateUrl: './exames.component.html',
  styleUrls: ['./exames.component.css']
})
export class ExamesComponent implements OnInit {

  showLoading: boolean = false;
  totalRegistros: number = 0;
  exams: Exam[] = [];
  exam: Exam = new Exam();
  displayModalSave: boolean = false;
  isDropdownOpen: boolean = false;
  file!: File;
  totalExames: number = 0;
  displayModalFilter: boolean = false;
  subjects: Subject[] = [];

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  currentMessage: string | null = null;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  filtro: ExameFilter = {
    examType: '',
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc',
  };

  @ViewChild('tabela') grid: any;

  niveis = [
    { label: 'Ensino Superior', value: 'Ensino Superior' },
    { label: 'Ensino Técnico', value: 'Ensino Técnico' },
    { label: 'Ensino Geral', value: 'Ensino Geral' },
  ];

  examTypes = [
    { label: 'Enunciado', value: 'ENUNCIADO' },
    { label: 'Resolução', value: 'RESOLUCAO' },
    //  { label: 'Todos tipos', value: '' },
  ];

  institutions = [
    { label: 'Universidade Eduardo Mondlane', value: 'UEM' },
    { label: 'Universidade Pedagógica', value: 'UP' },
    //  { label: 'Todas', value: '' },
  ];

  accessLevels = [
    { label: 'Premium', value: true },
    { label: 'Free', value: false },
  ];

  constructor(
    private examesService: ExamesService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Questions page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll(0);
    this.buscarTotal();
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.exam.id)
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
    this.examesService.update(this.exam.id, this.exam.examType, this.exam.institution, this.exam.premium, this.exam.date, this.exam.subject.id!, this.file).subscribe(
      response => {
        this.exam = response
        this.exam.date = new Date(this.exam.date);
        this.messageService.add({ severity: 'success', detail: 'Exame actualizado com sucesso!' });
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
    this.examesService.save(this.exam.examType, this.exam.institution, this.exam.premium, this.exam.date, this.exam.subject.id!, this.file).subscribe(
      response => {
        this.exam = response
        this.exam.date = new Date(this.exam.date);
        this.messageService.add({ severity: 'success', detail: 'Exame salvo com sucesso!' });
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
    this.showLoading = true;

    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.examesService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Exam>) => {
        this.exams = dados.content
        //this.totalRegistros = dados.totalElements
        if (this.totalRegistros == 0) {
          this.totalRegistros = dados.totalElements;
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
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filtro.pagina++;

    this.examesService.findAll(this.filtro).subscribe(
      (data: IApiResponse<Exam>) => {
        this.exams = [...this.exams, ...data.content];

        this.totalRegistros = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(exam: Exam) {
    this.examesService.excluir(exam.id!).subscribe(() => {
      this.findAll();
      this.messageService.add({ severity: 'success', detail: 'Exame excluído com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(exam: Exam): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(exam);
      }
    });
  }

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  buscarTotal() {
    this.examesService.buscarTotal().subscribe(
      (total) => {
        this.totalExames = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  toggleDropdown(exam: Exam) {
    exam.isAdminMenuOpen = !exam.isAdminMenuOpen
  }

  closeDropdown(exam: Exam) {
    exam.isAdminMenuOpen = false;
  }

  onAddNewExame(): void {
    this.exam = new Exam();
    this.displayModalSave = true;
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  get isLoadMoreDisabled(): boolean {
    return this.exams.length >= this.totalRegistros && this.totalRegistros > 0;
  }

  public onUpdate(exam: Exam, file: File): void {
    this.exam = exam;
    this.file = file;
    this.exam.date = new Date(this.exam.date);
    this.displayModalSave = true;
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumExam(exam: Exam): boolean {
    if (!exam.premium) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser();
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const expiresAt = this.loggedUser.expiresAt ? new Date(this.loggedUser.expiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !expiresAt || expiresAt <= new Date();
  }

  getLevelValue(status: string) {
    switch (status) {
      case 'Ensino Geral':
        return 'Masculino';
      case 'FEMININE':
        return 'Feminino';
    }
    return '';
  }

  getLevel(status: string) {
    switch (status) {
      case 'Ensino Geral':
        return 'primmary';
      case 'FEMININE':
        return 'info';
    }
    return '';
  }

  getTypeValue(type: string) {
    switch (type) {
      case 'ENUNCIADO':
        return 'Enunciado';
      case 'RESOLUCAO':
        return 'Resolução';
    }
    return '';
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'ENUNCIADO':
        return 'badge-enunciado';
      case 'RESOLUCAO':
        return 'badge-resolvido';
      default:
        return '';
    }
  }

  getType(type: string): string {
    switch (type) {
      case 'ENUNCIADO':
        return 'Enunciado';
      case 'RESOLUCAO':
        return 'Resolução';
      default:
        return '';
    }
  }

  getInstitution(institution: string): string {
    switch (institution) {
      case 'UEM':
        return 'Universidade Eduardo Mondlane';
      case 'UP':
        return 'Universidade Pedagógica';
      default:
        return '';
    }
  }

  onDownload(exam: Exam) {
    this.download(exam);
  }

  download(exam: Exam): void {
    exam.showLoadingDownload = true;
    this.examesService.download(exam.id, exam.fileName).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = exam.fileName;

      // Simular um clique no link para iniciar o download
      link.click();

      // Limpar o link após o download iniciar
      window.URL.revokeObjectURL(link.href);
      //this.findAll(this.paginaAtual)
      exam.showLoadingDownload = false;
    },
      (errorResponse: HttpErrorResponse) => {
        exam.showLoadingDownload = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.subject = undefined;
    this.filtro.examType = "";
    this.filtro.institution = "";
    this.filtro.beginDate = undefined;
    this.filtro.endDate = undefined;
    this.filtro.pagina = 0;
    this.filtro.itensPorPagina = 10;
    this.filtro.ordenamento = "id,desc"
    this.findAll();
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
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}