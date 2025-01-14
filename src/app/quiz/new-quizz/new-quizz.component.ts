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
import { SubjectsService } from 'src/app/core/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';

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
  currentQuestionIndex: number = 0;

  questionIds: number[] = []; // IDs das questões a serem associadas

  // Armazenar as respostas do usuário
  userAnswers: { questionId: number; answerId: number }[] = [];
  result: { correctAnswers: number; incorrectAnswers: number } = { correctAnswers: 0, incorrectAnswers: 0 };
  showCorrection: boolean = false;

  correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  showStartScreen: boolean = true;
  showFinalScreen: boolean = false;

  selectedSubject: Subject = new Subject();
  subjects: any[] = [];

  loggedUser: User = new User;

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
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get submited() {
    return Boolean(this.quiz.id);
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
        this.questions = dados.content;
        this.quiz.questions = this.questions;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  saveQuiz() {
    // 1. Mapear os IDs das questões
    this.questionIds = this.quiz.questions.map(question => question.id);

    // 2. Mapear os IDs das respostas capturadas (apenas answerId)
    const userAnswerIds = this.userAnswers.map(answer => answer.answerId);

    // 3. Atribuir o usuário logado ao quiz
    this.quiz.user = this.loggedUser;

    // 4. Enviar o quiz, os IDs das questões e os IDs das respostas capturadas para o servidor
    this.quizService.saveQuiz(this.quiz, this.questionIds, userAnswerIds).subscribe(
        (response) => {
            this.quiz = response;
            this.messageService.add({ severity: 'success', detail: 'Quiz salvo com sucesso!' });
        },
        (errorResponse: HttpErrorResponse) => {
            this.sendErrorNotification(errorResponse.error.message);
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

    if(!this.submited){
      this.saveQuiz();
    }
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

  //showFinalResults() {
  //  this.showFinalScreen = true;
  //  this.submitAnswers();
  //}

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
