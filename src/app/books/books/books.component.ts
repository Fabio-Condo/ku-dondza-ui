import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { BookFilter } from 'src/app/core/interface/BookFilter';
import { Book } from 'src/app/core/model/Book';
import { BooksService } from '../books.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Subject } from 'src/app/core/model/Subject';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/model/User';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {

  showLoading: boolean = false;
  totalRegistros: number = 0;
  books: Book[] = [];
  book: Book = new Book();
  selectedBook: Book = new Book();

  displayModalSave: boolean = false;
  isDropdownOpen: boolean = false;
  file!: File;
  coverImageFile!: File;
  totalBooks: number = 0;
  displayModalFilter: boolean = false;
  subjects: Subject[] = [];

  private subscriptions: Subscription[] = [];

  displayModalLogin: boolean = false;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  loadingMessage = "Carregando"; // Alterar dinamicamente

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  filtro: BookFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc',
  };


  constructor(
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private booksService: BooksService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Books page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.findAll(0);
    this.carregarDisciplinas();
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.book.id)
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
    this.booksService.update(this.book, this.file, this.coverImageFile).subscribe(
      response => {
        this.book = response
        this.messageService.add({ severity: 'success', detail: 'Livro actualizado com sucesso!' });
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
    this.booksService.save(this.book, this.file, this.coverImageFile).subscribe(
      response => {
        this.book = response
        this.messageService.add({ severity: 'success', detail: 'Livro salvo com sucesso!' });
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

  onCoverImageFileSelected(event: any) {
    this.coverImageFile = event.target.files[0];
  }

  findAll(pagina: number = 0): void {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.booksService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Book>) => {
        this.books = dados.content
        this.totalRegistros = dados.totalElements;
        if (this.totalBooks == 0) {
          this.totalBooks = dados.totalElements;
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
    this.showLoading = true;
    this.filtro.pagina++;

    this.booksService.findAll(this.filtro).subscribe(
      (data: IApiResponse<Book>) => {
        this.books = [...this.books, ...data.content];

        this.totalRegistros = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(book: Book) {
    this.booksService.excluir(book.id!).subscribe(() => {
      this.findAll();
      this.messageService.add({ severity: 'success', detail: 'Livro excluído com sucesso!' })
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
  }

  confirmarExclusao(book: Book): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(book);
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

  toggleDropdown(book: Book) {
    book.isAdminMenuOpen = !book.isAdminMenuOpen
  }

  closeDropdown(book: Book) {
    book.isAdminMenuOpen = false;
  }

  onAddNewBook(): void {
    this.book = new Book();
    this.displayModalSave = true;
  }

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  public onUpdate(book: Book, file: File): void {
    this.book = book
    this.file = file;
    this.displayModalSave = true;
  }

  onDownload(book: Book) {
    this.selectedBook = book;
    if (this.isUserLoggedIn) {
      this.download(book);
    }

    if (!this.isUserLoggedIn) {
      this.displayModalLogin = true;
      setTimeout(() => {
        this.initializeGoogleAuth();
      }, 100); // Espera para o botão estar no DOM
      return;
    }
  }

  download(book: Book): void {
    book.showLoadingDownload = true;
    this.booksService.download(book.id, book.fileName).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = book.fileName;

      // Simular um clique no link para iniciar o download
      link.click();

      // Limpar o link após o download iniciar
      window.URL.revokeObjectURL(link.href);
      //this.findAll(this.paginaAtual)
      book.showLoadingDownload = false;
    },
      (errorResponse: HttpErrorResponse) => {
        book.showLoadingDownload = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.subject = undefined;
    this.filtro.name = "";
    this.filtro.description = "";
    this.filtro.author = "";
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
    return Math.ceil(this.totalRegistros / this.filtro.itensPorPagina);
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

        this.download(this.selectedBook);
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

        this.download(this.selectedBook);
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
      const setupButton = await this.googleAuthService.initializeGoogleButton('google-signin-button');
      setupButton((credential) => this.handleGoogleCredential(credential));
    } catch (error) {
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
          this.download(this.selectedBook)
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
