import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { retryWhen, scan, delayWhen, timer } from 'rxjs';
import { ChallengeService } from 'src/app/challenges/challenge.service';
import { ChallengeFilter } from 'src/app/core/interface/ChallengeFilter';
import { ExameFilter } from 'src/app/core/interface/ExameFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { SubjectFilter } from 'src/app/core/interface/SubjectFilter';
import { Challenge } from 'src/app/core/model/Challenge';
import { Exam } from 'src/app/core/model/Exame';
import { Quiz } from 'src/app/core/model/Quiz';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectProgressDTO } from 'src/app/core/model/SubjectProgressDTO';
import { User } from 'src/app/core/model/User';
import { Role } from 'src/app/enum/role.enum';
import { ExamesService } from 'src/app/exames/exames.service';
import { QuestionService } from 'src/app/questions/question.service';
import { QuizService } from 'src/app/quiz/quiz.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { TopicService } from 'src/app/topics/topicsService.service';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  showLoading = false;
  retryVisible: boolean = false;
  loadingMessage = 'Carregando';

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  // Challenges
  challenges: Challenge[] = [];
  totalChallenges: number = 0;
  totalRecords: number = 0;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  challengeFilter: ChallengeFilter = {
    page: 0,
    itemsPerPage: 6,
    sort: 'id,desc',
  };

  // Courses
  subjectCourses: Subject[] = [];
  totalSubjectCoursesRecords: number = 0;
  totalSubjects: number = 0;

  courseFilter: SubjectFilter = {
    pagina: 0,
    itensPorPagina: 6,
    enabled: true,
    ordenamento: 'id,asc'
  };

  // Quizzes
  quizzes: Quiz[] = [];
  totalQuizzes: number = 0;

  quizFilter = {
    userId: 0,
    page: 0,
    itemsPerPage: 6,
    sort: 'id,desc'
  };

  // Exams
  exams: Exam[] = [];
  totalExames: number = 0;

  exameFilter: ExameFilter = {
    pagina: 0,
    itensPorPagina: 6,
    ordenamento: 'id,asc'
  };

  // Subject Progress
  subjectsProgress: SubjectProgressDTO[] = [];


  constructor(
    private authenticationService: AuthenticationService,
    private challengeService: ChallengeService,
    private subjectsService: SubjectsService,
    private quizService: QuizService,
    private examesService: ExamesService,
    private messageService: MessageService,
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Main painel page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.getChallenges();
    if (this.isUserLoggedIn) {
      this.getUserProgress();
    }
    this.getCourses();
    this.getExames();
    this.getQuizzes();

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getChallenges(pagina: number = 0): void {

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
        this.challenges = dados.content;
        this.totalRecords = dados.totalElements;
        this.totalChallenges = this.totalChallenges || dados.totalElements;
        //this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
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
    this.loadingMessage = 'Carregando progresso';
    this.showLoading = true;

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
        //this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  getCourses(pagina: number = 0): void {

    if (!this.loggedUser) {
      this.loggedUser = new User();
      this.loggedUser.id = 0;
    }

    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
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
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
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
    this.loadingMessage = "Carregando dados";
    this.showLoading = true;

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
          this.showLoading = false;
          this.loadingMessage = "";
        },
        (errorResponse: HttpErrorResponse) => {
          this.showLoading = false;
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
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

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
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
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

    // Não autenticado
    if (!this.isUserLoggedIn || !this.loggedUser) {
      this.router.navigate(['/login']);
      return;
    }

    const remainingHours = challenge.remainingHours ?? 0;

    // Finalizado
    if (remainingHours <= 0) {
      this.viewResults(challenge);
      return;
    }

    // Já submeteu
    if (challenge.hasCurrentUserSubmitted === true) {
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

    // Não autenticado
    if (!this.isUserLoggedIn || !this.loggedUser) {
      return 'Entrar para participar';
    }

    const remainingHours = challenge.remainingHours ?? 0;

    // Finalizado
    if (remainingHours <= 0) {
      return 'Ver resultado';
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

    // Já submeteu enquanto ainda está activo
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

