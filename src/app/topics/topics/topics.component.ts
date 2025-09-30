import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { TopicFilter } from 'src/app/core/interface/TopicFilter';
import { Subject } from 'src/app/core/model/Subject';
import { Topic } from 'src/app/core/model/Topic';
import { Role } from 'src/app/enum/role.enum';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { TopicService } from 'src/app/topics/topicsService.service';
import { AuthenticationService } from 'src/app/users/authentication.service';

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

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  isUserLoggedIn: boolean = false;

  // Paginação
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];
  filtro: TopicFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc'
  };

  constructor(
    private topicService: TopicService,
    private subjectsService: SubjectsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Topics page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.findAll();
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
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.topicService.filter(this.filtro).subscribe(
      (dados: IApiResponse<Topic>) => {
        this.topics = dados.content;
        this.totalRegistros = dados.totalElements;
        if (this.totalTopics == 0) {
          this.totalTopics = dados.totalElements;
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
    this.filtro.pagina++;

    this.topicService.filter(this.filtro).subscribe(
      (data: IApiResponse<Topic>) => {
        this.topics = [...this.topics, ...data.content];

        this.totalRegistros = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  get isLoadMoreDisabled(): boolean {
    return this.topics.length >= this.totalRegistros && this.totalRegistros > 0;
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

  toggleFilter(): void {
    this.displayModalFilter = !this.displayModalFilter;

    if (this.displayModalFilter) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
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
    this.topics.forEach(t => {
      if (t !== topic) {
        t.isAdminMenuOpen = false;
      }
    });
    topic.isAdminMenuOpen = !topic.isAdminMenuOpen;
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

  limparCampos() {
    this.filtro.searchParam = "";
    this.filtro.name = "";
    this.filtro.subject = undefined;
    this.findAll();
  }

  shareOnSocial(network: string, topicId: string): void {
    const baseUrl = `${window.location.origin}/topics/${topicId}`; // link do item
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

  copyLink(topicId: string): void {
    const link = window.location.href; // pega a URL atual, ou pode ser um link específico

    navigator.clipboard.writeText(link + `/${topicId}`).then(() => {
      console.log(`Link do item ${topicId} copiado!`);
    }).catch(err => {
      console.error("Erro ao copiar link: ", err);
    });
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
      this.messageService.add({ severity: 'error', detail: 'Ocorreu um erro. Por favor, tente novamente.' });
    }
  }
}
