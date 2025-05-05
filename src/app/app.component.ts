import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private router: Router
  ) {}
  
  title = 'post-app';

  showNavbar() {  
    return this.router.url !== '/login' && this.router.url !== '/register';
    //return this.router.url !== '/login';
  }

  showFooter() {  
    return this.router.url !== '/pagina-nao-encontrada' && this.router.url !== '/pagina-nao-autorizada';
  }
}
