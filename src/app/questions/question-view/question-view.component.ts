import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../question.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { QuizService } from 'src/app/quiz/quiz.service';
import { Quiz } from 'src/app/core/model/Quiz';
import { QuizFilter } from 'src/app/core/interface/QuizFilter';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from 'src/app/core/model/User';
import { Role } from 'src/app/enum/role.enum';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Title } from '@angular/platform-browser';

declare const MathJax: any;
import { evaluate } from 'mathjs'; //npm install mathjs


@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent implements OnInit {

  question: Question = new Question();

  questions: Question[] = [];
  currentQuestionIndex = 0;

  showLoading: boolean = false;
  showLatexLoading: boolean = false;

  quizzes: Quiz[] = [];
  displayModalViewQuizzes: boolean = false;
  totalQuizzes: number = 0;
  totalRecordsQuizzes: number = 0
  currentPageQuizzes: number = 1;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  selectedAnswers: { [questionId: number]: number } = {}

  showCorrection: boolean = false;
  showSolution: boolean = true;
  imagePath = './assets/images/funcao do grau 2.png';

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';


  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  quizFilter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private questionService: QuestionService,
    private quizService: QuizService,
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
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  findById(id: string) {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.questionService.getQuestionByQuestionId(id).subscribe(
      (response) => {
        this.question = response;
        this.renderMathExpressions();
        this.renderFunctions();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  onGenerateNextQuestion() {

    this.showCorrection = false;

    // Se já carregamos as questões, vamos para a próxima
    if (this.questions.length > 0) {
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

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.question = this.questions[this.currentQuestionIndex];
      this.router.navigate(['/questions', this.question.questionId], { replaceUrl: true });
      this.renderMathExpressions();
      this.renderFunctions();
      this.scrollToTop();
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

  onViewSolution() {
    if (this.isUserLoggedIn) {
      this.togleCorrection();
    }

    if (!this.isUserLoggedIn) {
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

  togleCorrection() {
    this.showCorrection = !this.showCorrection;
    this.renderMathExpressions();
    this.renderFunctions();
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

        this.togleCorrection();
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
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.togleCorrection();
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
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.ngZone.run(() => {
          this.togleCorrection();
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

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
