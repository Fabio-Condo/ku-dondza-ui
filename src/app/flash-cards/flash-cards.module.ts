import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashCardsComponent } from './flash-cards/flash-cards.component';
import { RouterModule } from '@angular/router';
import { TopicFlashCardsComponent } from './topic-flash-cards/topic-flash-cards.component';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [
    FlashCardsComponent,
    TopicFlashCardsComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    FormsModule,

    ButtonModule,
    InputTextModule,
    TableModule,
    TabViewModule,
    TooltipModule,
    DropdownModule,
    SelectButtonModule,
    DialogModule,
    DividerModule,
    CalendarModule,
    ProgressBarModule,

    RouterModule,
    TagModule,

    InputNumberModule
  ]
})
export class FlashCardsModule { }
