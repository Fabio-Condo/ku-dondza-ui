import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../authentication.service';
import { User } from 'src/app/core/model/User';
import { FormBuilder, NgForm } from '@angular/forms';
import { GoogleAuthServiceV2 } from '../google-auth.service';

declare let gtag: Function;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  user = new User();
  imagePath = './assets/scilogo.png'
  public showLoading: any;
  private subscriptions: Subscription[] = [];
  loadingMessage = "Carregando"; // Alterar dinamicamente

  activeTab: number = 1;

  step: 'email' | 'otp' = 'email';  // Passos para exibir o formulário de email ou OTP
  //message: string = '';
  //jwtToken: string = '';

  otp: string = '';

  isGoogleLoading: boolean = false;

  googleAuthReady = true;

  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private googleAuthService2: GoogleAuthServiceV2,
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  loginWithGoogleBigPopup() {

    this.isGoogleLoading = true;

    this.googleAuthService2.loginWithPopup((credential) => {

      this.handleGoogleCredential(credential);

      this.isGoogleLoading = false;
    });

    setTimeout(() => {
      this.isGoogleLoading = false;
    }, 5000);
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

        // Evento de login no Google Analytics
        gtag('event', 'login', {
          method: 'google'
        });

        this.router.navigateByUrl('/main-panel');
        //this.router.navigateByUrl('/quizzes');
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

        // Evento de login no Google Analytics
        gtag('event', 'login', {
          method: 'google'
        });

        this.router.navigateByUrl('/main-panel');
        //this.router.navigateByUrl('/quizzes');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });
  }

  public onRegister(user: NgForm): void {
    this.user.plan = "PREMIUM";
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.register(this.user).subscribe(
        (response: User) => {
          this.showLoading = false;
          this.messageService.add({ severity: 'success', detail: 'A new account was created for ${response.firstName}.Please check your email for password to log in.' })
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(errorResponse.error.message);
          this.showLoading = false;
        }
      )
    );
  }

  public onLogin(user: User): void {
    this.loadingMessage = "Estamos quase lá";
    this.showLoading = true;

    const subscription = this.authenticationService.login(user).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);

        // Evento de login no Google Analytics
        gtag('event', 'login', {
          method: 'google'
        });

        this.router.navigateByUrl('/main-panel');
        //this.router.navigateByUrl('/quizzes');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        this.showLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private handleGoogleCredential(googleCredential: string): void {
    this.ngZone.run(() => {
      this.loadingMessage = "Estamos quase lá";
      this.showLoading = true;
    });

    const sub = this.authenticationService.loginWithGoogle(googleCredential).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.authenticationService.notifyLoginStatus(true);

        // Evento de login no Google Analytics
        gtag('event', 'login', {
          method: 'google'
        });

        this.ngZone.run(() => {
          this.router.navigateByUrl('/main-panel');
          //this.router.navigateByUrl('/quizzes');
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
        this.showLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  private checkAuthentication(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/main-panel');
    }
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
