import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthModalService } from 'src/app/core/auth-modal.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { TopicContentService } from 'src/app/topics/TopicContentService.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { FlashCardsService } from './flash-cards.service';
import { FlashCard } from 'src/app/core/model/FlashCard';
import { FlashCardFilter } from 'src/app/core/interface/FlashCardFilter';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';
import { Role } from 'src/app/enum/role.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Subject } from 'src/app/core/model/Subject';
import { TopicService } from 'src/app/topics/topicsService.service';
import { Topic } from 'src/app/core/model/Topic';
declare const MathJax: any;


@Component({
  selector: 'app-flash-cards',
  templateUrl: './flash-cards.component.html',
  styleUrls: ['./flash-cards.component.css']
})
export class FlashCardsComponent {

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  flashCards: FlashCard[] = [];
  totalFlashCards: number = 0;
  totalRecords: number = 0;
  currentPage: number = 1;

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  retryVisible: boolean = false;

  subjects: Subject[] = [];

  selectedSubject?: number;
  topics: Topic[] = [];

  /* ── Paginação ── */
  //currentPage: number = 1;
  //pageSize: number = 9;
  //isLoadMoreDisabled: boolean = false;

  /* ── Filtro ── */
  displayModalFilter: boolean = false;

  /* ── Modal save (CRUD) ── */
  displayModalSave: boolean = false;
  flashCard: FlashCard = new FlashCard();

  /* ── Player (flip card) ── */
  displayModalPlayer: boolean = false;
  studyDeck: FlashCard[] = [];
  currentIndex: number = 0;
  isFlipped: boolean = false;
  isDone: boolean = false;

  showLatexLoading: boolean = false;

  filtro: FlashCardFilter = {
    page: 0,
    itemsPerPage: 6,
    sort: 'id,desc',
  };

  constructor(
    private authModalService: AuthModalService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private topicContentService: TopicContentService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private flashCardsService: FlashCardsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {

    this.title.setTitle('Flash cards page');

    this.authenticationService.loginStatus$
      .subscribe(logged => {
        this.isUserLoggedIn = logged;
        this.loggedUser =
          this.authenticationService.getUserFromLocalCache();
      });

    this.findAll();
    this.carregarDisciplinas();

    this.scrollToTop();
  }

  onUpdateFlashCard(flashCard: FlashCard): void {
    this.flashCard = flashCard;
    this.flashCard.id = flashCard.id;
    this.displayModalSave = true;

    this.selectedSubject = (this.flashCard.topic.subject) ? this.flashCard.topic.subject.id : undefined;
    if (this.selectedSubject) {
      this.getTopicsBySubjectId();
    }

    document.body.classList.add('no-scroll');
  }

  onAddNewFlashCard(): void {
    this.flashCard = new FlashCard();
    this.displayModalSave = true;
    document.body.classList.add('no-scroll');
  }

  get editing() {
    return Boolean(this.flashCard.id)
  }

  save() {
    if (this.editing) {
      this.update()
    } else {
      this.addNew()
    }
  }

  update() {
    this.showLoading = true;
    this.flashCardsService.update(this.flashCard).subscribe(
      response => {
        this.flashCard = response
        this.messageService.add({ severity: 'success', detail: 'Flash Card actualizado com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.flashCardsService.save(this.flashCard).subscribe(
      response => {
        this.flashCard = response
        this.messageService.add({ severity: 'success', detail: 'Flash Card salvo com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  findAll(pagina: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.flashCardsService.findAll(this.filtro).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (dados: IApiResponse<FlashCard>) => {
        this.flashCards = dados.content
        this.totalRecords = dados.totalElements;
        this.totalFlashCards = this.totalFlashCards || dados.totalElements;
        this.renderMathExpressions();
        this.showLoading = false;
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
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filtro.page++;

    this.flashCardsService.findAll(this.filtro).subscribe(
      (data: IApiResponse<FlashCard>) => {
        this.flashCards = [...this.flashCards, ...data.content];
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  retryFindAll(): void {
    this.retryVisible = false;
    this.filtro.page = 0;
    this.findAll(this.currentPage);
    this.carregarDisciplinas();
  }

  get isLoadMoreDisabled(): boolean {
    return this.flashCards.length >= this.totalRecords && this.totalRecords > 0;
  }

  getTopicsBySubjectId() {

    this.loadingMessage = "Carregando tópicos"
    this.showLoading = true;

    this.topicService.getBySubjectIdWithCache(this.selectedSubject!).subscribe({
      next: (dados) => {
        this.topics = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  carregarDisciplinas() {
    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        //this.subjects = dados;
        this.subjects = dados.filter(s => s.examEnabled);
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onOpenFilter() {
    this.displayModalFilter = true;
    document.body.classList.add('no-scroll');
  }

  onCloseFilter() {
    this.displayModalFilter = false;
    document.body.classList.remove('no-scroll');
  }

  limparFiltros() {
    this.filtro.subjectId = undefined;
    this.filtro.topicId = undefined;
    this.findAll();
  }

  changePageSize(event: any): void {
    this.filtro.itemsPerPage = +event.target.value;
    this.currentPage = 1; // Resetar para a primeira página ao mudar o número de itens por página
    this.findAll();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findAll();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findAll();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / this.filtro.itemsPerPage);
  }

  goToPage(page: number): void {
    if (
      page >= 1 &&
      page <= this.totalPages() &&
      page !== this.currentPage
    ) {
      this.currentPage = page;
      this.findAll();
    }
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];

    // primeira página sempre aparece
    pages.push(1);

    // mostrar ... se estiver longe do início
    if (current > 3) {
      pages.push(-1);
    }

    // páginas ao redor da atual
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // mostrar ... se estiver longe do fim
    if (current < total - 2) {
      pages.push(-1);
    }

    // última página sempre aparece
    pages.push(total);

    return pages;
  }

  toggleDropdown(flashCard: FlashCard) {
    this.flashCards.forEach(fc => {
      if (fc !== flashCard) {
        fc.isAdminMenuOpen = false;
      }
    });
    flashCard.isAdminMenuOpen = !flashCard.isAdminMenuOpen;
  }

  closeDropdown(flashCard: FlashCard) {
    flashCard.isAdminMenuOpen = false;
  }

  closeSavePopout(): void {
    this.displayModalSave = false;
    document.body.classList.remove('no-scroll');
  }

  openPlayer(flashCard: FlashCard): void {

    this.studyDeck = this.flashCards;

    this.currentIndex =
      this.flashCards.findIndex(fc => fc.id === flashCard.id);

    this.isFlipped = false;
    this.isDone = false;
    this.displayModalPlayer = true;
    this.renderMathExpressions();

    document.body.classList.add('no-scroll');
  }

  closePlayer(): void {
    this.displayModalPlayer = false;
    this.isFlipped = false;
    document.body.classList.remove('no-scroll');
  }

  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
  }

  nextCard(): void {

    if (this.currentIndex < this.studyDeck.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.renderMathExpressionsForDeck();
    } else {
      this.isDone = true;
    }
  }

  previousCard(): void {

    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.renderMathExpressionsForDeck();
    }
  }

  get currentCard(): FlashCard {
    return this.studyDeck[this.currentIndex];
  }

  get progressPercentage(): number {

    if (!this.studyDeck.length) {
      return 0;
    }

    return ((this.currentIndex + 1) / this.studyDeck.length) * 100;
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    this.showLoading = true;
    setTimeout(() => {
      MathJax.typesetPromise();
    }, 0);
    this.showLoading = false;
  }

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
  }

  renderMathExpressionsForDeck(): void {
    setTimeout(() => {
      const q = document.getElementById(`math-container-${this.currentIndex}`);
      const a = document.getElementById(`math-container-solution-${this.currentIndex}`);

      if (q) {
        q.innerHTML = this.getFormattedText(this.studyDeck[this.currentIndex].question);
      }

      if (a) {
        a.innerHTML = this.getFormattedText(this.studyDeck[this.currentIndex].answer);
      }

      MathJax.typesetPromise()
        .then(() => console.log('MathJax OK'))
        .catch(console.error);
    }, 0);
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
