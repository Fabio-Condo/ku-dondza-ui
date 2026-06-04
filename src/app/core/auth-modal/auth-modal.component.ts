import { Component, NgZone, OnInit } from '@angular/core';
import { AuthModalService } from '../auth-modal.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { Role } from 'src/app/enum/role.enum';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Subscription } from 'rxjs';
import { User } from '../model/User';
import { GoogleAuthServiceV2 } from 'src/app/users/google-auth.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {

  visible = false;

  showLoading: boolean = false;
  isGoogleLoading: boolean = false;

  googleAuthReady = true;
  loadingMessage: string = "Carregando...";

  isUserLoggedIn: boolean = false;
  loggedUser = new User();

  user = new User();
  activeTab: number = 1;
  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  otp: string = '';

  displayModalLogin: boolean = false;

  constructor(
    public authModalService: AuthModalService,
    private ngZone: NgZone,
    private googleAuthService: GoogleAuthServiceV2,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.googleAuthService.initOnce();
  }

  closeLogin() {
    //this.authModalService.close();
    this.authModalService.notifyCancelled();
  }

  openLogin() {
    this.authModalService.open();
  }

  // Se quizer usar o botão One Tap da Google, chame essa função no clique do botão
  // e comente a função loginWithGoogleBigPopup()
  loginWithGoogleOnTap() {
    this.isGoogleLoading = true;

    this.googleAuthService.showOneTap((credential) => {
      this.handleGoogleCredential(credential);
      this.isGoogleLoading = false;
    });

    // fallback de segurança (caso user feche popup)
    setTimeout(() => {
      this.isGoogleLoading = false;
    }, 5000);
  }

  // Se quiser usar o popup grande da Google, chame essa função no clique do botão
  // e comente a função loginWithGoogleOnTap()
  // Esta opção é mais confiável, pois o One Tap pode ser bloqueado por navegadores ou pelo próprio usuário
  // Neste momento estou usando no HTML o popup grande, mas deixei o código do One Tap caso queira testar depois
  loginWithGoogleBigPopup() {

    this.isGoogleLoading = true;

    this.googleAuthService.loginWithPopup((credential) => {

      this.handleGoogleCredential(credential);

      this.isGoogleLoading = false;
    });

    setTimeout(() => {
      this.isGoogleLoading = false;
    }, 5000);
  }

  private handleGoogleCredential(credential: string) {

    this.ngZone.run(() => {
      this.showLoading = true;
    });

    this.authenticationService.loginWithGoogle(credential)
      .subscribe({
        next: (res: HttpResponse<User>) => {

          const token = res.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(res.body);
          this.authenticationService.notifyLoginStatus(true);
          this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
          this.loggedUser = this.authenticationService.getUserFromLocalCache();

          this.authModalService.notifyLoginSuccess(this.loggedUser);

          this.authModalService.close();
          this.user = new User();

          this.ngZone.run(() => {
            this.showLoading = false;
            this.authModalService.close();
          });
        },
        error: (err: HttpErrorResponse) => {
          this.showLoading = false;
          this.messageService.add({
            severity: 'error',
            detail: err.error?.message || 'Erro login Google'
          });
        }
      });
  }

  sendOtp() {
    this.showLoading = true;
    //const email = this.otpForm.value.email!;
    this.authenticationService.generateOtp(this.user.email).subscribe({
      next: () => {
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  validateOtp() {
    this.showLoading = true;
    this.authenticationService.validateOtp(this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();
        this.authModalService.notifyLoginSuccess(this.loggedUser);

        this.authModalService.close();
        this.user = new User();
        this.otp = '';
        this.step = 'email';
        this.activeTab = 1;

        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  startRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.startRegistrationViaOtp(this.user.email).subscribe({
      next: (response) => {
        console.log(response.body)
        this.step = 'otp';
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  completeRegistrationViaOtp() {
    this.showLoading = true;
    this.authenticationService.completeRegistrationViaOtp(this.user.fullName, this.user.email, this.otp).subscribe({
      next: (response) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();
        this.authModalService.notifyLoginSuccess(this.loggedUser);

        this.authModalService.close();
        this.user = new User();
        this.otp = '';
        this.step = 'email';
        this.activeTab = 1;

        this.showLoading = false;
        this.displayModalLogin = false;
        document.body.classList.remove('no-scroll');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  onCloseLoginPopout() {
    this.displayModalLogin = false;
    document.body.classList.remove('no-scroll');
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
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
      this.messageService.add({
        severity: 'error',
        detail: 'Ocorreu um erro. Por favor, tente novamente.',
      });
    }
  }

}
