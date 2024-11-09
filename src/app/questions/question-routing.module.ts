import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionsComponent } from './questions/questions.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';

const routes: Routes = [
  { 
    path: 'questions', 
    component: QuestionsComponent,
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
export class QuestionRoutingModule { }
