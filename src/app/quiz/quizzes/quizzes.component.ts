import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuizFilter } from 'src/app/core/interface/QuizFilter';
import { Quiz } from 'src/app/core/model/Quiz';
import { Question } from 'src/app/core/model/Question';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { QuestionService } from 'src/app/questions/question.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {

  showLoading: boolean = false;
  totalQuizzes: number = 0;
  totalRecords: number = 0
  currentPage: number = 1;
  quizzes: Quiz[] = [];
  quiz: Quiz = new Quiz;
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  isAdmin: boolean = false;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  selectedQuiz: Quiz = new Quiz();
  subjects: any[] = [];

  selectedQuestion: Question = new Question();
  showQuestionsDialog: boolean = false;
  showSelectQuestionsDialog: boolean = false;

  questionsList: any[] = [];
  totalRegistrosQuestions: number = 10000


  @ViewChild('table') grid: any;

  filter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }
  
  filtroQuestions: QuestionFilter = {
    page: -1,
    itemsPerPage: 2,
    sort: 'id,asc',
  }


  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Quiz page');
    this.getTotalQuizzes();
    this.getQuizzes();
    this.getQuestions();
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.quiz.id);
  }

  save(quizForm: NgForm) {
    if (this.editing) {
      this.update(quizForm)
    } else {
      this.addNew(quizForm)
    }
  }

  addNew(quizForm: NgForm) {
    this.showLoading = true;
    this.quizService.add(this.quiz).subscribe(
      (quiz) => {
        this.quiz = quiz;
        this.showLoading = false;
        this.getQuizzes();
        this.messageService.add({ severity: 'success', detail: 'Quiz added successfully' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(quizForm: NgForm) {
    this.showLoading = true;
    this.quizService.update(this.quiz).subscribe(
      (quiz) => {
        this.quiz = quiz;
        this.showLoading = false;
        this.getQuizzes();
        this.messageService.add({ severity: 'success', detail: 'Quiz updated successfully!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  getQuizzes(page: number = 0): void {
    this.showLoading = true;
    this.filter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.quizService.getQuizzes(this.filter).subscribe(
      (data: IApiResponse<Quiz>) => {
        this.quizzes = data.content;
        data.content.forEach(quiz => {
          this.countQuestionsByQuizId(quiz);
        });
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
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

  getTotalQuizzes(){
    this.quizService.getTotal().subscribe(
      (total) => {
        this.totalQuizzes =  total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  toggleDropdown(quiz: Quiz) {
    quiz.isAdminMenuOpen = !quiz.isAdminMenuOpen
  }

  closeDropdown(quiz: Quiz) {
    quiz.isAdminMenuOpen = false;
  }

  getQuestions() {
    return this.questionService.getAll().subscribe(
      dados => {
        this.questionsList = dados.map(dado => {
          return {
            label: dado.text,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  addQuestionToQuiz() {
    this.quizService.addQuestionToQuiz(this.quiz.id, this.selectedQuestion.id).subscribe(
      (quiz) => {
        this.quiz = quiz;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  removeQuestionFromQuiz(question: Question) {
    this.quizService.removeQuestionFromQuiz(this.selectedQuiz.id, question.id).subscribe(
      () => {
        this.selectedQuiz.questions = this.selectedQuiz.questions.filter(quest => quest.id !== question.id);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getQuestionsByQuizId(): void {
    this.quizService.getQuestionsByQuizId(this.selectedQuiz.id, this.filtroQuestions).subscribe(
      (dados: IApiResponse<Question>) => {
        this.selectedQuiz.questions = [...this.selectedQuiz.questions, ...dados.content];
        this.totalRegistrosQuestions = dados.totalElements;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  countQuestionsByQuizId(quiz: Quiz) {
    this.showLoading = true;
    this.quizService.countQuestionsByQuizId(quiz.id,).subscribe(
      (total) => {
        quiz.totalQuestions = total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }
  
  onShowMoreQuestions(): void {
    if (this.selectedQuiz) {
      this.filtroQuestions.page++;
      this.getQuestionsByQuizId();
    }
  }

  onShowSelectedQuiz(quiz: Quiz): void {
    this.selectedQuiz = quiz;
    this.selectedQuiz.questions = [];
    this.filtroQuestions.page = 0; 
    this.getQuestionsByQuizId();
    this.showQuestionsDialog = true;
  }

  onAddQuestions(quiz: Quiz) {
    this.quiz = quiz;
    this.showSelectQuestionsDialog = true;
  }

  onUpdateQuiz(quiz: Quiz): void {
    this.quiz = quiz
    this.quiz.id = quiz.id
    this.displayModalSave = true;
  }

  onAddNewQuiz(): void {
    this.quiz = new Quiz();
    this.displayModalSave = true;
  }

  excluir(quiz: Quiz) {
    this.quizService.delete(quiz.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.getQuizzes()
      } else {
        //this.grid.reset();
        //this.findAll(this.paginaAtual)
      }
      this.messageService.add({ severity: 'success', detail: 'Quiz excluído com sucesso!' })
      this.getTotalQuizzes();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  confirmarExclusao(quiz: Quiz): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(quiz);
      }
    });
  }

  changePageSize(event: any): void {
    this.filter.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.getQuizzes();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getQuizzes();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.getQuizzes();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / this.filter.itemsPerPage);
  }

  limparCampos() {
    this.filter.searchParam = "";
    this.filter.title = "";
    this.filter.subject = undefined;
    this.getQuizzes();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
