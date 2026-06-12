import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthModalService } from 'src/app/core/auth-modal.service';
import { SubjectsService } from 'src/app/subjects/subjects.service';
import { TopicContentService } from 'src/app/topics/TopicContentService.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { UserService } from 'src/app/users/user.service';
import { User } from 'src/app/core/model/User';
import { FlashCardsService } from './flash-cards.service';
import { FlashCardDeckResponse } from 'src/app/core/model/FlashCardDeckResponse';
import { FlashCard } from 'src/app/core/model/FlashCard';

//export interface FlashCardDeck {
//  subject: string;
//  topic: string;
//  cards: FlashCard[];
//}


@Component({
  selector: 'app-flash-cards',
  templateUrl: './flash-cards.component.html',
  styleUrls: ['./flash-cards.component.css']
})
export class FlashCardsComponent {

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  // ── State ──────────────────────────────────────────────────────────────
  cards: FlashCard[] = [];
  currentIndex = 0;
  isFlipped = false;
  isAnimating = false;
  hasFlippedOnce = false;
  showCompleted = false;

  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  //@Input() deckInput?: FlashCardDeck;
  //@Output() closed = new EventEmitter<void>();

  // ── Demo data (hardcoded for first phase) ──────────────────────────────
  currentDeck!: FlashCardDeckResponse;


  constructor(
    private authModalService: AuthModalService,
    private subjectsService: SubjectsService,
    private topicContentService: TopicContentService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private flashCardsService: FlashCardsService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit(): void {

    this.title.setTitle('Flash cards view page');

    this.authenticationService.loginStatus$
      .subscribe(logged => {
        this.isUserLoggedIn = logged;
        this.loggedUser =
          this.authenticationService.getUserFromLocalCache();
      });

    const topicId = this.route.snapshot.params['id'];
    if (topicId) {
      this.loadDeck(topicId);
    }

    this.scrollToTop();
  }

  private loadDeck(topicId: number): void {

    this.showLoading = true;

    this.flashCardsService.getDeck(topicId, this.loggedUser.id)
      .subscribe({

        next: response => {

          this.currentDeck = response;

          this.cards = response.cards;

          this.currentIndex = 0;

          this.showLoading = false;
        },

        error: () => {

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar os flash cards.'
          });

          this.showLoading = false;
          
        }
      });
  }

  toggleSave(): void {

    const card = this.cards[this.currentIndex];

    if (!card) {
      return;
    }

    card.saved = !card.saved;

    this.flashCardsService.saveCard({ flashCardId: card.id, saved: card.saved })
      .subscribe({
        error: () => {

          card.saved = !card.saved;

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível guardar o flash card.'
          });
        }
      });
  }

  // ── Computed ───────────────────────────────────────────────────────────
  get progressPercent(): number {

    if (!this.cards.length) {
      return 0;
    }

    const seen = this.cards.filter(
      c => c.status !== 'UNSEEN'
    ).length;

    return Math.round(
      (seen / this.cards.length) * 100
    );
  }

  get knownCount(): number {
    return this.cards.filter(
      c => c.status === 'KNOWN'
    ).length;
  }

  get learningCount(): number {
    return this.cards.filter(
      c => c.status === 'LEARNING'
    ).length;
  }

  get savedCount(): number {
    return this.cards.filter(c => c.saved).length;
  }

  // ── Actions ────────────────────────────────────────────────────────────
  flipCard(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) this.hasFlippedOnce = true;
    setTimeout(() => (this.isAnimating = false), 420);
  }

  markKnown(): void {

    if (!this.isFlipped) {
      return;
    }

    const card = this.cards[this.currentIndex];

    card.status = 'KNOWN';

    this.flashCardsService
      .updateProgress({
        flashCardId: card.id,
        status: 'KNOWN'
      })
      .subscribe();

    this.advance();
  }

  markLearning(): void {

    if (!this.isFlipped) {
      return;
    }

    const card = this.cards[this.currentIndex];

    card.status = 'LEARNING';

    this.flashCardsService
      .updateProgress({
        flashCardId: card.id,
        status: 'LEARNING'
      })
      .subscribe();

    this.advance();
  }

  private advance(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.goToCard(this.currentIndex + 1);
    } else {
      this.showCompleted = true;
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.goToCard(this.currentIndex + 1);
    }
  }

  prevCard(): void {
    if (this.currentIndex > 0) {
      this.goToCard(this.currentIndex - 1);
    }
  }

  private goToCard(index: number): void {
    this.isFlipped = false;
    setTimeout(() => {
      this.currentIndex = index;
      this.hasFlippedOnce = false;
    }, 200);
  }

  restartDeck(): void {

    this.cards = this.cards.map(card => ({
      ...card,
      status: 'UNSEEN'
    }));

    this.goToCard(0);

    this.showCompleted = false;
  }

  repeatLearning(): void {
    const learning = this.cards.filter(c => c.status === 'LEARNING').map(c => ({ ...c, status: 'UNSEEN' as const }));
    this.cards = learning;
    this.goToCard(0);
    this.showCompleted = false;
  }

  onClose(): void {
    //this.closed.emit();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
