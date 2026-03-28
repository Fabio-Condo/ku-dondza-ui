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
import { Topic } from 'src/app/core/model/Topic';
import { Role } from 'src/app/enum/role.enum';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';

@Component({
  selector: 'app-quizzes',
  templateUrl: './quizzes.component.html',
  styleUrls: ['./quizzes.component.css']
})
export class QuizzesComponent implements OnInit {

  showLoading: boolean = false;
  retryVisible: boolean = false;

  totalQuizzes: number = 0;
  totalRecords: number = 0
  currentPage: number = 1;
  quizzes: Quiz[] = [];
  quiz: Quiz = new Quiz;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  selectedQuiz: Quiz = new Quiz();
  subjects: Subject[] = [];
  topics: Topic[] = [];

  showAllTopicsMap: { [competitionId: number]: boolean } = {};

  loadingMessage = "Carregando"; // Alterar dinamicamente

  loggedUser: User = new User;
  isUserLoggedIn: boolean = false;

  expanded = true;

  selectQuizOption: string = 'ALL_QUIZZES';

  quizFilterOptions = [
    { label: 'Mostrar todos', value: 'ALL_QUIZZES' },
    { label: 'Mostrar seus', value: 'MY_QUIZZES' },
  ];

  @ViewChild('table') grid: any;

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
    this.title.setTitle('Quizzes page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.getQuizzes();
    this.carregarDisciplinas();
    this.scrollToTop();
    this.autoCollapseFabButton();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  autoCollapseFabButton(): void {
    setTimeout(() => {
      this.expanded = false;
    }, 15000);
  }

  get editing() {
    return Boolean(this.quiz.id);
  }

  getQuizzes(page: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando dados";
    this.showLoading = true;

    if (this.selectQuizOption == 'MY_QUIZZES') this.filter.user = this.loggedUser.id;
    if (this.selectQuizOption == 'ALL_QUIZZES') this.filter.user = 0;
    this.filter.page = this.currentPage - 1;

    this.quizService.getQuizzes(this.filter).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000)) // 2s → 4s → 8s
        )
      )
    )
      .subscribe(
        (data: IApiResponse<Quiz>) => {
          this.quizzes = data.content;
          this.totalRecords = data.totalElements;
          this.totalQuizzes = this.totalQuizzes || data.totalElements;
          this.showLoading = false;
          this.loadingMessage = "";
        },
        (errorResponse: HttpErrorResponse) => {
          this.showLoading = false;
          this.retryVisible = true;
          if (!navigator.onLine) {
            this.sendErrorNotification("Você está sem conexão com a internet.");
          } else {
            this.sendErrorNotification(errorResponse.error.message);
          }
        }
      );
  }

  loadMore(page: number = 0): void {
    if (this.showLoading) return;

    if (this.selectQuizOption == 'MY_QUIZZES') {
      this.filter.user = this.loggedUser.id;
    }

    if (this.selectQuizOption == 'ALL_QUIZZES') {
      this.filter.user = 0;
    }

    this.showLoading = true;
    this.filter.page++;

    this.quizService.getQuizzes(this.filter).subscribe(
      (data: IApiResponse<Quiz>) => {
        this.quizzes = [...this.quizzes, ...data.content];
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  get isLoadMoreDisabled(): boolean {
    return this.quizzes.length >= this.totalRecords && this.totalRecords > 0;
  }

  retryGetQuizzes(): void {
    this.retryVisible = false;
    this.filter.page = 0;
    this.getQuizzes(this.currentPage);
    this.carregarDisciplinas();
  }

  toggleTopics(quizId: number): void {
    this.showAllTopicsMap[quizId] = !this.showAllTopicsMap[quizId];
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

  toggleDropdown(quiz: Quiz) {
    this.quizzes.forEach(q => {
      if (q !== quiz) {
        q.isAdminMenuOpen = false;
      }
    });
    quiz.isAdminMenuOpen = !quiz.isAdminMenuOpen;
  }

  closeDropdown(quiz: Quiz) {
    quiz.isAdminMenuOpen = false;
  }

  excluir(quiz: Quiz) {
    this.quizService.delete(quiz.id).subscribe(() => {
      this.getQuizzes();
      this.messageService.add({ severity: 'success', detail: 'Quiz excluído com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  toggleAnonymousStatus(quiz: Quiz): void {
    quiz.showLoadingSave = true;

    const newStatus = !quiz.anonymous;

    this.quizService.toggleAnonymous(quiz.id, newStatus).subscribe({
      next: () => {
        quiz.anonymous = newStatus;
        quiz.showLoadingSave = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        quiz.showLoadingSave = false;
      },
    });
  }

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  confirmarExclusao(quiz: Quiz): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(quiz);
      }
    });
  }

  pageSizeOptions = [5, 10, 20, 50]; // Opções para itens por página
  maxVisibleButtons = 5; // Número máximo de botões visíveis (como no PrimeNG)

  changePageSize(event: any): void {
    this.filter.itemsPerPage = +event.target.value;
    this.currentPage = 1;
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

  goToPage(page: number): void {
    this.currentPage = page;
    this.getQuizzes();
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / this.filter.itemsPerPage);
  }

  /** Retorna a lista de páginas visíveis com reticências */
  getPages(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage;
    const max = this.maxVisibleButtons;

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Sempre mostrar a primeira página
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    // Páginas ao redor da página atual
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    // Sempre mostrar a última página
    pages.push(total);

    return pages;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Formata os minutos e segundos para ter 2 dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  shareOnSocial(network: string, quizzId: string): void {
    const baseUrl = `${window.location.origin}/quizzes/${quizzId}`; // link do item
    let url = '';

    switch (network) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent('Olha isto: ' + baseUrl)}`;
        break;

      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(baseUrl)}`;
        break;

      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(baseUrl)}`;
        break;
    }

    if (url) {
      window.open(url, '_blank'); // abre numa nova aba
    }
  }

  copyLink(quizzId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link + `/${quizzId}`).then(() => {
      console.log(`Link do item ${quizzId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
  }

  limparCampos() {
    this.filter.searchParam = "";
    this.filter.subject = undefined;
    this.selectQuizOption = 'ALL_QUIZZES';
    this.getQuizzes();
  }

  getBadgeClass(category: string): string {
    switch (category) {
      case 'EXACT_SCIENCES':
        return 'exact-sciences';
      case 'HUMAN_SCIENCES':
        return 'human-sciences';
      case 'LANGUAGES':
        return 'languages';
      default:
        return '';
    }
  }

  getScoreClass(rate: number): string {
    if (rate < 40) return 'low';
    if (rate < 70) return 'medium';
    return 'high';
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
