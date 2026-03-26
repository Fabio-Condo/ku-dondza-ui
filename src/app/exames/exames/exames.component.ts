import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Role } from 'src/app/enum/role.enum';
import { Exam } from 'src/app/core/model/Exame';
import { ExameFilter } from 'src/app/core/interface/ExameFilter';
import { ExamesService } from '../exames.service';
import { User } from 'src/app/core/model/User';
import { Title } from '@angular/platform-browser';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Wallet } from 'src/app/core/model/Wallet';
import { NgForm } from '@angular/forms';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { UserService } from 'src/app/users/user.service';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';

@Component({
  selector: 'app-exames',
  templateUrl: './exames.component.html',
  styleUrls: ['./exames.component.css']
})
export class ExamesComponent implements OnInit {

  showLoading: boolean = false;
  retryVisible: boolean = false;

  exams: Exam[] = [];
  exam: Exam = new Exam();
  displayModalSave: boolean = false;
  isDropdownOpen: boolean = false;
  file!: File;
  totalExames: number = 0;
  displayModalFilter: boolean = false;
  subjects: Subject[] = [];

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  currentMessage: string | null = null;

  totalRecords: number = 0;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  private subscriptions: Subscription[] = [];
  displayModalLogin: boolean = false;

  wallet: Wallet = new Wallet();
  userWallets: Wallet[] = [];
  selectedWalletId: number = 0;

  displayModalQuestionsList: boolean = false;
  displayModalUpgradePlan: boolean = false;
  displayModalPaymentOptions: boolean = false;
  displayModalAddPaymentOption: boolean = false;

  googleAuthReady = true;

  filtro: ExameFilter = {
    examType: '',
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc',
  };

  @ViewChild('tabela') grid: any;

  anos = [
    { label: '2025', value: 2025 },
    { label: '2024', value: 2024 },
    { label: '2023', value: 2023 },
    { label: '2022', value: 2022 },
    { label: '2021', value: 2021 },
    { label: '2020', value: 2020 },
    { label: '2019', value: 2019 },
    { label: '2018', value: 2018 },
    { label: '2017', value: 2017 },
    { label: '2016', value: 2016 },
    { label: '2015', value: 2015 },
    { label: '2014', value: 2014 },
    { label: '2013', value: 2017 },
    { label: '2012', value: 2016 },
    { label: '2011', value: 2011 },
    { label: '2010', value: 2010 },
    { label: '2009', value: 2009 },
    { label: '2008', value: 2008 },
    { label: '2007', value: 2007 },
    { label: '2006', value: 2006 },
    { label: '2005', value: 2005 },
  ];

  niveis = [
    { label: 'Ensino Superior', value: 'Ensino Superior' },
    { label: 'Ensino Técnico', value: 'Ensino Técnico' },
    { label: 'Ensino Geral', value: 'Ensino Geral' },
  ];

  examTypes = [
    { label: 'Enunciado', value: 'ENUNCIADO' },
    { label: 'Resolução', value: 'RESOLUCAO' },
    //  { label: 'Todos tipos', value: '' },
  ];

  institutions = [
    { label: 'Universidade Eduardo Mondlane', value: 'UEM' },
    { label: 'Universidade Pedagógica', value: 'UP' },
    //  { label: 'Todas', value: '' },
  ];

  accessLevels = [
    { label: 'Premium', value: true },
    { label: 'Free', value: false },
  ];

  numbers = [
    { label: 'I', value: "I" },
    { label: 'II', value: "II" },
    { label: 'III', value: "III" },
    { label: 'Nenhum', value: "" },
  ];

  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private examesService: ExamesService,
    private walletService: WalletService,
    private userService: UserService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Questions page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll(0);
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.exam.id)
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
    this.examesService.update(this.exam.id, this.exam.examType, this.exam.institution, this.exam.premium, this.exam.year, this.exam.subject.id!, this.exam.number, this.file).subscribe(
      response => {
        this.exam = response
        this.exam.date = new Date(this.exam.date);
        this.messageService.add({ severity: 'success', detail: 'Exame actualizado com sucesso!' });
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
    this.examesService.save(this.exam.examType, this.exam.institution, this.exam.premium, this.exam.year, this.exam.subject.id!, this.exam.number, this.file).subscribe(
      response => {
        this.exam = response
        this.exam.date = new Date(this.exam.date);
        this.messageService.add({ severity: 'success', detail: 'Exame salvo com sucesso!' });
        this.showLoading = false;
        this.findAll();
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  findAll(pagina: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.examesService.findAll(this.filtro).pipe(
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
      (dados: IApiResponse<Exam>) => {
        this.exams = dados.content
        this.totalRecords = dados.totalElements;
        this.totalExames = this.totalExames || dados.totalElements;
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

    this.filtro.pagina++;

    this.examesService.findAll(this.filtro).subscribe(
      (data: IApiResponse<Exam>) => {
        this.exams = [...this.exams, ...data.content];
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  retryGetExames(): void {
    this.retryVisible = false;
    this.filtro.pagina = 0;
    this.findAll(this.currentPage);
    this.carregarDisciplinas();
  }

  excluir(exam: Exam) {
    this.loadingMessage = "Excluindo exame";
    this.showLoading = true;
    this.examesService.excluir(exam.id!).subscribe(() => {
      this.showLoading = false;
      this.findAll();
      this.messageService.add({ severity: 'success', detail: 'Exame excluído com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(exam: Exam): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(exam);
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

  toggleDropdown(exam: Exam) {
    exam.isAdminMenuOpen = !exam.isAdminMenuOpen
  }

  closeDropdown(exam: Exam) {
    exam.isAdminMenuOpen = false;
  }

  onAddNewExame(): void {
    this.exam = new Exam();
    this.displayModalSave = true;
  }

  onFilter(): void {
    this.displayModalFilter = true;
  }

  get isLoadMoreDisabled(): boolean {
    return this.exams.length >= this.totalRecords && this.totalRecords > 0;
  }

  public onUpdate(exam: Exam, file: File): void {
    this.exam = exam;
    this.file = file;
    this.exam.date = new Date(this.exam.date);
    this.displayModalSave = true;
  }

  // bloqueia clique se o tópico Premium não estiver liberado para o usuário logado
  isPremiumExam(exam: Exam): boolean {
    if (!exam.premium) return false;

    // ADMIN sempre tem acesso
    if (this.isUserLoggedIn && this.isAdmin) return false;

    // desabilita se não estiver logado ou se estiver no plano FREE
    return this.isFreeUser(); ``
  }

  isFreeUser(): boolean {
    if (!this.loggedUser || this.loggedUser.id === 0) return true;

    const planExpiresAt = this.loggedUser.planExpiresAt ? new Date(this.loggedUser.planExpiresAt) : null;
    return this.loggedUser.plan === 'FREE' || !planExpiresAt || planExpiresAt <= new Date();
  }

  getLevelValue(status: string) {
    switch (status) {
      case 'Ensino Geral':
        return 'Masculino';
      case 'FEMININE':
        return 'Feminino';
    }
    return '';
  }

  getLevel(status: string) {
    switch (status) {
      case 'Ensino Geral':
        return 'primmary';
      case 'FEMININE':
        return 'info';
    }
    return '';
  }

  getTypeValue(type: string) {
    switch (type) {
      case 'ENUNCIADO':
        return 'Enunciado';
      case 'RESOLUCAO':
        return 'Resolução';
    }
    return '';
  }

  getBadgeClass(type: string): string {
    switch (type) {
      case 'ENUNCIADO':
        return 'badge-enunciado';
      case 'RESOLUCAO':
        return 'badge-resolvido';
      default:
        return '';
    }
  }

  getType(type: string): string {
    switch (type) {
      case 'ENUNCIADO':
        return 'Enunciado';
      case 'RESOLUCAO':
        return 'Resolução';
      default:
        return '';
    }
  }

  getInstitution(institution: string): string {
    switch (institution) {
      case 'UEM':
        return 'Universidade Eduardo Mondlane';
      case 'UP':
        return 'Universidade Pedagógica';
      default:
        return '';
    }
  }

  onDownload(exam: Exam) {
    this.download(exam);
  }

  download(exam: Exam): void {
    exam.showLoadingDownload = true;
    this.examesService.download(exam.id, exam.fileName).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = exam.fileName;

      // Simular um clique no link para iniciar o download
      link.click();

      // Limpar o link após o download iniciar
      window.URL.revokeObjectURL(link.href);
      //this.findAll(this.paginaAtual)
      exam.showLoadingDownload = false;
    },
      (errorResponse: HttpErrorResponse) => {
        exam.showLoadingDownload = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  getWalletsByUser(userId: number): void {
    this.loadingMessage = "Obtendo dados"
    this.showLoading = true;
    this.walletService.getWalletsByUser(userId).subscribe(
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

    this.displayModalLogin = true;
    setTimeout(() => {
      this.displayModalUpgradePlan = false;
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
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

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.subject = undefined;
    this.filtro.examType = "";
    this.filtro.institution = "";
    this.filtro.beginYear = undefined;
    this.filtro.endYear = undefined;
    this.filtro.pagina = 0;
    this.filtro.itensPorPagina = 10;
    this.filtro.ordenamento = "id,desc"
    this.findAll();
  }

  changePageSize(event: any): void {
    this.filtro.itensPorPagina = +event.target.value;
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
    return Math.ceil(this.totalRecords / this.filtro.itensPorPagina);
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

  sendOtp() {
    this.showLoading = true;
    //const email = this.otpForm.value.email!;
    this.authenticationService.generateOtp(this.user.email).subscribe({
      next: () => {
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  validateOtp() {
    this.showLoading = true;
    this.authenticationService.validateOtp(this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        //this.findById(this.question.questionId);

        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  startRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.startRegistrationViaOtp(this.user.email).subscribe({
      next: (response) => {
        console.log(response.body)
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  completeRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.completeRegistrationViaOtp(this.user.fullName, this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();

        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  private async initializeGoogleAuth(): Promise<void> {
    try {
      const setupButton =
        await this.googleAuthService.initializeGoogleButton('google-signin-button');

      setupButton((credential) => this.handleGoogleCredential(credential));

      // só ativa o botão se tudo correr bem
      this.googleAuthReady = true;

    } catch (error) {
      this.googleAuthReady = false;

      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar autenticação Google',
        life: 5000
      });
    }
  }

  private handleGoogleCredential(googleCredential: string): void {
    this.ngZone.run(() => {
      this.loadingMessage = "Estamos quase lá";
      this.showLoading = true;
    });

    const sub = this.authenticationService.loginWithGoogle(googleCredential).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();


        this.ngZone.run(() => {
          //this.findById(this.question.questionId);
          this.showLoading = false;
          this.displayModalLogin = false;
          document.body.classList.remove('no-scroll');
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
        this.showLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  onCloseLoginPopout() {
    this.displayModalLogin = false;
    document.body.classList.remove('no-scroll');
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}