import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../question.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { QuizService } from 'src/app/quiz/quiz.service';
import { Quiz } from 'src/app/core/model/Quiz';
import { Comment } from 'src/app/core/model/Comment';
import { QuizFilter } from 'src/app/core/interface/QuizFilter';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from 'src/app/core/model/User';
import { Role } from 'src/app/enum/role.enum';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Title } from '@angular/platform-browser';

declare const MathJax: any;
import { evaluate, re } from 'mathjs'; //npm install mathjs
import { NgForm } from '@angular/forms';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { CommentService } from 'src/app/comments/comment.service';
import { CommentFilter } from 'src/app/core/interface/CommentFilter';
import { CommentLikeService } from 'src/app/likes/commentLike.service';
import { UserService } from 'src/app/users/user.service';
import { Answer } from 'src/app/core/model/Answer';
import { Wallet } from 'src/app/core/model/Wallet';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { Topic } from 'src/app/core/model/Topic';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';


@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent implements OnInit {

  question: Question = new Question();

  questions: Question[] = [];
  questionsWithFullSolutions: Question[] = [];
  currentQuestionIndex = 0;

  showLoading: boolean = false;
  retryVisible: boolean = false;
  showLatexLoading: boolean = false;

  quizzes: Quiz[] = [];
  displayModalViewQuizzes: boolean = false;
  totalQuizzes: number = 0;
  totalRecordsQuizzes: number = 0
  currentPageQuizzes: number = 1;

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  displayModalQuestionsList: boolean = false;
  displayModalUpgradePlan: boolean = false;
  displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  //selectedAnswers: { [questionId: number]: number } = {}
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário


  showCorrection: boolean = false;
  showSolution: boolean = true;
  imagePath = './assets/images/funcao do grau 2.png';

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;
  action: 'solution' | 'comment' | 'save' = 'solution';

  comment: Comment = new Comment();
  comments: Comment[] = [];
  totalRecordComments: number = 0;
  showComments: boolean = false;
  selectedComment: Comment = new Comment();

  private editarFoco = false;

  @ViewChild('editInput') editInputRef!: ElementRef;

  correctSound = new Audio('assets/sounds/correct.wav');
  wrongSound = new Audio('assets/sounds/wrong.wav');

  openedMenuId: number | null = null;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  origem: string = '';
  topicId: string = '';
  subjectId: string = '';

  currentMessage: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null = null;

  // Mensagens de acerto
  correctMessages: string[] = [
    "Mandou muito bem! 🎉",
    "Perfeito! Continue assim! ⭐",
    "Excelente escolha! 🚀",
    "Mandou ver! 🎯",
    "Você pegou essa! 🔥"
  ];

  // Mensagens de erro (motivacionais, sem desanimar)
  incorrectMessages: string[] = [
    "Faz parte do processo — siga firme! 🚀",
    "Errou, mas está aprendendo! 🌱",
    "Cada erro é um passo para o acerto! 🌟",
    "Aprender é assim: tenta, erra e evolui! 🔥",
    "O importante é continuar! 🌟",
  ];

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  commentFilter: CommentFilter = {
    page: -1,
    itemsPerPage: 25,
    sort: 'id,asc',
  }

  quizFilter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private questionService: QuestionService,
    private walletService: WalletService,
    private commentService: CommentService,
    private commentLikeService: CommentLikeService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Question view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const questionId = this.route.snapshot.params['id'];
    if (questionId) {
      this.findById(questionId);
    }
    this.scrollToTop();

    this.route.queryParams.subscribe(params => {
      this.origem = params['from'];
      this.topicId = params['topicId'];
      this.subjectId = params['subjectId'];
    });

    // Pré-carrega os sons para evitar atrasos
    this.correctSound.load();
    this.wrongSound.load();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBack(): void {
    if (this.origem === 'topics' && this.topicId) {
      this.router.navigate(['/topics', this.topicId]);
    } else if (this.origem === 'subjects' && this.subjectId) {
      this.router.navigate(['/subjects', this.subjectId]);
    } else {
      this.router.navigate(['/questions']);
    }
  }

  findById(id: string) {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.questionService.getQuestionByQuestionId(id, this.loggedUser.id)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            scan((retryCount, error) => {
              if (retryCount >= 3) throw error; // 3 tentativas
              const nextRetry = retryCount + 1;
              this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
              return nextRetry;
            }, 0),
            delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000)) // 2s → 4s → 8s
          )
        )
      )
      .subscribe(
        (response) => {
          this.question = response;
          this.questionsWithFullSolutions.unshift(response); // Adiciona a questão recebida na primeira posição da lista

          // 🔒 Se o utilizador não for Premium → limitar o texto da solução
          if (this.isPremiumTopic(this.question.topic)) {
            this.question.solution = this.limitSolutionSafe(this.question.solution, 4); // mostra 4 blocos/linhas}
          }

          this.questions.unshift(this.question); // Adiciona a questão recebida na primeira posição da lista
          this.renderMathExpressions();
          this.renderFunctions();
          this.showLoading = false;
          //this.getComments(this.question.id);
        },
        (errorResponse: HttpErrorResponse) => {
          this.showLoading = false;
          this.retryVisible = true;
          if (!navigator.onLine) {
            this.sendErrorNotification("Você está sem conexão com a internet.");
          } else {
            this.sendErrorNotification(
              errorResponse?.error?.message || "Não foi possível carregar a questão."
            );
          }
        }
      );
  }

  retryGetQuestion(): void {
    this.retryVisible = false;
    this.findById(this.route.snapshot.params['id']);
  }

  onGenerateNextQuestion() {

    this.showCorrection = false;

    // Se já carregamos as questões, vamos para a próxima
    if (this.questions.length > 1) {
      this.showNextQuestion();
    } else {
      this.getQuestionsByTopicId();
    }
  }

  getQuestionsByTopicId(): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.questionService.getQuestionsByTopicId(this.question.topic.id).subscribe(
      (dados: Question[]) => {

        this.questionsWithFullSolutions = dados;

        // 🔒 Se o utilizador não for Premium → limitar o texto da solução
        if (this.isPremiumTopic(this.question.topic)) {
          dados = dados.map(q => ({
            ...q,
            solution: this.limitSolutionSafe(q.solution, 4) // mostra 4 blocos/linhas
          }));
        }

        // Separa a questão atual
        const questaoAtual = this.question;

        // Remove a questão atual da lista para não embaralhá-la junto
        const outrasQuestoes = dados.filter(q => q.questionId !== questaoAtual.questionId);

        // Embaralha as outras
        const embaralhadas = this.shuffleQuestions(outrasQuestoes);

        // Junta a questão atual + embaralhadas
        this.questions = [questaoAtual, ...embaralhadas];

        // Atualiza a posição atual
        this.currentQuestionIndex = 1;
        this.question = this.questions[1]; // Mostra a segunda questão (a segunda após a atual)
        this.showLoading = false;

        // Navega e renderiza
        this.router.navigate(['/questions', this.question.questionId], { replaceUrl: true });
        this.renderMathExpressions();
        this.renderFunctions();
        this.scrollToTop();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onSave() {

    if (this.isUserLoggedIn) {
      this.toggleSaveQuestion();
    }

    if (!this.isUserLoggedIn) {
      this.action = 'save';
      document.body.classList.add('no-scroll');
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  toggleSaveQuestion(): void {
    this.question.showLoadingSave = true;
    this.userService.toggleSaveQuestion(this.loggedUser.id, this.question.id).subscribe(
      response => {
        this.question.savedByUser = !this.question.savedByUser;
        this.question.showLoadingSave = false;

        // Mensagem de confirmação colorida e animada
        const message = this.question.savedByUser
          ? 'Questão adicionada aos favoritos'
          : 'Questão removida dos favoritos';

        const type = this.question.savedByUser ? 'success' : 'warning';

        this.showAnswerMessage([message], type);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.question.showLoadingSave = false;
      }
    );
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.question = this.questions[this.currentQuestionIndex];
      this.router.navigate(['/questions', this.question.questionId], { replaceUrl: true });
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();

      if (this.isCurrentQuestionAnswered(this.question.id) && this.question.verified) {
        this.showCorrection = true;
      } else {
        this.showCorrection = false;
      }
    }
  }

  showNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.question = this.questions[this.currentQuestionIndex];
      this.router.navigate(['/questions', this.question.questionId], { replaceUrl: true });
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();

      if (this.isCurrentQuestionAnswered(this.question.id) && this.question.verified) {
        this.showCorrection = true;
      } else {
        this.showCorrection = false;
      }
    } else {
      this.sendErrorNotification("Você chegou ao fim das questões deste tópico.");
    }
  }

  get QuestionsEnded(): boolean {
    return this.currentQuestionIndex >= this.questions.length - 1;
  }

  // Embaralhar a ordem
  shuffleQuestions(questions: Question[]): Question[] {
    return questions.sort(() => Math.random() - 0.5);
  }

  gettimeLimitValue(seconds: number) {
    switch (seconds) {
      case 120:
        return '2 minutos';
      case 180:
        return '3 minutos';
      case 240:
        return '4 minutos';
      case 300:
        return '5 minutos';
    }
    return '';
  }



  //isSelected(questionId: number, answerId: number): boolean {
  //  return this.selectedAnswers[questionId] === answerId;
  //}

  //captureUserAnswer(questionId: number, answerId: number): void {
  //  this.selectedAnswers[questionId] = answerId;
  //}

  //hasUserSelected(questionId: number): boolean {
  //  return this.selectedAnswers.hasOwnProperty(questionId);
  //}

  //togleCorrection() {
  //  this.showCorrection = !this.showCorrection;
  //  this.renderMathExpressions();
  //  this.renderFunctions();
  //}

  playCorrect(): void {
    this.correctSound.currentTime = 0;
    this.correctSound.play().catch(() => { });
  }

  playWrong(): void {
    this.wrongSound.currentTime = 0;
    this.wrongSound.play().catch(() => { });
  }

  onViewSolution() {
    this.togleCorrection();

    //if (this.isUserLoggedIn) {
    //  this.togleCorrection();
    //}

    //if (!this.isUserLoggedIn) {
    //  this.action = 'solution';
    //  document.body.classList.add('no-scroll');
    //  this.displayModalLogin = true;
    //  setTimeout(() => {
    //    this.initializeGoogleAuth();
    //  }, 100); // Espera para o botão estar no DOM
    //  return;
    //}
  }

  // Se escolher o modo treino. SERA DADO FEEDBACK INSTATANEO
  togleCorrection() {
    this.showCorrection = true;
    this.question.verified = true; // Marca como verificada pelo usuário (para mostrar dica/solução automaticamente)
    this.renderMathExpressions();
    this.renderFunctions();

    // Mostra mensagem de acerto/erro da pergunta atual (se houver)
    const perguntaAtual = this.submittedAnswers[this.currentQuestionIndex];
    if (perguntaAtual && perguntaAtual.id !== undefined) {
      const question = this.questions[this.currentQuestionIndex];
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

  isCurrentQuestionAnswered(questionId: number): boolean {
    return this.submittedAnswers.some(
      (answer: Answer) => answer.question?.id === questionId
    );
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    this.showLatexLoading = true;
    setTimeout(() => {
      MathJax.typesetPromise();
    }, 0);
    this.showLatexLoading = false;
  }

  renderFunctions() {
    setTimeout(() => {
      const canvas = this.canvas?.nativeElement;
      if (!canvas || !this.question.mathExpressions || this.question.mathExpressions.length === 0) return;

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

      this.question.mathExpressions.forEach((express, index) => {
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
    this.comment.question = this.question;
    this.commentService.add(this.comment).subscribe(
      (response) => {
        this.comment = response;
        this.showLoading = false;
        this.comments.unshift(this.comment); // Adiciona o novo comentário no início da lista
        this.totalRecordComments++;
        this.question.numberOfComments++;
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
    this.comment.question = this.question;
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
      this.action = 'comment';
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
      this.question.numberOfComments--;
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
    this.getComments(this.question.id);
  }

  onLike(comment: Comment) {
    this.selectedComment = comment;
    if (this.isUserLoggedIn) {
      this.toggleLike(comment);
    }

    if (!this.isUserLoggedIn) {
      //this.action = 'Like';
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

  onGetComments() {
    this.comments = [];
    this.commentFilter.page = -1;
    this.totalRecordComments = 0

    if (this.question.numberOfComments > 0) {
      this.getComments(this.question.id);
    }

    this.showComments = true;
    document.body.classList.add('no-scroll');
  }

  onCloseComments() {
    this.showComments = false;
    document.body.classList.remove('no-scroll');
  }

  toggleDropdown(question: Question) {
    question.isAdminMenuOpen = !question.isAdminMenuOpen;
  }

  closeDropdown(question: Question) {
    question.isAdminMenuOpen = false;
  }

  shareOnSocial(network: string, questionId: string): void {
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

  copyLink(questionId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link).then(() => {
      console.log(`Link do item ${questionId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
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

        this.findById(this.question.questionId);

        if (this.action === 'solution') {
          this.togleCorrection();
        }
        if (this.action === 'comment') {
          this.showComments = true;
        }
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

        if (this.action === 'solution') {
          this.togleCorrection();
        }
        if (this.action === 'comment') {
          this.showComments = true;
        }
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

    if (this.isMobileWebView()) {
      console.log('Mobile WebView detected — Google Auth skipped.');
      return; // não inicializa SDK
    }

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
          this.findById(this.question.questionId);
          //if (this.action === 'save' && !this.question.savedByUser) {
          //  this.toggleSaveQuestion();
          //  this.question.savedByUser = !this.question.savedByUser;
          //}
          if (this.action === 'solution') {
            this.togleCorrection();
          }
          if (this.action === 'comment') {
            this.showComments = true;
          }
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

  public isMobileWebView(): boolean {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent) && this.isWebView();
  }

  public isWebView(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    // Android WebView ou iOS WKWebView
    return /wv|Android.*Version\/|iPhone.*AppleWebKit\/.*Mobile/i.test(userAgent);
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

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumTopic(topic: Topic): boolean {
    if (!topic.premium) return false;

    // ADMIN sempre tem acesso
    if (this.isUserLoggedIn && this.isAdmin) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser();
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const planExpiresAt = this.loggedUser.planExpiresAt ? new Date(this.loggedUser.planExpiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !planExpiresAt || planExpiresAt <= new Date();
  }

  getWalletsByUser(userId: number): void {
    this.loadingMessage = "Obtendo dados"
    this.showLoading = true;
    this.walletService.getWalletsByUser(userId).subscribe(
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

    this.displayModalLogin = true;
    setTimeout(() => {
      this.displayModalUpgradePlan = false;
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
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

        // Atualiza também a questão atual (referência direta)
        if (this.questions.length === 1) {
          this.findById(this.question.questionId); // Recarrega questão atual
        }

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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
