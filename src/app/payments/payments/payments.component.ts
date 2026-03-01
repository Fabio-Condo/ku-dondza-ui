import { Component } from '@angular/core';
import { PaymentsService } from '../payments.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Payment } from 'src/app/core/model/Payment';
import { User } from 'src/app/core/model/User';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {

  payments: Payment[] = [];
  showLoading: boolean = false;
  loadingMessage = "Carregando"; // Alterar dinamicamente

  loggedUser: User = new User;
  isUserLoggedIn: boolean = false;



  constructor(
    private paymentsService: PaymentsService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Payments page');
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.getPaymets();
  }

  getPaymets() {
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.paymentsService.findAll().subscribe({
      next: (dados) => {
        this.payments = dados;
        this.showLoading = false;

      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;

      }
    });
  }

  getPlanClass(plan: string) {
    switch (plan) {
      case 'PRO': return 'plan-pro';
      case 'PREMIUM': return 'plan-premium';
      case 'BASIC': return 'plan-basic';
      default: return 'plan-free';
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'SUCCESS': return 'status-success';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-failed';
      case 'REFUNDED': return 'status-refunded';
      default: return '';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
