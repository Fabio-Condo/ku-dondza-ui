import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupsComponent } from './groups/groups.component';
import { GroupsViewComponent } from './groups-view/groups-view.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';

const routes: Routes = [
  { 
    path: 'grupos', 
    component: GroupsComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'groups/:id', 
    component: GroupsViewComponent,
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
export class GroupsRoutingModule { }

