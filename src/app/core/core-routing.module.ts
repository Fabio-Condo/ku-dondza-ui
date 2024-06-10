import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaginaNaoEncontradaComponent } from './pagina-nao-encontrada.component';

const routes: Routes = [

    { 
      path: 'pagina-nao-encontrada', 
      component: PaginaNaoEncontradaComponent,
    }

];

  @NgModule({
    imports: [
      RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
  })
  export class UserRoutingModule { }