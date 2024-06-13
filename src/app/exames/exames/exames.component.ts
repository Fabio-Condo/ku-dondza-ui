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

  isAdmin: boolean = false;

  showLoadingDownload: boolean = false;

  displayModalFilter: boolean = false;

  niveis = [
    { label: 'Ensino Superior', value: 'Ensino Superior' },
    { label: 'Ensino Técnico', value: 'Ensino Técnico' },
    { label: 'Ensino Geral', value: 'Ensino Geral' },
  ];

  subjects = [
    { label: 'Matemática', value: 'Matemática' },
    { label: 'Português', value: 'Português' },
    { label: 'Fisica', value: 'Fisica' },
    { label: 'Quimica', value: 'Quimica' },
    { label: 'Biológia', value: 'Biológia' },
    { label: 'Inglês', value: 'Inglês' },
    { label: 'Francês', value: 'Francês' },
    { label: 'História', value: 'História' },
    { label: 'Geográfia', value: 'Geográfia' },
  ];

  institutosSuperiores = [
    { label: 'Universidade Eduardo Mondlane (UEM)', value: 'Universidade Eduardo Mondlane (UEM)' },
    { label: 'Universidade Pedagógica (UP)', value: 'Universidade Pedagógica (UP)' },
    { label: 'Universidade Joaquim Chissano (UJC)', value: 'Universidade Joaquim Chissano (UJC)' },
    { label: 'Universidade Lúrio (UniLúrio)', value: 'Universidade Lúrio (UniLúrio)' },
    { label: 'Universidade Zambeze (UniZambeze)', value: 'Universidade Zambeze (UniZambeze)' },
    { label: 'Universidade Rovuma (UniRovuma)', value: 'Universidade Rovuma (UniRovuma)' },
    { label: 'Instituto Superior de Ciências de Saúde (ISCISA)', value: 'Instituto Superior de Ciências de Saúde (ISCISA)' },
    { label: 'Academia de Ciências Policiais (ACIPOL)', value: 'Academia de Ciências Policiais (ACIPOL)' },
    { label: 'Academia Militar "Marechal Samora Machel"', value: 'Academia Militar "Marechal Samora Machel"' },  
    { label: 'Escola Superior de Ciências Nauticas', value: 'Escola Superior de Ciências Nauticas' },    
  ];

  institutosTecnicos = [
    { label: 'Instituto Comercial de Maputo (ICM)', value: 'Instituto Comercial de Maputo (ICM)' },
    { label: 'Instituto Industrial de Maputo (IIM)', value: 'Instituto Industrial de Maputo (IIM)' },
    { label: 'Instituto de Ciências de Saúde de Infulene', value: 'Instituto de Ciências de Saúde de Infulene' },
  ];

  institutosDeEnsinoGeral = [
    { label: '12ª Classe', value: '12 Classe' },
    { label: '10ª Classe', value: '10 Classe' },
  ];


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
    this.examesService.update(this.exame.id, this.exame.institution, this.exame.subject, this.exame.description, this.exame.level, this.exame.date, this.file).subscribe(
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
    this.examesService.save(this.exame.institution, this.exame.subject, this.exame.description, this.exame.level, this.exame.date, this.file).subscribe(
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
    //this.file = undefined;
    this.displayModalSave = true;
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  aoMudarPagina(event: LazyLoadEvent) {
    const pagina = event!.first! / event!.rows!;
    this.filtro.itensPorPagina = event!.rows!;
    this.findAll(pagina);
  }

  public onEdit(id: number, institution: string, subject: string, description: string, level: string, date: Date, file: File): void {
    this.exame.id = id
    this.exame.institution = institution;
    this.exame.subject = subject;
    this.exame.description = description;
    this.exame.level = level;
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

  download(id: number, filename: string): void {
    this.showLoadingDownload = true
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
      this.showLoadingDownload = false;
      this.findAll()
    });
  }

  limparCampos() {
    this.filtro.global = "";
    this.filtro.subject = "";
    this.filtro.description = "";
    this.filtro.institution = "";
    this.filtro.level = "";
    this.filtro.beginDate = undefined;
    this.filtro.endDate = undefined;
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
