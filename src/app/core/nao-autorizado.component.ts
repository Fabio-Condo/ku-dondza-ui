import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  template: `
  <div class="container" style="position: absolute; top: 15%; width: 100%; text-align: center;  ">
    <h1 class="" style="font-size: 70px; color: #6662cf;">401</h1>
    <h1 class=""  >Acesso negado!</h1>
    <p class="" >Oops! Não tem permissões suficientes para acessar a página.</p>
    <p class="" >Código do erro: 401 Unauthorized</p>
    <a routerLink="/menu" style="color: #6662cf;">Click aqui para voltar para a tela principal</a>
  <div>
  `,
})
export class NaoAutorizadoComponent implements OnInit {

  constructor(private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('401 page');
  }

}