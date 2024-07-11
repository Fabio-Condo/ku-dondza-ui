import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed.component';
import { SavedFeedComponent } from './saved-feed/saved-feed.component';

const routes: Routes = [
  { 
    path: 'feed', 
    component: FeedComponent,
  },
  { 
    path: 'saved-feed', 
    component: SavedFeedComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedsRoutingModule { }
