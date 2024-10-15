import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuizFilter } from 'src/app/core/interface/QuizFilter';
import { Quiz } from 'src/app/core/model/Quiz';

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
  isAdmin: boolean = true;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  @ViewChild('table') grid: any;

  filter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,asc'
  }


  constructor(
    private quizService: QuizService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Quiz page');
    this.getTotalQuizzes();
    this.getQuizzes();
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
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  getTotalQuizzes(){
    this.showLoading = true;
    this.quizService.getTotal().subscribe(
      (total) => {
        this.totalQuizzes =  total;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
