import { Component, OnInit } from '@angular/core';
import { ChallengeRankingResultDTO } from 'src/app/core/model/ChallengeRankingResultDTO';
import { ChallengeService } from '../challenge.service';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  rankings: ChallengeRankingResultDTO[] = [];

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  constructor(
    private challengeService: ChallengeService,
    private router: Router,
    private title: Title,
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Results view page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    const questionId = this.route.snapshot.params['id'];
    if (questionId) {
      this.loadRanking(questionId);
    }

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadRanking(challengeId: string): void {
    this.challengeService.getRanking(challengeId).subscribe({
      next: (response) => {
        this.rankings = response;
      },
      error: (error) => {
        console.error('Erro ao carregar ranking:', error);
      }
    });
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

}
