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

  examType = [
    { label: 'Enunciado', value: 'ENUNCIADO' },
    { label: 'Resolução', value: 'RESOLUCAO' },
    { label: 'Todos tipos', value: '' },
  ];


  constructor(
    private examesService: ExamesService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
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
    this.examesService.update(this.exam.id, this.exam.description, this.exam.examType, this.exam.date, this.exam.subject.id!, this.file).subscribe(
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
    this.examesService.save(this.exam.description, this.exam.examType, this.exam.date, this.exam.subject.id!, this.file).subscribe(
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
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.examesService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Exam>) => {
        this.exams = dados.content
        this.totalRegistros = dados.totalElements
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

  public onUpdate(id: number, description: string, examType: string, date: Date, subjectId: number, file: File): void {
    this.exam.id = id
    this.exam.subject.id = subjectId;
    this.exam.description = description;
    this.exam.examType = examType;
    this.file = file;
    this.exam.date = date;
    this.exam.date = new Date(this.exam.date);
    this.displayModalSave = true;
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

  download(exam: Exam, filename: string): void {
    exam.showLoadingDownload = true;
    this.examesService.download(exam.id, filename).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = filename;

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
    this.filtro.description = "";
    this.filtro.institution = undefined;
    this.filtro.examType = "";
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