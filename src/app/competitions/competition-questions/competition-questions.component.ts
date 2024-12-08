import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { CompetitionService } from '../competition.service';
import { Competition } from 'src/app/core/model/Competition';


@Component({
  selector: 'app-competition-questions',
  templateUrl: './competition-questions.component.html',
  styleUrls: ['./competition-questions.component.css']
})
export class CompetitionQuestionsComponent implements OnInit {

  competition: Competition = new Competition();
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

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 105,
    sort: 'id,asc'
  };

  constructor(
    private competitionService: CompetitionService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const competitionId = this.route.snapshot.params['id'];
    if (competitionId) {
      this.getCompetitionByCompetitionId(competitionId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCompetitionByCompetitionId(competitionId: string) {
    this.competitionService.getCompetitionByCompetitionId(competitionId).subscribe(
      (response) => {
        this.competition = response;
        this.getQuestionsByCompetitionId(this.competition.id);
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

  getQuestionsByCompetitionId(competitionId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; 
    this.competitionService.getQuestionsByCompetitionId(competitionId, this.filtro).subscribe(
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

