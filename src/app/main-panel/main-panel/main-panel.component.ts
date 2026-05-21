import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { retryWhen, scan, delayWhen, timer } from 'rxjs';
import { ChallengeService } from 'src/app/challenges/challenge.service';
import { ChallengeFilter } from 'src/app/core/interface/ChallengeFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { SubjectFilter } from 'src/app/core/interface/SubjectFilter';
import { Challenge } from 'src/app/core/model/Challenge';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectProgressDTO } from 'src/app/core/model/SubjectProgressDTO';
import { User } from 'src/app/core/model/User';
import { Role } from 'src/app/enum/role.enum';
import { QuestionService } from 'src/app/questions/question.service';
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
    sort: 'id,asc',
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

  // Subject Progress
  subjectsProgress: SubjectProgressDTO[] = [];
  

  constructor(
    private authenticationService: AuthenticationService,
    private challengeService: ChallengeService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Main painel page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.getChallenges();
    this.getUserProgress();
    this.getCourses();

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getChallenges(pagina: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.challengeFilter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.challengeService.findAll(this.challengeFilter).pipe(
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
        this.showLoading = false;
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

