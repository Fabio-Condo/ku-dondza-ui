import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { retryWhen, scan, delayWhen, timer } from 'rxjs';
import { ChallengeService } from 'src/app/challenges/challenge.service';
import { AuthModalService } from 'src/app/core/auth-modal.service';
import { ChallengeFilter } from 'src/app/core/interface/ChallengeFilter';
import { ExameFilter } from 'src/app/core/interface/ExameFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { SubjectFilter } from 'src/app/core/interface/SubjectFilter';
import { Challenge } from 'src/app/core/model/Challenge';
import { Exam } from 'src/app/core/model/Exame';
import { Question } from 'src/app/core/model/Question';
import { Quiz } from 'src/app/core/model/Quiz';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectProgressDTO } from 'src/app/core/model/SubjectProgressDTO';
import { User } from 'src/app/core/model/User';
import { Role } from 'src/app/enum/role.enum';
import { ExamesService } from 'src/app/exames/exames.service';
import { QuestionService } from 'src/app/questions/question.service';
import { QuizService } from 'src/app/quiz/quiz.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { evaluate } from 'mathjs'; //npm install mathjs
import { GoogleAuthServiceV2 } from 'src/app/users/google-auth.service';
import { HeaderType } from 'src/app/enum/header-type.enum';
declare const MathJax: any;

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  //showLoading = false;
  retryVisible: boolean = false;
  loadingMessage = 'Carregando';

  isGoogleLoading: boolean = false;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  // Challenges
  challenges: Challenge[] = [];
  totalChallenges: number = 0;
  totalRecords: number = 0;
  currentPage: number = 1;
  showLoadingChallenges: boolean = false;

  challengeFilter: ChallengeFilter = {
    page: 0,
    itemsPerPage: 6,
    sort: 'id,desc',
  };

  // Courses
  subjectCourses: Subject[] = [];
  totalSubjectCoursesRecords: number = 0;
  totalSubjects: number = 0;
  showLoadingCourses: boolean = false;

  courseFilter: SubjectFilter = {
    pagina: 0,
    itensPorPagina: 6,
    enabled: true,
    ordenamento: 'id,asc'
  };

  // Quizzes
  quizzes: Quiz[] = [];
  totalQuizzes: number = 0;
  showLoadingQuizzes: boolean = false;

  quizFilter = {
    userId: 0,
    page: 0,
    itemsPerPage: 6,
    sort: 'id,desc'
  };

  // Exams
  exams: Exam[] = [];
  totalExames: number = 0;
  showLoadingExames: boolean = false;

  exameFilter: ExameFilter = {
    pagina: 0,
    itensPorPagina: 6,
    ordenamento: 'id,asc'
  };

  // Questions
  questions: Question[] = [];
  totalQuestions: number = 0;
  showLoadingQuestions: boolean = false;
  currentQuestionIndex: number = 0;

  //@ViewChild('canvas', { static: false }) canvas!: ElementRef;
  @ViewChildren('canvas') canvases!: QueryList<ElementRef<HTMLCanvasElement>>;

  questionFilter: QuestionFilter = {
    highlighted: true,
    page: 0,
    itemsPerPage: 3,
    sort: 'id,asc'
  };


  // Subject Progress
  subjectsProgress: SubjectProgressDTO[] = [];
  showLoadingProgress: boolean = false;

  constructor(
    private googleAuthService: GoogleAuthServiceV2,
    private authModalService: AuthModalService,
    private authenticationService: AuthenticationService,
    private ngZone: NgZone,
    private challengeService: ChallengeService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private quizService: QuizService,
    private examesService: ExamesService,
    private messageService: MessageService,
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Explorer page');

    this.authenticationService.loginStatus$.subscribe(logged => {
      this.isUserLoggedIn = logged;
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    });

    this.getChallenges();
    this.getUserProgress();
    this.getQuestions();
    this.getCourses();
    this.getExames();
    this.getQuizzes();

    this.scrollToTop();

    this.loginWithGoogleOnTap();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  loginWithGoogleOnTap() {

    if (this.isUserLoggedIn) {
      return;
    }

    this.isGoogleLoading = true;

    this.googleAuthService.showOneTap((credential) => {
      this.handleGoogleCredential(credential);
      this.isGoogleLoading = false;
    });

    // fallback de segurança (caso user feche popup)
    setTimeout(() => {
      this.isGoogleLoading = false;
    }, 5000);
  }

  private handleGoogleCredential(credential: string) {

    this.ngZone.run(() => {
      //  this.showLoading = true;
    });

    this.authenticationService.loginWithGoogle(credential)
      .subscribe({
        next: (res: HttpResponse<User>) => {

          const token = res.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(res.body);
          this.authenticationService.notifyLoginStatus(true);
          this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
          this.loggedUser = this.authenticationService.getUserFromLocalCache();

          this.authModalService.close();
          //this.user = new User();

          this.ngZone.run(() => {
            // this.showLoading = false;
            this.authModalService.close();
          });
        },
        error: (err: HttpErrorResponse) => {
          // this.showLoading = false;
          this.messageService.add({
            severity: 'error',
            detail: err.error?.message || 'Erro login Google'
          });
        }
      });
  }

  getChallenges(pagina: number = 0): void {

    this.showLoadingChallenges = true;
    this.loadingMessage = "Carregando desafios";

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.retryVisible = false;

    this.challengeFilter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.challengeService.findAll(this.challengeFilter, this.loggedUser.id).pipe(
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
      (dados: IApiResponse<Challenge>) => {
        //this.challenges = dados.content;
        this.challenges = dados.content.slice(0, 3);
        this.totalRecords = dados.totalElements;
        this.totalChallenges = this.totalChallenges || dados.totalElements;
        this.showLoadingChallenges = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoadingChallenges = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getUserProgress(): void {

    console.log('Buscando progresso do usuário...');

    this.loadingMessage = 'Carregando progresso';
    this.showLoadingProgress = true;

    this.subjectsService.getUserProgressSubjects(this.loggedUser.id).pipe(
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
      next: (dados) => {
        this.subjectsProgress = dados.filter(subject => subject.progressEnabled);
        this.showLoadingProgress = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoadingProgress = false;
      }
    });
  }

  getCourses(pagina: number = 0): void {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando cursos"
    this.showLoadingCourses = true;
    this.courseFilter.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.subjectsService.filter(this.courseFilter, this.loggedUser.id).pipe(
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
      (dados: IApiResponse<Subject>) => {
        this.subjectCourses = dados.content;
        this.totalSubjectCoursesRecords = dados.totalElements;
        if (this.totalSubjects == 0) {
          this.totalSubjects = dados.totalElements;
        }
        this.showLoadingCourses = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoadingCourses = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuizzes(page: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando quizzes";
    this.showLoadingQuizzes = true;

    this.quizFilter.userId = 0; // Todos quizzes, mesmo para não autenticados
    this.quizFilter.page = this.currentPage - 1;

    this.quizService.getQuizzesWithCash(this.quizFilter).pipe(
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
    )
      .subscribe(
        (data: IApiResponse<Quiz>) => {
          //this.quizzes = data.content;
          this.quizzes = data.content.slice(0, 3);
          this.totalRecords = data.totalElements;
          this.totalQuizzes = this.totalQuizzes || data.totalElements;
          this.showLoadingQuizzes = false;
          this.loadingMessage = "";
        },
        (errorResponse: HttpErrorResponse) => {
          this.showLoadingQuizzes = false;
          this.retryVisible = true;
          if (!navigator.onLine) {
            this.sendErrorNotification("Você está sem conexão com a internet.");
          } else {
            this.sendErrorNotification(errorResponse.error.message);
          }
        }
      );
  }

  getExames(pagina: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando exames";
    this.showLoadingExames = true;

    this.exameFilter.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.examesService.filterWithCash(this.exameFilter).pipe(
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
      (dados: IApiResponse<Exam>) => {
        //this.exams = dados.content
        this.exams = dados.content.slice(0, 3);
        this.totalRecords = dados.totalElements;
        this.totalExames = this.totalExames || dados.totalElements;
        this.showLoadingExames = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoadingExames = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuestions(pagina: number = 0): void {

    console.log('Buscando questões...');
    this.questionFilter.userId = 0;

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando questões"
    this.showLoadingQuestions = true;
    this.questionFilter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0

    this.questionService.getQuestions(this.questionFilter, this.loggedUser.id).pipe(
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
      (dados: IApiResponse<Question>) => {
        this.questions = dados.content
        this.totalRecords = dados.totalElements;
        if (this.totalQuestions == 0) {
          this.totalQuestions = dados.totalElements;
        }
        this.showLoadingQuestions = false;
        this.renderMathExpressions();
        this.renderFunctions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoadingQuestions = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  goToQuestion(questionId: string) {
    this.router.navigate(['/questions', questionId], {
      queryParams: {
        from: 'main-panel'
      }
    });
  }

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        mathContainer.innerHTML = this.getFormattedText(this.questions[this.currentQuestionIndex].text);
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        mathContainerSolution.innerHTML = this.getFormattedText(this.questions[this.currentQuestionIndex].solution);
      }

      const mathContainerTip = document.getElementById(`math-container-tip-${this.currentQuestionIndex}`);
      if (mathContainerTip && typeof MathJax !== 'undefined') {
        mathContainerTip.innerHTML = this.getFormattedText(this.questions[this.currentQuestionIndex].tip);
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

      if (!this.canvases || this.canvases.length === 0) {
        return;
      }

      this.canvases.forEach((canvasRef) => {

        const canvas = canvasRef.nativeElement;
        const questionId = Number(canvas.getAttribute('data-question-id'));

        if (!questionId) return;

        const question = this.questions.find(q => q.id === questionId);

        if (
          !question ||
          !question.mathExpressions ||
          question.mathExpressions.length === 0
        ) {
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;

        const scaleX = width / 20;
        const scaleY = height / 20;

        // ======================
        // GRADE
        // ======================
        ctx.beginPath();
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;

        for (let i = -10; i <= 10; i++) {

          const x = width / 2 + i * scaleX;

          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }

        for (let i = -10; i <= 10; i++) {

          const y = height / 2 - i * scaleY;

          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }

        ctx.stroke();

        // ======================
        // EIXOS
        // ======================
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);

        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);

        ctx.stroke();

        // ======================
        // LABELS
        // ======================
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';

        for (let i = -10; i <= 10; i++) {

          if (i === 0) continue;

          const x = width / 2 + i * scaleX;
          const y = height / 2 - i * scaleY;

          ctx.fillText(i.toString(), x, height / 2 + 15);
          ctx.fillText(i.toString(), width / 2 - 15, y + 5);
        }

        // ======================
        // FUNÇÕES
        // ======================
        const colors = ['blue', 'red', 'green', 'orange', 'purple'];

        question.mathExpressions.forEach((express, expIndex) => {

          ctx.beginPath();

          ctx.strokeStyle = colors[expIndex % colors.length];
          ctx.lineWidth = 2;

          let firstPoint = true;

          for (let x = -10; x <= 10; x += 0.1) {

            try {

              const y = evaluate(
                express.expression!.replace(/x/g, `(${x})`)
              );

              if (!isFinite(y)) continue;

              const screenX = width / 2 + x * scaleX;
              const screenY = height / 2 - y * scaleY;

              if (firstPoint) {
                ctx.moveTo(screenX, screenY);
                firstPoint = false;
              } else {
                ctx.lineTo(screenX, screenY);
              }

            } catch (error) {
              console.error(
                `Erro ao avaliar ${express.expression}:`,
                error
              );
            }
          }

          ctx.stroke();

          // ======================
          // LEGENDA
          // ======================
          ctx.fillStyle = colors[expIndex % colors.length];
          ctx.font = '14px Arial';
          ctx.textAlign = 'left';

          ctx.fillText(
            express.name || `f${expIndex + 1}(x)`,
            10,
            20 + expIndex * 20
          );

        });

      });

    }, 0);
  }

  getDifficultyLevelType(type: string): string {
    switch (type) {
      case 'BEGINNER':
        return 'Iniciante';
      case 'INTERMEDIATE':
        return 'Intermediário';
      case 'ADVANCED':
        return 'Avançado';
      default:
        return '';
    }
  }

  onDownload(exam: Exam) {
    this.download(exam);
  }

  download(exam: Exam): void {
    exam.showLoadingDownload = true;
    this.examesService.download(exam.id, exam.fileName).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = exam.fileName;

      // Simular um clique no link para iniciar o download
      link.click();

      // Limpar o link após o download iniciar
      window.URL.revokeObjectURL(link.href);
      //this.findAll(this.paginaAtual)
      exam.showLoadingDownload = false;
    },
      (errorResponse: HttpErrorResponse) => {
        exam.showLoadingDownload = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumExam(exam: Exam): boolean {
    if (!exam.premium) return false;

    // ADMIN sempre tem acesso
    if (this.isUserLoggedIn && this.isAdmin) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser(); ``
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const planExpiresAt = this.loggedUser.planExpiresAt ? new Date(this.loggedUser.planExpiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !planExpiresAt || planExpiresAt <= new Date();
  }

  onChallengeAction(challenge: Challenge | null | undefined): void {

    // Segurança
    if (!challenge) {
      return;
    }

    const remainingHours = challenge.remainingHours ?? 0;

    // Finalizado -> qualquer pessoa pode ver resultados
    if (remainingHours <= 0) {
      this.viewResults(challenge);
      return;
    }

    // Não autenticado -> apenas para desafios activos
    if (!this.isUserLoggedIn || !this.loggedUser) {

      this.openLogin(() => {
        this.startChallenge(challenge);
      });

      return;
    }

    // Já submeteu
    if (challenge.hasCurrentUserSubmitted === true) {
      this.sendErrorNotification("Identificamos que você submeteu este desafio. Aguarde ele finalizar para ver os resultados!");
      return;
    }

    // Pode participar
    this.startChallenge(challenge);
  }

  getChallengeButtonText(challenge: Challenge | null | undefined): string {

    // Segurança
    if (!challenge) {
      return 'Indisponível';
    }

    const remainingHours = challenge.remainingHours ?? 0;

    // Finalizado
    if (remainingHours <= 0) {
      return 'Ver resultado';
    }

    // Não autenticado
    if (!this.isUserLoggedIn || !this.loggedUser) {
      return 'Entrar para participar';
    }

    // Já submeteu
    if (challenge.hasCurrentUserSubmitted === true) {
      return 'Você já submeteu este desafio';
    }

    return 'Participar agora';
  }

  isChallengeButtonDisabled(challenge: Challenge | null | undefined): boolean {

    // Segurança
    if (!challenge) {
      return true;
    }

    const remainingHours = challenge.remainingHours ?? 0;

    return (
      challenge.hasCurrentUserSubmitted === true &&
      remainingHours > 0
    );
  }

  startChallenge(challenge: Challenge) {
    this.router.navigate(['/quizzes', 'challenge'], {
      queryParams: {
        from: 'challenges',
        challengeId: challenge.id
      }
    });
  }

  viewResults(challenge: Challenge) {
    this.router.navigate(['/challenges', challenge.challengeId, 'results']);
  }

  circumference = 2 * Math.PI * 16; // raio = 16

  getStrokeOffset(rate: number): number {
    return this.circumference * (1 - rate / 100);
  }

  getAccuracyClass(rate: number): string {
    if (rate >= 80) {
      return 'ring-fill-high';
    }

    if (rate >= 50) {
      return 'ring-fill-mid';
    }

    return 'ring-fill-low';
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
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }

}

