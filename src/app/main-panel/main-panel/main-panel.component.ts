import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicTestDTO } from 'src/app/core/model/TopicTestDTO';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { MainPanelService } from '../main-panel.service';
import { TopicWithTestsDTO } from 'src/app/core/model/TopicWithTestsDTO';
import { Topic } from 'src/app/core/model/Topic';
import { Subject } from 'src/app/core/model/Subject';

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  topicWithTests: TopicWithTestsDTO[] = [];
  subjects: Subject[] = [];

  selectedSubject: Subject = new Subject();
  selectedUser: User = new User();
  loggedUser: User = new User();

  showLoading = false;
  loadingMessage = 'Carregando';

  constructor(
    private mainPanelService: MainPanelService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) {}

  /* =========================
     CICLO DE VIDA
     ========================= */

  ngOnInit(): void {
    this.title.setTitle('Painel Principal');
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const selectedUserId = this.route.snapshot.params['id'];
    this.selectedUser.id = selectedUserId;

    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================
     NAVEGAÇÃO
     ========================= */

  startTopicTest(topicTest: TopicTestDTO): void {
    this.router.navigate(['/quizzes', 'test'], {
      queryParams: {
        from: 'subject-progress',
        progressTestId: topicTest.id
      }
    });
  }

  reviewTest(topicTest: TopicTestDTO): void {
    const quizId = topicTest.submittedQuizzes?.[0]?.quizId;
    if (!quizId) return;

    this.router.navigate(['/quizzes', quizId]);
  }

  /* =========================
     CARREGAMENTO DE DADOS
     ========================= */

  carregarDisciplinas(): void {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
        this.selectedSubject = this.subjects[0];
        this.getTopicTestsBySubjectId(this.selectedUser.id);
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
      }
    });
  }

  onSelectSubject(subject: Subject): void {
    this.selectedSubject = subject;
    this.getTopicTestsBySubjectId(this.selectedUser.id);
  }

  getTopicTestsBySubjectId(selectedUserId: number): void {
    this.loadingMessage = 'Obtendo o progresso';
    this.showLoading = true;

    this.mainPanelService
      .getBySubjectId(this.selectedSubject.id, selectedUserId)
      .subscribe({
        next: (dados) => {
          this.topicWithTests = dados;
          this.showLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.sendErrorNotification(error.error.message);
          this.showLoading = false;
        }
      });
  }

  /* =========================
     PROGRESSOS (TAXAS)
     ========================= */

  isCompleted(test: TopicTestDTO): boolean {
    return !!test.submittedQuizzes && test.submittedQuizzes.length > 0;
  }

  getTopicProgress(topic: TopicWithTestsDTO): number {
    if (!topic.tests || topic.tests.length === 0) return 0;

    const completed = topic.tests.filter(t => this.isCompleted(t)).length;
    return Math.round((completed / topic.tests.length) * 100);
  }

  getDisciplineProgress(): number {
    if (!this.topicWithTests || this.topicWithTests.length === 0) return 0;

    const totalTests = this.topicWithTests.reduce(
      (sum, topic) => sum + topic.tests.length,
      0
    );

    if (totalTests === 0) return 0;

    const completedTests = this.topicWithTests.reduce((sum, topic) => {
      return sum + topic.tests.filter(t => this.isCompleted(t)).length;
    }, 0);

    return Math.round((completedTests / totalTests) * 100);
  }

  /* =========================
     DESBLOQUEIO SEQUENCIAL
     ========================= */

  getFirstIncompleteIndex(topic: TopicWithTestsDTO): number {
    return topic.tests.findIndex(test => !this.isCompleted(test));
  }

  isActive(topic: TopicWithTestsDTO, test: TopicTestDTO, index: number): boolean {
    if (this.isCompleted(test)) return false;
    return index === this.getFirstIncompleteIndex(topic);
  }

  isLocked(topic: TopicWithTestsDTO, test: TopicTestDTO, index: number): boolean {
    return !this.isCompleted(test) && !this.isActive(topic, test, index);
  }

  /* =========================
     UTILIDADES
     ========================= */

  getDifficultyLevelValue(level: string): string {
    switch (level) {
      case 'BEGINNER': return 'Iniciante';
      case 'INTERMEDIATE': return 'Intermediário';
      case 'ADVANCED': return 'Avançado';
      default: return '';
    }
  }

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }
}
