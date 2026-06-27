import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Test } from 'src/app/core/model/Test';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Title } from '@angular/platform-browser';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Topic } from 'src/app/core/model/Topic';
import { Role } from 'src/app/enum/role.enum';
import { NgForm } from '@angular/forms';
import { TopicService } from 'src/app/topics/topicsService.service';
import { QuestionService } from 'src/app/questions/question.service';
import { Question } from 'src/app/core/model/Question';
import { ProgressService } from 'src/app/progress/progress.service';
import { SubjectProgressDTO } from 'src/app/core/model/SubjectProgressDTO';
import { TopicDtoWithTests } from 'src/app/core/model/TopicDtoWithTests';
import { Wallet } from 'src/app/core/model/Wallet';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { UserService } from 'src/app/users/user.service';
import { delayWhen, retryWhen, scan, timer } from 'rxjs';
declare const MathJax: any;
import { evaluate } from 'mathjs'; //npm install mathjs


@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.css']
})
export class TopicComponent {

 subject: SubjectProgressDTO = new SubjectProgressDTO();
  //subjects: Subject[] = [];

  test: Test = new Test();
  //topicTests: TopicTestsDTO[] = [];
  topics: Topic[] = [];

  allQuestions: Question[] = [];
  displayModalQuestionsList: boolean = false;
  currentQuestionIndex = 0;

  selectedQuestions: Question[] = [];
  displayModalSelectedQuestionsList: boolean = false;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  showLoading = false;
  loadingMessage = 'Carregando';

  displayModalSave: boolean = false;

  displayModalUpgradePlan: boolean = false;
  displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  @ViewChild('canvas', { static: false }) canvas!: ElementRef;


  difficultyLevels = [
    { label: 'Iniciante', value: 'BEGINNER' },
    { label: 'Intermediário', value: 'INTERMEDIATE' },
    { label: 'Avançado', value: 'ADVANCED' },
  ];

  constructor(
    private progressService: ProgressService,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
    private questionService: QuestionService,
    private userService: UserService,
    private walletService: WalletService,
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
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const selectedUserId = this.route.snapshot.params['id'];

    //this.getTestsBySubjectId(selectedUserId);
    this.getUserProgressSubject();
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.test.id);
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
    this.progressService.add(this.test).subscribe(
      (response) => {
        this.test = response;
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
    this.progressService.update(this.test).subscribe(
      (response) => {
        this.test = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Teste alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpdateTest(test: Test): void {
    this.test = test;
    this.displayModalSave = true;
  }

  onAddNewTest(): void {
    this.test = new Test();
    //this.getTopicsBySubjectId();

    this.topics = [];
    this.topics = this.subject.topicDtoWithTests.map(t => {
      const topic = new Topic();
      topic.id = t.topicId;
      topic.name = t.topicName;
      return topic;
    });

    this.displayModalSave = true;
  }

  getTopicsBySubjectId() {

    this.loadingMessage = "Carregando tópicos"
    this.showLoading = true;

    this.topicService.getBySubjectIdWithCache(this.subject.id!).subscribe({
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

  onGetSelectedQuestionsByTopicId(test: Test) {
    this.test = test;
    this.getSelectedQuestionsByTopicId(this.test);
    this.displayModalSelectedQuestionsList = true;
    document.body.classList.add('no-scroll');
  }

  onCloseSelectedQuestionsList() {
    this.displayModalSelectedQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  getSelectedQuestionsByTopicId(test: Test): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.progressService.getQuestionsByTestId(test.id).subscribe(
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

  onGetQuestionsByTopicId(test: Test) {
    this.test = test;
    this.findAllByTopicAndMarkSelected(this.test);
    this.displayModalQuestionsList = true;
    document.body.classList.add('no-scroll');
  }

  onCloseQuestionList() {
    this.displayModalQuestionsList = false;
    document.body.classList.remove('no-scroll');
  }

  // USADO PARA ADD QUESTIONS NOS TESTES DE PROGRESSO
  findAllByTopicAndMarkSelected(test: Test): void {
    this.loadingMessage = "Buscando questões";
    this.showLoading = true;

    this.questionService.findAllByTopicAndMarkSelected(test.id).subscribe(
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

  onAddQuestionToTestQuestions(questionId: number): void {
    this.addQuestionToTestQuestions(questionId);
  }

  addQuestionToTestQuestions(questionId: number): void {
    this.loadingMessage = 'Adicionando questão';
    this.showLoading = true;

    this.progressService.addQuestionToTestQuestions(this.test.id, questionId).subscribe({
      next: (test) => {

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

  onRemoveQuestionFromTestQuestions(questionId: number): void {
    this.removeQuestionFromTestQuestions(questionId);
  }

  removeQuestionFromTestQuestions(questionId: number): void {
    this.loadingMessage = 'Removendo questão';
    this.showLoading = true;

    this.progressService.removeQuestionFromTestQuestions(this.test.id, questionId).subscribe({
      next: (test) => {
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

  startTest(test: Test, topic: TopicDtoWithTests): void {

    //console.log("Premium: " + topic.premium)
    if (this.isPremiumTopic(topic)) {
      this.displayModalUpgradePlan = true;
      return;
    }

    this.router.navigate(['/quizzes', 'test'], {
      queryParams: {
        from: 'progress/subjects',
        progressTestId: test.id
      }
    });
  }

  reviewTest(test: Test): void {
    const quizId = test.submittedQuizzes?.[0]?.quizId;
    if (!quizId) return;

    this.router.navigate(['/quizzes', quizId], {
      queryParams: {
        from: 'progress/subjects'
      }
    });
  }

  /* =========================
     CARREGAMENTO DE DADOS
     ========================= */

  getUserProgressSubject(): void {
    this.loadingMessage = 'Carregando progresso';
    this.showLoading = true;

    const selectedSubjectId = this.route.snapshot.params['id'];

    this.subjectsService.getUserProgressSubject(this.loggedUser.id, selectedSubjectId).pipe(
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
    ).subscribe({
      next: (dado) => {
        this.subject = dado;
        this.showLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.showLoading = false;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else if (error.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(error.error.message);
        }
      }
    });
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumTopic(topic: TopicDtoWithTests): boolean {
    if (!topic.premium) return false;

    // ADMIN sempre tem acesso
    if (this.isUserLoggedIn && this.isAdmin) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser();
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const planExpiresAt = this.loggedUser.planExpiresAt ? new Date(this.loggedUser.planExpiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !planExpiresAt || planExpiresAt <= new Date();
  }

  isCompleted(test: Test): boolean {
    return !!test.submittedQuizzes && test.submittedQuizzes.length > 0;
  }

  getFirstIncompleteIndex(topic: TopicDtoWithTests): number {
    return topic.tests.findIndex(test => !this.isCompleted(test));
  }

  isActive(topic: TopicDtoWithTests, test: Test, index: number): boolean {
    if (this.isCompleted(test)) return false;
    return index === this.getFirstIncompleteIndex(topic);
  }

  isLocked(topic: TopicDtoWithTests, test: Test, index: number): boolean {
    return !this.isCompleted(test) && !this.isActive(topic, test, index);
  }

  getDifficultyLevelValue(level: string): string {
    switch (level) {
      case 'BEGINNER': return 'Iniciante';
      case 'INTERMEDIATE': return 'Intermediário';
      case 'ADVANCED': return 'Avançado';
      default: return '';
    }
  }

  getWalletsByUser(userId: number): void {
    this.loadingMessage = "Obtendo dados"
    this.showLoading = true;
    this.walletService.getWalletsByUser(userId).pipe(
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
      (dados: Wallet[]) => {
        this.userWallets = dados;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewWlletType(walletTypeForm: NgForm) {

    //this.wallet.user = this.loggedUser;

    this.detectWalletType(); // força atualização e validação

    const phone = this.wallet.phoneNumber || '';

    if (!this.wallet.type) {
      this.sendErrorNotification("Número inválido: prefixo deve ser 84, 85, 86 ou 87.");
      return;
    }

    if (phone.length !== 9) {
      this.sendErrorNotification("Número inválido: deve conter exatamente 9 dígitos.");
      return;
    }

    // Evitar duplicados
    const exists = this.userWallets.some(
      w => w.phoneNumber === phone
    );

    if (exists) {
      this.sendErrorNotification("Este número já está registado nas suas carteiras.");
      return;
    }

    // Definir como default se for a primeira carteira
    if (this.userWallets.length === 0) {
      this.wallet.default = true;
    } else {
      this.wallet.default = false;
    }

    this.loadingMessage = "Adicionando carteira"
    this.showLoading = true;
    this.walletService.add(this.loggedUser.id, this.wallet).subscribe(
      (response) => {
        console.log(response);
        this.wallet = response;

        this.userWallets.push(this.wallet);
        this.showLoading = false;
        this.displayModalAddPaymentOption = false;
        //this.messageService.add({ severity: 'success', detail: 'Disciplina adicionada com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onUpgradePlan(): void {
    if (this.isUserLoggedIn) {
      //this.upgradePlan();
      this.openModalPaymentOptions();
      return;
    }
  }

  upgradePlan() {
    // Se não tiver carteira selecionada, pega a default
    if (!this.selectedWalletId) {
      const defaultWallet = this.userWallets.find(w => w.default);
      if (defaultWallet) {
        this.selectedWalletId = defaultWallet.id!;
      } else {
        this.sendErrorNotification("Nenhuma carteira selecionada ou definida como principal.");
        return;
      }
    }

    this.loadingMessage = "Processando o pagamento";
    this.showLoading = true;

    this.userService.activatePlan(this.loggedUser.id, 'PREMIUM', this.selectedWalletId).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.onCloseUpgradeModal();
        this.onCloseModalPaymentOptions();
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  setDefaultWallet(wallet: Wallet) {

    if (!wallet.id) {
      this.sendErrorNotification('Carteira inválida: ID não definido');
      return;
    }

    this.userWallets.forEach(w => w.default = false); // limpa anterior
    wallet.default = true;

    this.walletService.setDefault(wallet.id).subscribe({
      next: (updatedWallet) => {
        // Atualiza visualmente todas as carteiras
        this.userWallets.forEach(w => w.default = w.id === updatedWallet.id);
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  openUpgradeModal() {
    this.displayModalUpgradePlan = true;
    document.body.classList.add('no-scroll');
  }

  onCloseUpgradeModal() {
    this.displayModalUpgradePlan = false;
    document.body.classList.remove('no-scroll');
  }

  openModalPaymentOptions() {

    if (this.userWallets.length === 0) {
      this.getWalletsByUser(this.loggedUser.id);
    }

    this.displayModalPaymentOptions = true;
    this.onCloseUpgradeModal();
    document.body.classList.add('no-scroll');
  }

  onCloseModalPaymentOptions() {
    this.displayModalPaymentOptions = false;
    document.body.classList.remove('no-scroll');
  }

  openModalAddPaymentOption() {
    this.displayModalAddPaymentOption = true;
  }

  onCloseModalAddPaymentOption() {
    this.displayModalAddPaymentOption = false;
  }

  detectWalletType(): void {
    const phone = this.wallet.phoneNumber ? this.wallet.phoneNumber.trim() : '';

    // Remove espaços e caracteres não numéricos
    const digitsOnly = phone.replace(/\D/g, '');

    // Define o telefone limpo
    this.wallet.phoneNumber = digitsOnly;

    // Validação do tamanho
    if (digitsOnly.length !== 9) {
      this.wallet.type = '';
      return;
    }

    // Verificação de prefixos válidos
    const prefix = digitsOnly.substring(0, 2);
    if (prefix === '84' || prefix === '85') {
      this.wallet.type = 'MPESA';
    } else if (prefix === '86' || prefix === '87') {
      this.wallet.type = 'EMOLA';
    } else {
      this.wallet.type = '';
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

  getTotalTests(subject: any): number {
    return subject.topicDtoWithTests.reduce(
      (total: number, topic: any) => total + (topic.tests?.length || 0),
      0
    ) || 0;
  }

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }
}

