import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { UserSubjectRankingDTO } from 'src/app/core/model/UserSubjectRankingDTO';
import { User } from 'src/app/core/model/User';
import { delayWhen, retryWhen, scan, timer } from 'rxjs';
import { RankingService } from 'src/app/core/ranking-service/ranking.service';
import { RankingFilter } from 'src/app/core/interface/RankingFilter';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent {

  showLoading: boolean = false;
  retryVisible: boolean = false;

  rankings: UserSubjectRankingDTO[] = [];

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  totalRecords: number = 0;
  currentPage: number = 1;

  totalRanking: number = 0;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  filter: RankingFilter = {
    page: 0,
    itemsPerPage: 10,
    sort: ''
  };

  constructor(
    private rankingService: RankingService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Payments page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.getRanking();
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getRanking(pagina: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filter.page = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.rankingService.getRanking(1, this.filter).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000)) // 2s → 4s → 8s
        )
      )
    ).subscribe(
      (dados: IApiResponse<UserSubjectRankingDTO>) => {
        this.rankings = dados.content;
        this.totalRecords = dados.totalElements;
        this.totalRanking = this.totalRanking || dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
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

  loadMore(page: number = 0): void {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filter.page++;

    this.rankingService.getRanking(1, this.filter).subscribe(
      (data: IApiResponse<UserSubjectRankingDTO>) => {
        this.rankings = [...this.rankings, ...data.content];
        this.totalRecords = data.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    );
  }

  retryGetRanking(): void {
    this.retryVisible = false;
    this.filter.page = 0;
    this.getRanking(this.currentPage);
  }

  getInitials(name: string): string {
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
