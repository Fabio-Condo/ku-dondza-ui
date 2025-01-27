import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { TopicFilter } from 'src/app/core/interface/TopicFilter';
import { Subject } from 'src/app/core/model/Subject';
import { Topic } from 'src/app/core/model/Topic';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { TopicService } from 'src/app/topics/topicsService.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.css']
})
export class TopicsComponent implements OnInit {

  topics: Topic[] = [];
  topic: Topic = new Topic();
  selectedTopic: Topic = new Topic();
  subjects: Subject[] = [];

  showLoading: boolean = false;
  totalRegistros: number = 0;
  totalTopics: number = 0;
  displayModalSave: boolean = false;
  displayModalFilter: boolean = false;
  displayModalView: boolean = false;
  isDropdownOpen: boolean = false;
  isAdmin: boolean = false;

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: TopicFilter = {
    pagina: 0,
    itensPorPagina: 5,
    ordenamento: 'id,asc'
  };

  constructor(
    private topicService: TopicService,
    private subjectsService: SubjectsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.findAll();
    this.carregarDisciplinas();
    this.buscarTotal();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get editing() {
    return Boolean(this.topic.id);
  }

  save(topicForm: NgForm) {
    if (this.editing) {
      this.update(topicForm);
    } else {
      this.addNew(topicForm);
    }
  }

  addNew(topicForm: NgForm) {
    this.showLoading = true;
    this.topicService.add(this.topic).subscribe(
      (response) => {
        this.topic = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Tópico adicionado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  update(topicForm: NgForm) {
    this.showLoading = true;
    this.topicService.update(this.topic).subscribe(
      (response) => {
        this.topic = response;
        this.showLoading = false;
        this.messageService.add({ severity: 'success', detail: 'Tópico alterado com sucesso!' });
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  excluir(topic: Topic) {
    this.topicService.excluir(topic.id).subscribe(() => {
      this.findAll();
      this.buscarTotal();
      this.messageService.add({ severity: 'success', detail: 'Tópico excluído com sucesso!' });
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  confirmarExclusao(topic: Topic): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(topic);
      }
    });
  }

  findAll(pagina: number = 0): void {
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.topicService.filter(this.filtro).subscribe(
      (dados: IApiResponse<Topic>) => {
        this.topics = dados.content;
        this.totalRegistros = dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  buscarTotal() {
    this.topicService.buscarTotal().subscribe(
      (total) => {
        this.totalTopics = total;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
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

  onUpdateTopic(topic: Topic): void {
    this.topic = topic;
    this.displayModalSave = true;
  }

  onAddNewTopic(): void {
    this.topic = new Topic();
    this.displayModalSave = true;
  }

  onView(topic: Topic): void {
    this.selectedTopic = topic;
    this.displayModalView = true;
  }

  toggleDropdown(topic: Topic) {
    topic.isAdminMenuOpen = !topic.isAdminMenuOpen
  }

  closeDropdown(topic: Topic) {
    topic.isAdminMenuOpen = false;
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
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
