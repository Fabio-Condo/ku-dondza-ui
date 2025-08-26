import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Answer } from 'src/app/core/model/Answer';
import { QuestionService } from 'src/app/questions/question.service';
import { TopicService } from 'src/app/topics/topicsService.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Topic } from 'src/app/core/model/Topic';
import { SubjectsService } from 'src/app/subjects/subjects.service';
declare const MathJax: any;
import { e, evaluate } from 'mathjs'; //npm install mathjs
import { interval, Subscription } from 'rxjs';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-new-quizz',
  templateUrl: './new-quizz.component.html',
  styleUrls: ['./new-quizz.component.css']
})
export class NewQuizzComponent implements OnInit, OnDestroy {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  topics: Topic[] = [];
  //selectedTopics: Topic[] = [];
  subjects: Subject[] = [];
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  showLoading: boolean = false;
  showGetSubjectLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  loadingMessage = "Carregando"; // Alterar dinamicamente

  imagePath = './assets/images/funcao do grau 2.png';

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

  private subscriptions: Subscription[] = [];

  displayModalLogin: boolean = false;

  isUserLoggedIn: boolean = false;

  // desabilita inputs ou edições
  disableEditing: boolean = false;


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

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  difficultyLevels = [
    { label: 'Fácil', value: 'EASY' },
    //{ label: 'Médio', value: 'MEDIUM' },
    //{ label: 'Dificil', value: 'HARD' },
  ];

  limitsPerTopic = [
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    //{ label: 'ALL', value: 1000000 },

  ];

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  };

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private quizService: QuizService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Create new quiz page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.carregarDisciplinas();
    this.scrollToTop();
    this.quiz.difficultyLevel = 'EASY';
    this.quiz.limitPerTopic = 2;
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');

    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();// Cancelar o temporizador e submiter o quiz
    }
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
          this.toggleCorrection();
          this.scrollToTop();
          this.showFinalScreen = true;
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

  gettimeLimitValue(type: number) {
    switch (type) {
      case 60:
        return '01:00';
      case 120:
        return '02:00';
      case 180:
        return '03:00';
    }
    return '00:00';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Formata os minutos e segundos para ter 2 dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  // Método para calcular os resultados
  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;
    this.result.nullAnswers = 0;

    // Reinicia o objeto de resultados por tópico
    this.quiz.resultsByTopic = {};

    // Itera sobre todas as questões do quiz
    this.quiz.questions.forEach((question) => {
      const submittedAnswer = this.submittedAnswers.find(
        (a) => a.question?.id === question.id
      );

      // Obtém o tópico da questão
      const questionTopic = question.topic?.name || 'Sem tópico';

      // Inicializa o tópico no objeto resultsByTopic, se necessário
      if (!this.quiz.resultsByTopic[questionTopic]) {
        this.quiz.resultsByTopic[questionTopic] = {
          correct: 0,
          incorrect: 0,
          nullAnswers: 0,
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
        // Se não há resposta submetida, conta como não respondida
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
    const answeredCount = this.submittedAnswers.filter(
      a => a.id !== null && a.id !== undefined
    ).length;

    // Calcula o progresso com base nas respostas
    return (answeredCount / totalQuestions) * 100;
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
    // Calcular o tempo gasto em segundos
    this.showFinalScreen = true;
    this.calculateResults();
    this.stopTimer();
    this.scrollToTop();
    if (!this.submited) {
      const elapsedTimeInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.quiz.timeSpent = elapsedTimeInSeconds;
      this.saveQuiz();
    }
  }

  onStopCurrentRunningQuiz() {
    this.stopTimer();
    this.scrollToTop();
    //if (this.isUserLoggedIn && !this.submited) {
    //  this.submitAnswers();
    //  this.showFinalScreen = true;
    //}
    this.router.navigateByUrl('/quizzes');
  }

  startQuiz() {
    this.showStartScreen = false;
    this.currentQuestionIndex = 0;
    this.renderMathExpressions();
    this.renderFunctions();
    this.scrollToTop();
    this.startTimer();
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

  getQuestions(): void {
    this.loadingMessage = "Gerrando questões"
    const selectedTopicIds = this.getSelectedTopicIds();

    if (selectedTopicIds.length == 0) {
      this.messageService.add({ severity: 'error', detail: 'O Quiz deve ter pelo menos um tópico associado para gerar questões.!' });
      return;
    }

    this.showLoading = true;
    this.questionService.getQuestionsByTopics(selectedTopicIds, this.quiz.difficultyLevel, this.quiz.limitPerTopic).subscribe(
      (dados: Question[]) => {
        this.questions = dados;
        this.quiz.questions = this.questions;
        this.showLoading = false;
        this.renderMathExpressions();
        this.renderFunctions();
        this.startQuiz();
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

  getSelectedTopics(): Topic[] {
    return this.topics.filter(topic => topic.selected);
  }

  getSelectedTopicIds(): number[] {
    return this.topics.filter(topic => topic.selected).map(topic => topic.id);
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
        this.submited = true;
        this.quiz.submittedAt = response.submittedAt
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
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

  reviewQuestions() {
    this.showFinalScreen = false;
    this.currentQuestionIndex = 0;
    this.scrollToTop();
  }

  newQuiz() {
    this.showFinalScreen = false;
    this.showStartScreen = true;
    this.submittedAnswers = [];
    this.currentQuestionIndex = 0;
    this.result = { correctAnswers: 0, incorrectAnswers: 0, nullAnswers: 0 };
  }

  toggleCorrection() {
    this.showCorrection = !this.showCorrection;
    this.currentQuestionIndex = 0;
    this.showFinalScreen = !this.showFinalScreen;

    // Aguarda a atualização do DOM antes de renderizar MathJax
    this.renderMathExpressions();
    this.renderFunctions();

    this.scrollToTop();
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();
      //this.startTimer();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions2(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainer.innerHTML = `${this.quiz.questions[this.currentQuestionIndex].text}`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainerSolution.innerHTML = `${this.quiz.questions[this.currentQuestionIndex].solution}`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }

      const mathContainerTip = document.getElementById(`math-container-tip-${this.currentQuestionIndex}`);
      if (mathContainerTip && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainerTip.innerHTML = `${this.quiz.questions[this.currentQuestionIndex].tip}`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
    }, 0);
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

      // ✅ Renderiza MathJax após todos os elementos atualizados
      if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
    }, 0);
  }

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
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
      });
    }, 0);
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

  toggleDisableEditing() {
    this.disableEditing = !this.disableEditing;
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}