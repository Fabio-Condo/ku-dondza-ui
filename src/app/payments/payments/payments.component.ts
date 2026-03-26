import { Component } from '@angular/core';
import { PaymentsService } from '../payments.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Payment } from 'src/app/core/model/Payment';
import { User } from 'src/app/core/model/User';
import { PaymentFilter } from 'src/app/core/interface/PaymentFilter';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { retryWhen, delayWhen, scan } from 'rxjs/operators';
import { timer } from 'rxjs';


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

  retryVisible: boolean = false;

  totalRecords: number = 0;
  currentPage: number = 1;
  opcoesItensPorPagina: number[] = [5, 10, 20, 50];

  totalPayments: number = 0;

  filtro: PaymentFilter = {
    pagina: 0,
    itensPorPagina: 10,
    ordenamento: 'id,asc',
  };

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
    //this.getPaymets();
    this.findAll();
  }

  findAll(pagina: number = 0): void {
    this.retryVisible = false;
    this.loadingMessage = "Carregando dados"
    this.showLoading = true;

    this.filtro.pagina = this.currentPage - 1; // Ajuste para o padrão de paginação começando em 0
    this.paymentsService.filter(this.filtro).pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error; // 3 tentativas
            const nextRetry = retryCount + 1;
            this.loadingMessage = `Tentando reconectar (${nextRetry}/3)`;
            return nextRetry;
          }, 0),
          delayWhen(retryCount => timer(Math.pow(2, retryCount) * 1000)) // 2s → 4s → 8s
        )
      )
    ).subscribe(
      (dados: IApiResponse<Payment>) => {
        this.payments = dados.content
        this.totalRecords = dados.totalElements;
        this.totalPayments = this.totalPayments || dados.totalElements;
        this.showLoading = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.showLoading = false;
        this.retryVisible = true;
        if (!navigator.onLine) {
          this.sendErrorNotification("Você está sem conexão com a internet.");
        } else {
          this.sendErrorNotification(errorResponse.error.message);
        }
      }
    );
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.findAll();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
      this.findAll();
    }
  }

  totalPages(): number {
    return Math.ceil(this.totalRecords / this.filtro.itensPorPagina);
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
