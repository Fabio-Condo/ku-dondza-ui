import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Topic } from 'src/app/core/model/Topic';
import { Comment } from 'src/app/core/model/Comment';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from 'src/app/core/model/User';
import { Title } from '@angular/platform-browser';
import { TopicService } from 'src/app/topics/topicsService.service';
import { QuestionService } from 'src/app/questions/question.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';
import { Answer } from 'src/app/core/model/Answer';
import { interval, Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { CommentLikeService } from 'src/app/likes/commentLike.service';
import { CommentService } from 'src/app/comments/comment.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { NgForm } from '@angular/forms';
import { Role } from 'src/app/enum/role.enum';
import { CommentFilter } from 'src/app/core/interface/CommentFilter';
import { UserService } from 'src/app/users/user.service';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { Wallet } from 'src/app/core/model/Wallet';
import { ProgressService } from 'src/app/progress/progress.service';
declare const MathJax: any;
import { e, evaluate } from 'mathjs'; //npm install mathjs
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';
import { ChallengeService } from 'src/app/challenges/challenge.service';
import { AuthModalService } from 'src/app/core/auth-modal.service';
import { TutorMessageResponse } from 'src/app/core/model/TutorMessageResponse';
import { TutorConversationService } from 'src/app/core/tutor-conversation.service';
import { TutorAiService } from 'src/app/core/tutor-ai.service';
import { ConversationFilter } from 'src/app/core/interface/ConversationFilter';
import { TutorRequest } from 'src/app/core/model/TutorRequest';


@Component({
  selector: 'app-quizz-questions',
  templateUrl: './quizz-questions.component.html',
  styleUrls: ['./quizz-questions.component.css'],
})
export class QuizzQuestionsComponent implements OnInit {
  //[x: string]: any;
  quiz: Quiz = new Quiz();
  topics: Topic[] = [];

  tutorRequest: TutorRequest = new TutorRequest();
  tutorResponse: string = '';
  showTutorThinking: boolean = false;

  tutorMessages: TutorMessageResponse[] = [];

  totalRecords: number = 0;
  //currentPage: number = 1;
  totalMessages: number = 0;

  displayModalTutor: boolean = false;

  showLoading: boolean = false;
  retryVisible: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  showInitQuizScreen: boolean = false; // Variável para controlar a exibição da tela inicial do quiz
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  questionsWithFullSolutions: Question[] = [];
  questions: Question[] = [];
  subjects: Subject[] = [];
  showGetSubjectLoading: boolean = false;

  // desabilita inputs ou edições
  disableEditing: boolean = false;

  // mostra opções adicionais
  showOptions: boolean = false;

  timerSubscription!: Subscription;
  totalTimeLimit: number = 0;
  timeLimit: number = 0;
  formattedTime: string = '00:00'; // Inicializa no formato correto
  remainingTime: number = 0;   // Tempo restante para o quiz
  startTime: number = 0; // Armazena o tempo em que o quiz foi iniciado (timestamp)

  displayModalQuestionsList: boolean = false;
  displayModalUpgradePlan: boolean = false;
  displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  origem: string = '';
  progressTestId: number = 0;
  challengeId: number = 0;

  correctSound = new Audio('assets/sounds/correct.mpeg');
  wrongSound = new Audio('assets/sounds/wrong.mpeg');

  selectedQuestion: Question = new Question();
  comment: Comment = new Comment();
  comments: Comment[] = [];
  totalRecordComments: number = 0;
  showComments: boolean = false;
  selectedComment: Comment = new Comment();

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  openedMenuId: number | null = null;

  private editarFoco = false;

  @ViewChild('editInput') editInputRef!: ElementRef;

  loadingMessage = "Carregando"; // Alterar dinamicamente

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  googleAuthReady = true;

  result: {
    correctAnswers: number;
    incorrectAnswers: number;
    nullAnswers: number; // Nova propriedade para respostas nulas
  } = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };

  showCorrection: boolean = false;
  showStartScreen: boolean = true;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  imagePath = './assets/images/funcao do grau 2.png';

  @ViewChild('tabela') grid: any;

  @ViewChild('tutorMessagesContainer')
  tutorMessagesContainer!: ElementRef;

  // Mensagens de acerto
  correctMessages: string[] = [
    "Mandou muito bem!",
    "Perfeito! Continue assim!",
    "Excelente escolha!",
    "Mandou ver!",
    "Você pegou essa!"
  ];

  // Mensagens de erro (motivacionais, sem desanimar)
  incorrectMessages: string[] = [
    "Faz parte do processo — siga firme!",
    "Errou, mas está aprendendo!",
    "Cada erro é um passo para o acerto!",
    "Aprender é assim: tenta, erra e evolui!",
    "O importante é continuar!",
  ];

  // --------------------------
  // MENSAGENS DE PROGRESSO
  // --------------------------

  currentMessage: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null = null;
  lastStage: number = -1;

  // Start (0–25%)
  startMessages: string[] = [
    "Você já começou, isso é o mais importante",
    "Primeiros passos dados, continue firme",
    "Início promissor, bora em frente",
    "Já está em movimento, ótimo começo",
    "Começou bem, mantenha o ritmo",
    "Cada jornada começa com um passo, e você já deu o seu",
    "Primeira parte iniciada, siga com foco",
    "Belo arranque, continue no fluxo",
    "O caminho começou, aproveite a jornada",
    "Ótima decisão em começar, siga em frente"
  ]

  // Mid (25–50%)
  midMessages: string[] = [
    "Você já está no ritmo, continue",
    "Seguindo bem no caminho, mantenha a constância",
    "Está avançando com firmeza",
    "Quase na metade, foco total",
    "Boa cadência, siga sem parar",
    "Progresso visível, continue firme",
    "Ótimo ritmo, siga nessa energia",
    "Você está construindo conhecimento passo a passo",
    "Já percorreu um bom trecho da jornada, continue",
    "Mais um pouco e você chega à metade"
  ]

  // Halfway (50–75%)
  halfwayMessages: string[] = [
    "Metade da jornada concluída",
    "Chegou longe, mantenha a energia",
    "Você já percorreu um grande caminho",
    "Mais da metade avançada, foco no restante",
    "Persistência é a chave, continue firme",
    "Agora é seguir até o fim, está indo bem",
    "Grande parte já concluída, não perca o ritmo",
    "O esforço está somando, continue constante",
    "Você está mantendo a disciplina, excelente",
    "Já passou do meio, siga motivado"
  ]

  // Almost finished (75–99%)
  finalMessages: string[] = [
    "Está quase no fim, falta pouco",
    "Última etapa, mantenha o foco",
    "Já percorreu quase tudo, continue firme",
    "Últimos passos da jornada",
    "Final se aproximando, energia extra agora",
    "Só mais um pouco, não pare agora",
    "Está prestes a concluir, parabéns pela dedicação",
    "A linha de chegada está à vista",
    "Última reta, concentre-se e finalize",
    "Falta bem pouco, continue até o fim"
  ]

  walletTypes = [
    { label: 'MPESA', value: 'MPESA' },
    { label: 'EMOLA', value: 'EMOLA' },
  ];

  difficultyLevels = [
    {
      label: 'Iniciante',
      value: 'BEGINNER',
      description: 'Quizzes introdutórios para treinar conceitos básicos.'
    },
    {
      label: 'Avançado',
      value: 'ADVANCED',
      description: 'Quizzes desafiadores que testam raciocínio e aplicação prática.'
    }
  ];

  anonymousOptions = [
    {
      label: 'Fazer como anônimo',
      value: true,
      description: 'Seu nome não será mostrado durante nem após o quiz.'
    },
    {
      label: 'Mostrar meu nome',
      value: false,
      description: 'Seu nome ficará visível nas tentativas e resultados do quiz.'
    },
  ];

  quizTypes = [
    {
      label: 'Treino',
      value: 'TRAINING',
      description: 'Você vê a correção de cada questão imediatamente após responder. O temporizador fica desativado neste modo.'
    },
    {
      label: 'Avaliação',
      value: 'TEST',
      description: 'Você só vê a correção no fim, após submeter todo o teste. O temporizador fica ativo e conta o tempo durante a resolução.'
    },
  ];

  limitsPerTopic = [
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '8', value: 8 },
    { label: '10', value: 10 },
    //{ label: 'ALL', value: 1000000 },
  ];

  commentFilter: CommentFilter = {
    page: -1,
    itemsPerPage: 25,
    sort: 'id,asc',
  }

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc',
  };

  conversationFilter: ConversationFilter = {
    page: 0,
    itemsPerPage: 10,
    sort: 'createdAt,desc',
  };

  constructor(
    private ngZone: NgZone,
    private authModalService: AuthModalService,
    private tutorAiService: TutorAiService,
    private tutorConversationService: TutorConversationService,
    private progressService: ProgressService,
    private challengeService: ChallengeService,
    private walletService: WalletService,
    private quizService: QuizService,
    private topicService: TopicService,
    private questionService: QuestionService,
    private commentService: CommentService,
    private commentLikeService: CommentLikeService,
    private userService: UserService,
    private subjectsService: SubjectsService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Quizzes view page');
    //  this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    //  this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.authenticationService.loginStatus$.subscribe(logged => {
      this.isUserLoggedIn = logged;
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    });

    const quizId = this.route.snapshot.params['id'];
    if (quizId && quizId !== 'new' && quizId !== 'test' && quizId !== 'training' && quizId !== 'challenge') {
      this.getQuizByQuizId(quizId);
    }

    this.scrollToTop();

    this.route.queryParams.subscribe(params => {
      this.origem = params['from'];
      this.progressTestId = params['progressTestId'];
      this.challengeId = params['challengeId'];
    });

    if (quizId && quizId == 'new' && !this.origem) {
      this.onInitQuiz();
    }

    if (quizId && quizId == 'test' && this.origem === 'progress/subjects' && this.progressTestId) {
      this.StartProgressTopicTest(this.progressTestId);
    }

    if (quizId && quizId == 'challenge' && this.origem === 'challenges' && this.challengeId) {
      this.StartChallenge(this.challengeId);
    }

    // Pré-carrega os sons para evitar atrasos
    this.correctSound.load();
    this.wrongSound.load();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.tutorMessagesContainer?.nativeElement;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();// Cancelar o temporizador e submiter o quiz
    }
  }

  get stepProgressPercentage(): number {
    let filled = 0;
    //if (this.quiz.difficultyLevel) filled++;
    if (this.quiz.type) filled++;
    //if (this.quiz.anonymous !== null) filled++;
    if (this.quiz.limitPerTopic) filled++;
    if (this.quiz.subject) filled++;
    if (this.getSelectedTopicIds().length > 0) filled++;

    return (filled / 4) * 100;
  }

  onInitQuiz() {
    this.carregarDisciplinas();
    this.showInitQuizScreen = true;
    this.showStartScreen = false;
    this.showCorrection = false;
    this.quiz.anonymous = null;
    //this.quiz.difficultyLevel = 'BEGINNER';
    //this.quiz.type = 'TEST';
    //this.quiz.limitPerTopic = 2;
  }

  showAnswerMessage(arr: string[], type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const index = Math.floor(Math.random() * arr.length);
    this.currentMessage = {
      text: arr[index],
      type
    };

    setTimeout(() => {
      this.currentMessage = null;
    }, 3000);
  }

  playCorrect(): void {
    this.correctSound.currentTime = 0;
    this.correctSound.play().catch(() => { });
    navigator.vibrate(50);
  }

  playWrong(): void {
    this.wrongSound.currentTime = 0;
    this.wrongSound.play().catch(() => { });
    navigator.vibrate([100, 50, 100]);
  }

  // Se escolher o modo treino. SERA DADO FEEDBACK INSTATANEO
  togleCorrection() {
    this.showCorrection = true;
    this.quiz.questions[this.currentQuestionIndex].verified = true; // Marca como verificada pelo usuário (para mostrar dica/solução automaticamente)
    this.renderMathExpressions();
    this.renderFunctions();

    // Mostra mensagem de acerto/erro da pergunta atual (se houver)
    const perguntaAtual = this.submittedAnswers[this.currentQuestionIndex];
    if (perguntaAtual && perguntaAtual.id !== undefined) {
      const question = this.quiz.questions[this.currentQuestionIndex];
      const selected = question.answers.find(a => a.id === perguntaAtual.id);
      if (selected) {
        if (selected.correct) {
          this.playCorrect();
          this.showAnswerMessage(this.correctMessages, 'success');
        } else {
          this.playWrong();
          this.showAnswerMessage(this.incorrectMessages, 'error');
        }
      }
    }
  }

  isCurrentQuestionAnswered(questionId: number): boolean {
    return this.submittedAnswers.some(
      (answer: Answer) => answer.question?.id === questionId
    );
  }

  allQuestionsAnswered(): boolean {
    // Para cada questão, verificamos se existe uma resposta correspondente no array submittedAnswers
    return this.quiz.questions.every(q =>
      this.submittedAnswers.some(a => a.question.id === q.id)
    );
  }

  carregarDisciplinas() {
    this.loadingMessage = "Obtendo disciplinas";
    this.showLoading = true;
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        //this.subjects = dados;
        this.subjects = dados.filter(s => s.quizEnabled);
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  getTopicsBySubjectId(subjectId: number): void {

    this.loadingMessage = "Obtendo tópicos";
    this.showLoading = true;

    this.topicService.getBySubjectIdWithCache(subjectId).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe({
      next: (dados: Topic[]) => {
        this.quiz.questions = [];
        this.topics = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    });
  }

  // Testes de topico único - Progresso automático
  StartProgressTopicTest(topicId: number): void {

    this.loadingMessage = "Iniciando teste de progresso"
    this.showLoading = true;

    this.showInitQuizScreen = false;
    this.showStartScreen = false;
    this.showCorrection = false;

    this.quiz.anonymous = true;
    this.quiz.type = 'TEST';
    this.quiz.difficultyLevel = 'BEGINNER';
    this.quiz.limitPerTopic = 10;

    this.quiz.blockedTip = true; // Bloqueia dicas para testes de progresso

    this.progressService.getQuestionsByTestId(topicId).subscribe(
      (questions: Question[]) => {
        this.questions = questions;
        this.quiz.questions = this.questions;

        this.quiz.subject = this.quiz.questions[0].topic.subject;

        this.topics = [{
          ...this.quiz.questions[0].topic,
          selected: true
        }];

        // Se o utilizador não for premium → limitar o texto da solução
        this.quiz.questions = this.quiz.questions.map(q => ({
          ...q,
          solution: this.isPremiumTopic(q.topic)
            ? this.limitSolutionSafe(q.solution, 1)
            : q.solution
        }));

        this.renderMathExpressions();
        this.renderFunctions();
        this.startQuiz();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  StartChallenge(challengeId: number): void {
    this.loadingMessage = "Iniciando teste de desafio";
    this.showLoading = true;

    this.showInitQuizScreen = false;
    this.showStartScreen = false;
    this.showCorrection = false;

    this.quiz.anonymous = true;
    this.quiz.type = 'TEST';
    this.quiz.difficultyLevel = 'BEGINNER';
    this.quiz.limitPerTopic = 10;

    this.quiz.blockedTip = true; // Bloqueia dicas para testes de progresso

    this.challengeService.getQuestionsByChallengeId(challengeId).subscribe(
      (questions: Question[]) => {
        this.questions = questions;
        this.quiz.questions = this.questions;

        this.quiz.subject = this.quiz.questions[0].topic.subject;

        this.topics = [{
          ...this.quiz.questions[0].topic,
          selected: true
        }];

        // Se o utilizador não for premium → limitar o texto da solução
        this.quiz.questions = this.quiz.questions.map(q => ({
          ...q,
          solution: this.isPremiumTopic(q.topic)
            ? this.limitSolutionSafe(q.solution, 1)
            : q.solution
        }));

        this.renderMathExpressions();
        this.renderFunctions();
        this.startQuiz();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getQuestions(): void {
    this.loadingMessage = "Gerando questões";
    const selectedTopicIds = this.getSelectedTopicIds();

    this.quiz.anonymous = true;
    this.quiz.difficultyLevel = 'BEGINNER';

    if (selectedTopicIds.length == 0) {
      this.messageService.add({ severity: 'error', detail: 'O Quiz deve ter pelo menos um tópico associado para gerar questões!' });
      return;
    }

    if (this.quiz.type === 'TEST') {
      this.quiz.blockedTip = true;
    }

    this.showLoading = true;

    this.questionService.getQuestionsByTopics(selectedTopicIds, this.quiz.difficultyLevel, this.quiz.limitPerTopic).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (dados: Question[]) => {

        this.questionsWithFullSolutions = dados;

        // Se o utilizador não for premium → limitar o texto da solução
        this.quiz.questions = this.quiz.questions.map(q => ({
          ...q,
          solution: this.isPremiumTopic(q.topic)
            ? this.limitSolutionSafe(q.solution, 1)
            : q.solution
        }));

        this.questions = dados;
        this.quiz.questions = this.questions;
        this.showLoading = false;
        this.renderMathExpressions();
        this.renderFunctions();
        this.startQuiz();

        if (this.isUserLoggedIn) {
          this.quiz.user = this.loggedUser;
        }
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  selectLevel(level: any) {
    if (this.isAdvancedLevelDisabled(level)) return; // bloqueia clique
    this.quiz.difficultyLevel = level.value;
  }

  // Nao remover este código comentado, será util futuramente
  //isAdvancedLevelDisabled(level: any): boolean {
  // só aplica a regra para o nível ADVANCED
  //  if (level.value !== 'ADVANCED') return false;

  // desabilita se não estiver logado ou se estiver no plano FREE
  //  return this.isFreeUser();
  //}

  isAdvancedLevelDisabled(level: any): boolean {
    if (level.value === 'ADVANCED') return true; // Sempre desabilitado para todos os usuários agora
    return false; // Sempre desabilitado para todos os usuários agora
  }

  selectAnonymousOption(anonymousOption: any) {
    if (this.isAnonymousOptionDisabled(anonymousOption)) return; // bloqueia clique
    this.quiz.anonymous = anonymousOption.value;
  }

  isAnonymousOptionDisabled(anonymousOption: any): boolean {
    // Se a opção for "identificado" (anonymous = false)
    if (anonymousOption.value === false) {
      return !this.isUserLoggedIn; // desabilita se não estiver logado
    }

    return false; // anônimo sempre liberado
  }

  toggleTopic(topic: Topic): void {

    // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
    if (this.isPremiumTopic(topic)) return;

    topic.selected = !topic.selected;
  }

  getSelectedTopics(): Topic[] {
    return this.topics.filter(topic => topic.selected);
  }

  getSelectedTopicIds(): number[] {
    return this.topics.filter(topic => topic.selected).map(topic => topic.id);
  }

  areAllTopicsSelected(): boolean {
    return this.topics.every(topic => topic.selected);
  }

  toggleSelectAllTopics(): void {
    const allSelected = this.areAllTopicsSelected();
    this.topics.forEach(topic => topic.selected = !allSelected);
  }

  //selectAllTopics(): void {
  //  this.topics.forEach(topic => topic.selected = true);
  //}

  selectAllTopics(): void {
    if (!this.topics) return;
    this.topics = this.topics.map(t => ({ ...t, selected: true }));
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumTopic(topic: Topic): boolean {
    if (!topic.premium) return false;

    // ADMIN sempre tem acesso
    if (this.isUserLoggedIn && this.isAdmin) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser();
  }

  selectLimitPerTopic(limit: any): void {
    // Se for utilizador FREE e tentar clicar numa opção bloqueada → mostra aviso
    if (this.isFreeUser()) {
      if (limit.value > 3) {
        return;
      }
    }
    this.quiz.limitPerTopic = limit.value;
  }

  isLockedLimit(value: number): boolean {
    return this.isFreeUser() && value > 3;
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const planExpiresAt = this.loggedUser.planExpiresAt ? new Date(this.loggedUser.planExpiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !planExpiresAt || planExpiresAt <= new Date();
  }

  onSubmitAnswers() {
    this.submitAnswers();
  }

  submitAnswers() {
    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.quiz.user = this.loggedUser;

    this.quiz.blockedTip = false; // Desbloqueia dicas ao submeter o quiz

    this.stopTimer();
    this.quiz.submittedAt = new Date();
    this.quiz.isSubmitted = true;
    this.quiz.id = 0; // Força a criação de um novo quiz
    this.quiz.answers = this.submittedAnswers;
    this.quiz.timeLimit = this.questions.reduce((sum, question) => sum + question.timeLimit, 0);
    this.topics = this.getTopicosFromQuestoes(this.quiz.questions);
    if (this.quiz.answers) {
      this.calculateResults();
    }
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    this.showStartScreen = true
    this.scrollToTop();
  }

  onSaveQuiz() {
    if (this.isUserLoggedIn) {

      if (this.origem === 'progress/subjects' && this.progressTestId) {
        this.saveQuizTopicTest();
        this.subjectsService.clearProgressSubjectsCache();
        return;
      }

      if (this.origem === 'challenges' && this.challengeId) {
        this.saveQuizChallenge();
        //this.subjectsService.clearProgressSubjectsCache();
        return;
      }

      this.saveQuiz();
    }

    if (!this.isUserLoggedIn) {
      this.openLogin();
    }
  }

  saveQuiz() {
    this.loadingMessage = "Salvando o quiz"
    this.showLoading = true;
    this.quiz.topics = this.getSelectedTopics();
    this.quiz.user = this.loggedUser;

    const questionIds = this.quiz.questions.map(question => question.id);
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.quizService.saveQuiz(this.quiz, questionIds, userAnswerIds, this.loggedUser.id).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (response) => {
        this.showLoading = false;
        this.quiz = response;
        this.quiz.isSubmitted = true;
        if (this.quiz.answers) {
          this.calculateResults();
        }
        this.router.navigate(['/quizzes', this.quiz.quizId], { replaceUrl: true });
        this.showStartScreen = true
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  saveQuizTopicTest() {
    this.loadingMessage = "Salvando o quiz"
    this.showLoading = true;
    this.quiz.topics = this.getSelectedTopics();
    this.quiz.user = this.loggedUser;

    const questionIds = this.quiz.questions.map(question => question.id);
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.quizService.saveQuizTopicTest(this.quiz, questionIds, userAnswerIds, this.progressTestId, this.loggedUser.id).subscribe(
      (response) => {
        this.showLoading = false;
        this.quiz = response;
        this.quiz.isSubmitted = true;
        if (this.quiz.answers) {
          this.calculateResults();
        }
        this.router.navigate(['/quizzes', this.quiz.quizId], { replaceUrl: true });
        this.showStartScreen = true
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  saveQuizChallenge() {
    this.loadingMessage = "Salvando o quiz"
    this.showLoading = true;
    this.quiz.topics = this.getSelectedTopics();
    this.quiz.user = this.loggedUser;

    const questionIds = this.quiz.questions.map(question => question.id);
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.quizService.saveQuizChallenge(this.quiz, questionIds, userAnswerIds, this.challengeId, this.loggedUser.id).subscribe(
      (response) => {
        this.showLoading = false;
        this.quiz = response;
        this.quiz.isSubmitted = true;
        if (this.quiz.answers) {
          this.calculateResults();
        }
        this.router.navigate(['/quizzes', this.quiz.quizId], { replaceUrl: true });
        this.showStartScreen = true
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getTotalTimeLimit(): number {
    //return this.quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0);
    return this.questions.reduce((sum, question) => sum + question.timeLimit, 0);
  }

  onSaveQuestion(question: Question) {
    if (this.isUserLoggedIn) {
      this.toggleSaveQuestion(question);
    }

    if (!this.isUserLoggedIn) {
      this.openLogin();
    }
  }

  toggleSaveQuestion(question: Question): void {
    question.showLoadingSave = true;
    this.userService.toggleSaveQuestion(this.loggedUser.id, question.id).subscribe(
      response => {
        question.savedByUser = !question.savedByUser;
        question.showLoadingSave = false;

        // Mensagem de confirmação colorida e animada
        const message = question.savedByUser
          ? 'Questão adicionada aos favoritos'
          : 'Questão removida dos favoritos';

        const type = question.savedByUser ? 'success' : 'warning';

        this.showAnswerMessage([message], type);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        question.showLoadingSave = false;
      }
    );
  }

  getQuizByQuizId(quizId: string) {
    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.showLoading = true;
    this.loadingMessage = "Carregando dados";

    this.quizService.getQuizByQuizIdWithCash(quizId, this.loggedUser.id).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (response) => {
        this.quiz = response;
        this.quiz.isSubmitted = true;

        this.questionsWithFullSolutions = this.quiz.questions;

        // 🔒 Se o utilizador não for Premium → limitar o texto da solução
        //if (this.isFreeUser()) {
        //  this.quiz.questions = this.quiz.questions.map(q => ({
        //    ...q,
        //    solution: this.limitSolutionSafe(q.solution, 4) // mostra 4 blocos/linhas
        //  }));
        //}

        this.quiz.questions = this.quiz.questions.map(q => ({
          ...q,
          solution: this.isPremiumTopic(q.topic)
            ? this.limitSolutionSafe(q.solution, 1)
            : q.solution
        }));

        this.topics = this.getTopicosFromQuestoes(this.quiz.questions);

        if (this.quiz.answers) {
          this.calculateResults();
        }

        this.renderMathExpressions();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  retryGetQuestion(): void {
    this.retryVisible = false;
    this.getQuizByQuizId(this.route.snapshot.params['id']);
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

  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0;

    // Reinicia o objeto de resultados por tópico
    this.quiz.resultsByTopic = {};

    // Itera sobre todas as questões do quiz
    this.quiz.questions.forEach((question) => {
      const submittedAnswer = this.quiz.answers.find(
        (a) => a.question.id === question.id
      );

      // Obtém o tópico da questão
      const questionTopic = question.topic?.name || 'Sem tópico';

      // Inicializa o tópico no objeto resultsByTopic, se necessário
      if (!this.quiz.resultsByTopic[questionTopic]) {
        this.quiz.resultsByTopic[questionTopic] = {
          correct: 0,
          incorrect: 0,
          nullAnswers: 0, // Adiciona contador de respostas nulas
          total: 0,
          percentage: 0
        };
      }

      // Incrementa o total de questões por tópico
      this.quiz.resultsByTopic[questionTopic].total++;

      if (submittedAnswer) {
        // Se o usuário respondeu, verifica se a resposta está correta ou incorreta
        if (submittedAnswer.correct) {
          this.result.correctAnswers++;
          this.quiz.resultsByTopic[questionTopic].correct++;
        } else {
          this.result.incorrectAnswers++;
          this.quiz.resultsByTopic[questionTopic].incorrect++;
        }
      } else {
        // Se não há resposta submetida, conta como nula
        this.result.nullAnswers++;
        this.quiz.resultsByTopic[questionTopic].nullAnswers++;
      }
    });

    // Calcula a porcentagem de acertos por tópico
    for (const topic in this.quiz.resultsByTopic) {
      const { correct, total } = this.quiz.resultsByTopic[topic];
      this.quiz.resultsByTopic[topic].percentage = (correct / total) * 100;
    }
  }

  get progressPercentage(): number {
    const totalQuestions = this.quiz.questions.length;

    // Filtra para contar somente as respostas não nulas
    const answeredCount = this.quiz.answers.filter(
      a => a.id !== null && a.id !== undefined
    ).length;

    // Calcula o progresso com base nas respostas
    return (answeredCount / totalQuestions) * 100;
  }

  get progressPercentage2(): number {
    const totalQuestions = this.quiz.questions.length;

    // Filtra para contar somente as respostas não nulas
    const answeredCount = this.submittedAnswers.filter(
      a => a.id !== null && a.id !== undefined
    ).length;

    // Calcula o progresso com base nas respostas
    return (answeredCount / totalQuestions) * 100;
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
      this.renderFunctions();
      this.scrollToTop();
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();

      // Mostra mensagem apenas se a próxima pergunta não estiver respondida
      const proximaPergunta = this.submittedAnswers[this.currentQuestionIndex];
      if ((!this.quiz.id && this.quiz.questions.length > 10) && (!proximaPergunta || proximaPergunta.id === null || proximaPergunta.id === undefined)) {
        this.showProgressMessage();
      }
    }

    if (!this.quiz.id && this.quiz.type == 'TRAINING') {
      this.showCorrection = false;
    }

    if ((this.quiz.id === 0) && this.quiz.type == 'TRAINING') {
      this.showCorrection = true;
    }

  }

  showProgressMessage() {
    const progress = this.progressPercentage2;

    if (progress >= 100) {
      this.currentMessage = null;
      return;
    }

    let messagesToDraw: string[] = [];
    let stage = -1;
    let type: 'info' | 'success' | 'warning' | 'error' = 'info';

    if (progress >= 75) {
      messagesToDraw = this.finalMessages;
      stage = 3;
      type = 'success'; // 💚 progresso alto
    } else if (progress >= 50) {
      messagesToDraw = this.halfwayMessages;
      stage = 2;
      type = 'info'; // 🔵 progresso médio
    } else if (progress >= 25) {
      messagesToDraw = this.midMessages;
      stage = 1;
      type = 'warning'; // 🟡 início do progresso
    } else {
      messagesToDraw = this.startMessages;
      stage = 0;
      type = 'info'; // Azul para começo
    }

    // Só mostra se entrou em uma faixa nova
    if (stage !== this.lastStage) {
      this.currentMessage = {
        text: this.getRandomMessage(messagesToDraw),
        type
      };
      this.lastStage = stage;

      setTimeout(() => {
        this.currentMessage = null;
      }, 3000);
    }
  }

  getRandomMessage(arr: string[]): string {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
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
    const source = !this.quiz.id ? this.submittedAnswers : this.quiz.answers;
    const userAnswer = source.find(a => a.question?.id === questionId);
    return userAnswer ? userAnswer.id === answerId : false;
  }

  onStopCurrentRunningQuiz() {
    //  if (!this.quiz.id) {
    //    this.stopTimer();
    //    this.scrollToTop();
    //    if (this.origem === 'subjects' && this.subjectId) {
    //      this.router.navigate(['/subjects', this.quiz.subject.subjectId]);
    //    } else {
    //      this.router.navigateByUrl('/quizzes');
    //    }
    //  }

    if (this.quiz.type === 'TEST' && (!this.quiz.id || this.quiz.id === 0)) {
      this.stopTimer();
    }

    if ((!this.quiz.id || this.quiz.id === 0) && !this.quiz.isSubmitted) {
      this.stopTimer();
      if (this.origem === 'progress/subjects' && this.progressTestId) {
        this.router.navigate(['/progress/subjects', this.quiz.subject.subjectId]);
      } else if (this.origem === 'challenges' && this.challengeId) {
        this.router.navigate(['/challenges']);
      } else {
        this.router.navigateByUrl('/quizzes'); ``
      }
      return;
    }
    this.scrollToTop();
    this.showStartScreen = true;
  }

  goBack(): void {
    if (this.origem === 'progress/subjects') {
      this.router.navigate(['/progress/subjects', this.quiz.subject.subjectId]);
    } else if (this.origem === 'challenges') {
      this.router.navigate(['/challenges']);
    } else {
      this.router.navigate(['/quizzes']);
    }
  }

  startQuiz() {
    this.showInitQuizScreen = false; // Oculta a tela inicial do quiz
    this.showStartScreen = false; // Oculta a tela de início do quiz
    this.showCorrection = false; // Garante que a correção não seja exibida ao iniciar o quiz
    this.currentQuestionIndex = 0; // Começa na primeira questão
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    this.renderFunctions();
    this.scrollToTop();
    navigator.vibrate(50);

    if (this.quiz.type === 'TEST') {
      this.startTimer();
    }
  }

  startCorretion() {
    this.showInitQuizScreen = false; // Oculta a tela inicial do quiz
    this.showStartScreen = false; // Oculta a tela de início do quiz
    this.showCorrection = true; // Garante que a correção não seja exibida ao iniciar o quiz
    this.currentQuestionIndex = 0; // Começa na primeira questão
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    this.renderFunctions();
    this.scrollToTop();
  }

  startTimer(): void {

    this.timeLimit = this.questions.reduce((sum, question) => sum + question.timeLimit, 0);
    this.totalTimeLimit = this.questions.reduce((sum, question) => sum + question.timeLimit, 0);

    this.remainingTime = this.timeLimit; // Tempo restante para contagem
    this.startTime = Date.now(); // Armazenar o tempo de início (timestamp)

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLimit > 0) {
        this.timeLimit--;
        this.updateFormattedTime(); // Atualiza o tempo formatado
      } else {
        if (this.isUserLoggedIn) {
          this.stopTimer();
          this.submitAnswers();
          this.showCorrection = true; // Exibe a correção
          this.scrollToTop();
          this.messageService.add({ severity: 'success', detail: 'O Tempo esgotou e a sbumissão foi feita com sucesso!' });
        }
      }
    });
  }

  // TARREFA: FINALIZAR E POR A  FUNCIONAR BEM
  updateFormattedTime(): void {
    const minutes = Math.floor(this.timeLimit / 60);
    const seconds = this.timeLimit % 60;
    this.formattedTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;

    if (this.formattedTime == "00:00" && this.quiz.type === 'TEST') {

      const message = 'O Tempo esgotou, mas não respondeu todas as questões!';

      if (this.submittedAnswers.length < this.questions.length) {
        this.showAnswerMessage([message], 'warning');
      } else {

        this.showAnswerMessage(['O Tempo esgotou!'], 'warning');

        this.ngZone.run(() => {
          //this.submitAnswers();
        });
      }

    }
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();// Cancelar o temporizador
    }
  }

  get isWarning(): boolean {
    if (!this.formattedTime) return false;

    const [minutes, seconds] = this.formattedTime.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;

    // Só aplica warning se tiver 1 minuto ou menos, mas maior que 0
    //return totalSeconds > 0 && totalSeconds <= 60;

    return totalSeconds <= 60;
  }

  toggleDisableEditing() {
    this.disableEditing = !this.disableEditing;
  }

  toggleShowOptions() {
    this.showOptions = !this.showOptions;
  }

  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        mathContainer.innerHTML = this.getFormattedText(this.quiz.questions[this.currentQuestionIndex].text);
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        mathContainerSolution.innerHTML = this.getFormattedText(this.quiz.questions[this.currentQuestionIndex].solution);
      }

      const mathContainerTip = document.getElementById(`math-container-tip-${this.currentQuestionIndex}`);
      if (mathContainerTip && typeof MathJax !== 'undefined') {
        mathContainerTip.innerHTML = this.getFormattedText(this.quiz.questions[this.currentQuestionIndex].tip);
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
      if (!canvas || !this.quiz.questions[this.currentQuestionIndex].mathExpressions || this.quiz.questions[this.currentQuestionIndex].mathExpressions.length === 0) return;


      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const scaleX = width / 20;
      const scaleY = height / 20;

      // Desenha a grade cartesiana
      ctx.beginPath();
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;

      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let i = -10; i <= 10; i++) {
        let y = height / 2 - i * scaleY;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Eixos principais
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Números dos eixos
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

      this.quiz.questions[this.currentQuestionIndex].mathExpressions.forEach((express, index) => {
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

        // Adiciona legenda no gráfico
        ctx.fillStyle = colors[index % colors.length];
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(
          //express.name || express.expression || `f${index + 1}(x)`,
          express.name || `f${index + 1}(x)`,
          10,
          20 + index * 20
        );
      });
    }, 0);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Formata os minutos e segundos para ter 2 dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  getQuizTypeValue(type: string) {
    switch (type) {
      case 'TEST':
        return 'Modo avaliação';
      case 'TRAINING':
        return 'Modo treino';
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

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = 'A' em ASCII - Mostra A, B, C, ...
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

  get editing() {
    return Boolean(this.comment.id);
  }

  save(commentForm: NgForm) {
    if (this.editing) {
      this.updateComment(commentForm);
    } else {
      this.addNewComment(commentForm);
    }
  }

  addNewComment(commentForm: NgForm) {
    this.loadingMessage = "Adicioando comentário";
    this.showLoading = true;
    this.comment.user = this.loggedUser;
    this.comment.question = this.selectedQuestion;
    this.commentService.add(this.comment).subscribe(
      (response) => {
        this.comment = response;
        this.showLoading = false;
        this.comments.unshift(this.comment); // Adiciona o novo comentário no início da lista
        this.totalRecordComments++;
        this.quiz.questions[this.currentQuestionIndex].numberOfComments++;
        this.comment = new Comment(); // Reseta o objeto de comentário
        commentForm.resetForm(); // Limpa o formulário após adicionar o comentário
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  updateComment(commentForm: NgForm) {
    this.loadingMessage = "Atualizando comentário";
    this.showLoading = true;
    this.comment.user = this.loggedUser;
    this.comment.question = this.selectedQuestion;
    this.commentService.update(this.comment).subscribe(
      (response) => {
        this.comment = response;
        this.showLoading = false;
        this.comment = new Comment(); // Reseta o objeto de comentário
        commentForm.resetForm(); // Limpa o formulário após adicionar o comentário
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onComment(commentForm: NgForm) {
    if (this.isUserLoggedIn) {
      this.save(commentForm);
    }

    if (!this.isUserLoggedIn) {
      this.openLogin();
    }
  }

  onUpdateComment(comment: Comment): void {
    this.comment = comment;
    this.editarFoco = true;
  }

  ngAfterViewChecked(): void {
    if (this.editarFoco && this.editInputRef) {
      this.editInputRef.nativeElement.focus();
      this.editarFoco = false;
    }
  }

  toggleMenu(commentId: number): void {
    if (this.openedMenuId === commentId) {
      this.openedMenuId = null;
    } else {
      this.openedMenuId = commentId;
    }
  }

  excluir(comment: Comment) {
    this.loadingMessage = "Excluíndo comentário";
    this.showLoading = true;
    this.commentService.excluir(comment.id).subscribe(() => {
      this.showLoading = false;
      this.comments = this.comments.filter(c => c.id !== comment.id);
      this.totalRecordComments--;
      this.quiz.questions[this.currentQuestionIndex].numberOfComments--;
      this.messageService.add({ severity: 'success', detail: 'Comentário excluído com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(comment: Comment): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(comment);
      }
    });
  }

  getComments(questionId: number): void {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.commentFilter.page++;
    this.commentService.getCommentsByQuestion(questionId, this.loggedUser.id, this.commentFilter).subscribe(
      (dados: IApiResponse<Comment>) => {
        //this.comments = dados.content;
        this.comments = [...this.comments, ...dados.content];
        this.totalRecordComments = dados.totalElements;

        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onShowMoreComments(): void {
    this.getComments(this.selectedQuestion.id);
  }

  onLike(comment: Comment) {
    this.selectedComment = comment;
    if (this.isUserLoggedIn) {
      this.toggleLike(comment);
    }

    if (!this.isUserLoggedIn) {
      this.openLogin();
    }
  }

  toggleLike(comment: Comment): void {
    comment.showLoadingLike = true;
    this.commentLikeService.toggleLike(comment.id, this.loggedUser.id).subscribe(
      response => {
        comment.likedByUser = !comment.likedByUser;
        if (comment.likedByUser) {
          comment.numberOfLikes = comment.numberOfLikes + 1;
        } else {
          comment.numberOfLikes = comment.numberOfLikes - 1;
        }
        comment.showLoadingLike = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        comment.showLoadingLike = false;
      }
    );
  }

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // reseta para recalcular corretamente
    const newHeight = Math.min(textarea.scrollHeight, 250); // até 250px
    textarea.style.height = `${newHeight}px`;
  }

  onGetComments(question: Question) {
    this.selectedQuestion = question;
    this.comments = [];
    this.commentFilter.page = -1;
    this.totalRecordComments = 0

    this.getComments(this.selectedQuestion.id);

    this.showComments = true;
    document.body.classList.add('no-scroll');
  }

  onCloseComments() {
    this.showComments = false;
    document.body.classList.remove('no-scroll');
  }

  formatarTempoRelativo(data: Date | string): string {
    const agora = new Date();
    const comentarioData = new Date(data);
    const diffMs = agora.getTime() - comentarioData.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    const diffMinutos = Math.floor(diffSegundos / 60);
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffSegundos < 60) {
      return 'agora mesmo';
    } else if (diffMinutos < 60) {
      return `há ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    } else if (diffHoras < 24) {
      return `há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    } else if (diffDias === 1) {
      return 'ontem';
    } else if (diffDias < 7) {
      return `há ${diffDias} dia${diffDias > 1 ? 's' : ''}`;
    } else if (diffDias < 30) {
      const semanas = Math.floor(diffDias / 7);
      return `há ${semanas} semana${semanas > 1 ? 's' : ''}`;
    } else if (diffDias < 365) {
      const meses = Math.floor(diffDias / 30);
      return `há ${meses} mês${meses > 1 ? 'es' : ''}`;
    } else {
      const anos = Math.floor(diffDias / 365);
      return `há ${anos} ano${anos > 1 ? 's' : ''}`;
    }
  }

  toggleDropdown(quiz: Quiz) {
    quiz.isAdminMenuOpen = !quiz.isAdminMenuOpen;
  }

  closeDropdown(quiz: Quiz) {
    quiz.isAdminMenuOpen = false;
  }

  shareOnSocial(network: string, quizzId: string): void {
    const baseUrl = window.location.href; // link do item
    let url = '';

    switch (network) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent('Olha isto: ' + baseUrl)}`;
        break;

      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;

      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank'); // abre numa nova aba
    }
  }

  copyLink(quizzId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link).then(() => {
      console.log(`Link do item ${quizzId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
  }

  onShowQuestionList() {
    this.displayModalQuestionsList = true;
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    this.renderFunctions();
    document.body.classList.add('no-scroll');
  }

  onCloseQuestionList() {
    this.displayModalQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.quiz.questions.length) {
      this.currentQuestionIndex = index;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
      this.renderFunctions();
      this.scrollToTop();
      this.displayModalQuestionsList = false;
      document.body.classList.remove('no-scroll');
    }
  }

  getQuestionStatus(question: any): boolean {
    // Verifica se a questão tem respostas
    if (!question?.answers?.length) {
      return false;
    }

    // Localiza a resposta do usuário para esta questão
    const userAnswer = this.quiz.answers?.find(ans => ans.question?.id === question.id);

    if (!userAnswer) {
      return false;
    }

    // Procura a resposta correspondente dentro da questão
    const selectedAnswer = question.answers.find((a: Answer) => a.id === userAnswer.id);

    if (!selectedAnswer) {
      return false;
    }

    // Retorna correto ou incorreto
    return !!selectedAnswer.correct;
  }

  getWalletsByUser(userId: number): void {
    this.loadingMessage = "Obtendo dados"
    this.showLoading = true;
    this.walletService.getWalletsByUser(userId).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (dados: Wallet[]) => {
        this.userWallets = dados;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewWlletType(walletTypeForm: NgForm) {

    //this.wallet.user = this.loggedUser;

    this.detectWalletType(); // força atualização e validação

    const phone = this.wallet.phoneNumber || '';

    if (!this.wallet.type) {
      this.sendErrorNotification("Número inválido: prefixo deve ser 84, 85, 86 ou 87.");
      return;
    }

    if (phone.length !== 9) {
      this.sendErrorNotification("Número inválido: deve conter exatamente 9 dígitos.");
      return;
    }

    // Evitar duplicados
    const exists = this.userWallets.some(
      w => w.phoneNumber === phone
    );

    if (exists) {
      this.sendErrorNotification("Este número já está registado nas suas carteiras.");
      return;
    }

    // Definir como default se for a primeira carteira
    if (this.userWallets.length === 0) {
      this.wallet.default = true;
    } else {
      this.wallet.default = false;
    }

    this.loadingMessage = "Adicionando carteira"
    this.showLoading = true;
    this.walletService.add(this.loggedUser.id, this.wallet).subscribe(
      (response) => {
        console.log(response);
        this.wallet = response;

        this.userWallets.push(this.wallet);
        this.showLoading = false;
        this.displayModalAddPaymentOption = false;
        //this.messageService.add({ severity: 'success', detail: 'Disciplina adicionada com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpgradePlan(): void {
    if (this.isUserLoggedIn) {
      //this.upgradePlan();
      this.openModalPaymentOptions();
      return;
    }

    this.openLogin();
  }

  upgradePlan() {
    // Se não tiver carteira selecionada, pega a default
    if (!this.selectedWalletId) {
      const defaultWallet = this.userWallets.find(w => w.default);
      if (defaultWallet) {
        this.selectedWalletId = defaultWallet.id!;
      } else {
        this.sendErrorNotification("Nenhuma carteira selecionada ou definida como principal.");
        return;
      }
    }

    this.loadingMessage = "Processando o pagamento";
    this.showLoading = true;

    this.userService.activatePlan(this.loggedUser.id, 'PREMIUM', this.selectedWalletId).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        // Atualiza **todas** as questões da lista
        this.quiz.questions = this.quiz.questions.map(q => {
          const full = this.questionsWithFullSolutions.find(f => f.questionId === q.questionId);
          if (full) {
            return {
              ...q,
              solution: full.solution
            };
          }
          return q;
        });

        this.questions = this.questions.map(q => {
          const full = this.questionsWithFullSolutions.find(f => f.questionId === q.questionId);
          if (full) {
            return {
              ...q,
              solution: full.solution
            };
          }
          return q;
        });

        this.renderMathExpressions(); // Re-renderiza MathJax para todas as soluções

        this.onCloseUpgradeModal();
        this.onCloseModalPaymentOptions();
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  upgradePlanByPhoneNumber(wallet: Wallet) {
    // Se não tiver carteira selecionada, pega a default
    if (!wallet.phoneNumber || !wallet.type) {
      return;
    }

    this.loadingMessage = "Processando o pagamento";
    this.showLoading = true;

    this.userService.activatePlanByPhoneNumber(this.loggedUser.id, 'PREMIUM', wallet.phoneNumber, wallet.type).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.onCloseUpgradeModal();
        this.onCloseModalPaymentOptions();
        this.onCloseModalAddPaymentOption();
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  setDefaultWallet(wallet: Wallet) {

    if (!wallet.id) {
      this.sendErrorNotification('Carteira inválida: ID não definido');
      return;
    }

    this.userWallets.forEach(w => w.default = false); // limpa anterior
    wallet.default = true;

    this.walletService.setDefault(wallet.id).subscribe({
      next: (updatedWallet) => {
        // Atualiza visualmente todas as carteiras
        this.userWallets.forEach(w => w.default = w.id === updatedWallet.id);
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  onAskTutor() {
    if (this.isUserLoggedIn) {
      this.askTutor();
      return;
    }

    //this.action = 'tutor';
    this.openLogin();
  }

  askTutor() {

    const userMessage = this.tutorRequest.message;
    const now = new Date();

    this.tutorMessages.push({
      id: 0,
      role: 'USER',
      content: userMessage,
      createdAt: now
    });

    this.tutorRequest.questionId = this.quiz.questions[this.currentQuestionIndex].id; 
    this.tutorRequest.userId = this.loggedUser.id;

    this.showTutorThinking = true;

    this.scrollToBottom();

    this.tutorAiService.askQuestions(this.tutorRequest).subscribe({
      next: (res) => {

        this.tutorMessages.push({
          id: 0,
          role: 'ASSISTANT',
          content: res,
          createdAt: new Date()
        });

        this.renderMathExpressions();
        this.renderFunctions();

        this.showTutorThinking = false;

        this.tutorRequest.message = '';

        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);

        this.showTutorThinking = false;

        this.tutorMessages.push({
          id: 0,
          role: 'ASSISTANT',
          content: 'Erro ao contactar Tutor AI.',
          createdAt: new Date()
        });

        this.scrollToBottom();
      }
    });
  }

  onStartConversation() {

    if (this.isUserLoggedIn) {
      this.tutorMessages = [];
      this.getConversationsMessages();
      document.body.classList.add('no-scroll');
      return;
    }

    this.openLogin();
  }

  onCloseModalTutor() {
    this.displayModalTutor = false;
    document.body.classList.remove('no-scroll');
  }

  getConversationsMessages(): void {

    this.retryVisible = false;
    this.loadingMessage = 'Carregando mensagens';
    this.showLoading = true;

    this.conversationFilter.page = this.currentPage - 1;

    this.tutorConversationService.getQuestionConversationsMessages(this.loggedUser.id, this.quiz.questions[this.currentQuestionIndex].id, this.conversationFilter).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error;

            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;

            return nextRetry;
          }, 0),
          delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000))
        )
      )
    ).subscribe(
      (data: IApiResponse<TutorMessageResponse>) => {

        const olderMessages = data.content.reverse();
        this.tutorMessages = olderMessages;

        this.renderMathExpressions();
        this.totalRecords = data.totalElements;
        this.totalMessages = data.totalElements;
        this.showLoading = false;
        this.scrollToBottom();
        this.displayModalTutor = true;
        document.body.classList.add('no-scroll');
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;

        if (!navigator.onLine) {
          this.sendErrorNotification('Você está sem conexão com a internet.');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  loadMoreConversationsMessages(): void {
    this.loadingMessage = 'Carregando mensagens';
    this.showLoading = true;

    this.conversationFilter.page++;

    this.tutorConversationService.getQuestionConversationsMessages(this.loggedUser.id, this.quiz.questions[this.currentQuestionIndex].id, this.conversationFilter)
      .subscribe((data: IApiResponse<TutorMessageResponse>) => {

        const olderMessages = data.content.reverse();

        this.tutorMessages = [
          ...olderMessages,
          ...this.tutorMessages
        ];

        this.totalMessages = data.totalElements;
        this.renderMathExpressions();
        this.showLoading = false;
      },
        (errorResponse: HttpErrorResponse) => {
          this.showLoading = false;
          this.retryVisible = true;

          if (!navigator.onLine) {
            this.sendErrorNotification('Você está sem conexão com a internet.');
          } else {
            this.sendErrorNotification(errorResponse.error.message);
          }
        }
      );
  }

  get isLoadMoreDisabled(): boolean {
    return this.tutorMessages.length >= this.totalMessages && this.totalMessages > 0;
  }

  openUpgradeModal() {
    this.displayModalUpgradePlan = true;
    document.body.classList.add('no-scroll');
  }

  onCloseUpgradeModal() {
    this.displayModalUpgradePlan = false;
    document.body.classList.remove('no-scroll');
  }

  openModalPaymentOptions() {

    if (this.userWallets.length === 0) {
      this.getWalletsByUser(this.loggedUser.id);
    }

    this.displayModalPaymentOptions = true;
    this.onCloseUpgradeModal();
    document.body.classList.add('no-scroll');
  }

  onCloseModalPaymentOptions() {
    this.displayModalPaymentOptions = false;
    document.body.classList.remove('no-scroll');
  }

  openModalAddPaymentOption() {
    this.displayModalAddPaymentOption = true;
  }

  onCloseModalAddPaymentOption() {
    this.displayModalAddPaymentOption = false;
  }

  detectWalletType(): void {
    const phone = this.wallet.phoneNumber ? this.wallet.phoneNumber.trim() : '';

    // Remove espaços e caracteres não numéricos
    const digitsOnly = phone.replace(/\D/g, '');

    // Define o telefone limpo
    this.wallet.phoneNumber = digitsOnly;

    // Validação do tamanho
    if (digitsOnly.length !== 9) {
      this.wallet.type = '';
      return;
    }

    // Verificação de prefixos válidos
    const prefix = digitsOnly.substring(0, 2);
    if (prefix === '84' || prefix === '85') {
      this.wallet.type = 'MPESA';
    } else if (prefix === '86' || prefix === '87') {
      this.wallet.type = 'EMOLA';
    } else {
      this.wallet.type = '';
    }
  }

  // Função que corta e adiciona aviso
  private limitSolutionSafe(solution: string, maxBlocks: number): string {
    if (!solution) return '';

    // Regex para encontrar blocos LaTeX (inline e display)
    const regex = /(\\\[.*?\\\]|\\\(.*?\\\)|\$\$.*?\$\$)/gs;
    const blocks = solution.split(regex).filter(b => b !== '');

    let preview = '';
    let count = 0;

    for (let block of blocks) {
      if (count >= maxBlocks) break;

      preview += block;
      count++;
    }

    // Garante que qualquer bloco LaTeX aberto seja fechado
    preview = this.closeLatexBlocks(preview);

    //return `${preview}... <br><br><em>(Resolução completa disponível apenas para utilizadores Premium 🔒)</em>`;
    return `${preview}...`;
  }

  private closeLatexBlocks(text: string): string {
    const inlineOpen = (text.match(/\\\(/g) || []).length;
    const inlineClose = (text.match(/\\\)/g) || []).length;
    const displayOpen = (text.match(/\\\[/g) || []).length;
    const displayClose = (text.match(/\\\]/g) || []).length;
    const dollarOpen = (text.match(/\$\$/g) || []).length;

    if (inlineOpen > inlineClose) text += '\\)';
    if (displayOpen > displayClose) text += '\\]';
    if (dollarOpen % 2 !== 0) text += '$$';

    return text;
  }

  getPercentage(result: any, quiz: any): number {
    return ((result.correctAnswers / quiz.questions.length) * 100) || 0;
  }

  getPerformanceClass(percentage: number): string {
    if (percentage >= 85) return 'great';
    if (percentage >= 50) return 'ok';
    return 'weak';
  }

  getPerformanceLabel(percentage: number): string {
    if (percentage >= 85) return 'Ótimo';
    if (percentage >= 50) return 'Bom';
    return 'Fraco';
  }

  getGrade(percent: number): string {
    if (percent >= 85) return 'A';
    if (percent >= 70) return 'B';
    if (percent >= 50) return 'C';
    return 'D';
  }

  getGradeLabel(percent: number): string {
    if (percent >= 85) return 'Excelente desempenho';
    if (percent >= 70) return 'Bom desempenho';
    if (percent >= 50) return 'Desempenho médio';
    return 'Fraco desempenho';
  }

  openLogin(callback?: (user: User) => void) {

    this.authModalService.open()
      .subscribe(user => {

        if (!user) {
          return;
        }

        this.loggedUser = user;
        this.isUserLoggedIn = true;

        callback?.(user);
      });
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({
        severity: 'error',
        detail: 'Ocorreu um erro. Por favor, tente novamente.',
      });
    }
  }
}