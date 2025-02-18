import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { Competition } from 'src/app/core/model/Competition';
import { CompetitionService } from 'src/app/competitions/competition.service';
import { CompetitionFilter } from 'src/app/core/interface/CompetitionFilter';
declare const MathJax: any;
import { evaluate } from 'mathjs'; //npm install mathjs



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
  showLatexLoading: boolean = false;

  quizzes: Quiz[] = [];
  displayModalViewQuizzes: boolean = false;
  totalQuizzes: number = 0;
  totalRecordsQuizzes: number = 0
  currentPageQuizzes: number = 1;

  competitions: Competition[] = [];
  displayModalViewCompetitions: boolean = false;
  totalCompetitions: number = 0;
  totalRecordsCompetitions: number = 0
  currentPageCompetitions: number = 1;


  showSolution: boolean = true;
  imagePath = './assets/images/funcao do grau 2.png';

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  quizFilter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }

  competitionFilter: CompetitionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }

  constructor(
    private questionService: QuestionService,
    private questionStatisticsService: QuestionStatisticsService,
    private competitionService: CompetitionService,
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
        this.renderFunctions();
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
    this.quizFilter.page = this.currentPageQuizzes - 1; // Ajuste para o padrão de paginação começando em 0
    this.quizService.getQuizzesByQuestionId(this.question.id, this.quizFilter).subscribe(
      (data: IApiResponse<Quiz>) => {
        this.quizzes = data.content;
        this.totalRecordsQuizzes = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getCompetitionsByQuestionId(page: number = 0): void {
    this.showLoading = true;
    this.competitionFilter.page = this.currentPageCompetitions - 1; // Ajuste para o padrão de paginação começando em 0
    this.competitionService.getCompetitionsByQuestionId(this.question.id, this.competitionFilter).subscribe(
      (data: IApiResponse<Competition>) => {
        this.competitions = data.content;
        this.totalRecordsCompetitions = data.totalElements;
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

  onViewCompetitionsByQuestion(): void {
    this.getCompetitionsByQuestionId();
    this.displayModalViewCompetitions = true;
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    this.showLatexLoading = true;
    setTimeout(() => {
      MathJax.typesetPromise();
    }, 0);
    this.showLatexLoading = false;
  }

  // Método para alternar a visibilidade da solução
  toggleSolution() {
    this.showSolution = !this.showSolution;
    this.renderMathExpressions();
  }

  renderFunctions() {
    setTimeout(() => {
      const canvas = this.canvas?.nativeElement;
      if (!canvas || !this.question.mathExpressions || this.question.mathExpressions.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const scaleX = width / 20;
      const scaleY = height / 20;

      // Desenha os eixos
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Adiciona os números nos eixos
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        let y = height / 2 - i * scaleY;
        if (i !== 0) {
          ctx.fillText(i.toString(), x, height / 2 + 15);
          ctx.fillText(i.toString(), width / 2 - 15, y + 5);
        }
      }

      // Cores para múltiplos gráficos
      const colors = ['blue', 'red', 'green', 'orange', 'purple'];

      this.question.mathExpressions.forEach((express, index) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2;

        for (let x = -10; x <= 10; x += 0.1) {
          try {
            let y = evaluate(express.expression!.replace(/x/g, `(${x})`));
            let screenX = width / 2 + x * scaleX;
            let screenY = height / 2 - y * scaleY;
            if (x === -10) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          } catch (error) {
            console.error(`Erro ao avaliar ${express.expression!}:`, error);
          }
        }
        ctx.stroke();
      });
    }, 0);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
