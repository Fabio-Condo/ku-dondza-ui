import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/model/User';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [MessageService]
})
export class HomeComponent implements OnInit, OnDestroy {

  public showLoading: boolean = false;
  private subscriptions: Subscription[] = [];
  value3: any;
  loadingMessage = "Carregando...";
  isPopoutVisible = false;
  isMenuActive = false;
  activeTab: number = 1;
  googleInitialized: boolean = false;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.initGoogleSignIn();
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private checkAuthentication(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/quizzes');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    this.isPopoutVisible = false;
  }

  public onLogin(user: User): void {
    this.loadingMessage = "Estamos quase lá...";
    this.showLoading = true;

    const subscription = this.authenticationService.login(user).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.router.navigateByUrl('/quizzes');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      },
      complete: () => {
        this.showLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private initGoogleSignIn(): void {
    this.loadGoogleScript().then(() => {
      this.initializeGoogleSignIn();
    }).catch(error => {
      console.error('Failed to load Google script:', error);
      this.showGoogleLoadError();
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google script load failed'));
      document.head.appendChild(script);
    });
  }

  private initializeGoogleSignIn(): void {
    setTimeout(() => {
      try {
        const buttonContainer = document.getElementById('google-signin-button');
        
        if (!buttonContainer) {
          console.error('Google Sign-In container not found');
          return;
        }

        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.handleGoogleResponse(response),
          error_callback: (error: any) => this.handleGoogleError(error),
          ux_mode: 'popup',
          auto_select: false
        });

        google.accounts.id.renderButton(
          buttonContainer,
          {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: buttonContainer.offsetWidth,
            text: 'signin_with'
          }
        );

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.warn('Google one-tap prompt was not displayed');
          }
        });

        this.googleInitialized = true;
      } catch (error) {
        console.error('Google Sign-In initialization failed:', error);
        this.handleGoogleError(error);
      }
    }, 300);
  }

  private handleGoogleResponse(response: any): void {
    this.loadingMessage = "Estamos quase lá...";
    this.showLoading = true;
    this.changeDetectorRef.detectChanges();
    
    const subscription = this.authenticationService.loginWithGoogle(response.credential).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.ngZone.run(() => {
          this.router.navigateByUrl('/quizzes');
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
      },
      complete: () => {
        this.showLoading = false;
        this.changeDetectorRef.detectChanges();
      }
    });

    this.subscriptions.push(subscription);
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private handleGoogleError(error: any): void {
    console.error('Google Sign-In error:', error);
    let errorMessage = 'Erro ao carregar o login do Google';
    
    if (error.type === 'fcmerror') {
      errorMessage = 'Por favor, verifique as configurações de cookies do seu navegador';
    } else if (error.type === 'token_fetch_failed') {
      errorMessage = 'Falha ao obter token de autenticação';
    }

    this.messageService.add({
      severity: 'warn',
      summary: 'Aviso',
      detail: errorMessage,
      life: 5000
    });
  }

  private showGoogleLoadError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar o serviço de autenticação do Google',
      life: 5000
    });
  }

  private sendErrorNotification(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message || 'Ocorreu um erro. Por favor, tente novamente.',
      life: 5000
    });
  }
}