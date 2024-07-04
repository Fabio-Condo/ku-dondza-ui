
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-pagina-nao-encontrada',
  template: `
  <div class="container" style="position: absolute; top: 20%; width: 100%; text-align: center;  ">
    <h1 class="" style="font-size: 70px; color: #3734ed;">404</h1>
    <h1 class=""  >Página não encontrada!</h1>
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