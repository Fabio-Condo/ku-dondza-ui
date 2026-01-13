import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicTestDTO } from 'src/app/core/model/TopicTestDTO';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { MainPanelService } from '../main-panel.service';
import { TopicWithTestsDTO } from 'src/app/core/model/TopicWithTestsDTO';
import { Topic } from 'src/app/core/model/Topic';
import { Subject } from 'src/app/core/model/Subject';
import { Role } from 'src/app/enum/role.enum';
import { NgForm } from '@angular/forms';
import { TopicService } from 'src/app/topics/topicsService.service';
import { QuestionService } from 'src/app/questions/question.service';
import { Question } from 'src/app/core/model/Question';
declare const MathJax: any;
import { e, evaluate } from 'mathjs'; //npm install mathjs

@Component({
  selector: 'app-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.css']
})
export class MainPanelComponent implements OnInit {

  topicTest: TopicTestDTO = new TopicTestDTO();
  topicWithTests: TopicWithTestsDTO[] = [];
  subjects: Subject[] = [];
  topics: Topic[] = [];

  questions: Question[] = [];
  displayModalQuestionsList: boolean = false;
  currentQuestionIndex = 0;

  selectedQuestions: Question[] = [];
  displayModalSelectedQuestionsList: boolean = false;

  selectedSubject: Subject = new Subject();
  //selectedUser: User = new User();
  loggedUser: User = new User();

  showLoading = false;
  loadingMessage = 'Carregando';

  displayModalSave: boolean = false;

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;


  difficultyLevels = [
    { label: 'Iniciante', value: 'BEGINNER' },
    { label: 'Intermediário', value: 'INTERMEDIATE' },
    { label: 'Avançado', value: 'ADVANCED' },
  ];

  constructor(
    private mainPanelService: MainPanelService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private questionService: QuestionService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  /* =========================
     CICLO DE VIDA
     ========================= */

  ngOnInit(): void {
    this.title.setTitle('Painel Principal');
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    //const selectedUserId = this.route.snapshot.params['id'];
    //this.selectedUser.id = selectedUserId;

    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.topicTest.id);
  }

  save(subjectForm: NgForm) {
    if (this.editing) {
      this.update(subjectForm);
    } else {
      this.addNew(subjectForm);
    }
  }

  addNew(testForm: NgForm) {

    this.showLoading = true;
    this.mainPanelService.add(this.topicTest).subscribe(
      (response) => {
        this.topicTest = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Teste adicionado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(testForm: NgForm) {
    this.showLoading = true;
    this.mainPanelService.update(this.topicTest).subscribe(
      (response) => {
        this.topicTest = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Teste alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdateTopicTest(topicTest: TopicTestDTO): void {
    this.topicTest = topicTest;
    this.displayModalSave = true;
  }

  onAddNewTopicTest(): void {
    this.topicTest = new TopicTestDTO();
    this.getTopicsBySubjectId();
    this.displayModalSave = true;
  }

  getTopicsBySubjectId() {

    this.loadingMessage = "Carregando tópicos"
    this.showLoading = true;

    this.topicService.getBySubjectId(this.selectedSubject.id!).subscribe({
      next: (dados) => {
        this.topics = [];
        this.topics = dados;
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  onGetSelectedQuestionsByTopicId(topicTest: TopicTestDTO) {
    this.topicTest = topicTest;
    this.getSelectedQuestionsByTopicId(this.topicTest);
    this.displayModalSelectedQuestionsList = true;
    document.body.classList.add('no-scroll');
  }

  onCloseSelectedQuestionsList() {
    this.displayModalSelectedQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  getSelectedQuestionsByTopicId(topicTest: TopicTestDTO): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.mainPanelService.getQuestionsByTopicTestId(topicTest.id).subscribe(
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

  onGetQuestionsByTopicId(topicTest: TopicTestDTO) {
    this.topicTest = topicTest;
    this.findAllByTopicAndMarkSelected(this.topicTest);
    this.displayModalQuestionsList = true;
    document.body.classList.add('no-scroll');
  }

  onCloseQuestionList() {
    this.displayModalQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  // USADO PARA ADD QUESTIONS NOS TESTES DE PROGRESSO
  findAllByTopicAndMarkSelected(topicTest: TopicTestDTO): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.questionService.findAllByTopicAndMarkSelected(topicTest.id).subscribe(
      (dados: Question[]) => {
        this.questions = dados;
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

  onAddQuestionToTopicTestQuestions(questionId: number): void {
    this.addQuestionToTopicTestQuestions(questionId);
  }

  addQuestionToTopicTestQuestions(questionId: number): void {
    this.loadingMessage = 'Adicionando questão';
    this.showLoading = true;

    this.mainPanelService.addQuestionToTopicTestQuestions(this.topicTest.id, questionId).subscribe({
      next: (topicTest) => {
        this.messageService.add({ severity: 'success', detail: 'Questão adicionada com sucesso!' });
        this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  onRemoveQuestionFromTopicTestQuestions(questionId: number): void {
    this.removeQuestionFromTopicTestQuestions(questionId);
  }

  removeQuestionFromTopicTestQuestions(questionId: number): void {
    this.loadingMessage = 'Removendo questão';
    this.showLoading = true;

    this.mainPanelService.removeQuestionFromTopicTestQuestions(this.topicTest.id, questionId).subscribe({
      next: (topicTest) => {
        this.messageService.add({ severity: 'success', detail: 'Questão removida com sucesso!' });
        this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
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

  /* =========================
     NAVEGAÇÃO
     ========================= */

  startTopicTest(topicTest: TopicTestDTO): void {
    this.router.navigate(['/quizzes', 'test'], {
      queryParams: {
        from: 'subject-progress',
        progressTestId: topicTest.id
      }
    });
  }

  reviewTest(topicTest: TopicTestDTO): void {
    const quizId = topicTest.submittedQuizzes?.[0]?.quizId;
    if (!quizId) return;

    this.router.navigate(['/quizzes', quizId]);
  }

  /* =========================
     CARREGAMENTO DE DADOS
     ========================= */

  carregarDisciplinas(): void {
    this.loadingMessage = 'Carregando disciplinas';
    this.showLoading = true;

    this.subjectsService.findAll().subscribe({
      next: (dados) => {
        this.subjects = dados;
        this.selectedSubject = this.subjects[0];
        this.getTopicTestsBySubjectId();
        //this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.sendErrorNotification(error.error.message);
        this.showLoading = false;
      }
    });
  }

  onSelectSubject(subject: Subject): void {
    this.selectedSubject = subject;
    this.getTopicTestsBySubjectId();
  }

  getTopicTestsBySubjectId(): void {
    this.loadingMessage = 'Obtendo o progresso';
    this.showLoading = true;

    this.mainPanelService.getBySubjectId(this.selectedSubject.id, this.loggedUser.id).subscribe({
        next: (dados) => {
          this.topicWithTests = dados;
          this.showLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.sendErrorNotification(error.error.message);
          this.showLoading = false;
        }
      });
  }

  /* =========================
     PROGRESSOS (TAXAS)
     ========================= */

  isCompleted(test: TopicTestDTO): boolean {
    return !!test.submittedQuizzes && test.submittedQuizzes.length > 0;
  }

  getTopicProgress(topic: TopicWithTestsDTO): number {
    if (!topic.tests || topic.tests.length === 0) return 0;

    const completed = topic.tests.filter(t => this.isCompleted(t)).length;
    return Math.round((completed / topic.tests.length) * 100);
  }

  getDisciplineProgress(): number {
    if (!this.topicWithTests || this.topicWithTests.length === 0) return 0;

    const totalTests = this.topicWithTests.reduce(
      (sum, topic) => sum + topic.tests.length,
      0
    );

    if (totalTests === 0) return 0;

    const completedTests = this.topicWithTests.reduce((sum, topic) => {
      return sum + topic.tests.filter(t => this.isCompleted(t)).length;
    }, 0);

    return Math.round((completedTests / totalTests) * 100);
  }

  /* =========================
     DESBLOQUEIO SEQUENCIAL
     ========================= */

  getFirstIncompleteIndex(topic: TopicWithTestsDTO): number {
    return topic.tests.findIndex(test => !this.isCompleted(test));
  }

  isActive(topic: TopicWithTestsDTO, test: TopicTestDTO, index: number): boolean {
    if (this.isCompleted(test)) return false;
    return index === this.getFirstIncompleteIndex(topic);
  }

  isLocked(topic: TopicWithTestsDTO, test: TopicTestDTO, index: number): boolean {
    return !this.isCompleted(test) && !this.isActive(topic, test, index);
  }

  /* =========================
     UTILIDADES
     ========================= */

  getDifficultyLevelValue(level: string): string {
    switch (level) {
      case 'BEGINNER': return 'Iniciante';
      case 'INTERMEDIATE': return 'Intermediário';
      case 'ADVANCED': return 'Avançado';
      default: return '';
    }
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

  renderMathExpressions(): void {
    setTimeout(() => {
      const mathContainer = document.getElementById(`math-container-${this.currentQuestionIndex}`);
      if (mathContainer && typeof MathJax !== 'undefined') {
        mathContainer.innerHTML = this.getFormattedText(this.questions[this.currentQuestionIndex].text);
      }

      const mathContainerSolution = document.getElementById(`math-container-solution-${this.currentQuestionIndex}`);
      if (mathContainerSolution && typeof MathJax !== 'undefined') {
        mathContainerSolution.innerHTML = this.getFormattedText(this.questions[this.currentQuestionIndex].solution);
      }

      const mathContainerTip = document.getElementById(`math-container-tip-${this.currentQuestionIndex}`);
      if (mathContainerTip && typeof MathJax !== 'undefined') {
        mathContainerTip.innerHTML = this.getFormattedText(this.questions[this.currentQuestionIndex].tip);
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
      if (!canvas || !this.questions[this.currentQuestionIndex].mathExpressions || this.questions[this.currentQuestionIndex].mathExpressions.length === 0) return;


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

      this.questions[this.currentQuestionIndex].mathExpressions.forEach((express, index) => {
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

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }
}
