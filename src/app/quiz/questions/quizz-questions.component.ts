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
import { QuestionService } from 'src/app/questions/question.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';



@Component({
  selector: 'app-quizz-questions',
  templateUrl: './quizz-questions.component.html',
  styleUrls: ['./quizz-questions.component.css']
})
export class QuizzQuestionsComponent implements OnInit {
  quiz: Quiz = new Quiz();
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
    private quizService: QuizService,
    private questionService: QuestionService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const quizId = this.route.snapshot.params['id'];
    if (quizId) {
      this.getQuizByQuizId(quizId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getQuizByQuizId(quizId: string) {
    this.quizService.getQuizByQuizId(quizId).subscribe(
      (response) => {
        this.quiz = response;
        //this.getQuestionsByQuizId(this.quiz.id);
        this.getQuestions(this.quiz.subject.id)
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

  //getQuestionsByQuizId(quizId: number): void {
  //  this.showLoading = true;
  //  this.filtro.page = this.currentPage - 1; 
  //  this.quizService.getQuestionsByQuizId(quizId, this.filtro).subscribe(
  //    (dados: IApiResponse<Question>) => {
  //      this.questions  = dados.content;
  //      this.showLoading = false;
  //    },
  //    (errorResponse: HttpErrorResponse) => {
  //      this.sendErrorNotification(errorResponse.error.message);
  //      this.showLoading = false;
  //    }
  //  );
  //}

  getQuestions(subjectId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; 
    this.questionService.getRandomQuestionsBySubjectId(subjectId, this.filtro).subscribe(
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
