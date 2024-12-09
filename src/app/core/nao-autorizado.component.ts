import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  template: `
  <div class="container" style="position: absolute; top: 15%; width: 100%; text-align: center;  ">
    <h1 class="" style="font-size: 70px; color: #3734ed;">401</h1>
    <h1 class=""  >Acesso negado!</h1>
  <div>
  `,
})
export class NaoAutorizadoComponent implements OnInit {

  constructor(private title: Title) { }

  ngOnInit(): void {
    this.title.setTitle('401 page');
  }

}