import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainPanelComponent } from './main-panel/main-panel.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    MainPanelComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ]
})
export class MainPanelModule { }
