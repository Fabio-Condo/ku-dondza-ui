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

  showNavbar() {  // Metodo que vai nao negar a exibição do navbar na tela do login. Ou seja, mostra a navbar em todas URL's excepto na URL do login. Nota: Depois colocar o metodo no app.component.html
    return this.router.url !== '/login';
    //return this.router.url !== '/feed';
  }
}
