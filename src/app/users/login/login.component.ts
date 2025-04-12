import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../authentication.service';
import { User } from 'src/app/core/model/User';
import { GoogleAuthService } from '../google-auth-service.service';
import { NgForm } from '@angular/forms';


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
  loadingMessage = "Carregando..."; // Alterar dinamicamente

  activeTab: number = 1;

  constructor(
    private ngZone: NgZone,
    private http: HttpClient,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private changeDetectorRef: ChangeDetectorRef, // Adicionado
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
    this.loadingMessage = "Estamos quase lá...";
    this.showLoading = true;

    const subscription = this.authenticationService.login(user).subscribe({
      next: (response: HttpResponse<User>) => {
        const token = response.headers.get(HeaderType.JWT_TOKEN);
        this.authenticationService.saveToken(token);
        this.authenticationService.addUserToLocalCache(response.body);
        this.router.navigateByUrl('/main-panel');
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
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
    this.ngZone.run(() => {
      this.loadingMessage = "Estamos quase lá...";
      this.showLoading = true;
    });
  
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
