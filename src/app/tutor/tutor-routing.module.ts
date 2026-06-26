import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TutorAiComponent } from './tutor-ai/tutor-ai.component';

const routes: Routes = [
  { 
    path: 'tutor-ai', 
    component: TutorAiComponent,
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
export class TutorRoutingModule { }
