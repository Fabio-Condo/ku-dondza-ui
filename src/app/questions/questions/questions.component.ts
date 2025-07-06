import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { QuestionFilter } from 'src/app/core/interface/QuestionFilter';
import { Answer } from 'src/app/core/model/Answer';
import { Question } from 'src/app/core/model/Question';
import { QuestionService } from '../question.service';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { TopicService } from 'src/app/topics/topicsService.service';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';
import { Subject } from 'src/app/core/model/Subject';
import { Topic } from 'src/app/core/model/Topic';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MathExpression } from 'src/app/core/model/MathExpression';
import { Title } from '@angular/platform-browser';
declare const MathJax: any;

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  questions: Question[] = [];
  totalQuestions: number = 0;
  totalRegistros: number = 0;
  showLoading: boolean = false;
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  isDropdownOpen: boolean = false;
  question: Question = new Question();
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  isUserLoggedIn: boolean = false;

  answer?: Answer;
  answers: Array<Answer> = [];
  showAnswerForm = false;
  answerIndex?: number;

  mathExpression?: MathExpression;
  mathExpressions: Array<MathExpression> = [];
  showMathExpressionForm = false;
  mathExpressionIndex?: number;

  fileToUpload!: File;
  subjects: Subject[] = [];
  //currentQuestionIndex: number = 0;

  selectedSubject?: number;
  topics: Topic[] = [];

  // Armazenar as respostas do usuário
  userAnswers: { questionId: number; answerId: number }[] = [];
  result: { correctAnswers: number; incorrectAnswers: number } = { correctAnswers: 0, incorrectAnswers: 0 };
  showCorrection: boolean = false;

  correctAnswer: string | undefined; // Para armazenar a resposta correta como texto

  @ViewChild('tabela') grid: any;

  timeLimits = [
    { label: '1 minutos', value: '60' },
    { label: '2 minutos', value: '120' },
    { label: '3 minutos', value: '180' },
  ];

  difficultyLevels = [
    { label: 'Fácil', value: 'EASY' },
    { label: 'Médio', value: 'MEDIUM' },
    { label: 'Dificil', value: 'HARD' },
  ];

  filtro: QuestionFilter = {
    page: 0,
    itemsPerPage: 5,
    sort: 'id,desc'
  };

  constructor(
    private questionService: QuestionService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Questions page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.findAll(0);
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToQuestion(questionId: string) {
    this.router.navigate(['/questions', questionId], {
      state: { from: 'questions' }
    });
  }

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
    this.showLoading = true;

    // Marcar a resposta correta
    this.question.answers.forEach(answer => {
      answer.correct = (answer.text === this.correctAnswer); // Define a resposta correta
    });

    this.questionService.add(this.question).subscribe(
      (question) => {
        this.question = question;
        this.showLoading = false;
        this.findAll();
        this.messageService.add({ severity: 'success', detail: 'Question added successfully' });
        questionForm.reset(); // Reseta o formulário
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para atualizar pergunta
  updateQuestion(questionForm: NgForm) {
    this.showLoading = true;

    // Marcar a resposta correta
    this.question.answers.forEach(answer => {
      answer.correct = (answer.text === this.correctAnswer); // Define a resposta correta
    });

    this.questionService.update(this.question).subscribe(
      (question) => {
        this.question = question;
        this.showLoading = false;
        this.findAll();
        this.messageService.add({ severity: 'success', detail: 'Question updated successfully!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  // Método para renderizar expressões matemáticas
  renderMathExpressions(): void {
    this.showLoading = true;
    setTimeout(() => {
      MathJax.typesetPromise();
    }, 0);
    this.showLoading = false;
  }

  // Método de carregamento de questões
  findAll(pagina: number = 0): void {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0

    this.questionService.getQuestions(this.filtro).subscribe(
      (dados: IApiResponse<Question>) => {
        this.questions = dados.content
        this.totalRegistros = dados.totalElements;
        this.renderMathExpressions();
        if (this.totalQuestions == 0) {
          this.totalQuestions = dados.totalElements;
        }
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  loadMore(page: number = 0): void {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.page++;

    this.questionService.getQuestions(this.filtro).subscribe(
      (data: IApiResponse<Question>) => {
        this.questions = [...this.questions, ...data.content];
        this.totalRegistros = data.totalElements;
        this.renderMathExpressions();
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  onUpdateQuestion(question: Question): void {
    this.question = question;
    this.question.id = question.id;
    this.displayModalSave = true;

    this.selectedSubject = (this.question.topic.subject) ? this.question.topic.subject.id : undefined;
    if (this.selectedSubject) {
      this.getTopicsBySubjectId();
    }

    // Captura a resposta correta (assumindo que a propriedade correta está na classe Question)
    const correctAnswerObj = this.question.answers.find(answer => answer.correct);
    this.correctAnswer = correctAnswerObj ? correctAnswerObj.text : undefined; // Armazena o texto da resposta correta
  }

  onAddNewQuestion(): void {
    this.question = new Question();
    this.displayModalSave = true;
  }

  excluir(question: Question) {
    this.questionService.delete(question.id).subscribe(() => {
      if (this.grid.first === 0) {
        this.findAll();
      }
      this.messageService.add({ severity: 'success', detail: 'Questao excluída com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(question: Question): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(question);
      }
    });
  }

  getTopicsBySubjectId() {
    this.topicService.getBySubjectId(this.selectedSubject!).subscribe({
      next: (dados) => {
        this.topics = dados;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    });
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

  onRemoveAnswer(index: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover da lista?',
      accept: () => {
        this.removeAnswer(index);
      }
    });
  }

  // Métodos de gerenciamento de expressoes matematicas
  getReadyNewMathExpression() {
    this.showMathExpressionForm = true;
    this.mathExpression = new MathExpression();
    this.mathExpressionIndex = this.question.mathExpressions.length;
  }

  getReadyMathExpressionEdit(mathExpression: MathExpression, index: number) {
    this.mathExpression = this.cloneMathExpression(mathExpression);
    this.showMathExpressionForm = true;
    this.mathExpressionIndex = index;
  }

  confirmMathExpression(frm: NgForm) {
    this.question.mathExpressions[this.mathExpressionIndex!] = this.cloneMathExpression(this.mathExpression!);
    this.showMathExpressionForm = false;
    frm.reset();
  }

  cloneMathExpression(mathExpression: MathExpression): MathExpression {
    return new MathExpression(mathExpression.id, mathExpression.expression);
  }

  get editingMathExpression() {
    return this.mathExpression && this.mathExpression?.id;
  }

  removeMathExpression(index: number) {
    this.question.mathExpressions.splice(index, 1);
  }

  onRemoveMathExpression(index: number): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover da lista?',
      accept: () => {
        this.removeMathExpression(index);
      }
    });
  }

  toggleDropdown(question: Question) {
    question.isAdminMenuOpen = !question.isAdminMenuOpen
  }

  closeDropdown(question: Question) {
    question.isAdminMenuOpen = false;
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

  // Métodos de paginação
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
    return Math.ceil(this.totalRegistros / this.filtro.itemsPerPage);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Formata os minutos e segundos para ter 2 dígitos
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  getDifficultyLevelValue(level: string) {
    switch (level) {
      case 'EASY':
        return 'Fácil';
      case 'MEDIUM':
        return 'Médio';
      case 'HARD':
        return 'Dificil';
    }
    return '';
  }

  getFormattedText(text: string): string {
    // Negrito: **texto** → <strong>texto</strong>
    let textoFormatado = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Itálico: *texto* → <em>texto</em>
    textoFormatado = textoFormatado.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Quebras de linha: \n → <br>
    return textoFormatado.replace(/\n/g, '<br>');
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.text = "";
    this.filtro.subject = undefined;
    this.filtro.topic = undefined;
    this.findAll();
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

