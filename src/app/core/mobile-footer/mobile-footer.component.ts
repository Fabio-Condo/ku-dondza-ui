import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../model/User';
import { AuthenticationService } from '../../users/authentication.service';
import { Role } from '../../enum/role.enum';
import { MessageService } from 'primeng/api';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { Subscription } from 'rxjs';
import { AuthModalService } from '../auth-modal.service';

@Component({
  selector: 'app-mobile-footer',
  templateUrl: './mobile-footer.component.html',
  styleUrls: ['./mobile-footer.component.css']
})
export class MobileFooterComponent implements OnInit {

  loggedUser: User = new User();
  isUserLoggedIn: boolean = false;

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  googleAuthReady = true;

  showLoading: boolean = false;
  displayModalLogin: boolean = false;
  private subscriptions: Subscription[] = [];

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    public authModalService: AuthModalService,
    private googleAuthService: GoogleAuthService,
    private ngZone: NgZone,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
  }

  onGoToProgressPanel(): void {
    if (this.isUserLoggedIn) {
      this.router.navigateByUrl('/progress');
      return;
    }

    this.displayModalLogin = true;
    //document.body.classList.add('no-scroll');
    setTimeout(() => {
      this.displayModalLogin = true;
      this.openLogin();
    }, 100); // Espera para o botão estar no DOM
  }

  openLogin(callback?: (user: User) => void) {

    this.authModalService.open()
      .subscribe(user => {

        if (!user) {
          return;
        }

        this.loggedUser = user;
        this.isUserLoggedIn = true;

        callback?.(user);
      });
  }

  onLogIn(): void {
    this.openLogin();
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache().role;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}
