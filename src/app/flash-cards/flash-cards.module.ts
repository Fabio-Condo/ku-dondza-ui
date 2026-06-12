import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashCardsComponent } from './flash-cards/flash-cards.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    FlashCardsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ]
})
export class FlashCardsModule { }
