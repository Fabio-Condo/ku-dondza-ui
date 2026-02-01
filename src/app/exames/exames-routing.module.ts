import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamesComponent } from './exames/exames.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';

const routes: Routes = [
  { 
    path: 'exames', 
    component: ExamesComponent,
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
export class ExamesRoutingModule { }