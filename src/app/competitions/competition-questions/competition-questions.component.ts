import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
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
import { Submission } from 'src/app/core/model/Submission';
import { UserService } from 'src/app/users/user.service';
declare const MathJax: any;
import { evaluate } from 'mathjs'; //npm install mathjs
import { Role } from 'src/app/enum/role.enum';
import { SubmissionService } from 'src/app/core/submissions/submission.service';
import { SubmissionFilter } from 'src/app/core/interface/SubmissionFilter';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Subscription } from 'rxjs';
import { RankingDTO } from 'src/app/core/interface/RankingDTO';
import { RankingFilter } from 'src/app/core/interface/RankingFilter';


@Component({
  selector: 'app-competition-questions',
  templateUrl: './competition-questions.component.html',
  styleUrls: ['./competition-questions.component.css']
})
export class CompetitionQuestionsComponent implements OnInit {

  competition: Competition = new Competition();
  //questions: Question[] = [];
  topics: Topic[] = [];
  submission: Submission = new Submission();

  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  showLoading: boolean = false;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  answers: Array<Answer> = [];
  currentQuestionIndex: number = 0;

  isUserLoggedIn: boolean = false;

  private subscriptions: Subscription[] = [];

  displayModalLogin: boolean = false;


  // Armazenar as respostas do usuário
  //userAnswers: { questionId: number; answerId: number }[] = [];
  //correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    nullAnswers: number; // Nova propriedade para respostas nulas
  } = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };

  showCorrection: boolean = false;
  showStartScreen: boolean = true;
  showResultsScreen: boolean = false;
  showSubmittedScreen: boolean = false; // nova variável adicionada

  // desabilita inputs ou edições
  disableEditing: boolean = false;


  loadingMessage = "Carregando"; // Alterar dinamicamente

  loggedUser: User = new User();
  //submited: boolean = false;

  submissions: Submission[] = [];
  totalRecordSubmissions: number = 0;

  rankingEntries: RankingDTO[] = [];
  totalRankingEntries: number = 0;

  user = new User();
  activeLoginTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  activeTab: number = 1;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 105,
    sort: 'id,asc'
  };


  submissionFilter: SubmissionFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  rankingFilter: RankingFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private competitionService: CompetitionService,
    private submissionService: SubmissionService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const competitionId = this.route.snapshot.params['id'];
    if (competitionId) {
      this.getCompetitionByCompetitionId(competitionId);
    }
    this.scrollToTop();
  }

  onStart() {
    if (this.isUserLoggedIn) {
      this.start();
    }

    if (!this.isUserLoggedIn) {
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  start() {
    this.showStartScreen = false;
    this.showResultsScreen = false;
    this.renderMathExpressions();
    this.renderFunctions();
  }

  submite() {
    this.submission.user = this.loggedUser;
    this.submission.competition = this.competition;
    this.submission.answers = this.submittedAnswers;
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.submissionService.add(this.submission, userAnswerIds).subscribe(
      (response) => {
        this.competition.currentUserHasSubmitted = true;
        this.submission = response;
        this.submissions.push(response);
        this.showSubmittedScreen = true;
        //this.messageService.add({ severity: 'success', detail: 'Sumissão feita com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onShowUserSubmissionOnly(userId: number) {
    this.submissionService.getSubmissionByUserAndCompetition(userId, this.competition.id).subscribe(
      (response) => {
        this.submission = response;
        this.submittedAnswers = this.submission.answers;

        this.showCorrection = false;
        this.currentQuestionIndex = 0;
        this.showResultsScreen = false;
        this.renderMathExpressions();
        this.renderFunctions();
        this.scrollToTop();

        this.showStartScreen = false;
        //this.competition.currentUserHasSubmitted = true;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onShowUserSubmissionAndCorrection(userId: number) {
    this.submissionService.getSubmissionByUserAndCompetition(userId, this.competition.id).subscribe(
      (response) => {
        this.submission = response;
        this.submittedAnswers = this.submission.answers;

        this.showCorrection = true;
        this.currentQuestionIndex = 0;
        this.showResultsScreen = false;
        this.renderMathExpressions();
        this.renderFunctions();
        this.calculateResults();
        this.scrollToTop();

        this.showStartScreen = false;
        //this.competition.currentUserHasSubmitted = true;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onShowCorrectionOnly() {

    this.submittedAnswers = [];

    this.showCorrection = true;
    this.currentQuestionIndex = 0;
    this.showResultsScreen = false;

    this.renderMathExpressions();
    this.renderFunctions();
    this.scrollToTop();

    this.calculateResults();
    this.showStartScreen = false;
    //this.competition.currentUserHasSubmitted = true;
  }

  getSubmissionsByCompetitionId(competitionId: number): void {
    this.loadingMessage = "Buscando alunos..."
    this.showLoading = true;
    this.submissionFilter.page++;
    this.submissionService.getSubmissionsByCompetitionId(competitionId, this.submissionFilter).subscribe(

      (dados: IApiResponse<Submission>) => {
        this.submissions = [...this.submissions, ...dados.content];
        this.totalRecordSubmissions = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onShowMoreSubmissions(): void {
    this.getSubmissionsByCompetitionId(this.competition.id);
  }

  getRankingEntries(competitionId: number): void {
    this.loadingMessage = "Buscando o ranking..."
    this.showLoading = true;
    this.rankingFilter.page++;
    this.submissionService.getRanking(competitionId, this.rankingFilter).subscribe(

      (dados: IApiResponse<RankingDTO>) => {
        this.rankingEntries = [...this.rankingEntries, ...dados.content];
        this.totalRankingEntries = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onGetMoreRankingEntries(): void {
    this.getRankingEntries(this.competition.id);
  }

  getSubmissionByUserAndCompetition(participante: User) {
    this.submissionService.getSubmissionByUserAndCompetition(participante.id, this.competition.id).subscribe(
      (response) => {
        this.submission = response;
        this.submittedAnswers = this.submission.answers;
        //this.submittedAnswers.forEach(submission => {
        //  console.log(submission.text);
        //});
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getCompetitionByCompetitionId(competitionId: string) {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.showLoading = true;
    this.loadingMessage = "Carregando dados"
    this.competitionService.getCompetitionByCompetitionId(competitionId, this.loggedUser.id).subscribe(
      (response) => {
        this.competition = response;
        this.getQuestionsByCompetitionId(this.competition.id);
        this.getSubmissionsByCompetitionId(this.competition.id);
        this.getRankingEntries(this.competition.id);
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) { // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
        this.showLoading = false;
      }
    );
  }

  getQuestionsByCompetitionId(competitionId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1;
    this.competitionService.getQuestionsByCompetitionId(competitionId, this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        //this.questions = dados.content;
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
        //console.log(`Processando questão: ${questao.id}, tópico: ${questao.topic.name}`);
        if (!topicosMap.has(questao.topic.id)) {
          topicosMap.set(questao.topic.id, questao.topic);
        }
      } else {
        console.error(`Questão ${questao.id} sem tópico`);
      }
    });

    return Array.from(topicosMap.values());
  }

  displayResults() {
    const message = `Você acertou ${this.result.correctAnswers} resposta(s) e errou ${this.result.incorrectAnswers} resposta(s).`;
    this.messageService.add({ severity: 'info', detail: message });
  }

  // Método para submeter as respostas
  submitAnswers() {
    // Verifica se o usuário fez login
    if (!this.isUserLoggedIn) {
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    } else {
      // Calcula os resultados
      //this.calculateResults();

      // Exibe a tela final
      //this.showResultsScreen = true;

      // Salva o quiz, se ainda não foi submetido
      if (!this.competition.currentUserHasSubmitted) {
        this.submite();
      }
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
    const question = this.competition.questions.find(q => q.id === questionId);
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
    this.showResultsScreen = false;
    this.renderMathExpressions();
    this.renderFunctions();
    this.scrollToTop();
  }

  get progressPercentage(): number {
    const totalQuestions = this.competition.questions.length;

    // Filtra para contar somente as respostas não nulas
    const answeredCount = this.answers.filter(
      a => a.id !== null && a.id !== undefined
    ).length;

    // Calcula o progresso com base nas respostas
    return (answeredCount / totalQuestions) * 100;
  }

  // Método para ir para a questão anterior
  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();
    }
  }

  // Método para ir para a próxima questão
  goToNextQuestion() {
    if (this.currentQuestionIndex < this.competition.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();
    }
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  // Método para rolar a página para o topo
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getUserTypeValue(type: string) {
    switch (type) {
      case 'STUDENT':
        return 'Estudante';
      case 'INSTRUTOR':
        return 'Instrutor';
      case 'TEACHER':
        return 'Professor';
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

  renderMathExpressions(): void {
    setTimeout(() => {
      const questionText = this.getTextoComNegrito(this.competition.questions[this.currentQuestionIndex].text);
      const solutionText = this.getTextoComNegrito(this.competition.questions[this.currentQuestionIndex].solution);

      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        mathContainer.innerHTML = questionText;
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        mathContainerSolution.innerHTML = solutionText;
      }

      if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
    }, 0);
  }

  renderFunctions() {
    setTimeout(() => {
      const canvas = this.canvas?.nativeElement;
      if (!canvas || !this.competition.questions[this.currentQuestionIndex].mathExpressions || this.competition.questions[this.currentQuestionIndex].mathExpressions.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const scaleX = width / 20;
      const scaleY = height / 20;

      // Desenha os eixos
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Adiciona os números nos eixos
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        let y = height / 2 - i * scaleY;
        if (i !== 0) {
          ctx.fillText(i.toString(), x, height / 2 + 15);
          ctx.fillText(i.toString(), width / 2 - 15, y + 5);
        }
      }

      // Cores para múltiplos gráficos
      const colors = ['blue', 'red', 'green', 'orange', 'purple'];

      this.competition.questions[this.currentQuestionIndex].mathExpressions.forEach((express, index) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2;

        for (let x = -10; x <= 10; x += 0.1) {
          try {
            let y = evaluate(express.expression!.replace(/x/g, `(${x})`));
            let screenX = width / 2 + x * scaleX;
            let screenY = height / 2 - y * scaleY;
            if (x === -10) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          } catch (error) {
            console.error(`Erro ao avaliar ${express.expression!}:`, error);
          }
        }
        ctx.stroke();
      });
    }, 0);
  }

  getTextoComNegrito(text: string): string {
    if (!text) return '';
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  sendOtp() {
    this.showLoading = true;
    //const email = this.otpForm.value.email!;
    this.authenticationService.generateOtp(this.user.email).subscribe({
      next: () => {
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  validateOtp() {
    this.showLoading = true;
    this.authenticationService.validateOtp(this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        //this.download(this.selectedBook);

        this.showLoading = false;
        this.displayModalLogin = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  startRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.startRegistrationViaOtp(this.user.email).subscribe({
      next: (response) => {
        console.log(response.body)
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  completeRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.completeRegistrationViaOtp(this.user.fullName, this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        //this.download(this.selectedBook);

        this.showLoading = false;
        this.displayModalLogin = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  private async initializeGoogleAuth(): Promise<void> {
    try {
      const setupButton = await this.googleAuthService.initializeGoogleButton('google-signin-button');
      setupButton((credential) => this.handleGoogleCredential(credential));
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar autenticação Google',
        life: 5000
      });
    }
  }

  private handleGoogleCredential(googleCredential: string): void {
    this.ngZone.run(() => {
      this.loadingMessage = "Estamos quase lá";
      this.showLoading = true;
    });

    const sub = this.authenticationService.loginWithGoogle(googleCredential).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.ngZone.run(() => {

          //this.download(this.selectedBook)

          this.showLoading = false;
          this.displayModalLogin = false;
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
        this.showLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }


  setActiveLoginTab(tabIndex: number) {
    this.activeLoginTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  goToProfile(userId: string) {
      this.router.navigate(['/user/profile', userId]);
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