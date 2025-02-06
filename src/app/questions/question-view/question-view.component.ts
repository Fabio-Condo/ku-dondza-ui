import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../question.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { QuestionStatisticsService } from '../question-statistics.service';
import { QuestionStatisticsDTO } from 'src/app/core/model/QuestionStatisticsDTO';
declare const MathJax: any;


@Component({
  selector: 'app-question-view',
  templateUrl: './question-view.component.html',
  styleUrls: ['./question-view.component.css']
})
export class QuestionViewComponent implements OnInit {

  question: Question = new Question();
  statistics: QuestionStatisticsDTO = new QuestionStatisticsDTO();
  showSolution: boolean = false;
  imagePath = './assets/images/funcao do grau 2.png';

  constructor(
    private questionService: QuestionService,
    private questionStatisticsService: QuestionStatisticsService,
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
        this.getStatisticsByQuestionId(this.question.id);
        // Renderiza as expressões matemáticas após carregar as questões
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

  getStatisticsByQuestionId(id: number) {
    this.questionStatisticsService.getStatisticsByQuestionId(id).subscribe(
      (response) => {
        this.statistics = response;
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
