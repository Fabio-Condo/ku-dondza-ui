import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompetitionsComponent } from './competitions/competitions.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { CompetitionQuestionsComponent } from './competition-questions/competition-questions.component';

const routes: Routes = [
  { 
    path: 'competitions', 
    component: CompetitionsComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'competitions/:id/questions', 
    component: CompetitionQuestionsComponent, 
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetitionRoutingModule { }