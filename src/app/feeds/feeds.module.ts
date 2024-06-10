import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed/feed.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';




@NgModule({
  declarations: [
    FeedComponent
  ],
  exports: [
    FeedComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DialogModule
  ],
  
})
export class FeedsModule { }
