import { Component, OnInit, ViewChild } from '@angular/core';
//import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { OnlineCourse } from 'src/app/core/model/Online-course';
import { OnlineCoursesService } from '../OnlineCoursesService.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-online-courses-questions',
  templateUrl: './online-courses-questions.component.html',
  styleUrls: ['./online-courses-questions.component.css']
})
export class OnlineCoursesQuestionsComponent implements OnInit {

  course: OnlineCourse = new OnlineCourse();
  questions: Question[] = [];
  showLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  answers: Array<Answer> = [];
  currentQuestionIndex: number = 0;

  // Armazenar as respostas do usuário
  userAnswers: { questionId: number; answerId: number }[] = [];
  result: { correctAnswers: number; incorrectAnswers: number } = { correctAnswers: 0, incorrectAnswers: 0 };
  showCorrection: boolean = false;

  correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  loggedUser: User = new User;

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 105,
    sort: 'id,asc'
  };

  constructor(
    private onlineCoursesService: OnlineCoursesService,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService

  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    const onlineCourseId = this.route.snapshot.params['id'];
    if (onlineCourseId) {
      this.getOnlineCourseByOnlineCourseId(onlineCourseId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getOnlineCourseByOnlineCourseId(onlineCourseId: string) {
    this.onlineCoursesService.getOnlineCourseByOnlineCourseId(onlineCourseId).subscribe(
      (response) => {
        this.course = response;
        this.getQuestionsByCourseId(this.course.id);
        this.checkIfSubscribed(this.course);
      },
      (errorResponse: HttpErrorResponse) => {
        if(errorResponse.status == 400){ // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        }else{
          this.sendErrorNotification(errorResponse.error.message);
        } 
      }
    );
  }

  getQuestionsByCourseId(courseId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; 
    this.onlineCoursesService.getQuestionsByCourseId(courseId, this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions  = dados.content;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  checkIfSubscribed(course: OnlineCourse): void {
    this.userService.doesUserSubscribedOnlineCourse(this.loggedUser.id, course.id).subscribe(response => {
      course.isSubscribed = response;
      this.course.isSubscribed = response;
      if(this.course.isSubscribed == false){
        this.router.navigateByUrl('/pagina-nao-autorizada');
      }
    });
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  submitAnswers() {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;

    this.questions.forEach(question => {
      const userAnswer = this.userAnswers.find(answer => answer.questionId === question.id);
      if (userAnswer) {
        const isCorrect = question.answers.some(answer => answer.id === userAnswer.answerId && answer.correct);
        if (isCorrect) {
          this.result.correctAnswers++;
        } else {
          this.result.incorrectAnswers++;
        }
      }
    });

    this.displayResults();
  }

  displayResults() {
    const message = `Você acertou ${this.result.correctAnswers} resposta(s) e errou ${this.result.incorrectAnswers} resposta(s).`;
    this.messageService.add({ severity: 'info', detail: message });
  }

  captureUserAnswer(questionId: number, answerId: number) {
    const existingAnswerIndex = this.userAnswers.findIndex(answer => answer.questionId === questionId);
    if (existingAnswerIndex !== -1) {
      this.userAnswers[existingAnswerIndex].answerId = answerId;
    } else {
      this.userAnswers.push({ questionId, answerId });
    }
  }

  isSelected(questionId: number, answerId: number): boolean {
    const userAnswer = this.userAnswers.find(answer => answer.questionId === questionId);
    return userAnswer ? userAnswer.answerId === answerId : false;
  }

  toggleCorrection() {
    this.showCorrection = !this.showCorrection;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
