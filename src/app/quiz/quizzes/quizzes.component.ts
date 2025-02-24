import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizService } from '../quiz.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { QuizFilter } from 'src/app/core/interface/QuizFilter';
import { Quiz } from 'src/app/core/model/Quiz';
import { QuestionService } from 'src/app/questions/question.service';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Subject } from 'src/app/core/model/Subject';
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
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  isAdmin: boolean = false;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  selectedQuiz: Quiz = new Quiz();
  subjects: Subject[] = [];

  loggedUser: User = new User;
  
  @ViewChild('table') grid: any;

  difficultyLevels = [
    { label: 'Fácil', value: 'EASY' },
    { label: 'Médio', value: 'MEDIUM' },
    { label: 'Dificil', value: 'HARD' },
  ];

  filter: QuizFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,desc'
  }

  constructor(
    private quizService: QuizService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Quiz page');
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.getTotalQuizzes();
    this.getQuizzes();
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.quiz.id);
  }

  getQuizzes(page: number = 0): void {
    this.showLoading = true;
    this.filter.user = this.loggedUser.id;
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

  loadMore(page: number = 0): void {
    this.showLoading = true;
    this.filter.user = this.loggedUser.id;
    this.filter.page++;

    this.quizService.getQuizzes(this.filter).subscribe(
      (data: IApiResponse<Quiz>) => {
        this.quizzes = [...this.quizzes, ...data.content]; 

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
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados; 
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  getTotalQuizzes(){
    this.quizService.getTotal(this.loggedUser.id).subscribe(
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

  excluir(quiz: Quiz) {
    this.quizService.delete(quiz.id).subscribe(() => {
      this.getQuizzes();
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

  getTypeValue(type: string) {
    switch (type) {
      case 'EASY':
        return 'Fácil';
      case 'MEDIUM':
        return 'Médio';
      case 'HARD':
        return 'Dificil';  
    }
    return '';
  }

  limparCampos() {
    this.filter.searchParam = "";
    this.filter.title = "";
    this.filter.subject = undefined;
    this.filter.difficultyLevel = undefined;
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
