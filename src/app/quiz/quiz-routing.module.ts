import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizzesComponent } from './quizzes/quizzes.component';
import { QuizzQuestionsComponent } from './questions/quizz-questions.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { WeeklyQuizzesComponent } from './weekly-quizzes/weekly-quizzes.component';

const routes: Routes = [
  { 
    path: 'quizzes', 
    component: QuizzesComponent,
    //canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'quizzes/:id', 
    component: QuizzQuestionsComponent,
    //canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'weekly-quizzes', 
    component: WeeklyQuizzesComponent,
    //canActivate: [AuthenticationGuard], 
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

