import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NaoAutorizadoComponent } from './core/nao-autorizado.component';

import { PaginaNaoEncontradaComponent } from './core/pagina-nao-encontrada.component';
import { HomeComponent } from './home/home/home.component';

const routes: Routes = [
  { path: 'nao-autorizado', component: NaoAutorizadoComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'pagina-nao-encontrada', component: PaginaNaoEncontradaComponent },
  { path: '**', redirectTo: 'pagina-nao-encontrada' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
