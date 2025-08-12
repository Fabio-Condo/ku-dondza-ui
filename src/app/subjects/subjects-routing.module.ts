import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { SubjectsComponent } from './subjects/subjects.component';
import { SubjectsViewComponent } from './subjects-view/subjects-view.component';

const routes: Routes = [
  {
    path: 'subjects',
    component: SubjectsComponent,
    //canActivate: [AuthenticationGuard],
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  {
    path: 'subjects/:id',
    component: SubjectsViewComponent,
    //canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubjectsRoutingModule { }
