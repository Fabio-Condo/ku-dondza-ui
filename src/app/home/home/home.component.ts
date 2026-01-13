import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/model/User';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  @ViewChild('slider', { static: false }) slider: ElementRef | undefined;

  user = new User();
  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];
  value3: any;
  loadingMessage = "Carregando...";
  isPopoutVisible = false;
  isMenuActive = false;
  activeTab: number = 1;
  googleInitialized: boolean = false;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private checkAuthentication(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      //this.router.navigateByUrl('/main-panel');
      this.router.navigateByUrl('/quizzes');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    this.isPopoutVisible = false;
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

  testimonials = [
    {
      text: '"A dikahub transformou minha forma de estudar. Os quizzes me ajudam a identificar pontos fracos e os cursos são incríveis. Recomendo para todos os estudantes!"',
      author: 'Maria Paula',
      role: 'Estudante'
    },
    {
      text: '"Como professor, encontrei na plataforma uma ferramenta completa para engajar meus alunos. Os recursos disponíveis são excelentes para complementar as aulas presenciais."',
      author: 'Rafael Silva',
      role: 'Professor'
    },
    {
      text: '"O repositório de questões foi fundamental para minha aprovação no vestibular. Consegui praticar com questões de provas anteriores e entender meus erros."',
      author: 'João Carlos',
      role: 'Aluno'
    },
    {
      text: '"Nunca imaginei que estudar online poderia ser tão envolvente. Os desafios semanais me mantêm motivada e focada!"',
      author: 'Larissa Gomes',
      role: 'Estudante de Direito'
    },
    {
      text: '"Utilizei a plataforma para revisar conteúdos antes de um concurso e tive ótimos resultados. A didática é excelente."',
      author: 'Carlos Mendes',
      role: 'Concurseiro'
    },
    {
      text: '"Os recursos interativos e as estatísticas de desempenho me ajudaram a melhorar significativamente minhas notas."',
      author: 'Bruna Teixeira',
      role: 'Aluna do Ensino Médio'
    }
  ];

  scroll(direction: string): void {
    const sliderElement = this.slider?.nativeElement;
    const scrollAmount = 320; // Igual ou maior que a largura do card

    if (direction === 'next') {
      sliderElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else if (direction === 'prev') {
      sliderElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }
}