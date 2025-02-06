import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { CompetitionService } from '../competition.service';
import { Competition } from 'src/app/core/model/Competition';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Topic } from 'src/app/core/model/Topic';
import { IUserFilter } from 'src/app/core/interface/IUserFilter';
import { SubmissionService } from 'src/app/core/submissions/submission.service';
import { Submission } from 'src/app/core/model/Submission';
import { UserService } from 'src/app/users/user.service';
declare const MathJax: any;


@Component({
  selector: 'app-competition-questions',
  templateUrl: './competition-questions.component.html',
  styleUrls: ['./competition-questions.component.css']
})
export class CompetitionQuestionsComponent implements OnInit {

  competition: Competition = new Competition();
  questions: Question[] = [];
  topics: Topic[] = [];
  participants: User[] = [];
  submission: Submission = new Submission();

  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  showLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  answers: Array<Answer> = [];
  currentQuestionIndex: number = 0;

  // Armazenar as respostas do usuário
  //userAnswers: { questionId: number; answerId: number }[] = [];
  //correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    nullAnswers: number; // Nova propriedade para respostas nulas
  } = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };

  showCorrection: boolean = false;
  showStartScreen: boolean = true;
  showFinalScreen: boolean = false;

  loggedUser: User = new User();
  submited: boolean = false;

  totalRegistrosParticipants: number = 0
  totalRegistrosParticipantRequests: number = 0

  activeTab: number = 1;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 105,
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

  constructor(
    private competitionService: CompetitionService,
    private submissionService: SubmissionService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const competitionId = this.route.snapshot.params['id'];
    if (competitionId) {
      this.getCompetitionByCompetitionId(competitionId);
    }
    this.scrollToTop();
  }

  //finishCompetition() {
  //  this.competitionService.finishCompetition(this.competition.id).subscribe(
  //    (response) => {
  //      console.log('Competition finished:', response);
  //    },
  //    (errorResponse: HttpErrorResponse) => {
  //      this.sendErrorNotification(errorResponse.error.message);
  //      this.showLoading = false;
  //    }
  //  );
  //}

  start() {
    this.showStartScreen = false;
    this.showFinalScreen = false;
    this.renderMathExpressions();
  }

  submite() {

    this.submission.user = this.loggedUser;
    this.submission.competition = this.competition;
    this.submission.answers = this.submittedAnswers;
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.submissionService.add(this.submission, userAnswerIds).subscribe(
      (response) => {
        this.submited = true;
        this.submission = response
        this.messageService.add({ severity: 'success', detail: 'Sumissão feita com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onShowUserSubmission(participante: User) {
    this.getSubmissionByUserAndCompetition(participante);
    this.toggleCorrection();
    this.scrollToTop();
    this.showStartScreen = false;
    this.showFinalScreen = false;
  }

  getSubmissionByUserAndCompetition(participante: User) {
    this.submissionService.getSubmissionByUserAndCompetition(participante.id, this.competition.id).subscribe(
      (response) => {
        this.submission = response;
        this.submittedAnswers = this.submission.answers;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }


  getCompetitionByCompetitionId(competitionId: string) {
    this.competitionService.getCompetitionByCompetitionId(competitionId).subscribe(
      (response) => {
        this.competition = response;
        this.checkIfRequestedParticipation(this.competition);
        this.checkIfIsParticipant(this.competition);
        this.getQuestionsByCompetitionId(this.competition.id);
        this.onShowMoreParticipantes();
        this.onShowMoreParticipanteRequests();

        if (this.competition.isParticipant && this.competition.status == 'FINISHED') {
          this.getSubmissionByUserAndCompetition(this.loggedUser);

        }
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) { // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuestionsByCompetitionId(competitionId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1;
    this.competitionService.getQuestionsByCompetitionId(competitionId, this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions = dados.content;
        this.competition.questions = dados.content;
        this.topics = this.getTopicosFromQuestoes(dados.content);
        this.showLoading = false;
        this.renderMathExpressions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getTopicosFromQuestoes(questoes: Question[]): Topic[] {
    if (!questoes || questoes.length === 0) {
      console.error('Nenhuma questão recebida ou questões vazias');
      return [];
    }

    const topicosMap = new Map<number, Topic>();

    questoes.forEach((questao) => {
      if (questao.topic) {
        console.log(`Processando questão: ${questao.id}, tópico: ${questao.topic.name}`);
        if (!topicosMap.has(questao.topic.id)) {
          topicosMap.set(questao.topic.id, questao.topic);
        }
      } else {
        console.error(`Questão ${questao.id} sem tópico`);
      }
    });

    return Array.from(topicosMap.values());
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

  removeParticipantFromCompetition(user: User) {
    this.competitionService.removeParticipantFromCompetition(this.competition.id, user.id).subscribe(
      () => {
        this.competition.participants = this.competition.participants.filter(request => request.id !== user.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  sendParticipationRequest(competition: Competition) {
    this.competitionService.sendParticipationRequest(competition.id, this.loggedUser.id).subscribe(
      (response) => {
        competition.requestedParticipation = true;
        // Adiciona o novo user à lista de pedidos de participação
        this.competition.participationRequests.push(this.loggedUser);
        //this.selectedCompetition.requestedParticipation = true;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  acceptParticipationRequest(user: User) {
    this.competitionService.acceptParticipationRequest(this.competition.id, user.id).subscribe(
      (competition) => {
        // Remove a solicitação pendente da lista
        this.competition.participationRequests = this.competition.participationRequests.filter(request => request.id !== user.id);
        // Adiciona o novo participante à lista de participantes
        this.competition.participants.push(user);
        this.totalRegistrosParticipants++;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  rejectParticipationRequest(user: User) {
    this.competitionService.rejectParticipationRequest(this.competition.id, user.id).subscribe(
      () => {
        // Remove a solicitação rejeitada da lista de pendentes
        this.competition.participationRequests = this.competition.participationRequests.filter(request => request.id !== user.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  cancelParticipationRequest(competition: Competition) {
    this.competitionService.rejectParticipationRequest(competition.id, this.loggedUser.id).subscribe(
      () => {
        competition.requestedParticipation = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  onShowMoreParticipantes(): void {
    if (this.competition) {
      this.filtroParticipants.page++;
      this.getParticipantsByCompetitionId();
    }
  }

  getParticipantsByCompetitionId(): void {
    this.competitionService.getParticipantsByCompetitionId(this.competition.id, this.filtroParticipants).subscribe(
      (dados: IApiResponse<User>) => {
        // Garante que this.competition.participants seja um array
        if (!Array.isArray(this.competition.participants)) {
          this.competition.participants = [];
        }

        this.competition.participants = [...this.competition.participants, ...dados.content];
        this.totalRegistrosParticipants = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getParticipantRequestsByCompetitionId(): void {
    this.competitionService.findParticipationRequestsByCompetitionId(this.competition.id, this.filtroParticipantRequests).subscribe(
      (dados: IApiResponse<User>) => {
        // Garante que this.competition.participants seja um array
        if (!Array.isArray(this.competition.participationRequests)) {
          this.competition.participationRequests = [];
        }

        this.competition.participationRequests = [...this.competition.participationRequests, ...dados.content];
        this.totalRegistrosParticipantRequests = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  onShowMoreParticipanteRequests(): void {
    if (this.competition) {
      this.filtroParticipantRequests.page++;
      this.getParticipantRequestsByCompetitionId();
    }
  }

  displayResults() {
    const message = `Você acertou ${this.result.correctAnswers} resposta(s) e errou ${this.result.incorrectAnswers} resposta(s).`;
    this.messageService.add({ severity: 'info', detail: message });
  }

  // Método para submeter as respostas
  submitAnswers() {
    // Calcula os resultados
    this.calculateResults();

    // Exibe a tela final
    this.showFinalScreen = true;

    // Salva o quiz, se ainda não foi submetido
    if (!this.submited) {
      this.submite();
    }
  }

  // Método para calcular os resultados
  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0;

    // Reinicia o objeto de resultados por tópico
    this.competition.resultsByTopic = {};

    // Itera sobre todas as questões do quiz
    this.competition.questions.forEach((question) => {
      const submittedAnswer = this.submittedAnswers.find(
        (a) => a.question?.id === question.id
      );

      // Obtém o tópico da questão
      const questionTopic = question.topic?.name || 'Sem tópico';

      // Inicializa o tópico no objeto resultsByTopic, se necessário
      if (!this.competition.resultsByTopic[questionTopic]) {
        this.competition.resultsByTopic[questionTopic] = {
          correct: 0,
          incorrect: 0,
          nullAnswers: 0,
          total: 0,
          percentage: 0
        };
      }

      // Incrementa o total de questões por tópico
      this.competition.resultsByTopic[questionTopic].total++;

      if (submittedAnswer) {
        // Se o usuário respondeu, verifica se a resposta está correta ou incorreta
        if (submittedAnswer.correct) {
          this.result.correctAnswers++;
          this.competition.resultsByTopic[questionTopic].correct++;
        } else {
          this.result.incorrectAnswers++;
          this.competition.resultsByTopic[questionTopic].incorrect++;
        }
      } else {
        // Se não há resposta submetida, conta como não respondida
        this.result.nullAnswers++;
        this.competition.resultsByTopic[questionTopic].nullAnswers++;
      }
    });

    // Calcula a porcentagem de acertos por tópico
    for (const topic in this.competition.resultsByTopic) {
      const { correct, total } = this.competition.resultsByTopic[topic];
      this.competition.resultsByTopic[topic].percentage = (correct / total) * 100;
    }
  }


  // Método para capturar a resposta do usuário
  captureUserAnswer(questionId: number, answerId: number | null): void {
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      let userAnswer: Answer;

      if (answerId !== null) {
        const answer = question.answers.find(a => a.id === answerId);
        if (answer) {
          userAnswer = {
            id: answer.id,
            text: answer.text,
            correct: answer.correct,
            question: question
          };
        } else {
          return; // Resposta inválida
        }
      } else {
        // Resposta nula (não respondida)
        userAnswer = {
          id: -1, // ID inválido para indicar resposta nula
          text: 'Não respondida',
          correct: false,
          question: question
        };
      }

      // Atualiza ou adiciona a resposta
      const existingAnswerIndex = this.submittedAnswers.findIndex(a => a.question?.id === questionId);
      if (existingAnswerIndex !== -1) {
        this.submittedAnswers[existingAnswerIndex] = userAnswer;
      } else {
        this.submittedAnswers.push(userAnswer);
      }
    }
  }

  // Método para verificar se uma resposta foi selecionada
  isSelected(questionId: number, answerId: number): boolean {
    const userAnswer = this.submittedAnswers.find(a => a.question?.id === questionId);
    return userAnswer ? userAnswer.id === answerId : false;
  }

  // Método para alternar a exibição da correção
  toggleCorrection() {
    this.showCorrection = true;
    this.currentQuestionIndex = 0;
    this.showFinalScreen = false;

    // Aguarda a atualização do DOM antes de renderizar MathJax
    setTimeout(() => {
      this.renderMathExpressions();
    }, 0);

    this.scrollToTop();
  }

  // Método para ir para a questão anterior
  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions();
      this.scrollToTop();
    }
  }

  // Método para ir para a próxima questão
  goToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions();
      this.scrollToTop();
    }
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainer.innerHTML = `\\[${this.competition.questions[this.currentQuestionIndex].text}\\]`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
    }, 0);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  // Método para rolar a página para o topo
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getStatus(status: string): string {
    switch (status) {
      case 'PLANNING':
        return 'PLANEANDO';
      case 'ONGOING':
        return 'EM ANDAMENTO';
      case 'FINISHED':
        return 'FINALIZADO';
      case 'CANCELED':
        return 'CANCELADO';
      default:
        return `PLANNING`;
    }
  }

  get isPlanned(): boolean {
    return this.competition.status === 'PLANNING';
  }

  get isOngoing(): boolean {
    return this.competition.status === 'ONGOING';
  }

  get isFinished(): boolean {
    return this.competition.status === 'FINISHED';
  }

  get canStart(): boolean {
    return (this.isOngoing &&
      this.competition.isParticipant);
  }

  get canSubscribe(): boolean {
    return this.isPlanned &&
      !this.competition.isParticipant &&
      !this.competition.requestedParticipation;
  }

  get canCancelRequest(): boolean {
    return this.isPlanned &&
      this.competition.requestedParticipation &&
      !this.competition.isParticipant;
  }

  get canViewSubmission(): boolean {
    return this.isFinished &&
      this.competition.isParticipant;
  }

  initCompetition() {
    this.competitionService.initCompetition(this.competition.id).subscribe(
      (response) => {
        this.competition.status = 'ONGOING'
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}

