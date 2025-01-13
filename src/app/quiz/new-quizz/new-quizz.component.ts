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
import { Subject } from 'src/app/core/model/Subject';

@Component({
  selector: 'app-new-quizz',
  templateUrl: './new-quizz.component.html',
  styleUrls: ['./new-quizz.component.css']
})
export class NewQuizzComponent implements OnInit {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  showLoading: boolean = false;
  showGetSubjectLoading: boolean = false;
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

  showStartScreen: boolean = true;
  showFinalScreen: boolean = false;

  selectedSubject: Subject = new Subject();
  subjects: any[] = [];

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  };

  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.scrollToTop();
    this.carregarDisciplinas();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Novo método para iniciar o quiz
  startQuiz() {
    this.showStartScreen = false; // Oculta a tela inicial
    this.currentQuestionIndex = 0; // Começa na primeira questão
  }

  getById(id: number) {
    this.showGetSubjectLoading = true;
    this.subjectsService.getById(id).subscribe(
      subject => {
        this.selectedSubject = subject;
        this.getQuestions(this.selectedSubject.id);
        this.showGetSubjectLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showGetSubjectLoading = false;
      }
    );
  }

  carregarDisciplinas() {
    return this.subjectsService.findAll().subscribe(
      dados => {
        this.subjects = dados.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  getQuestions(subjectId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; 
    this.questionService.getRandomQuestionsBySubjectId(subjectId, this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions  = dados.content;
        this.quiz.questions = dados.content;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  saveQuiz(quiz: Quiz) {
    this.showLoading = true;
    this.quizService.add(this.quiz).subscribe(
      (quiz) => {
        //this.quiz = quiz;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Quiz added successfully' });
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

    this.saveQuiz(this.quiz);
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

  showFinalResults() {
    this.showFinalScreen = true; 
    this.submitAnswers(); 
  }
  
  reviewQuestions() {
    this.showFinalScreen = false; 
    this.currentQuestionIndex = 0; 
  }

  restartQuiz() {
    this.showFinalScreen = false; 
    this.showStartScreen = true; 
    this.userAnswers = []; 
    this.currentQuestionIndex = 0; 
  }

  toggleCorrection() {
    this.showCorrection = !this.showCorrection;
    this.currentQuestionIndex = 0; // Volta para a primeira questão
    this.showFinalScreen = false; // Oculta a tela final
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
