import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstitutionsComponent } from './institutions/institutions.component';
import { InstitutionsViewComponent } from './institutions-view/institutions-view.component';

const routes: Routes = [
  { 
    path: 'instituicoes', 
    component: InstitutionsComponent,
  },
  { 
    path: 'instituicoes/:id', 
    component: InstitutionsViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InstitutionsRoutingModule { }
