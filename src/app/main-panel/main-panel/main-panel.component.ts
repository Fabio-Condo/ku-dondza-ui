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

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  topicWithTests: TopicWithTestsDTO[] = [];

  loggedUser: User = new User();

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
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.getTopicTestsBySubjectId();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTopicTestsBySubjectId() {
    this.mainPanelService.getBySubjectId(1).subscribe({
      next: (dados) => {
        this.topicWithTests = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  getTopicProgress(topicGroup: TopicWithTestsDTO): number {
    if (!topicGroup.tests || topicGroup.tests.length === 0) return 0;
    const total = topicGroup.tests.length;
    const completed = topicGroup.tests.filter(t => t.accuracyRate === 100).length;
    return Math.round((completed / total) * 100);
  }


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
