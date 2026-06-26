import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { delayWhen, retryWhen, scan, timer } from 'rxjs';
import { AuthModalService } from 'src/app/core/auth-modal.service';
import { ConversationFilter } from 'src/app/core/interface/ConversationFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { TutorMessageResponse } from 'src/app/core/model/TutorMessageResponse';
import { TutorRequest } from 'src/app/core/model/TutorRequest';
import { User } from 'src/app/core/model/User';
import { TutorAiService } from 'src/app/core/tutor-ai.service';
import { TutorConversationService } from 'src/app/core/tutor-conversation.service';
import { WalletService } from 'src/app/core/wallets/answers.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';

@Component({
  selector: 'app-tutor-ai',
  templateUrl: './tutor-ai.component.html',
  styleUrls: ['./tutor-ai.component.css']
})
export class TutorAiComponent {

  tutorRequest: TutorRequest = new TutorRequest();
  tutorResponse: string = '';
  showTutorThinking: boolean = false;

  tutorMessages: TutorMessageResponse[] = [];

  totalRecords: number = 0;
  currentPage: number = 1;
  totalMessages: number = 0;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  showLoading: boolean = false;
  retryVisible: boolean = false;

  @ViewChild('tutorMessagesContainer')
  tutorMessagesContainer!: ElementRef;

  conversationFilter: ConversationFilter = {
    page: 0,
    itemsPerPage: 10,
    sort: 'createdAt,desc',
  };

  constructor(
    private tutorAiService: TutorAiService,
    private tutorConversationService: TutorConversationService,
    private authModalService: AuthModalService,
    private walletService: WalletService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Question view page');
    //  this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    //  this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.authenticationService.loginStatus$.subscribe(logged => {
      this.isUserLoggedIn = logged;
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    });

    this.scrollToTop();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-scroll');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = this.tutorMessagesContainer?.nativeElement;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  onAskTutor() {
    if (this.isUserLoggedIn) {
      this.askTutor();
      return;
    }

    //this.action = 'tutor';
    this.openLogin();
  }

  askTutor() {

    const userMessage = this.tutorRequest.message;
    const now = new Date();

    this.tutorMessages.push({
      id: 0,
      role: 'USER',
      content: userMessage,
      createdAt: now
    });

    //this.tutorRequest.questionId = this.question.id;
    this.tutorRequest.userId = this.loggedUser.id;

    this.showTutorThinking = true;

    this.scrollToBottom();

    this.tutorAiService.askQuestions(this.tutorRequest).subscribe({
      next: (res) => {

        this.tutorMessages.push({
          id: 0,
          role: 'ASSISTANT',
          content: res,
          createdAt: new Date()
        });

        this.showTutorThinking = false;

        this.tutorRequest.message = '';

        this.scrollToBottom();
      },
      error: (err) => {
        console.error(err);

        this.showTutorThinking = false;

        this.tutorMessages.push({
          id: 0,
          role: 'ASSISTANT',
          content: 'Erro ao contactar Tutor AI.',
          createdAt: new Date()
        });

        this.scrollToBottom();
      }
    });
  }

  onStartConversation() {

    if (this.isUserLoggedIn) {
      this.tutorMessages = [];
      this.getConversationsMessages();
      document.body.classList.add('no-scroll');
      return;
    }

    this.openLogin();
  }

  getConversationsMessages(): void {

    this.retryVisible = false;
    this.loadingMessage = 'Carregando mensagens';
    this.showLoading = true;

    this.conversationFilter.page = this.currentPage - 1;

    this.tutorConversationService.getQuestionConversationsMessages(this.loggedUser.id, 1, this.conversationFilter).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error;

            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;

            return nextRetry;
          }, 0),
          delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000))
        )
      )
    ).subscribe(
      (data: IApiResponse<TutorMessageResponse>) => {

        const olderMessages = data.content.reverse();
        this.tutorMessages = olderMessages;

        this.totalRecords = data.totalElements;
        this.totalMessages = data.totalElements;
        this.showLoading = false;
        this.scrollToBottom();
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;

        if (!navigator.onLine) {
          this.sendErrorNotification('Você está sem conexão com a internet.');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  loadMoreConversationsMessages(): void {
    this.loadingMessage = 'Carregando mensagens';
    this.showLoading = true;

    this.conversationFilter.page++;

    this.tutorConversationService.getQuestionConversationsMessages(this.loggedUser.id, 1, this.conversationFilter)
      .subscribe((data: IApiResponse<TutorMessageResponse>) => {

        const olderMessages = data.content.reverse();

        this.tutorMessages = [
          ...olderMessages,
          ...this.tutorMessages
        ];

        this.totalMessages = data.totalElements;
        this.showLoading = false;
      },
        (errorResponse: HttpErrorResponse) => {
          this.showLoading = false;
          this.retryVisible = true;

          if (!navigator.onLine) {
            this.sendErrorNotification('Você está sem conexão com a internet.');
          } else {
            this.sendErrorNotification(errorResponse.error.message);
          }
        }
      );
  }

  get isLoadMoreDisabled(): boolean {
    return this.tutorMessages.length >= this.totalMessages && this.totalMessages > 0;
  }

  openLogin(callback?: (user: User) => void) {

    this.authModalService.open()
      .subscribe(user => {

        if (!user) {
          return;
        }

        this.loggedUser = user;
        this.isUserLoggedIn = true;

        callback?.(user);
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

  autoResize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto'; // reseta para recalcular corretamente
    const newHeight = Math.min(textarea.scrollHeight, 250); // até 250px
    textarea.style.height = `${newHeight}px`;
  }

  getUserInitials(name: string): string {
    if (!name) return '';

    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
