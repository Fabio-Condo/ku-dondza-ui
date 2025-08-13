import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-8ZHNYCTQ04', {
          page_path: event.urlAfterRedirects
        });
      }
    });
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
    return this.router.url == '/quizzes' || this.router.url == '/questions' || this.router.url == '/topics' || this.router.url == '/subjects' || this.router.url == '/courses'
      || this.router.url == '/books' || this.router.url == '/articles' || this.router.url == '/competitions' || this.router.url == '/users';
  }
}
