import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed.component';
import { SavedFeedComponent } from './saved-feed/saved-feed.component';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';

const routes: Routes = [
  { 
    path: 'feed', 
    component: FeedComponent,
    canActivate: [AuthenticationGuard], 
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  { 
    path: 'saved-feed', 
    component: SavedFeedComponent,
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
export class FeedsRoutingModule { }
