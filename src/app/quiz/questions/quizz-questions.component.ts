import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { AnswerService } from 'src/app/core/answers/answers.service';

@Component({
  selector: 'app-quizz-questions',
  templateUrl: './quizz-questions.component.html',
  styleUrls: ['./quizz-questions.component.css'],
})
export class QuizzQuestionsComponent implements OnInit {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  submittedAnswers: Answer[] = [];
  showLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  result: { correctAnswers: number; incorrectAnswers: number } = { correctAnswers: 0, incorrectAnswers: 0 };
  showCorrection: boolean = false;
  showStartScreen: boolean = true;

  imagePath = './assets/images/funcao do grau 2.png';

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc',
  };

  constructor(
    private quizService: QuizService,
    private answerService: AnswerService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.params['id'];
    if (quizId) {
      this.getQuizByQuizId(quizId);
    }
    this.scrollToTop();
    this.showCorrection = true; // Mostrar a correção ao carregar a página
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getQuizByQuizId(quizId: string) {
    this.quizService.getQuizByQuizId(quizId).subscribe(
      (response) => {
        this.quiz = response;
        this.getQuestionsByQuizId(this.quiz.id);
        this.getUserSubmittedAnswersByQuizId(this.quiz.id);
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  getQuestionsByQuizId(quizId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1;
    this.quizService.getQuestionsByQuizId(quizId).subscribe(
      (dados: Question[]) => {
        this.questions = dados;
        this.quiz.questions = this.questions;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getUserSubmittedAnswersByQuizId(quizId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1;
    this.quizService.getUserSubmittedAnswersByQuizId(quizId).subscribe(
      (dados: Answer[]) => {
        this.submittedAnswers = dados;
        this.quiz.userSubmittedAnswers = this.submittedAnswers;
        this.calculateResults();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  calculateResults(): void {
    this.result.correctAnswers = 0;
    this.result.incorrectAnswers = 0;

    this.quiz.userSubmittedAnswers.forEach((answer) => {
      if (answer.correct) {
        this.result.correctAnswers++;
      } else {
        this.result.incorrectAnswers++;
      }
    });
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  captureUserAnswer(questionId: number, answerId: number) {
    const question = this.quiz.questions.find((q) => q.id === questionId);
    const selectedAnswer = question?.answers.find((a) => a.id === answerId);

    if (selectedAnswer) {
      const existingSubmittedAnswerIndex = this.quiz.userSubmittedAnswers.findIndex(
        (a) => a.question.id === questionId
      );

      if (existingSubmittedAnswerIndex !== -1) {
        // Atualiza a resposta existente
        this.quiz.userSubmittedAnswers[existingSubmittedAnswerIndex] = selectedAnswer;
      } else {
        // Adiciona uma nova resposta
        this.quiz.userSubmittedAnswers.push(selectedAnswer);
      }
    }
  }

  isSelected(questionId: number, answerId: number): boolean {
    const submittedAnswer = this.quiz.userSubmittedAnswers.find((a) => a.question.id === questionId);
    return submittedAnswer ? submittedAnswer.id === answerId : false;
  }

  startQuiz() {
    this.showStartScreen = false; // Oculta a tela inicial
    this.currentQuestionIndex = 0; // Começa na primeira questão
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}