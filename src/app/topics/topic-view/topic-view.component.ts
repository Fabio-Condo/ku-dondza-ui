import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Topic } from 'src/app/core/model/Topic';
import { User } from 'src/app/core/model/User';
import { QuestionService } from 'src/app/questions/question.service';
import { QuizService } from 'src/app/quiz/quiz.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { TopicService } from '../topicsService.service';
import { TopicContent } from 'src/app/core/model/Topic-content';
import { TopicContentService } from '../TopicContentService.service';
import { Role } from 'src/app/enum/role.enum';

@Component({
  selector: 'app-topic-view',
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.css']
})
export class TopicViewComponent implements OnInit {

  topic: Topic = new Topic();
  showLoading: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  displayModalSaveContent: boolean = false;
  topicContent: TopicContent = new TopicContent();
  topicContentFile!: File;

  contentType = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'File', value: 'FILE' },
  ];


  constructor(
    private topicService: TopicService,
    private topicContentService: TopicContentService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }


  ngOnInit(): void {
    this.title.setTitle('Topic view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const questionId = this.route.snapshot.params['id'];
    if (questionId) {
      this.findById(questionId);
    }
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startQuestions() {
    this.router.navigate(['/questions', this.topic.questions[0].questionId], {
      queryParams: {
        from: 'topics',
        topicId: this.route.snapshot.paramMap.get('id')  // o ID do tópico atual
      }
    });
  }

  findById(id: string) {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;
    this.topicService.getTopicByTopicId(id).subscribe(
      (response) => {
        this.topic = response;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        if (errorResponse.status == 400) {
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  get editingContent() {
    return Boolean(this.topicContent.id)
  }

  saveContent() {
    if (this.editingContent) {
      this.updateContent()
    } else {
      this.addNewContent()
    }
  }

  updateContent() {
    if (this.topicContent.contentType === 'FILE') {
      this.topicContent.time = '0';
    }
    this.loadingMessage = "Atualizando o conteúdo";
    this.showLoading = true;
    this.topicContent.topic = this.topic;
    this.topicContentService.update(this.topicContent, this.topicContentFile).subscribe(
      response => {
        this.topicContent = response
        this.messageService.add({ severity: 'success', detail: 'Conteúdo actualizado com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  addNewContent() {
    if (this.topicContent.contentType === 'FILE') {
      this.topicContent.time = '0';
    }
    this.loadingMessage = "Adicionando o conteúdo";
    this.showLoading = true;
    this.topicContent.topic = this.topic;
    this.topicContentService.save(this.topicContent, this.topicContentFile).subscribe(
      response => {
        this.topicContent = response
        this.messageService.add({ severity: 'success', detail: 'Conteúdo salvo com sucesso!' });
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  onAddNewTopicContent(): void {
    this.topicContent = new TopicContent();
    this.displayModalSaveContent = true;
  }

  onUpdateTopicContent(content: TopicContent, file: File): void {
    this.topicContent = content;
    this.topicContent.contentType = content.contentType;
    this.topicContent.time = content.time;
    this.topicContent.topic = this.topic;
    this.topicContentFile = file;
    this.displayModalSaveContent = true;
  }

  onTopicContentFileSelected(event: any) {
    this.topicContentFile = event.target.files[0];
  }

  download(content: TopicContent, filename: string): void {
    content.showLoadingDownload = true;
    this.topicContentService.download(content.id, filename).subscribe((data: Blob) => {
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
      content.showLoadingDownload = false;
    },
      (errorResponse: HttpErrorResponse) => {
        content.showLoadingDownload = false;
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  confirmarExclusao(content: TopicContent): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir?',
      accept: () => {
        this.excluir(content);
      }
    });
  }

  excluir(content: TopicContent) {
    this.topicContentService.excluir(content.id).subscribe(() => {
      this.messageService.add({ severity: 'success', detail: 'Instituição excluída com sucesso!' })
      //this.buscarTotal();
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    )
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
