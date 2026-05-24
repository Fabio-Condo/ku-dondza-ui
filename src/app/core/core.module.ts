import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './navbar/navbar.component';

import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ErrorHandlerService } from './error-handler.service';

import { PaginaNaoEncontradaComponent } from './pagina-nao-encontrada.component';
import { NaoAutorizadoComponent } from './nao-autorizado.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { FormsModule } from '@angular/forms';
import { MobileFooterComponent } from './mobile-footer/mobile-footer.component';
import { AuthModalComponent } from './auth-modal/auth-modal.component';


@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    MobileFooterComponent,
    AuthModalComponent,
    PaginaNaoEncontradaComponent,
    NaoAutorizadoComponent,
    /* , */
  ],
  imports: [
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
    RouterModule,
    FormsModule,
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    AuthModalComponent,
    MobileFooterComponent,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [
    MessageService,
    ConfirmationService,
    ErrorHandlerService,
  ]
})
export class CoreModule { }