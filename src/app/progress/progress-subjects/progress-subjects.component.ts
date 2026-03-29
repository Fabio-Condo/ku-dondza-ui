import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { QuestionService } from 'src/app/questions/question.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { TopicService } from 'src/app/topics/topicsService.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { ProgressService } from '../progress.service';
import { User } from 'src/app/core/model/User';
import { Subject } from 'src/app/core/model/Subject';
import { HttpErrorResponse } from '@angular/common/http';
import { TopicTestsDTO } from 'src/app/core/model/TopicTestsDTO';

@Component({
  selector: 'app-progress-subjects',
  templateUrl: './progress-subjects.component.html',
  styleUrls: ['./progress-subjects.component.css']
})
export class ProgressSubjectsComponent {

  subjects: Subject[] = [];
  topicTests: TopicTestsDTO[] = [];

  loggedUser: User = new User();
  showLoading = false;
  loadingMessage = 'Carregando';

  selectedSubject: Subject = new Subject();

  constructor(
    private progressService: ProgressService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private questionService: QuestionService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Painel Principal');
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  carregarDisciplinas(): void {
    this.loadingMessage = 'Carregando disciplinas';
    this.showLoading = true;

    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
        this.selectedSubject = this.subjects[0];
        this.getTestsBySubjectId();
        //this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  getTestsBySubjectId(): void {
    this.loadingMessage = 'Carregando progresso';
    this.showLoading = true;

    this.progressService.getBySubjectId(this.selectedSubject.id, this.loggedUser.id).subscribe({
      next: (dados) => {
        this.topicTests = dados;
        this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }
}
