import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface FlashCard {
  id: number;
  question: string;
  answer: string;
  category: string;
  note?: string;
  status: 'unseen' | 'known' | 'learning';
  saved: boolean;
}

export interface FlashCardDeck {
  subject: string;
  topic: string;
  cards: FlashCard[];
}

@Component({
  selector: 'app-flash-cards',
  templateUrl: './flash-cards.component.html',
  styleUrls: ['./flash-cards.component.css']
})
export class FlashCardsComponent {


  @Input() deckInput?: FlashCardDeck;
  @Output() closed = new EventEmitter<void>();

  // ── Demo data (hardcoded for first phase) ──────────────────────────────
  currentDeck: FlashCardDeck = {
    subject: 'Matemática',
    topic: 'Funções e Gráficos',
    cards: [],
  };

  private readonly demoCards: FlashCard[] = [
    {
      id: 1,
      question: 'O que é uma função matemática?',
      answer: 'Uma função é uma relação entre dois conjuntos em que cada elemento do domínio corresponde a um único elemento no contradomínio.',
      category: 'Conceito Base',
      note: 'Notação: f: A → B, lê-se "f de A em B".',
      status: 'unseen',
      saved: false,
    },
    {
      id: 2,
      question: 'Qual é a forma geral de uma função afim?',
      answer: 'f(x) = ax + b, onde "a" é o coeficiente angular (declive) e "b" é o coeficiente linear (ordenada na origem).',
      category: 'Função Afim',
      note: 'Quando a = 0, a função é constante. Quando b = 0, é chamada função linear.',
      status: 'unseen',
      saved: false,
    },
    {
      id: 3,
      question: 'O que representa o coeficiente angular de uma função afim?',
      answer: 'O coeficiente angular (a) representa a taxa de variação da função — ou seja, quanto y varia quando x aumenta 1 unidade. Determina a inclinação da reta.',
      category: 'Função Afim',
      note: 'Se a > 0, a função é crescente. Se a < 0, é decrescente.',
      status: 'unseen',
      saved: false,
    },
    {
      id: 4,
      question: 'Qual é a forma geral de uma função quadrática?',
      answer: 'f(x) = ax² + bx + c, com a ≠ 0. O gráfico é uma parábola que abre para cima se a > 0 e para baixo se a < 0.',
      category: 'Função Quadrática',
      status: 'unseen',
      saved: false,
    },
    {
      id: 5,
      question: 'Como se calcula o vértice de uma parábola?',
      answer: 'As coordenadas do vértice são: xv = −b / (2a) e yv = −Δ / (4a), onde Δ = b² − 4ac.',
      category: 'Função Quadrática',
      note: 'O vértice é o ponto de máximo ou mínimo da função quadrática.',
      status: 'unseen',
      saved: false,
    },
    {
      id: 6,
      question: 'O que é o domínio de uma função?',
      answer: 'O domínio é o conjunto de todos os valores de x para os quais a função está definida e produz um resultado real.',
      category: 'Conceito Base',
      status: 'unseen',
      saved: false,
    },
    {
      id: 7,
      question: 'Qual é a diferença entre zeros e raízes de uma função?',
      answer: 'São o mesmo conceito: os zeros (ou raízes) de f(x) são os valores de x onde f(x) = 0, isto é, os pontos onde o gráfico intercepta o eixo das abcissas.',
      category: 'Conceito Base',
      status: 'unseen',
      saved: false,
    },
    {
      id: 8,
      question: 'O que é uma função par? Dê um exemplo.',
      answer: 'Uma função f é par se f(−x) = f(x) para todo x no domínio. O gráfico é simétrico em relação ao eixo y. Exemplo: f(x) = x².',
      category: 'Propriedades',
      status: 'unseen',
      saved: false,
    },
  ];

  // ── State ──────────────────────────────────────────────────────────────
  cards: FlashCard[] = [];
  currentIndex = 0;
  isFlipped = false;
  isAnimating = false;
  hasFlippedOnce = false;
  showCompleted = false;

  // ── Computed ───────────────────────────────────────────────────────────
  get progressPercent(): number {
    if (!this.cards.length) return 0;
    const seen = this.cards.filter(c => c.status !== 'unseen').length;
    return Math.round((seen / this.cards.length) * 100);
  }

  get knownCount(): number {
    return this.cards.filter(c => c.status === 'known').length;
  }

  get learningCount(): number {
    return this.cards.filter(c => c.status === 'learning').length;
  }

  get savedCount(): number {
    return this.cards.filter(c => c.saved).length;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.deckInput) {
      this.currentDeck = this.deckInput;
      this.cards = this.deckInput.cards.map(c => ({ ...c }));
    } else {
      this.cards = this.demoCards.map(c => ({ ...c }));
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────
  flipCard(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) this.hasFlippedOnce = true;
    setTimeout(() => (this.isAnimating = false), 420);
  }

  toggleSave(): void {
    if (!this.cards[this.currentIndex]) return;
    this.cards[this.currentIndex].saved = !this.cards[this.currentIndex].saved;
  }

  markKnown(): void {
    if (!this.isFlipped) return;
    this.cards[this.currentIndex].status = 'known';
    this.advance();
  }

  markLearning(): void {
    if (!this.isFlipped) return;
    this.cards[this.currentIndex].status = 'learning';
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
    this.cards = this.cards.map(c => ({ ...c, status: 'unseen' as const }));
    this.goToCard(0);
    this.showCompleted = false;
  }

  repeatLearning(): void {
    const learning = this.cards.filter(c => c.status === 'learning').map(c => ({ ...c, status: 'unseen' as const }));
    this.cards = learning;
    this.goToCard(0);
    this.showCompleted = false;
  }

  onClose(): void {
    this.closed.emit();
  }

}
