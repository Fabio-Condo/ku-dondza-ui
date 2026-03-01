import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NaoAutorizadoComponent } from './core/nao-autorizado.component';

import { PaginaNaoEncontradaComponent } from './core/pagina-nao-encontrada.component';
import { HomeComponent } from './home/home/home.component';
import { MainPanelComponent } from './main-panel/main-panel/main-panel.component';

const routes: Routes = [
  { path: 'nao-autorizado', component: NaoAutorizadoComponent },
  { path: 'main-panel', component: MainPanelComponent },
  { path: '', redirectTo: 'main-panel', pathMatch: 'full' },
  { path: 'pagina-nao-encontrada', component: PaginaNaoEncontradaComponent },
  { path: '**', redirectTo: 'pagina-nao-encontrada' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
