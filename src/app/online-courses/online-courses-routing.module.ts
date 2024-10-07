import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlineCoursesComponent } from './online-courses/online-courses.component';
import { OnlineCoursesContentComponent } from './online-courses-content/online-courses-content.component';

const routes: Routes = [
  { 
    path: 'coursos-online', 
    component: OnlineCoursesComponent,
  },
  { 
    path: 'coursos-online/:id', 
    component: OnlineCoursesContentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnlineCoursesRoutingModule { }
