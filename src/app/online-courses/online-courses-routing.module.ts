import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlineCoursesComponent } from './online-courses/online-courses.component';
import { OnlineCoursesContentComponent } from './online-courses-content/online-courses-content.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { OnlineCoursesQuestionsComponent } from './online-courses-questions/online-courses-questions.component';

const routes: Routes = [
  { 
    path: 'coursos-online', 
    component: OnlineCoursesComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'coursos-online/:id', 
    component: OnlineCoursesContentComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'coursos-online/:id/questions', 
    component: OnlineCoursesQuestionsComponent,
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
export class OnlineCoursesRoutingModule { }
