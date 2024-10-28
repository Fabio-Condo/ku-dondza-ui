import { Component, OnInit, ViewChild } from '@angular/core';
import { CompetitionFilter } from 'src/app/core/interface/CompetitionFilter';
import { Competition } from 'src/app/core/model/Competition';
import { CompetitionService } from '../competition.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuizService } from 'src/app/quiz/quiz.service';

@Component({
  selector: 'app-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.css']
})
export class CompetitionsComponent implements OnInit {

  // Variáveis de controle de estado
  showLoadingDownload: boolean = false;
  showLoading: boolean = false;
  totalRegistros: number = 0;
  totalCompetitions: number = 0;
  displayModalSave: boolean = false;
  isAdmin: boolean = true;

  // Dados das competições
  competitions: Competition[] = [];
  competition: Competition = new Competition();
  quizzes: any[] = [];

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: CompetitionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  };

  @ViewChild('tabela') grid: any;

  constructor(
    private competitionService: CompetitionService,
    private quizService: QuizService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.buscarTotal();
    this.carregarQuizzes();
    this.findAll(0);
  }

  get editing() {
    return Boolean(this.competition.id);
  }

  save(competitionForm: NgForm) {
    if (this.editing) {
      this.update(competitionForm);
    } else {
      this.addNew(competitionForm);
    }
  }

  addNew(competitionForm: NgForm) {
    this.showLoading = true;
    this.competitionService.add(this.competition).subscribe(
      (response) => {
        this.competition = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Competição adicionado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(competitionForm: NgForm) {
    this.showLoading = true;
    this.competitionService.update(this.competition).subscribe(
      (response) => {
        this.competition = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Competição alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(competition: Competition) {
    this.competitionService.excluir(competition.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      }
      this.messageService.add({ severity: 'success', detail: 'Competição excluída com sucesso!' });
      this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(competition: Competition): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(competition);
      }
    });
  }

  buscarTotal() {
    this.showLoading = true;
    this.competitionService.buscarTotal().subscribe(
      (total) => {
        this.totalCompetitions = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.competitionService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Competition>) => {
        this.competitions = dados.content;
        this.totalRegistros = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  carregarQuizzes() {
    return this.quizService.findAll().subscribe(
      dados => {
        this.quizzes = dados.content.map(dado => {
          return {
            label: dado.title,
            value: dado.id
          };
        });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Métodos de paginação
  changePageSize(event: any): void {
    this.filtro.itemsPerPage = +event.target.value;
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
    return Math.ceil(this.totalRegistros / this.filtro.itemsPerPage);
  }

  // Método para limpar campos
  limparCampos() {
    this.filtro.title = "";
    this.filtro.page = 0;
    this.filtro.itemsPerPage = 10;
    this.filtro.sort = "id,desc";
    this.findAll();
  }

  // Métodos para abrir o modal
  onUpdateCompetition(competition: Competition): void {
    this.competition = competition;
    this.displayModalSave = true;
  }

  onAddNewCompetition(): void {
    this.competition = new Competition();
    this.displayModalSave = true;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
