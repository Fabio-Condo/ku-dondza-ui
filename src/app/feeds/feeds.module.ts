import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedComponent } from './feed/feed.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { SavedFeedComponent } from './saved-feed/saved-feed.component';
import { TableModule } from 'primeng/table';
import { DataViewModule } from 'primeng/dataview';





@NgModule({
  declarations: [
    FeedComponent,
    SavedFeedComponent
  ],
  exports: [
    FeedComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    DataViewModule,
    FormsModule,
    RouterModule,
    DialogModule
  ],
  
})
export class FeedsModule { }
