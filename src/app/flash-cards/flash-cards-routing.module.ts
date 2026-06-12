import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlashCardsComponent } from './flash-cards/flash-cards.component';

const routes: Routes = [
  {
    path: 'flash-cards',
    component: FlashCardsComponent,
    //canActivate: [AuthenticationGuard],
    //data: { 
    //  roles: ['ROLE_USER'], 
    //  requiresRoleCheck: true
    //} 
  },
  {
    path: 'flash-cards/topic/:id',
    component: FlashCardsComponent,
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
export class FlashCardsRoutingModule { }
