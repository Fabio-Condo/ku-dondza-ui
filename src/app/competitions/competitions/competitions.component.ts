import { Component, OnInit, ViewChild } from '@angular/core';
import { CompetitionFilter } from 'src/app/core/interface/CompetitionFilter';
import { Competition } from 'src/app/core/model/Competition';
import { CompetitionService } from '../competition.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionService } from 'src/app/questions/question.service';
import { Question } from 'src/app/core/model/Question';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { IUserFilter } from 'src/app/core/model/IUserFilter';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';

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
  isAdmin: boolean = false;

  // Dados das competições
  competitions: Competition[] = [];
  competition: Competition = new Competition();
  selectedCompetition: Competition = new Competition();
  selectedQuestion: Question = new Question();
  showCompetitionDialog: boolean = false;
  showAddQuestionsDialog: boolean = false;

  loggedUser: User = new User;

  activeTab: number = 1;

  //participants: User[] = [];
  totalRegistrosParticipants: number = 0
  totalRegistrosParticipantRequests: number = 0

  questionsList: any[] = [];
  totalRegistrosQuestions: number = 10000

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: CompetitionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  };

  filtroParticipants: IUserFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  filtroParticipantRequests: IUserFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  filtroQuestions: QuestionFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  @ViewChild('tabela') grid: any;

  constructor(
    private competitionService: CompetitionService,
    private questionService: QuestionService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private errorHandler: ErrorHandlerService,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.buscarTotal();
    this.findAll(0);
    this.getQuestions();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  toggleDropdown(competition: Competition) {
    competition.isAdminMenuOpen = !competition.isAdminMenuOpen
  }

  closeDropdown(competition: Competition) {
    competition.isAdminMenuOpen = false;
  }


  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.competitionService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Competition>) => {
        this.competitions = dados.content;
        dados.content.forEach(competition => {
          this.countQuestionsByCompetitionId(competition);
          this.countParticipantsByCompetitionId(competition);
          this.checkIfRequestedParticipation(competition);
          this.checkIfIsParticipant(competition);
        });
        this.totalRegistros = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  checkIfIsParticipant(competition: Competition): void {
    this.competitionService.checkIfIsParticipant(competition.id, this.loggedUser.id).subscribe(response => {
      competition.isParticipant = response;
    });
  }

  checkIfRequestedParticipation(competition: Competition): void {
    this.competitionService.checkIfRequestedParticipation(competition.id, this.loggedUser.id).subscribe(response => {
      competition.requestedParticipation = response;
    });
  }

  addParticipantToCompetition(competition: Competition) {
    this.competitionService.addParticipantToCompetition(competition.id, this.loggedUser.id).subscribe(
      (competition) => {
        this.competition = competition;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  countParticipantsByCompetitionId(competition: Competition) {
    this.showLoading = true;
    this.competitionService.countParticipantsByCompetitionId(competition.id,).subscribe(
      (total) => {
        competition.totalParticipants = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getQuestions() {
    return this.questionService.getAll().subscribe(
      dados => {
        this.questionsList = dados.map(dado => {
          return {
            label: dado.text,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  addQuestionToCompetition() {
    this.competitionService.addQuestionToCompetition(this.competition.id, this.selectedQuestion.id).subscribe(
      (competition) => {
        this.competition = competition;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  removeQuestionFromCompetition(question: Question) {
    this.competitionService.removeQuestionFromCompetition(this.selectedCompetition.id, question.id).subscribe(
      () => {
        this.selectedCompetition.questions = this.selectedCompetition.questions.filter(quest => quest.id !== question.id);
      },
      error => this.errorHandler.handle(error)
    );
  }

  getQuestionsByCompetitionId(): void {
    this.competitionService.getQuestionsByCompetitionId(this.selectedCompetition.id, this.filtroQuestions).subscribe(
      (dados: IApiResponse<Question>) => {
        this.selectedCompetition.questions = [...this.selectedCompetition.questions, ...dados.content];
        this.totalRegistrosQuestions = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  countQuestionsByCompetitionId(competition: Competition) {
    this.showLoading = true;
    this.competitionService.countQuestionsByCompetitionId(competition.id,).subscribe(
      (total) => {
        competition.totalQuestions = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }
  
  onShowMoreQuestions(): void {
    if (this.selectedCompetition) {
      this.filtroQuestions.page++;
      this.getQuestionsByCompetitionId();
    }
  }

  removeParticipantFromCompetition(user: User) {
    this.competitionService.removeParticipantFromCompetition(this.selectedCompetition.id, user.id).subscribe(
      () => {
        this.selectedCompetition.participants = this.selectedCompetition.participants.filter(request => request.id !== user.id);
      },
      error => this.errorHandler.handle(error)
    );
  }

  getParticipantsByCompetitionId(): void {
    this.competitionService.getParticipantsByCompetitionId(this.selectedCompetition.id, this.filtroParticipants).subscribe(
      (dados: IApiResponse<User>) => {
        this.selectedCompetition.participants = [...this.selectedCompetition.participants, ...dados.content];
        this.totalRegistrosParticipants = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }
  
  onShowMoreParticipantes(): void {
    if (this.selectedCompetition) {
      this.filtroParticipants.page++;
      this.getParticipantsByCompetitionId();
    }
  }

  getParticipantRequestsByCompetitionId(): void {
    this.competitionService.findParticipationRequestsByCompetitionId(this.selectedCompetition.id, this.filtroParticipantRequests).subscribe(
      (dados: IApiResponse<User>) => {
        this.selectedCompetition.participationRequests = [...this.selectedCompetition.participationRequests, ...dados.content];
        this.totalRegistrosParticipantRequests = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }
  
  onShowMoreParticipanteRequests(): void {
    if (this.selectedCompetition) {
      this.filtroParticipantRequests.page++;
      this.getParticipantRequestsByCompetitionId();
    }
  }

  onShowSelectedCompetition(competition: Competition): void {
    this.selectedCompetition = competition;

    this.selectedCompetition.participants = []; 
    this.filtroParticipants.page = 0; 
    this.getParticipantsByCompetitionId();

    this.selectedCompetition.participationRequests = []; 
    this.filtroParticipantRequests.page = 0; 
    this.getParticipantRequestsByCompetitionId();

    this.selectedCompetition.questions = [];
    this.filtroQuestions.page = 0; 
    this.getQuestionsByCompetitionId();

    this.showCompetitionDialog = true;
  } 

  sendParticipationRequest(competition: Competition) {
    this.competitionService.sendParticipationRequest(competition.id, this.loggedUser.id).subscribe(
      (response) => {
        competition.requestedParticipation = true;
        // Adiciona o novo user à lista de pedidos de participação
        this.selectedCompetition.participationRequests.push(this.loggedUser);
        //this.selectedCompetition.requestedParticipation = true;
      },
      erro => this.errorHandler.handle(erro)
    )
  }

  acceptParticipationRequest(user: User) {
    this.competitionService.acceptParticipationRequest(this.selectedCompetition.id, user.id).subscribe(
      (competition) => {
        // Remove a solicitação pendente da lista
        this.selectedCompetition.participationRequests = this.selectedCompetition.participationRequests.filter(request => request.id !== user.id);
        // Adiciona o novo participante à lista de participantes
        this.selectedCompetition.participants.push(user);
        //this.getUsersSearch();
      },
      erro => this.errorHandler.handle(erro)
    )
  }

  rejectParticipationRequest(user: User) {
    this.competitionService.rejectParticipationRequest(this.selectedCompetition.id, user.id).subscribe(
      () => {
        // Remove a solicitação rejeitada da lista de pendentes
        this.selectedCompetition.participationRequests = this.selectedCompetition.participationRequests.filter(request => request.id !== user.id);
      },
      error => this.errorHandler.handle(error)
    );
  }

  cancelParticipationRequest(competition: Competition) {
    this.competitionService.rejectParticipationRequest(competition.id, this.loggedUser.id).subscribe(
      () => {
        competition.requestedParticipation = false;
      },
      error => this.errorHandler.handle(error)
    );
  }

  onAddQuestions(competition: Competition) {
    this.competition = competition;
    this.showAddQuestionsDialog = true;
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
    this.filtro.searchParam = "";
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

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
