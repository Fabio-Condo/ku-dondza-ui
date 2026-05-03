import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';
import { Role } from 'src/app/enum/role.enum';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { GoogleAuthService } from 'src/app/users/google-auth-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  imagePath = './assets/images';
  isUserLoggedIn: boolean = false;
  loggedUser: User = new User();
  isPopoutVisible = false;
  isMenuActive = false; // Controla a exibição do menu
  unreadNotificationsCount: number = 0;
  isDropdownOpen = false;

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
    private googleAuthService: GoogleAuthService,
    private ngZone: NgZone,
    private messageService: MessageService,
  ) { }


  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.authenticationService.loginStatus$.subscribe(logged => {
      this.isUserLoggedIn = logged;
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    });
  }

  //this.authenticationService.logOut(); // So para testes, remova depois

  onPratice() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/quizzes', 'new']);
    });
  }

  goToProfile() {
    const userId = this.loggedUser.userId;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/profile', userId]);
    });
  }

  onGoToProgressPanel(): void {
    if (this.isUserLoggedIn) {
      this.router.navigateByUrl('/progress');
      return;
    }

    this.displayModalLogin = true;
    document.body.classList.add('no-scroll');    
    setTimeout(() => {
      this.displayModalLogin = true;
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  goToProgressPanel() {
    //const userId = this.loggedUser.id;

    //this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //this.router.navigate(['/progress-panel/users', 1]);
    //});

    this.router.navigateByUrl('/progress');
  }

  onLogIn(): void {
    this.router.navigate(['/login']);
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.authenticationService.notifyLoginStatus(false);
    //this.router.navigate(['/home']);
    this.router.navigateByUrl('/main-panel');
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    this.isPopoutVisible = false;
  }

  togglePopout() {
    //this.isPopoutVisible = !this.isPopoutVisible;
    //this.isMenuActive = false;
  }

  showNavButtons() {
    return this.router.url === '/home';
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

        //this.findById(this.question.questionId);
        this.router.navigateByUrl('/progress');

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

        this.router.navigateByUrl('/progress');

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

  private async initializeGoogleAuth(): Promise<void> {
    try {
      const setupButton =
        await this.googleAuthService.initializeGoogleButton('google-signin-button');

      setupButton((credential) => this.handleGoogleCredential(credential));

      // só ativa o botão se tudo correr bem
      this.googleAuthReady = true;

    } catch (error) {
      this.googleAuthReady = false;

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
        this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
        this.loggedUser = this.authenticationService.getUserFromLocalCache();


        this.ngZone.run(() => {
          //this.findById(this.question.questionId);
          this.router.navigateByUrl('/progress');
          this.showLoading = false;
          this.displayModalLogin = false;
          document.body.classList.remove('no-scroll');
        });
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error?.message || 'Falha na autenticação com Google');
        this.showLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    setTimeout(() => {
      this.initializeGoogleAuth();
    }, 100); // Espera para o botão estar no DOM
  }

  onCloseLoginPopout() {
    this.displayModalLogin = false;
    document.body.classList.remove('no-scroll');
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}