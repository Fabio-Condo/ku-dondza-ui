import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionService } from '../question.service';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { NgForm } from '@angular/forms';
import { Answer } from 'src/app/core/model/Answer';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  quiz: Quiz = new Quiz;
  questions: Question[] = [];
  totalRegistros: number = 0
  showLoading: boolean = false;

  displayModalSave: boolean = false;
  question: Question = new Question;

  isAdmin: boolean = true;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  answer?: Answer;
  answwers: Array<Answer> = []
  showAnswerForm = false;
  answerIndex?: number;

  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getQuizById(id);
      this.findQuestionsByQuizId(0, id);
    }
  }

  @ViewChild('tabela') grid: any;

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 105,
    sort: 'id,asc'
  }

  get editing() {
    return Boolean(this.question.id);
  }

  save(questionForm: NgForm) {
    if (this.editing) {
      this.updateQuestion(questionForm)
    } else {
      this.addNewQuestion(questionForm)
    }
  }

  getQuizById(id: number) {
    this.quizService.findById(id).subscribe(
      (response) => {
        this.quiz = response;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  findQuestionsByQuizId(pagina: number = 0, quizId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.questionService.findQuestionsByQuizId(quizId, this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions = dados.content
        this.totalRegistros = dados.totalElements
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewQuestion(questioForm: NgForm) {
    this.question.quiz.id = this.quiz.id;
    console.log("id: " + this.question.quiz.id)
    this.showLoading = true;
    this.questionService.add(this.question).subscribe(
      (question) => {
        this.question = question;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Question added successfully' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  updateQuestion(questioForm: NgForm) {
    //this.question.quiz = this.quiz;
    this.showLoading = true;
    this.questionService.update(this.question).subscribe(
      (question) => {
        this.question = question;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Question updated successfully!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onUpdateQuestion(question: Question): void {
    this.question = question
    this.question.id = question.id
    this.displayModalSave = true;
  }

  onAddNewQuestion(): void {
    this.question = new Question();
    this.displayModalSave = true;
  }

  // Answeres
  getReadyNewAnswer() {
    this.showAnswerForm = true;
    this.answer = new Answer();
    this.answerIndex = this.question.answers.length;
  }

  getReadyAnswerEdit(answer: Answer, index: number) {
    this.answer = this.cloneAnswer(answer);
    this.showAnswerForm = true;
    this.answerIndex = index;
  }

  confirmAnswer(frm: NgForm) {
    this.question.answers[this.answerIndex!] = this.cloneAnswer(this.answer!);
    this.showAnswerForm = false;
    frm.reset();
  }

  cloneAnswer(answer: Answer): Answer {
    return new Answer(answer.id, answer.text, answer.correct);
  }

  get editingAnswer() {
    return this.answer && this.answer?.id;
  }

  removeAnswer(index: number) {
    this.question.answers.splice(index, 1);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }


  currentQuestionIndex: number = 0;
  isShowingAllQuestions: boolean = false; // Para controlar a visualização de todas as perguntas

  // Método para mostrar todas as perguntas
  toggleQuestions() {
    this.isShowingAllQuestions = !this.isShowingAllQuestions; // Alterna entre mostrar todas ou uma por uma

    // Se mudar para ver uma por uma, resetar o índice atual
    if (!this.isShowingAllQuestions) {
      this.currentQuestionIndex = 0; // Reseta para a primeira pergunta
    }
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

}
