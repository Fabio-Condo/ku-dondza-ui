import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { Question } from 'src/app/core/model/Question';
import { QuestionService } from '../question.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { TopicService } from 'src/app/topics/topicsService.service';
import { Subject } from 'src/app/core/model/Subject';
import { Topic } from 'src/app/core/model/Topic';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MathExpression } from 'src/app/core/model/MathExpression';
import { Title } from '@angular/platform-browser';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Subscription } from 'rxjs';
import { evaluate } from 'mathjs'; //npm install mathjs
declare const MathJax: any;


@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  questions: Question[] = [];
  totalQuestions: number = 0;
  totalRegistros: number = 0;
  showLoading: boolean = false;
  displayModalSave: boolean = false;
  displayModalgenerateFromAI: boolean = false;
  displayModalPriview: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  question: Question = new Question();
  //selectedQuestion: Question = new Question();
  //generatedQuestion: Question = new Question();
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  extraRule: string = "";
  numberOfOptions: number = 4;


  loadingMessage = "Carregando..."; // Alterar dinamicamente

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  answer?: Answer;
  answers: Array<Answer> = [];
  showAnswerForm = false;
  answerIndex?: number;

  mathExpression?: MathExpression;
  mathExpressions: Array<MathExpression> = [];
  showMathExpressionForm = false;
  mathExpressionIndex?: number;

  fileToUpload!: File;
  subjects: Subject[] = [];
  //currentQuestionIndex: number = 0;

  selectedSubject?: number;
  topics: Topic[] = [];

  selectedAnswers: { [questionId: number]: number } = {}

  // Armazenar as respostas do usuário
  //userAnswers: { questionId: number; answerId: number }[] = [];
  //result: { correctAnswers: number; incorrectAnswers: number } = { correctAnswers: 0, incorrectAnswers: 0 };
  showCorrection: boolean = false;

  correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  @ViewChild('tabela') grid: any;

  selectQuestionOption: string = 'ALL_QUESTIONS';

  questionFilterOptions = [
    { label: 'Mostrar todos', value: 'ALL_QUESTIONS' },
    { label: 'Mostrar salvos', value: 'MY_SAVED_QUESTIONS' },
  ];

  timeLimits = [
    { label: '1 minutos', value: '60' },
    { label: '2 minutos', value: '120' },
    { label: '3 minutos', value: '180' },
  ];

  difficultyLevels = [
    { label: 'Fácil', value: 'EASY' },
    { label: 'Médio', value: 'MEDIUM' },
    { label: 'Dificil', value: 'HARD' },
  ];

  numberOfOptionsList = [
    { label: '4 opções', value: 4 },
    { label: '5 opções', value: 5 },
  ];

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,desc'
  };

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Questions page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll(0);
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToQuestion(questionId: string) {
    this.router.navigate(['/questions', questionId], {
      state: { from: 'questions' }
    });
  }

  get editing() {
    return Boolean(this.question.id);
  }

  // Método de salvar
  save(questionForm: NgForm) {
    if (this.editing) {
      this.updateQuestion(questionForm);
    } else {
      this.addNewQuestion(questionForm);
    }
  }

  // Método para adicionar nova pergunta
  addNewQuestion(questionForm: NgForm) {
    this.showLoading = true;

    // Marcar a resposta correta
    this.question.answers.forEach(answer => {
      answer.correct = (answer.text === this.correctAnswer); // Define a resposta correta
    });

    this.questionService.add(this.question).subscribe(
      (question) => {
        this.question = question;
        this.findAll();
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Question added successfully' });
        //questionForm.reset(); // Reseta o formulário
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para atualizar pergunta
  updateQuestion(questionForm: NgForm) {
    this.showLoading = true;

    // Marcar a resposta correta
    this.question.answers.forEach(answer => {
      answer.correct = (answer.text === this.correctAnswer); // Define a resposta correta
    });

    this.questionService.update(this.question).subscribe(
      (question) => {
        this.question = question;
        this.findAll();
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Question updated successfully!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    this.showLoading = true;
    setTimeout(() => {
      MathJax.typesetPromise();
    }, 0);
    this.showLoading = false;
  }

  // Método de carregamento de questões
  findAll(pagina: number = 0): void {
    if (this.selectQuestionOption == 'MY_SAVED_QUESTIONS') {
      this.filtro.userId = this.loggedUser.id;
    }

    if (this.selectQuestionOption == 'ALL_QUESTIONS') {
      this.filtro.userId = 0;
    }

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0

    this.questionService.getQuestions(this.filtro, this.loggedUser.id).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions = dados.content
        this.totalRegistros = dados.totalElements;
        this.renderMathExpressions();
        if (this.totalQuestions == 0) {
          this.totalQuestions = dados.totalElements;
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  loadMore(page: number = 0): void {
    if (this.selectQuestionOption == 'MY_SAVED_QUESTIONS') {
      this.filtro.userId = this.loggedUser.id;
    }

    if (this.selectQuestionOption == 'ALL_QUESTIONS') {
      this.filtro.userId = 0;
    }

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.page++;

    this.questionService.getQuestions(this.filtro, this.loggedUser.id).subscribe(
      (data: IApiResponse<Question>) => {
        this.questions = [...this.questions, ...data.content];
        this.totalRegistros = data.totalElements;
        this.renderMathExpressions();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  get isLoadMoreDisabled(): boolean {
    return this.questions.length >= this.totalRegistros && this.totalRegistros > 0;
  }

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  onUpdateQuestion(question: Question): void {
    this.question = question;
    this.question.id = question.id;
    this.displayModalSave = true;

    this.selectedSubject = (this.question.topic.subject) ? this.question.topic.subject.id : undefined;
    if (this.selectedSubject) {
      this.getTopicsBySubjectId();
    }

    // Captura a resposta correta (assumindo que a propriedade correta está na classe Question)
    const correctAnswerObj = this.question.answers.find(answer => answer.correct);
    this.correctAnswer = correctAnswerObj ? correctAnswerObj.text : undefined; // Armazena o texto da resposta correta
  }

  onAddNewQuestion(): void {
    this.question = new Question();
    this.displayModalSave = true;
  }

  onGenerateFromAI(): void {
    this.question = new Question();
    this.displayModalgenerateFromAI = true;
  }

  generateFromAI(): void {
    this.loadingMessage = "Gerrando questão";
    this.showLoading = true;

    this.questionService.generateAdvancedQuestionFromAI(this.question.topic.id, this.question.difficultyLevel, this.extraRule, this.numberOfOptions).subscribe(
      (question) => {
        this.question = question;
        this.renderMathExpressions();
        this.renderFunctions();

        // Captura a resposta correta (assumindo que a propriedade correta está na classe Question)
        const correctAnswerObj = this.question.answers.find(answer => answer.correct);
        this.correctAnswer = correctAnswerObj ? correctAnswerObj.text : undefined; // Armazena o texto da resposta correta

        this.showLoading = false;

        this.displayModalgenerateFromAI = false;
        this.priviewQuestion(this.question);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onSaveGeneratedQuestionFromAI(): void {
    this.displayModalPriview = false;
    this.displayModalSave = true;
    this.onUpdateQuestion(this.question);
  }

  priviewQuestion(question: Question): void {
    this.question = question;
    this.displayModalPriview = true;
    this.showCorrection = true;

    this.renderMathExpressions();
    this.renderFunctions();
  }

  togglePriview(): void {
    this.displayModalPriview = !this.displayModalPriview;

    if (this.displayModalPriview) {
      document.body.classList.add('no-scroll');
    } else {
      this.showCorrection = false;
      document.body.classList.remove('no-scroll');
    }
  }

  excluir(question: Question) {
    this.questionService.delete(question.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      }
      this.messageService.add({ severity: 'success', detail: 'Questao excluída com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(question: Question): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(question);
      }
    });
  }

  getTopicsBySubjectId() {
    this.topicService.getBySubjectId(this.selectedSubject!).subscribe({
      next: (dados) => {
        this.topics = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

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

  // Métodos de gerenciamento de respostas
  getReadyNewAnswer() {
    this.showAnswerForm = true;
    this.answer = new Answer();
    this.answerIndex = this.question.answers.length;
  }

  getReadyAnswerEdit(answer: Answer, index: number) {
    this.answer = this.cloneAnswer(answer);
    this.showAnswerForm = true;
    this.answerIndex = index;
  }

  confirmAnswer(frm: NgForm) {
    this.question.answers[this.answerIndex!] = this.cloneAnswer(this.answer!);
    this.showAnswerForm = false;
    frm.reset();
  }

  cloneAnswer(answer: Answer): Answer {
    return new Answer(answer.id, answer.text, answer.correct);
  }

  get editingAnswer() {
    return this.answer && this.answer?.id;
  }

  removeAnswer(index: number) {
    this.question.answers.splice(index, 1);
  }

  onRemoveAnswer(index: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover da lista?',
      accept: () => {
        this.removeAnswer(index);
      }
    });
  }

  // Métodos de gerenciamento de expressoes matematicas
  getReadyNewMathExpression() {
    this.showMathExpressionForm = true;
    this.mathExpression = new MathExpression();
    this.mathExpressionIndex = this.question.mathExpressions.length;
  }

  getReadyMathExpressionEdit(mathExpression: MathExpression, index: number) {
    this.mathExpression = this.cloneMathExpression(mathExpression);
    this.showMathExpressionForm = true;
    this.mathExpressionIndex = index;
  }

  confirmMathExpression(frm: NgForm) {
    this.question.mathExpressions[this.mathExpressionIndex!] = this.cloneMathExpression(this.mathExpression!);
    this.showMathExpressionForm = false;
    frm.reset();
  }

  cloneMathExpression(mathExpression: MathExpression): MathExpression {
    return new MathExpression(mathExpression.id, mathExpression.expression);
  }

  get editingMathExpression() {
    return this.mathExpression && this.mathExpression?.id;
  }

  removeMathExpression(index: number) {
    this.question.mathExpressions.splice(index, 1);
  }

  onRemoveMathExpression(index: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover da lista?',
      accept: () => {
        this.removeMathExpression(index);
      }
    });
  }

  toggleDropdown(question: Question) {
    question.isAdminMenuOpen = !question.isAdminMenuOpen
  }

  closeDropdown(question: Question) {
    question.isAdminMenuOpen = false;
  }

  onUpdateQuestionImage(question: Question, event: any) {
    if (event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];
      this.questionService.updateQuestionImage(question.id, this.fileToUpload).subscribe(
        response => {
          question = response;
          console.log('Upload successful', response);
        },
        error => {
          console.error('Upload failed', error);
        }
      );
    }
  }

  onSave(question: Question) {
    this.question = question;
    if (this.isUserLoggedIn) {
      this.toggleSaveQuestion(question);
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

  toggleSaveQuestion(question: Question): void {
    question.showLoadingSave = true;
    this.userService.toggleSaveQuestion(this.loggedUser.id, question.id).subscribe(
      response => {
        question.savedByUser = !question.savedByUser;
        question.showLoadingSave = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        question.showLoadingSave = false;
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

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.text = "";
    this.filtro.subject = undefined;
    this.filtro.topic = undefined;
    this.filtro.page = 0;
    this.filtro.itemsPerPage = 10;
    this.filtro.sort = "id,desc";
    this.selectQuestionOption = 'ALL_QUESTIONS';
    this.findAll();
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

        this.findAll();
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

        this.findAll();
        this.showLoading = false;
        this.displayModalLogin = false; this.showLoading = false;
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
          this.findAll();
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

  togleCorrection() {
    this.showCorrection = !this.showCorrection;
    this.renderMathExpressions();
    this.renderFunctions();
  }

  toggleValidatedStatus(question: Question): void {
    question.showLoadingValidation = true;

    const newStatus = !question.validated;

    this.questionService.toggleValidated(question.id, newStatus).subscribe({
      next: () => {
        question.validated = newStatus;
        question.showLoadingValidation = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        question.showLoadingValidation = false;
      },
    });
  }

  onViewSolution() {

    if (this.isUserLoggedIn) {
      this.togleCorrection();
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

  isSelected(questionId: number, answerId: number): boolean {
    return this.selectedAnswers[questionId] === answerId;
  }

  captureUserAnswer(questionId: number, answerId: number): void {
    this.selectedAnswers[questionId] = answerId;
  }

  hasUserSelected(questionId: number): boolean {
    return this.selectedAnswers.hasOwnProperty(questionId);
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

      // Desenha a grade cartesiana (quadradinhos)
      ctx.beginPath();
      ctx.strokeStyle = '#ddd'; // cor cinza clara
      ctx.lineWidth = 0.5;

      // Linhas verticais
      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }

      // Linhas horizontais
      for (let i = -10; i <= 10; i++) {
        let y = height / 2 - i * scaleY;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

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
      });
    }, 0);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}

