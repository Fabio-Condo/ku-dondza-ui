import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicTestDTO } from 'src/app/core/model/TopicTestDTO';
import { TopicService } from 'src/app/topics/topicsService.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { MainPanelService } from '../main-panel.service';
import { TopicWithTestsDTO } from 'src/app/core/model/TopicWithTestsDTO';
import { Topic } from 'src/app/core/model/Topic';
import { to } from 'mathjs';
import { Subject } from 'src/app/core/model/Subject';
import { Quiz } from 'src/app/core/model/Quiz';

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

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  constructor(
    private mainPanelService: MainPanelService,
    private subjectsService: SubjectsService,
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

    const selectedUserId = this.route.snapshot.params['id'];
    this.selectedUser.id = selectedUserId;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Eliminar este método se não for mais necessário
  startTest(topic: Topic) {
    this.router.navigate(['/quizzes', 'test'], {
      queryParams: {
        from: 'subject-progress',
        topicId: topic.id
      }
    });
  }

  // Usar este método para iniciar testes de progresso
  startTopicTest(topicTest: TopicTestDTO) {
    this.router.navigate(['/quizzes', 'test'], {
      queryParams: {
        from: 'subject-progress',
        progressTestId: topicTest.id
      }
    });
  }

  reviewTest(topicTest: TopicTestDTO) {
    console.log("Quiz id: " + topicTest.submittedQuizzes[0].quizId)
    this.router.navigate(['/quizzes/', topicTest.submittedQuizzes[0].quizId]);
    //this.getQuizByUserAndTopicTest(topicTest.id, this.loggedUser.id);
  }

  getTopicTestsBySubjectId(selectedUserId: number) {

    this.loadingMessage = "Obtendo o progresso";
    this.showLoading = true;

    this.mainPanelService.getBySubjectId(this.selectedSubject.id, selectedUserId).subscribe({
      next: (dados) => {
        this.topicWithTests = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  getTopicProgress(topicGroup: TopicWithTestsDTO): number {
    if (!topicGroup.tests || topicGroup.tests.length === 0) return 0;
    const total = topicGroup.tests.length;
    const completed = topicGroup.tests.filter(t => t.accuracyRate === 100).length;
    return Math.round((completed / total) * 100);
  }

  getDifficultyLevelValue(difficultyLevel: string) {
    switch (difficultyLevel) {
      case 'BEGINNER':
        return 'Iniciante';
      case 'INTERMEDIATE':
        return 'Intermediário';
      case 'ADVANCED':
        return 'Avançado';
    }
    return '';
  }

  onSelectSubject(subject: Subject) {
    this.selectedSubject = subject;
    this.getTopicTestsBySubjectId(this.selectedUser.id);
  }

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
        this.selectedSubject = this.subjects[0];

        //const selectedUserId = this.route.snapshot.params['id'];
        this.getTopicTestsBySubjectId(this.selectedUser.id);
        //this.getTopicTestsBySubjectId();

      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  // Helper methods to determine test status
  isCompleted(test: any): boolean {
    return test.submittedQuizzes?.length === 1;
  }

  getFirstIncompleteIndex(topic: any): number {
    return topic.tests.findIndex(
      (t: any) => t.submittedQuizzes?.length === 0
    );
  }

  isActive(topic: any, test: any, index: number): boolean {
    if (this.isCompleted(test)) {
      return false;
    }

    return index === this.getFirstIncompleteIndex(topic);
  }

  isLocked(topic: any, test: any, index: number): boolean {
    return !this.isCompleted(test) && !this.isActive(topic, test, index);
  }
  //


  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({
        severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.',
      });
    }
  }
}
