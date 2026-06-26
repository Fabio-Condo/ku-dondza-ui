import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SubjectsService } from './subjects/subjects.service';
import { TopicService } from './topics/topicsService.service';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private router: Router,
    private subjectsService: SubjectsService,
    private topicService: TopicService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-8ZHNYCTQ04', {
          page_path: event.urlAfterRedirects
        });
      }
    });

    // Pré-carrega as disciplinas para melhorar a experiência do usuário (evitar espera depois de escolher a disciplina)
    this.subjectsService.findAll().subscribe();
    this.topicService.getBySubjectIdWithCache(1).subscribe(); // Matematica
    this.topicService.getBySubjectIdWithCache(2).subscribe(); // Portugues
    this.topicService.getBySubjectIdWithCache(3).subscribe(); // Quimica
  }

  title = 'dikahub';

  showNavbar() {
    return this.router.url !== '/login' && this.router.url !== '/register';
    //return this.router.url !== '/login';
  }

  showFooter() {
    return this.router.url !== '/pagina-nao-encontrada' && this.router.url !== '/pagina-nao-autorizada';
  }

  showMobileFooter() {
    return this.router.url == '/quizzes' || this.router.url == '/main-panel' || this.router.url == '/tutor-ai' || this.router.url == '/questions' || this.router.url == '/topics' || this.router.url == '/subjects'
      || this.router.url == '/exames' || this.router.url == '/progress' || this.router.url == '/challenges' || this.router.url == '/users';
  }
}
