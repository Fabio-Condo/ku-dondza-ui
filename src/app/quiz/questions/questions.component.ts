import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuestionService } from '../question.service';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { NgForm } from '@angular/forms';
import { Answer } from 'src/app/core/model/Answer';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';


@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {
  quiz: Quiz = new Quiz();
  questions: Question[] = [];
  totalRegistros: number = 0;
  showLoading: boolean = false;
  displayModalSave: boolean = false;
  question: Question = new Question();
  isAdmin: boolean = true;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  answer?: Answer;
  answers: Array<Answer> = [];
  showAnswerForm = false;
  answerIndex?: number;
  fileToUpload!: File;
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
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.getQuizById(id);
      this.getQuestionsByQuizId(id);
    }
  }

  public Editor = ClassicEditor;  // Associa o editor clássico ao componente
  public postContent: string = ''; // Propriedade para armazenar o conteúdo do editor

  get editing() {
    return Boolean(this.question.id);
  }

  // Método de salvar
  save(questionForm: NgForm) {
    if (this.editing) {
      this.updateQuestion(questionForm);
    } else {
      this.addNewQuestion(questionForm);
    }
  }

  // Método para adicionar nova pergunta
  addNewQuestion(questionForm: NgForm) {
    //this.question.quiz = this.quiz; 
    this.showLoading = true;

    // Marcar a resposta correta
    this.question.answers.forEach(answer => {
      answer.correct = (answer.text === this.correctAnswer); // Define a resposta correta
    });

    this.questionService.add(this.question).subscribe(
      (question) => {
        this.question = question;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Question added successfully' });
        questionForm.reset(); // Reseta o formulário
        //this.displayModalSave = false; // Fecha o modal
        //this.findQuestionsByQuizId(0, question.quiz.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para atualizar pergunta
  updateQuestion(questionForm: NgForm) {
    //this.question.quiz = this.quiz; 
    this.showLoading = true;

    // Marcar a resposta correta
    this.question.answers.forEach(answer => {
      answer.correct = (answer.text === this.correctAnswer); // Define a resposta correta
    });

    this.questionService.update(this.question).subscribe(
      (question) => {
        this.question = question;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Question updated successfully!' });
        //this.displayModalSave = false; // Fecha o modal
        //this.findQuestionsByQuizId(0, question.quiz.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
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

  getQuestionsByQuizId(quizId: number): void {
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.quizService.getQuestionsByQuizId(quizId, this.filtro).subscribe(
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

  onUpdateQuestion(question: Question): void {
    this.question = question;
    this.question.id = question.id;
    this.displayModalSave = true;

    // Captura a resposta correta (assumindo que a propriedade correta está na classe Question)
    const correctAnswerObj = this.question.answers.find(answer => answer.correct);
    this.correctAnswer = correctAnswerObj ? correctAnswerObj.text : undefined; // Armazena o texto da resposta correta

  }

  onAddNewQuestion(): void {
    this.question = new Question();
    this.displayModalSave = true;
  }

  // Métodos de gerenciamento de respostas
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

  onUpdateQuestionImage(question: Question, event: any) {
    if (event.target.files.length > 0) {
      this.fileToUpload = event.target.files[0];
      this.questionService.updateQuestionImage(question.id, this.fileToUpload).subscribe(
        response => {
          question = response;
          console.log('Upload successful', response);
        },
        error => {
          console.error('Upload failed', error);
        }
      );
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

  // Método para submeter as respostas
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

  // Método para exibir os resultados
  displayResults() {
    const message = `Você acertou ${this.result.correctAnswers} resposta(s) e errou ${this.result.incorrectAnswers} resposta(s).`;
    this.messageService.add({ severity: 'info', detail: message });
  }

  // Método para capturar a resposta do usuário
  captureUserAnswer(questionId: number, answerId: number) {
    const existingAnswerIndex = this.userAnswers.findIndex(answer => answer.questionId === questionId);
    if (existingAnswerIndex !== -1) {
      this.userAnswers[existingAnswerIndex].answerId = answerId;
    } else {
      this.userAnswers.push({ questionId, answerId });
    }
  }

  // Método para verificar se uma opção foi selecionada
  isSelected(questionId: number, answerId: number): boolean {
    const userAnswer = this.userAnswers.find(answer => answer.questionId === questionId);
    return userAnswer ? userAnswer.answerId === answerId : false;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

  toggleCorrection() {
    this.showCorrection = !this.showCorrection;
  }
}
