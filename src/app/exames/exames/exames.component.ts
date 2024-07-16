import { Component, OnInit, ViewChild } from '@angular/core';
import { ExamesService } from '../exames.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Exame } from 'src/app/core/model/Exame';
import { ExameFilter } from 'src/app/core/interface/ExameFilter';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { InstitutionService } from 'src/app/institutions/InstitutionService.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';

@Component({
  selector: 'app-exames',
  templateUrl: './exames.component.html',
  styleUrls: ['./exames.component.css']
})
export class ExamesComponent implements OnInit {

  showLoading: boolean = false;
  totalRegistros: number = 0
  exames: Exame[] = [];
  exame: Exame = new Exame;
  displayModalSave: boolean = false;
  file!: File;
  totalExames: number = 0;
  displayModalFilter: boolean = false;
  institutions: any[] = [];
  subjects: any[] = [];


  isAdmin: boolean = true;

  //paginaAtual: number = 0;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  niveis = [
    { label: 'Ensino Superior', value: 'Ensino Superior' },
    { label: 'Ensino Técnico', value: 'Ensino Técnico' },
    { label: 'Ensino Geral', value: 'Ensino Geral' },
  ];

  constructor(
    private examesService: ExamesService,
    private institutionService: InstitutionService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
    this.carregarInstituicoes();
    this.carregarDisciplinas();
    this.findAll(0);
  }

  filtro: ExameFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc'
  }

  @ViewChild('tabela') grid: any;

  get editing() {
    return Boolean(this.exame.id)
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
    this.examesService.update(this.exame.id, this.exame.description, this.exame.date, this.exame.subject.id!, this.exame.institution.id, this.file).subscribe(
      response => {
        this.exame = response
        this.exame.date = new Date(this.exame.date);
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
    this.examesService.save(this.exame.description, this.exame.date, this.exame.subject.id!, this.exame.institution.id, this.file).subscribe(
      response => {
        this.exame = response
        this.exame.date = new Date(this.exame.date);
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
    //this.filtro.pagina = pagina;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.examesService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Exame>) => {
        this.exames = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(exame: Exame) {
    this.examesService.excluir(exame.id!).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      } else {
        this.grid.reset();
      }
      this.messageService.add({ severity: 'success', detail: 'Exames excluído com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(exame: Exame): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(exame);
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

  carregarDisciplinas() {
    return this.subjectsService.findAll().subscribe(
      dados => {
        this.subjects = dados.map(dado => {
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

  buscarTotal() {
    this.showLoading = true;
    this.examesService.buscarTotal().subscribe(
      (total) => {
        this.totalExames = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onAddNewExame(): void {
    this.exame = new Exame();
    this.displayModalSave = true;
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  //aoMudarPagina(event: LazyLoadEvent) {
  //  const pagina = event!.first! / event!.rows!;
  //  this.filtro.itensPorPagina = event!.rows!;
  //  this.findAll(pagina);
  //  this.paginaAtual = pagina;
  //}

  public onUpdate(id: number, description: string, date: Date, subjectId: number, institutionId: number, file: File): void {
    this.exame.id = id
    this.exame.subject.id = subjectId;
    this.exame.institution.id = institutionId;
    this.exame.description = description;
    this.file = file;
    this.exame.date = date;
    this.exame.date = new Date(this.exame.date);
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

  // Depois usar
  incrementDownloadCount(currentCount: number): number {
    return currentCount + 1;
  }

  download(exame: Exame, filename: string): void {
    exame.showLoadingDownload = !exame.showLoadingDownload;
    this.examesService.download(exame.id, filename).subscribe((data: Blob) => {
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
    });
  }

  limparCampos() {
    this.filtro.global = "";
    this.filtro.subject = undefined;
    this.filtro.description = "";
    this.filtro.institution = undefined;
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
