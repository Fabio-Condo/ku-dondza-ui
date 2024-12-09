import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationGuard } from '../security/Guard/authentication.guard';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { 
    path: 'search', 
    component: SearchComponent,
    canActivate: [AuthenticationGuard], 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
