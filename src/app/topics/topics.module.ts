import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicsViewComponent } from './topics-view/topics-view.component';
import { TopicsComponent } from './topics/topics.component';



@NgModule({
  declarations: [
    TopicsViewComponent,
    TopicsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TopicsModule { }
