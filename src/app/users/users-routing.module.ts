import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { LoginComponent } from './login/login.component';
import { UserProfileViewComponent } from './user-profile-view/user-profile-view.component';

const routes: Routes = [
  {
    path: 'users',
    component: UsersComponent,
  },
  {
    path: 'login', component: LoginComponent,
  },
  {
    path: 'user/profile/:userId',
    component: UserProfileViewComponent,
    //canActivate: [AuthenticationGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
