import { Component, OnInit } from '@angular/core';
import { ChallengeRankingResultDTO } from 'src/app/core/model/ChallengeRankingResultDTO';
import { ChallengeService } from '../challenge.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { ActivatedRoute } from '@angular/router';
import { Challenge } from 'src/app/core/model/Challenge';
import { MessageService } from 'primeng/api';
import { delayWhen, retryWhen, scan, timer } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  rankings: ChallengeRankingResultDTO[] = [];
  myRanking: ChallengeRankingResultDTO | null = null;

  challenge!: Challenge;
  challengeId!: string;

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  showLoading = false;
  loadingMessage = 'Carregando';

  retryVisible: boolean = false;

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private title: Title,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Results view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const challengeId = this.route.snapshot.params['id'];
    if (challengeId) {
      this.challengeId = challengeId;
      this.loadChallenge();
    }

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadChallenge(): void {
    this.retryVisible = false;
    this.showLoading = true;

    this.challengeService.getById(this.challengeId).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (response) => {
        this.challenge = response;
        this.loadRanking(this.challengeId);
        // this.showLoading = false;
      },
      (errorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else if (errorResponse.status == 400) {
          // BAD_REQUEST
          this.router.navigateByUrl('/pagina-nao-encontrada');
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  loadRanking(challengeId: string): void {
    this.retryVisible = false;
    this.showLoading = true;

    this.challengeService.getRanking(challengeId).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (error.status && error.status >= 400 && error.status < 500) {
              throw error;
            }
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount =>
            timer(Math.pow(2, retryCount) * 1000) // 2s → 4s → 8s
          )
        )
      )
    ).subscribe(
      (response) => {
        this.rankings = response;

        this.myRanking = this.rankings.find(
          r => r.userId === this.loggedUser.id
        ) || null;

        this.showLoading = false;
      },
      (errorResponse) => {
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

  retryGetChallengeAndRanking(): void {
    this.retryVisible = false;
    this.loadChallenge();
    this.loadRanking(this.challengeId);
  }

  formatTime(seconds: number): string {
    if (!seconds) return '0s';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getPodiumClass(index: number) {
    if (index === 0) return 'p1';
    if (index === 1) return 'p2';
    return 'p3';
  }

  getMedal(index: number) {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    return 'bronze';
  }

  getAvatarClass(index: number) {
    if (index === 0) return 'av-gold';
    if (index === 1) return 'av-silver';
    return 'av-bronze';
  }

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.'
    });
  }

}
