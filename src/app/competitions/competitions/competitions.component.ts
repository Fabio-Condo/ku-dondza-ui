import { Component, OnInit, ViewChild } from '@angular/core';
import { CompetitionFilter } from 'src/app/core/interface/CompetitionFilter';
import { Competition } from 'src/app/core/model/Competition';
import { CompetitionService } from '../competition.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Topic } from 'src/app/core/model/Topic';
import { TopicService } from 'src/app/topics/topicsService.service';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Role } from 'src/app/enum/role.enum';

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
  isDropdownOpen: boolean = false;
  displayModalFilter: boolean = false;

  // Dados das competições
  competitions: Competition[] = [];
  competition: Competition = new Competition();

  topics: Topic[] = [];
  subjects: Subject[] = [];

  loggedUser: User = new User;
  isUserLoggedIn: boolean = false;

  loadingMessage = "Carregando"; // Alterar dinamicamente

  activeTab: number = 1;

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: CompetitionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,desc'
  };

  difficultyLevels = [
    { label: 'EASY', value: 'EASY' },
    { label: 'MEDIUM', value: 'MEDIUM' },
    { label: 'HARD', value: 'HARD' },
  ];

  @ViewChild('tabela') grid: any;

  constructor(
    private competitionService: CompetitionService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private errorHandler: ErrorHandlerService,
  ) { }

  ngOnInit(): void {
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
    const selectedTopicIds = this.getSelectedTopicIds();
    this.competitionService.add(this.competition, selectedTopicIds).subscribe(
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
      //if (this.grid.first === 0) {
      //  this.findAll();
      //}
      this.findAll();
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
    this.competitionService.buscarTotal().subscribe(
      (total) => {
        this.totalCompetitions = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  findAll(pagina: number = 0): void {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.showLoading = true;
    this.loadingMessage = "Carregando dados"
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.competitionService.findAll(this.filtro, this.loggedUser.id).subscribe(
      (dados: IApiResponse<Competition>) => {
        this.competitions = dados.content;
        dados.content.forEach(competition => {
          //this.countQuestionsByCompetitionId(competition);
          //this.countParticipantsByCompetitionId(competition);
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

  loadMore(page: number = 0): void {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.showLoading = true;
    this.loadingMessage = "Carregando dados"
    this.filtro.page++;

    this.competitionService.findAll(this.filtro, this.loggedUser.id).subscribe(
      (data: IApiResponse<Competition>) => {
        this.competitions = [...this.competitions, ...data.content];

        data.content.forEach(competition => {
          //this.countQuestionsByCompetitionId(competition);
          //this.countParticipantsByCompetitionId(competition);
        });
        this.totalRegistros = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para carregar as disciplinas
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

  // Método para carregar os tópicos de uma disciplina
  getTopicsBySubjectId(subjectId: number): void {
    this.topicService.getBySubjectId(subjectId).subscribe(
      (dados: Topic[]) => {
        this.competition.questions = [];
        this.topics = [];
        this.topics = dados;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para alternar a seleção de um tópico
  toggleTopic(topic: Topic): void {
    topic.selected = !topic.selected;
  }

  // Método para obter os tópicos selecionados
  getSelectedTopics(): Topic[] {
    return this.topics.filter(topic => topic.selected);
  }

  // Método para obter os IDs dos tópicos selecionados
  getSelectedTopicIds(): number[] {
    return this.topics.filter(topic => topic.selected).map(topic => topic.id);
  }

  toggleDropdown(competition: Competition) {
    competition.isAdminMenuOpen = !competition.isAdminMenuOpen
  }

  closeDropdown(competition: Competition) {
    competition.isAdminMenuOpen = false;
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

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Formata os minutos e segundos para ter 2 dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  getDifficultyLevelValue(level: string) {
    switch (level) {
      case 'EASY':
        return 'Fácil';
      case 'MEDIUM':
        return 'Médio';
      case 'HARD':
        return 'Dificil';
    }
    return '';
  }

  getStatusValue(status: boolean) {
    switch (status) {
      case true:
        return 'Aberta';
      case false:
        return 'Encerrada';
    }
    return '';
  }

  // Método para limpar campos
  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.title = "";
    this.filtro.subject = undefined;
    this.filtro.difficultyLevel = undefined;
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


  getPosition(prize: string): string {
    switch (prize) {
      case 'FIRST_PLACE':
        return '1º lugar';
      case 'SECOND_PLACE':
        return '2º lugar';
      case 'THIRD_PLACE':
        return '3º lugar';
      default:
        return `${prize}º lugar`;
    }
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
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