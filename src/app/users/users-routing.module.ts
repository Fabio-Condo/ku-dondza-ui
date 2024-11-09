import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { UserProfileViewComponent } from './user-profile-view/user-profile-view.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';

const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  {
    path: 'login', component: LoginComponent,
  },
  {
    path: 'user/profile/:userId',
    component: UserProfileViewComponent,
    canActivate: [AuthenticationGuard], 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
