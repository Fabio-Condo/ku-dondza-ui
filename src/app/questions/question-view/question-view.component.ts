import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../question.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { QuestionStatisticsService } from '../question-statistics.service';
import { CompetitionQuestionStatisticsDTO } from 'src/app/core/model/CompetitionQuestionStatisticsDTO';
import { QuizQuestionStatisticsDTO } from 'src/app/core/model/QuizQuestionStatisticsDTO';
import { QuizService } from 'src/app/quiz/quiz.service';
import { Quiz } from 'src/app/core/model/Quiz';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuizFilter } from 'src/app/core/interface/QuizFilter';
declare const MathJax: any;


@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent implements OnInit {

  question: Question = new Question();
  competitionQuestionStatistics: CompetitionQuestionStatisticsDTO = new CompetitionQuestionStatisticsDTO();
  quizQuestionStatistics: QuizQuestionStatisticsDTO = new QuizQuestionStatisticsDTO();

  showLoading: boolean = false;
  totalQuizzes: number = 0;
  totalRecords: number = 0
  currentPage: number = 1;
  quizzes: Quiz[] = [];
  displayModalViewQuizzes: boolean = false;


  showSolution: boolean = false;
  imagePath = './assets/images/funcao do grau 2.png';

  quizFilter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }

  constructor(
    private questionService: QuestionService,
    private questionStatisticsService: QuestionStatisticsService,
    private quizService: QuizService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
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
    this.questionService.getQuestionByQuestionId(id).subscribe(
      (response) => {
        this.question = response;
        this.getCompetitionStatisticsByQuestionId(this.question.id);
        this.getQuizStatisticsByQuestionId(this.question.id);
        this.renderMathExpressions();
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuizStatisticsByQuestionId(id: number) {
    this.questionStatisticsService.getQuizStatisticsByQuestionId(id).subscribe(
      (response) => {
        this.quizQuestionStatistics = response;
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getCompetitionStatisticsByQuestionId(id: number) {
    this.questionStatisticsService.getCompetitionStatisticsByQuestionId(id).subscribe(
      (response) => {
        this.competitionQuestionStatistics = response;
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuizzesByQuestionId(page: number = 0): void {
    this.showLoading = true;
    this.quizFilter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.quizService.getQuizzesByQuestionId(this.question.id, this.quizFilter).subscribe(
      (data: IApiResponse<Quiz>) => {
        this.quizzes = data.content;
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onViewQuizzesByQuestion(): void {
    this.getQuizzesByQuestionId();
    this.displayModalViewQuizzes = true;
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    setTimeout(() => {
      MathJax.typesetPromise();
    }, 0);
  }

  // Método para alternar a visibilidade da solução
  toggleSolution() {
    this.showSolution = !this.showSolution;
    this.renderMathExpressions();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
