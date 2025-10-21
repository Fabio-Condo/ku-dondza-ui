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
declare const MathJax: any;
import { evaluate } from 'mathjs'; //npm install mathjs
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from 'src/app/core/model/User';
import { DomSanitizer, SafeHtml, Title } from '@angular/platform-browser';
import { TopicService } from 'src/app/topics/topicsService.service';
import { QuestionService } from 'src/app/questions/question.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';
import { Answer } from 'src/app/core/model/Answer';
import { interval, Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { CommentLikeService } from 'src/app/likes/commentLike.service';
import { CommentService } from 'src/app/comments/comment.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { NgForm } from '@angular/forms';
import { Role } from 'src/app/enum/role.enum';
import { CommentFilter } from 'src/app/core/interface/CommentFilter';
import { UserService } from 'src/app/users/user.service';


@Component({
  selector: 'app-quizz-questions',
  templateUrl: './quizz-questions.component.html',
  styleUrls: ['./quizz-questions.component.css'],
})
export class QuizzQuestionsComponent implements OnInit {
  quiz: Quiz = new Quiz();
  topics: Topic[] = [];

  showLoading: boolean = false;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  showInitQuizScreen: boolean = false; // Variável para controlar a exibição da tela inicial do quiz
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
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

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  displayModalLogin: boolean = false;

  displayModalQuestionsList: boolean = false;

  origem: string = '';
  subjectId: number = 0;

  correctSound = new Audio('assets/sounds/correct.wav');
  wrongSound = new Audio('assets/sounds/wrong.wav');

  private subscriptions: Subscription[] = [];

  selectedQuestion: Question = new Question();
  comment: Comment = new Comment();
  comments: Comment[] = [];
  totalRecordComments: number = 0;
  showComments: boolean = false;
  selectedComment: Comment = new Comment();

  openedMenuId: number | null = null;

  private editarFoco = false;

  @ViewChild('editInput') editInputRef!: ElementRef;

  loadingMessage = "Carregando"; // Alterar dinamicamente

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

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

  // Mensagens de acerto
  correctMessages: string[] = [
    "Muito bem! 👏",
    "Acertou, continue assim! ⭐",
    "Excelente escolha! 🚀",
    "Perfeito, siga firme 💪",
    "Você pegou essa! 🔥"
  ];

  // Mensagens de erro (motivacionais, sem desanimar)
  incorrectMessages: string[] = [
    "Não foi dessa vez, tente a próxima! 💡",
    "Quase lá, continue tentando! 🌟",
    "Não desista, siga focado 🚀",
    "Boa tentativa, revise e continue 💪",
    "Cada tentativa conta, prossiga 👌"
  ];

  // --------------------------
  // MENSAGENS DE PROGRESSO
  // --------------------------

  currentMessage: string | null = null;
  lastStage: number = -1;

  // Start (0–25%)
  startMessages: string[] = [
    "Você já começou, isso é o mais importante 👣",
    "Primeiros passos dados, continue firme 💪",
    "Início promissor, bora em frente 🚀",
    "Já está em movimento, ótimo começo ⚡",
    "Começou bem, mantenha o ritmo ⭐",
    "Cada jornada começa com um passo, e você já deu o seu 👏",
    "Primeira parte iniciada, siga com foco 📚",
    "Belo arranque, continue no fluxo 🌊",
    "O caminho começou, aproveite a jornada 🛤️",
    "Ótima decisão em começar, siga em frente 👍"
  ]

  // Mid (25–50%)
  midMessages: string[] = [
    "Você já está no ritmo, continue 📈",
    "Seguindo bem no caminho, mantenha a constância ⚡",
    "Está avançando com firmeza 💡",
    "Quase na metade, foco total 🔥",
    "Boa cadência, siga sem parar 🚴",
    "Progresso visível, continue firme ⭐",
    "Ótimo ritmo, siga nessa energia 👏",
    "Você está construindo conhecimento passo a passo 📚",
    "Já percorreu um bom trecho da jornada, continue 🌟",
    "Mais um pouco e você chega à metade 💪"
  ]

  // Halfway (50–75%)
  halfwayMessages: string[] = [
    "Metade da jornada concluída 👏",
    "Chegou longe, mantenha a energia 🚀",
    "Você já percorreu um grande caminho 🌟",
    "Mais da metade avançada, foco no restante 💡",
    "Persistência é a chave, continue firme 🔑",
    "Agora é seguir até o fim, está indo bem 💪",
    "Grande parte já concluída, não perca o ritmo 🚴",
    "O esforço está somando, continue constante 📈",
    "Você está mantendo a disciplina, excelente 👌",
    "Já passou do meio, siga motivado 🔥"
  ]

  // Almost finished (75–99%)
  finalMessages: string[] = [
    "Está quase no fim, falta pouco 🏁",
    "Última etapa, mantenha o foco 👀",
    "Já percorreu quase tudo, continue firme 💪",
    "Últimos passos da jornada 🚶",
    "Final se aproximando, energia extra agora ⚡",
    "Só mais um pouco, não pare agora 🚀",
    "Está prestes a concluir, parabéns pela dedicação 🎯",
    "A linha de chegada está à vista 🏆",
    "Última reta, concentre-se e finalize 🌟",
    "Falta bem pouco, continue até o fim 🔥"
  ]

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

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private sanitizer: DomSanitizer,
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
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const quizId = this.route.snapshot.params['id'];
    if (quizId && quizId !== 'new' && quizId !== 'test') {
      this.getQuizByQuizId(quizId);
    }

    this.scrollToTop();

    this.route.queryParams.subscribe(params => {
      this.origem = params['from'];
      this.subjectId = params['subjectId'];
    });

    if (quizId && quizId == 'new' && !this.origem && !this.subjectId) {
      this.onInitQuiz();
    }

    if (quizId && quizId == 'test' && this.origem === 'subjects' && this.subjectId) {
      this.StartFinalTest(this.subjectId);
    }

    // Pré-carrega os sons para evitar atrasos
    this.correctSound.load();
    this.wrongSound.load();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();// Cancelar o temporizador e submiter o quiz
    }
  }

  get stepProgressPercentage(): number {
    let filled = 0;
    if (this.quiz.difficultyLevel) filled++;
    if (this.quiz.type) filled++;
    if (this.quiz.anonymous !== null) filled++;
    if (this.quiz.limitPerTopic) filled++;
    if (this.quiz.subject) filled++;
    if (this.getSelectedTopicIds().length > 0) filled++;

    return (filled / 6) * 100;
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

  showAnswerMessage(arr: string[]) {
    const index = Math.floor(Math.random() * arr.length);
    this.currentMessage = arr[index];

    setTimeout(() => {
      this.currentMessage = null;
    }, 3000); // some depois de 3 segundos
  }

  playCorrect(): void {
    this.correctSound.currentTime = 0;
    this.correctSound.play().catch(() => { });
  }

  playWrong(): void {
    this.wrongSound.currentTime = 0;
    this.wrongSound.play().catch(() => { });
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
          this.showAnswerMessage(this.correctMessages);
        } else {
          this.playWrong();
          this.showAnswerMessage(this.incorrectMessages);
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
        this.subjects = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  getTopicsBySubjectId(subjectId: number): void {
    this.loadingMessage = "Obtendo tópicos"
    this.showLoading = true;
    this.topicService.getBySubjectId(subjectId).subscribe(
      (dados: Topic[]) => {
        this.quiz.questions = [];
        this.topics = [];
        this.topics = dados;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  StartFinalTest(subjectId: number): void {

    this.loadingMessage = "Obtendo tópicos"
    this.showLoading = true;

    this.showInitQuizScreen = false;
    this.showStartScreen = false;
    this.showCorrection = false;

    this.quiz.anonymous = true;
    this.quiz.type = 'TEST';
    this.quiz.limitPerTopic = 5;

    this.topicService.getBySubjectId(subjectId).subscribe(
      (dados: Topic[]) => {
        this.quiz.questions = [];
        this.topics = [];
        this.topics = dados;
        this.quiz.subject = this.topics[0].subject;

        this.selectAllTopics();
        this.getQuestions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getQuestions(): void {
    this.loadingMessage = "Gerando questões...";
    const selectedTopicIds = this.getSelectedTopicIds();

    if (selectedTopicIds.length == 0) {
      this.messageService.add({ severity: 'error', detail: 'O Quiz deve ter pelo menos um tópico associado para gerar questões!' });
      return;
    }

    this.showLoading = true;

    this.questionService.getQuestionsByTopics(selectedTopicIds, this.quiz.difficultyLevel, this.quiz.limitPerTopic).subscribe(
      (dados: Question[]) => {
        // Se o utilizador não for premium → limitar o texto da solução
        if (!this.loggedUser || this.loggedUser.plan === 'FREE') {
          dados = dados.map(q => ({
            ...q,
            solution: this.limitSolutionSafe(q.solution, 5)
          }));
        }

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
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  selectLevel(level: any) {
    if (this.isAdvancedLevelDisabled(level)) return; // bloqueia clique
    this.quiz.difficultyLevel = level.value;
  }

  isAdvancedLevelDisabled(level: any): boolean {
    // só aplica a regra para o nível ADVANCED
    if (level.value !== 'ADVANCED') return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return !this.loggedUser || this.loggedUser.plan === 'FREE';
  }

  toggleTopic(topic: Topic): void {

    // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
    if (this.isPremiumTopicDisabled(topic)) return;

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
  isPremiumTopicDisabled(topic: Topic): boolean {
    if (topic.premium) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return !this.loggedUser || this.loggedUser.plan === 'FREE';
  }

  saveQuiz() {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Salvando o quiz"
    this.showLoading = true;
    this.quiz.topics = this.getSelectedTopics();

    const questionIds = this.quiz.questions.map(question => question.id);
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.quiz.timeLimit = this.questions.reduce((sum, question) => sum + question.timeLimit, 0);
    this.quiz.user = this.loggedUser;

    this.quizService.saveQuiz(this.quiz, questionIds, userAnswerIds, this.loggedUser.id).subscribe(
      (response) => {
        this.showLoading = false;
        this.quiz = response;
        //this.getQuizByQuizId(this.quiz.quizId);

        this.topics = this.getTopicosFromQuestoes(this.quiz.questions);
        if (this.quiz.answers) {
          this.calculateResults();
        }
        this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
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

  onSubmitAnswers() {
    if (this.isUserLoggedIn) {
      this.submitAnswers();
    }

    if (!this.isUserLoggedIn) {
      document.body.classList.add('no-scroll');
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  submitAnswers() {
    this.calculateResults();
    this.stopTimer();
    this.scrollToTop();
    if (!this.quiz.id) {
      const elapsedTimeInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.quiz.timeSpent = elapsedTimeInSeconds;
      this.saveQuiz();
    }
  }

  onSaveQuestion(question: Question) {
    if (this.isUserLoggedIn) {
      this.toggleSaveQuestion(question);
    }

    if (!this.isUserLoggedIn) {
      //this.action = 'save';
      document.body.classList.add('no-scroll');
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  toggleSaveQuestion(question: Question): void {
    question.showLoadingSave = true;
    this.userService.toggleSaveQuestion(this.loggedUser.id, question.id).subscribe(
      response => {
        question.savedByUser = !question.savedByUser;
        question.showLoadingSave = false;

        // Mensagem de confirmação melhorada
        this.currentMessage = question.savedByUser
          ? 'Questão adicionada aos favoritos'
          : 'Questão removida dos favoritos';

        setTimeout(() => {
          this.currentMessage = null;
        }, 3000); // desaparece depois de 3 segundos
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

    this.quizService.getQuizByQuizId(quizId, this.loggedUser.id).subscribe(
      (response) => {
        this.quiz = response;

        // 🔒 Se o utilizador não for Premium → limitar o texto da solução
        if (this.loggedUser.id === 0 || this.loggedUser.plan === 'FREE') {
          this.quiz.questions = this.quiz.questions.map(q => ({
            ...q,
            solution: this.limitSolutionSafe(q.solution, 4) // mostra 4 blocos/linhas
          }));
        }

        this.topics = this.getTopicosFromQuestoes(this.quiz.questions);

        if (this.quiz.answers) {
          this.calculateResults();
        }

        this.renderMathExpressions();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status === 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
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

  }

  showProgressMessage() {
    const progress = this.progressPercentage2;

    if (progress >= 100) {
      this.currentMessage = null;
      return;
    }

    let messagesToDraw: string[] = [];
    let stage = -1;

    if (progress >= 75) {
      messagesToDraw = this.finalMessages;
      stage = 3;
    } else if (progress >= 50) {
      messagesToDraw = this.halfwayMessages;
      stage = 2;
    } else if (progress >= 25) {
      messagesToDraw = this.midMessages;
      stage = 1;
    } else {
      messagesToDraw = this.startMessages;
      stage = 0;
    }

    // Só mostra se entrou em uma faixa nova
    if (stage !== this.lastStage) {
      this.currentMessage = this.getRandomMessage(messagesToDraw);
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
    if (!this.quiz.id) {
      this.stopTimer();
      this.scrollToTop();
      //this.router.navigateByUrl('/quizzes');
      //this.router.navigate(['/subjects', this.quiz.subject.subjectId]);

      if (this.origem === 'subjects' && this.subjectId) {
        this.router.navigate(['/subjects', this.quiz.subject.subjectId]);
      } else {
        this.router.navigateByUrl('/quizzes');
      }
    }

    this.showStartScreen = true;
  }

  startQuiz() {
    this.showInitQuizScreen = false; // Oculta a tela inicial do quiz
    this.showStartScreen = false; // Oculta a tela de início do quiz
    this.showCorrection = false; // Garante que a correção não seja exibida ao iniciar o quiz
    this.currentQuestionIndex = 0; // Começa na primeira questão
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    this.renderFunctions();
    this.scrollToTop();

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

  updateFormattedTime(): void {
    const minutes = Math.floor(this.timeLimit / 60);
    const seconds = this.timeLimit % 60;
    this.formattedTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();// Cancelar o temporizador
    }
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

  public get(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
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
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.submitAnswers();
        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
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
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.submitAnswers();
        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
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
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.ngZone.run(() => {
          this.submitAnswers();
          this.showLoading = false;
          this.displayModalLogin = false;
          document.body.classList.remove('no-scroll');
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
        this.showLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  onCloseLoginPopout() {
    this.displayModalLogin = false;
    document.body.classList.remove('no-scroll');
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
      //this.action = 'comment';
      this.showComments = false;
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
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
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
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

  openUpgradeModal() {
    // abre modal ou redireciona para plano Premium
    alert('Conteúdo exclusivo para utilizadores Premium.');
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