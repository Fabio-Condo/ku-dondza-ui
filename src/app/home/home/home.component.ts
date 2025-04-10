import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/model/User';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
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
    private googleAuthService: GoogleAuthService,
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.initializeGoogleAuth();
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private checkAuthentication(): void {
    if (this.authenticationService.isUserLoggedIn()) {
      this.router.navigateByUrl('/main-panel');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
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
        this.router.navigateByUrl('/main-panel');
        this.showLoading = false;
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
        console.log(errorResponse.error.message)
        this.showLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private async initializeGoogleAuth(): Promise<void> {
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
    this.showLoading = true;
    this.loadingMessage = "Estamos quase lá...";

    const sub = this.authenticationService.loginWithGoogle(googleCredential).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.ngZone.run(() => {
          this.router.navigateByUrl('/main-panel');
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
      }
    });

    this.subscriptions.push(sub);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }
}