
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pagina-nao-encontrada',
  template: `
  <div class="container" style="position: absolute; top: 15%; width: 100%; text-align: center;  ">
    <h1 class="" style="font-size: 70px; color: #6662cf;">404</h1>
    <h1 class=""  >Page not found!</h1>
    <p class="" >Oops! You're lost.</p>
    <p class="" >Error code: 404 Not Found</p>
    <a routerLink="/home" style="color: #6662cf;">Click here to go back to home page</a>
  <div>

  `,
  styles: []
})
export class PaginaNaoEncontradaComponent implements OnInit {

  constructor(private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('404 page');
  }

}