import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupsComponent } from './groups/groups.component';
import { GroupsViewComponent } from './groups-view/groups-view.component';

const routes: Routes = [
  { 
    path: 'grupos', 
    component: GroupsComponent,
  },
  { 
    path: 'groups/:id', 
    component: GroupsViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }

