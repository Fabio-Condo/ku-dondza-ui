import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlineCoursesComponent } from './online-courses/online-courses.component';
import { OnlineCoursesContentComponent } from './online-courses-content/online-courses-content.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { CoursesComponent } from './courses/courses.component';

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
    path: 'coursos', 
    component: CoursesComponent,
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
