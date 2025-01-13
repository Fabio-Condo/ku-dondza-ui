import { Component, OnInit } from '@angular/core';
import { BookFilter } from 'src/app/core/interface/BookFilter';
import { Book } from 'src/app/core/model/Book';
import { BooksService } from '../books.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';

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
  displayModalSave: boolean = false;
  isDropdownOpen: boolean = false;
  file!: File;
  totalbooks: number = 0;
  displayModalFilter: boolean = false;
  subjects: any[] = [];
  isAdmin: boolean = false;

  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  filtro: BookFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc',
  };


  constructor(
    private booksService: BooksService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.findAll(0);
    this.buscarTotal();
    this.carregarDisciplinas();
    this.scrollToTop();
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
    this.booksService.update(this.book, this.file).subscribe(
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
    this.booksService.save(this.book, this.file).subscribe(
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

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.booksService.findAll(this.filtro).subscribe(
      (dados: IApiResponse<Book>) => {
        this.books = dados.content
        this.totalRegistros = dados.totalElements
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
    return this.subjectsService.findAll().subscribe(
      dados => {
        this.subjects = dados.map(dado => {
          return {
            label: dado.name,
            value: dado.id
          }
        })
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  buscarTotal() {
    this.booksService.buscarTotal().subscribe(
      (total) => {
        this.totalbooks = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
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

  onFilter(): void {
    this.displayModalFilter = true;
  }

  public onUpdate(book: Book, file: File): void {
    this.book = book
    this.file = file;
    this.displayModalSave = true;
  }


  download(book: Book, filename: string): void {
    book.showLoadingDownload = true;
    this.booksService.download(book.id, filename).subscribe((data: Blob) => {
      const blob = new Blob([data], { type: 'application/octet-stream' });

      // Criar um link temporário para o Blob
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      // Definir o atributo "download" com o nome do arquivo
      link.download = filename;

      // Simular um clique no link para iniciar o download
      link.click();

      // Limpar o link após o download iniciar
      window.URL.revokeObjectURL(link.href);
      //this.findAll(this.paginaAtual)
      book.showLoadingDownload = false;
    });
  }

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.subject = undefined;
    this.filtro.name = "";
    this.filtro.description = "";
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
