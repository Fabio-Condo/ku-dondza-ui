import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Subject } from 'src/app/core/model/Subject';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Answer } from 'src/app/core/model/Answer';
import { QuestionService } from 'src/app/questions/question.service';
import { TopicService } from 'src/app/core/topics/courseService.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Topic } from 'src/app/core/model/Topic';
import { SubjectsService } from 'src/app/subjects/subjects.service';
declare const MathJax: any;


@Component({
  selector: 'app-new-quizz',
  templateUrl: './new-quizz.component.html',
  styleUrls: ['./new-quizz.component.css']
})
export class NewQuizzComponent implements OnInit {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  submittedAnswers: Answer[] = []; // Lista de respostas do usuário
  showLoading: boolean = false;
  showGetSubjectLoading: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  currentQuestionIndex: number = 0;

  imagePath = './assets/images/funcao do grau 2.png';

  result: { correctAnswers: number; incorrectAnswers: number; unansweredQuestions: number } = {
    correctAnswers: 0,
    incorrectAnswers: 0,
    unansweredQuestions: 0
  };
  showCorrection: boolean = false;

  showStartScreen: boolean = true;
  showFinalScreen: boolean = false;

  subjects: Subject[] = [];
  topics: Topic[] = [];

  loggedUser: User = new User();

  submited: boolean = false;

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
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private errorHandler: ErrorHandlerService,
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

  startQuiz() {
    this.showStartScreen = false;
    this.currentQuestionIndex = 0;
    this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
  }

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  getTopicsBySubjectId(subjectId: number): void {
    this.topicService.getSubjectsById(subjectId).subscribe(
      (dados: Topic[]) => {
        this.quiz.questions = [];
        this.topics = [];
        this.topics = dados;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getQuestions(): void {
    const selectedTopicIds = this.getSelectedTopicIds();

    this.showLoading = true;
    this.questionService.getQuestionsByTopics(selectedTopicIds).subscribe(
      (dados: Question[]) => {
        this.questions = dados;
        this.quiz.questions = this.questions;
        this.showLoading = false;
        this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  toggleTopic(topic: Topic): void {
    topic.selected = !topic.selected;
  }

  getSelectedTopics(): Topic[] {
    return this.topics.filter(topic => topic.selected);
  }

  getSelectedTopicIds(): number[] {
    return this.topics.filter(topic => topic.selected).map(topic => topic.id);
  }

  submitSelectedTopics(): void {
    const selectedTopics = this.getSelectedTopics();
  }

  saveQuiz() {

    this.quiz.selectedTopics = this.getSelectedTopics();

    const topicIds = this.quiz.selectedTopics.map(topic => topic.id);
    const questionIds = this.quiz.questions.map(question => question.id);
    const userAnswerIds = this.submittedAnswers.map(answer => answer.id);

    this.quiz.user = this.loggedUser;

    this.quizService.saveQuiz(this.quiz, topicIds, questionIds, userAnswerIds).subscribe(
      (response) => {
        this.submited = true;
        this.messageService.add({ severity: 'success', detail: 'Quiz salvo com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  submitAnswers() {
    const totalQuestions = this.questions.length;
    const answeredQuestions = this.submittedAnswers.filter(answer => answer.id !== -1).length;
    const unansweredQuestions = totalQuestions - answeredQuestions;

    this.result.correctAnswers = this.submittedAnswers.filter(answer => answer.correct).length;
    this.result.incorrectAnswers = answeredQuestions - this.result.correctAnswers;
    this.result.unansweredQuestions = unansweredQuestions;

    if (!this.submited) {
      this.saveQuiz();
    }

    this.showFinalScreen = true; // Mostra a tela final
  }

  captureUserAnswer(questionId: number, answerId: number | null): void {
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      let userAnswer: Answer;

      if (answerId !== null) {
        const answer = question.answers.find(a => a.id === answerId);
        if (answer) {
          userAnswer = {
            id: answer.id,
            text: answer.text,
            correct: answer.correct,
            question: question
          };
        } else {
          return; // Resposta inválida
        }
      } else {
        // Resposta nula (não respondida)
        userAnswer = {
          id: -1, // ID inválido para indicar resposta nula
          text: 'Não respondida',
          correct: false,
          question: question
        };
      }

      // Atualiza ou adiciona a resposta
      const existingAnswerIndex = this.submittedAnswers.findIndex(a => a.question?.id === questionId);
      if (existingAnswerIndex !== -1) {
        this.submittedAnswers[existingAnswerIndex] = userAnswer;
      } else {
        this.submittedAnswers.push(userAnswer);
      }
    }
  }

  isSelected(questionId: number, answerId: number): boolean {
    const userAnswer = this.submittedAnswers.find(a => a.question?.id === questionId);
    return userAnswer ? userAnswer.id === answerId : false;
  }

  reviewQuestions() {
    this.showFinalScreen = false;
    this.currentQuestionIndex = 0;
  }

  newQuiz() {
    this.showFinalScreen = false;
    this.showStartScreen = true;
    this.submittedAnswers = [];
    this.currentQuestionIndex = 0;
    this.result = { correctAnswers: 0, incorrectAnswers: 0, unansweredQuestions: 0 };
  }

  toggleCorrection() {
    this.showCorrection = true;
    this.currentQuestionIndex = 0;
    this.showFinalScreen = false;
  
    // Aguarda a atualização do DOM antes de renderizar MathJax
    setTimeout(() => {
      this.renderMathExpressions();
    }, 0);
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    }
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
    }
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        // Força a recriação do conteúdo do contêiner
        mathContainer.innerHTML = `\\[${this.quiz.questions[this.currentQuestionIndex].text}\\]`;

        // Renderiza as expressões matemáticas
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
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