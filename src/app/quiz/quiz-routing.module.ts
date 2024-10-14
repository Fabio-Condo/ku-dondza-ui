import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuizzesComponent } from './quizzes/quizzes.component';
import { QuestionsComponent } from './questions/questions.component';

const routes: Routes = [
  { 
    path: 'quizzes', 
    component: QuizzesComponent,
  },
  { 
    path: 'quizzes/:id/questions', 
    component: QuestionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizRoutingModule { }

