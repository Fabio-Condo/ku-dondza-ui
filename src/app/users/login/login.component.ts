import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../authentication.service';
import { User } from 'src/app/core/model/User';
import { GoogleAuthService } from '../google-auth-service.service';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

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

  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private googleAuthService: GoogleAuthService
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.scrollToTop();
    this.initializeGoogleAuth();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
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

  private async initializeGoogleAuth(): Promise<void> {

    if (this.isMobileWebView()) {
      console.log('Mobile WebView detected — Google Auth skipped.');
      return; // não inicializa SDK
    }

    try {
      const setupButton = await this.googleAuthService.initializeGoogleButton('google-signin-button');
      setupButton((credential) => this.handleGoogleCredential(credential));
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar autenticação Google',
        life: 5000
      });
    }
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

  public isMobileWebView(): boolean {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent) && this.isWebView();
  }

  public isWebView(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor;
    // Android WebView ou iOS WKWebView
    return /wv|Android.*Version\/|iPhone.*AppleWebKit\/.*Mobile/i.test(userAgent);
  }

  private checkAuthentication(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/main-panel');
      //this.router.navigateByUrl('/quizzes');
    }
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}
