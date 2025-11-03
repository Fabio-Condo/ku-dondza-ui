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
  displayModalgenerateFromJson: boolean = false;
  displayModalPriview: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  question: Question = new Question();
  //selectedQuestion: Question = new Question();
  //generatedQuestion: Question = new Question();
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  extraRule: string = "";
  numberOfOptions: number = 5;
  exerciseFormat: string = "";

  jsonInput: string = '';

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  currentMessage: string | null = null;

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

  // mostra opções adicionais
  showOptions: boolean = false;

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
    { label: 'Iniciante', value: 'BEGINNER' },
    { label: 'Avançado', value: 'ADVANCED' },
  ];

  numberOfOptionsList = [
    { label: '4 opções', value: 4 },
    { label: '5 opções', value: 5 },
  ];

  exerciseFormats = [
    { label: 'Cálculo direto', value: 'cálculo direto' },
    { label: 'Problema contextualizado', value: 'problema contextualizado' },
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
    document.body.classList.add('no-scroll');

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
    document.body.classList.add('no-scroll');
  }

  closeSavePopout(): void {
    this.displayModalSave = false;
    document.body.classList.remove('no-scroll');
  }

  onGenerateFromAI(): void {
    this.question = new Question();
    this.displayModalgenerateFromAI = true;
    document.body.classList.add('no-scroll');
  }

  closeGenerateFromAiPopout(): void {
    this.displayModalgenerateFromAI = false;
    document.body.classList.remove('no-scroll');
  }

  generateFromAI(): void {
    this.loadingMessage = "Gerrando questão";
    this.showLoading = true;

    this.questionService.generateAdvancedQuestionFromAI(this.question.topic.id, this.extraRule, this.numberOfOptions, this.exerciseFormat).subscribe(
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

  onPriviewQuestion(question: Question): void {
    this.displayModalPriview = true;
    this.priviewQuestion(question);
    document.body.classList.add('no-scroll');
  }

  closePriview(): void {
    this.displayModalPriview = false;
    this.showCorrection = false;
    document.body.classList.remove('no-scroll');
  }

  onGenerateFromJson(): void {
    this.question = new Question();
    this.displayModalgenerateFromJson = true;
    document.body.classList.add('no-scroll');
  }

  closeGenerateFromJsonPopout(): void {
    this.displayModalgenerateFromJson = false;
    document.body.classList.remove('no-scroll');
  }

  onGenerateQuestionFromJsonInput(): void {
    try {
      const parsed = JSON.parse(this.jsonInput); // converte string -> objeto
      this.question = this.convertFromJson(parsed); // guarda na variável da classe

      this.renderMathExpressions();
      this.renderFunctions();

      // Captura a resposta correta (assumindo que a propriedade correta está na classe Question)
      const correctAnswerObj = this.question.answers.find(answer => answer.correct);
      this.correctAnswer = correctAnswerObj ? correctAnswerObj.text : undefined; // Armazena o texto da resposta correta

      this.showLoading = false;

      this.displayModalgenerateFromJson = false;
      this.priviewQuestion(this.question);

    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e);
    }
  }

  // Função robusta para converter $...$ -> \( ... \) e $$...$$ -> \[ ... \]
  // Preserva \$ escapados.
  private convertLatexDollarsToBrackets(text: string): string {
    if (typeof text !== 'string' || text.length === 0) return text;

    // Protege sequências escapadas '\$' para não as converter
    const ESC = '__ESCAPED_DOLLAR__';
    text = text.replace(/\\\$/g, ESC);

    // Primeiro trata $$...$$ -> \[ ... \] (display math)
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, inner) => {
      return `\\[${inner}\\]`;
    });

    // Depois trata $...$ -> \( ... \) (inline math)
    text = text.replace(/\$([\s\S]*?)\$/g, (_match, inner) => {
      return `\\(${inner}\\)`;
    });

    // Restaura os \$ originais
    return text.replace(new RegExp(ESC, 'g'), '$');
  }

  convertFromJson(jsonData: any): Question {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('JSON inválido: não é um objeto');
    }

    // Verifica existência dos campos obrigatórios (não apenas falsy)
    if (typeof jsonData.text === 'undefined' ||
      typeof jsonData.solution === 'undefined' ||
      typeof jsonData.answers === 'undefined') {
      throw new Error('JSON inválido: campos obrigatórios ausentes (text, solution, answers)');
    }

    if (!Array.isArray(jsonData.answers) || jsonData.answers.length === 0) {
      throw new Error('JSON inválido: answers deve ser um array não vazio');
    }

    const question = new Question();

    // Converte com segurança (garante strings)
    question.text = this.convertLatexDollarsToBrackets(String(jsonData.text));
    question.tip = this.convertLatexDollarsToBrackets(String(jsonData.tip ?? ''));
    question.solution = this.convertLatexDollarsToBrackets(String(jsonData.solution));
    question.timeLimit = 60;

    question.answers = jsonData.answers.map((answer: any) => ({
      text: this.convertLatexDollarsToBrackets(String(answer.text ?? '')),
      correct: Boolean(answer.correct)
    }));

    return question;
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

    this.loadingMessage = "Carregando tópicos"
    this.showLoading = true;

    this.topicService.getBySubjectId(this.selectedSubject!).subscribe({
      next: (dados) => {
        this.topics = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
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
    return new MathExpression(mathExpression.id, mathExpression.name, mathExpression.expression);
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
    this.questions.forEach(q => {
      if (q !== question) {
        q.isAdminMenuOpen = false;
      }
    });
    question.isAdminMenuOpen = !question.isAdminMenuOpen;
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

        // Mensagem de confirmação melhorada
        this.currentMessage = this.question.savedByUser
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

  toggleShowOptions() {
    this.showOptions = !this.showOptions;
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

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = 'A' em ASCII - Mostra A, B, C, ...
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

  shareOnSocial(network: string, questionId: string): void {
    const baseUrl = `${window.location.origin}/questions/${questionId}`; // link do item
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
    //const link = `${window.location.origin}/questions/${questionId}`;

    navigator.clipboard.writeText(link + `/${questionId}`).then(() => {
      console.log(`Link do item ${questionId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}


// Para gerar question atravez do json
/*

{
  "text": "Um jato de água descreve uma parábola cuja altura (em metros) em função da distância horizontal x (em metros) é dada por \\(h(x) = -2x^2 + 8x + 1\\). Determine **a altura máxima** atingida pelo jato e *a posição horizontal* onde isso ocorre. Justifique o raciocínio.",
  "tip": "Calcule primeiro a abscissa do vértice com \\(x_v = -\\frac{b}{2a}\\) e depois avalie a função nesse valor. Lembre que, se \\(a<0\\), o vértice é um ponto de máximo.",
  "solution": "Dados: \\(a = -2\\), \\(b = 8\\), \\(c = 1\\). A abscissa do vértice é \\(x_v = -\\frac{b}{2a} = -\\frac{8}{2\\cdot(-2)} = 2\\). Como \\(a<0\\) a parábola é côncava para baixo, portanto o vértice corresponde a um máximo. Avaliando a função em \\(x=2\\): \\(h(2) = -2\\cdot 2^2 + 8\\cdot 2 + 1 = -8 + 16 + 1 = 9\\). Portanto a altura máxima é **9 metros** e ocorre em \\(x = 2\\) metros.",
  "answers": [
    {
      "text": "A altura máxima é \\(7\\) metros e ocorre em \\(x = 1\\) metro.",
      "correct": false
    },
    {
      "text": "A altura máxima é **9 metros** e ocorre em \\(x = 2\\) metros.",
      "correct": true
    },
    {
      "text": "A altura máxima é \\(1\\) metro e ocorre em \\(x = 4\\) metros.",
      "correct": false
    },
    {
      "text": "A altura máxima é \\(8{,}5\\) metros e ocorre em \\(x = 1.5\\) metros.",
      "correct": false
    },
    {
      "text": "A altura máxima é \\(9\\) metros e ocorre em \\(x = -2\\) metros.",
      "correct": false
    }
  ],
  "mathExpressions": [
    {
      "expression": "-2x^2+8x+1"
    }
  ]
}


Regras para gerar o JSON:
Responda somente com JSON válido — nada antes nem depois do JSON.
O JSON deve ser sintaticamente válido (parseável em Java).
Todos os campos do JSON são obrigatórios.
Exatamente 5 alternativas em "answers" — uma correta e as restantes incorretas.
"mathExpressions" é opcional e só deve ser incluído quando o enunciado exigir interpretação gráfica ou análise visual de uma função/equação.
Para LaTeX, não use o símbolo $.
Para conteúdo inline, use exatamente \\(...\\).
Para conteúdo em bloco, use exatamente \\[...\\].
Para todo LaTeX presente no JSON (enunciado, dica, solução, respostas e expressões), não use $; use \\(...\\) para inline e \\[...\\] para bloco, tal como indicado.
Para colocar texto em negrito, envolva com dois asteriscos. Exemplo: **Texto em negrito.**
Para colocar texto em itálico, envolva com um asterisco. Exemplo: *texto em italico.*
Para saltar linha / iniciar novo parágrafo, utilize Enter criando uma linha em branco; não use a sequência \n.
Valores monetários: se mencionar dinheiro, represente-o apenas em metical (MT).
Regras específicas para "mathExpressions" (se usado):
As variáveis nas expressões devem ser apenas em função de x.
Não utilize notação de função como f(x)=2x+5; escreva apenas 2x+5.
As expressões devem ser não redundantes — evite escrever a mesma função em formas diferentes.
Exemplo inválido: -2x^2+12x-10 e -2(x-3)^2+8 (são a mesma função em formas diferentes).
A questão deve ser inteligente e não trivial:
Deve exigir raciocínio do aluno, não mera memorização.
As alternativas incorretas devem ser plausíveis (não óbvias).
O enunciado deve contextualizar bem o problema.
A solução deve explicar o raciocínio passo a passo.
Para intervalos (por exemplo: [0,1], ]0,1[, ]0,1], [0,1[), utilize apenas colchetes [ ]; nunca use parênteses ().
Para saltar de linha use \n\n1

*/


