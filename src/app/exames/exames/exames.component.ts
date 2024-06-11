import { Component, OnInit, ViewChild } from '@angular/core';
import { ExamesService } from '../exames.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Exame } from 'src/app/core/model/Exame';
import { ExameFilter } from 'src/app/core/interface/ExameFilter';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';

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

  isAdmin: boolean = true;


  constructor(
    private examesService: ExamesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
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
    this.examesService.update(this.exame.id, this.exame.subject, this.exame.description, this.exame.level, this.file).subscribe(
      response => {
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
    this.examesService.save(this.exame.subject, this.exame.description, this.exame.level, this.file).subscribe(
      response => {
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
    this.filtro.pagina = pagina;
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
    this.examesService.excluir(exame.id!)
      .subscribe(() => {
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

  aoMudarPagina(event: LazyLoadEvent) {
    const pagina = event!.first! / event!.rows!;
    this.filtro.itensPorPagina = event!.rows!;
    this.findAll(pagina);
  }

  public onEdit(id: number, subject: string, description: string, level: string, file: File): void {
    this.exame.id = id
    this.exame.subject = subject;
    this.exame.description = description;
    this.exame.level = level;
    this.file = file
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
  
  download(id: number, filename: string): void {
    this.examesService.download(id, filename).subscribe((data: Blob) => {
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
    });
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
