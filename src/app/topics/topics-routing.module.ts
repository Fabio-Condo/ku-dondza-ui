import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopicsComponent } from './topics/topics.component';
import { TopicViewComponent } from './topic-view/topic-view.component';

const routes: Routes = [
  {
    path: 'topics',
    component: TopicsComponent,
    //canActivate: [AuthenticationGuard],
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  {
    path: 'topics/:id',
    component: TopicViewComponent,
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
export class TopicsRoutingModule { }
