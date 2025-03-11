import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizzesComponent } from './quizzes/quizzes.component';
import { QuizzQuestionsComponent } from './questions/quizz-questions.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { NewQuizzComponent } from './new-quizz/new-quizz.component';

const routes: Routes = [
  { 
    path: 'quizzes', 
    component: QuizzesComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'quizzes/new', 
    component: NewQuizzComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'quizzes/:id/questions', 
    component: QuizzQuestionsComponent,
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
export class QuizRoutingModule { }

