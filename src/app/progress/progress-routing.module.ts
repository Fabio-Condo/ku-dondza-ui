import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { ProgressComponent } from './progress/progress.component';
import { ProgressSubjectsComponent } from './progress-subjects/progress-subjects.component';

const routes: Routes = [
  {
    path: 'progress-panel',
    component: ProgressComponent,
    canActivate: [AuthenticationGuard],
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  {
    path: 'progress-subjects',
    component: ProgressSubjectsComponent,
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
export class ProgressRoutingModule { }
