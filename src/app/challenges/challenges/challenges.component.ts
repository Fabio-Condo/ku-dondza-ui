import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Challenge } from 'src/app/core/model/Challenge';
import { ChallengeService } from '../challenge.service';
import { Question } from 'src/app/core/model/Question';
import { User } from 'src/app/core/model/User';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { evaluate } from 'mathjs';
import { QuestionService } from 'src/app/questions/question.service';
import { ChallengeFilter } from 'src/app/core/interface/ChallengeFilter';
import { delayWhen, retryWhen, scan, timer } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Subject } from 'src/app/core/model/Subject';
declare const MathJax: any;


@Component({
  selector: 'app-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.css']
})
export class ChallengesComponent implements OnInit {

  challenge: Challenge = new Challenge();

  challenges: Challenge[] = [];
  selectedChallenge?: Challenge;
  displayModalSave: boolean = false;

  allQuestions: Question[] = [];
  displayModalQuestionsList: boolean = false;
  currentQuestionIndex = 0;

  selectedQuestions: Question[] = [];
  displayModalSelectedQuestionsList: boolean = false;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  subjects: Subject[] = [];

  showLoading = false;
  loadingMessage = 'Carregando';

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;

  retryVisible: boolean = false;
  currentMessage: string | null = null;

  totalChallenges: number = 0;
  totalRecords: number = 0;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  displayFilterModal = false;

  difficultyLevelOptions = [
    { label: 'Iniciante', value: 'BEGINNER' },
    { label: 'Intermediário', value: 'INTERMEDIATE' },
    { label: 'Avançado', value: 'ADVANCED' },
  ];

  filtro: ChallengeFilter = {
    page: 0,
    itemsPerPage: 6,
    sort: 'id,asc',
  };

  constructor(
    private challengeService: ChallengeService,
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.carregarDisciplinas();
    this.findAll();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.challenge.id);
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
    this.challengeService.update(this.challenge).subscribe(
      challenge => {
        this.challenge = challenge
        this.challenge.startDate = challenge.startDate
          ? new Date(challenge.startDate).toISOString().split('T')[0] as any
          : null;

        this.challenge.endDate = challenge.endDate
          ? new Date(challenge.endDate).toISOString().split('T')[0] as any
          : null;

        this.messageService.add({ severity: 'success', detail: 'Desafio actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNew() {
    this.showLoading = true;
    this.challengeService.add(this.challenge).subscribe(
      challenge => {
        this.challenge = challenge
        this.challenge.startDate = challenge.startDate
          ? new Date(challenge.startDate).toISOString().split('T')[0] as any
          : null;

        this.challenge.endDate = challenge.endDate
          ? new Date(challenge.endDate).toISOString().split('T')[0] as any
          : null;

        this.messageService.add({ severity: 'success', detail: 'Desafio salvo com sucesso!' });
        this.showLoading = false;
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
    this.challengeService.findAll(this.filtro).pipe(
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
    ).subscribe(
      (dados: IApiResponse<Challenge>) => {
        this.challenges = dados.content;
        this.totalRecords = dados.totalElements;
        this.totalChallenges = this.totalChallenges || dados.totalElements;
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

    this.challengeService.findAll(this.filtro).subscribe(
      (data: IApiResponse<Challenge>) => {
        this.challenges = [...this.challenges, ...data.content];
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
    return this.challenges.length >= this.totalRecords && this.totalRecords > 0;
  }

  retryGetChallenges(): void {
    this.retryVisible = false;
    this.filtro.page = 0;
    this.findAll(this.currentPage);
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

  onGetByStatus(status: string) {
    this.filtro.status = status;
    this.findAll();
  }

  onReset() {
    this.filtro.status = undefined;
    this.findAll();
  }

  getById(id: string): void {
    this.challengeService.getById(id)
      .subscribe({
        next: (res) => {
          this.selectedChallenge = res;
        }
      });
  }

  openChallenge(id: string): void {
    this.getById(id);
  }

  onUpdateChallenge(challenge: Challenge): void {
    this.challenge = challenge;

    this.challenge.startDate = challenge.startDate
      ? new Date(challenge.startDate).toISOString().split('T')[0] as any
      : null;

    this.challenge.endDate = challenge.endDate
      ? new Date(challenge.endDate).toISOString().split('T')[0] as any
      : null;

    this.displayModalSave = true;
  }

  onAddNewChallenge(): void {
    this.challenge = new Challenge();
    this.displayModalSave = true;
  }

  getDifficultyLabel(level: string): string {
    switch (level) {
      case 'BEGINNER':
        return 'Iniciante';

      case 'INTERMEDIATE':
        return 'Intermediário';

      case 'ADVANCED':
        return 'Avançado';

      default:
        return '';
    }
  }

  onGetSelectedQuestionsByTopicId(challenge: Challenge) {
    this.challenge = challenge;
    this.getSelectedQuestionsByTopicId(this.challenge);
    this.displayModalSelectedQuestionsList = true;
    document.body.classList.add('no-scroll');
  }

  onCloseSelectedQuestionsList() {
    this.displayModalSelectedQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  getSelectedQuestionsByTopicId(challenge: Challenge): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.challengeService.getQuestionsByChallengeId(challenge.id).subscribe(
      (dados: Question[]) => {
        this.selectedQuestions = dados;
        this.showLoading = false;
        this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
        this.renderFunctions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onGetQuestionsByTopicId(challenge: Challenge) {
    this.challenge = challenge;
    this.findAllByTopicAndMarkSelected(this.challenge);
    this.displayModalQuestionsList = true;
    document.body.classList.add('no-scroll');
  }

  onCloseQuestionList() {
    this.displayModalQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  // USADO PARA ADD QUESTIONS NOS TESTES DE PROGRESSO
  findAllByTopicAndMarkSelected(challenge: Challenge): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.questionService.findAllByTopicAndMarkSelected(challenge.id).subscribe(
      (dados: Question[]) => {
        this.allQuestions = dados;
        this.currentQuestionIndex = 0;
        this.showLoading = false;
        this.renderMathExpressions(); // Renderiza as expressões matemáticas após carregar o quiz
        this.renderFunctions();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onAddQuestionToChallengeQuestions(questionId: number): void {
    this.addQuestionToChallengeQuestions(questionId);
  }

  addQuestionToChallengeQuestions(questionId: number): void {
    this.loadingMessage = 'Adicionando questão';
    this.showLoading = true;

    this.challengeService.addQuestionToChallengeQuestions(this.challenge.id, questionId).subscribe({
      next: (challenge) => {

        // DEVE MARCAR A QUESTÃO COMO SELECIONADA NA LISTA
        const question = this.allQuestions.find(q => q.id === questionId);
        if (question) {
          question.selected = true;
        }

        this.messageService.add({ severity: 'success', detail: 'Questão adicionada com sucesso!' });
        this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  onRemoveQuestionFromChallengeQuestions(questionId: number): void {
    this.removeQuestionFromChallengeQuestions(questionId);
  }

  removeQuestionFromChallengeQuestions(questionId: number): void {
    this.loadingMessage = 'Removendo questão';
    this.showLoading = true;

    this.challengeService.removeQuestionFromChallengeQuestions(this.challenge.id, questionId).subscribe({
      next: (challenge) => {
        // DEV RETIRAR A QUESTÃO DA LISTA TAMBÉM
        this.selectedQuestions = this.selectedQuestions.filter(q => q.id !== questionId);

        // DEVE MARCAR A QUESTAO COM NAO SELECIONADA NA LISTA GERAL
        this.allQuestions = this.allQuestions.map(q => {
          if (q.id === questionId) {
            q.selected = false;
          }
          return q;
        });

        this.messageService.add({ severity: 'success', detail: 'Questão removida com sucesso!' });
        this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  toggleDropdown(challenge: Challenge) {
    challenge.isAdminMenuOpen = !challenge.isAdminMenuOpen
  }

  closeDropdown(challenge: Challenge) {
    challenge.isAdminMenuOpen = false;
  }

  openFilterModal(): void {
    this.displayFilterModal = true;
    document.body.classList.add('no-scroll');
  }

  closeFilterModal(): void {
    this.displayFilterModal = false;
    document.body.classList.remove('no-scroll');
  }

  applyAdvancedFilters(): void {
    this.currentPage = 1;
    this.filtro.page = 0;

    this.closeFilterModal();
    this.findAll();
  }

  clearAdvancedFilters(): void {
    this.filtro.title = undefined;
    this.filtro.description = undefined;
    this.filtro.difficultyLevel = undefined;
    this.filtro.subject = undefined;
    this.filtro.sort = 'id,asc';

    this.currentPage = 1;
    this.filtro.page = 0;

    this.closeFilterModal();
    this.findAll();
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

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
  }

  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        mathContainer.innerHTML = this.getFormattedText(this.allQuestions[this.currentQuestionIndex].text);
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        mathContainerSolution.innerHTML = this.getFormattedText(this.allQuestions[this.currentQuestionIndex].solution);
      }

      const mathContainerTip = document.getElementById(`math-container-tip-${this.currentQuestionIndex}`);
      if (mathContainerTip && typeof MathJax !== 'undefined') {
        mathContainerTip.innerHTML = this.getFormattedText(this.allQuestions[this.currentQuestionIndex].tip);
      }

      if (typeof MathJax !== 'undefined') {
        MathJax.typesetPromise().then(() => {
          console.log('MathJax renderizado com sucesso!');
        }).catch((err: any) => {
          console.error('Erro ao renderizar MathJax:', err);
        });
      }
    }, 0);
  }

  renderFunctions() {
    setTimeout(() => {
      const canvas = this.canvas?.nativeElement;
      if (!canvas || !this.allQuestions[this.currentQuestionIndex].mathExpressions || this.allQuestions[this.currentQuestionIndex].mathExpressions.length === 0) return;


      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const scaleX = width / 20;
      const scaleY = height / 20;

      // Desenha a grade cartesiana
      ctx.beginPath();
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;

      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let i = -10; i <= 10; i++) {
        let y = height / 2 - i * scaleY;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Eixos principais
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Números dos eixos
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      for (let i = -10; i <= 10; i++) {
        let x = width / 2 + i * scaleX;
        let y = height / 2 - i * scaleY;
        if (i !== 0) {
          ctx.fillText(i.toString(), x, height / 2 + 15);
          ctx.fillText(i.toString(), width / 2 - 15, y + 5);
        }
      }

      // Cores para múltiplos gráficos
      const colors = ['blue', 'red', 'green', 'orange', 'purple'];

      this.allQuestions[this.currentQuestionIndex].mathExpressions.forEach((express, index) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2;

        for (let x = -10; x <= 10; x += 0.1) {
          try {
            let y = evaluate(express.expression!.replace(/x/g, `(${x})`));
            let screenX = width / 2 + x * scaleX;
            let screenY = height / 2 - y * scaleY;
            if (x === -10) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          } catch (error) {
            console.error(`Erro ao avaliar ${express.expression!}:`, error);
          }
        }
        ctx.stroke();

        // Adiciona legenda no gráfico
        ctx.fillStyle = colors[index % colors.length];
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(
          //express.name || express.expression || `f${index + 1}(x)`,
          express.name || `f${index + 1}(x)`,
          10,
          20 + index * 20
        );
      });
    }, 0);
  }

  startChallenge(challenge: Challenge) {
    //console.log("Premium: " + topic.premium)
    //if (this.isPremiumTopic(topic)) {
    //  this.displayModalUpgradePlan = true;
    //  return;
    //}

    this.router.navigate(['/quizzes', 'challenge'], {
      queryParams: {
        from: 'challenges',
        challengeId: challenge.id
      }
    });
  }

  saveChallenge(challenge: Challenge) {
    this.router.navigate(['/challenges', challenge.challengeId, 'results']);
  }

  viewResults(challenge: Challenge) {
    this.router.navigate(['/challenges', challenge.challengeId, 'results']);
  }

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }
}