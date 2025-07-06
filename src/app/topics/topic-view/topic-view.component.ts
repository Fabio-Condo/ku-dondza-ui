import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Topic } from 'src/app/core/model/Topic';
import { User } from 'src/app/core/model/User';
import { QuestionService } from 'src/app/questions/question.service';
import { QuizService } from 'src/app/quiz/quiz.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicService } from '../topicsService.service';

@Component({
  selector: 'app-topic-view',
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.css']
})
export class TopicViewComponent implements OnInit {

  topic: Topic = new Topic();
  showLoading: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  constructor(
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }


  ngOnInit(): void {
    this.title.setTitle('Topic view page');
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
    this.topicService.getTopicByTopicId(id).subscribe(
      (response) => {
        this.topic = response;
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
