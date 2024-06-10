import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorHandlerService } from './core/error-handler.service';
import { FeedsRoutingModule } from './feeds/feeds-routing.module';
import { FeedsModule } from './feeds/feeds.module';
import { ExamesRoutingModule } from './exames/exames-routing.module';
import { ExamesModule } from './exames/exames.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    
    FeedsRoutingModule,
    ExamesRoutingModule,
    AppRoutingModule,

  
    FeedsModule,
    ExamesModule,

    CoreModule,
  ],
  providers: [
    ConfirmationService, 
    MessageService, 
    ErrorHandlerService, 
    DatePipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
