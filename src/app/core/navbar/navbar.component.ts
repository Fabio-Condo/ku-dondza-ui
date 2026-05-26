import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';
import { Role } from 'src/app/enum/role.enum';
import { Subscription } from 'rxjs';
import { AuthModalService } from '../auth-modal.service';

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

  showLoading: boolean = false;

  loadingMessage = "Carregando..."; // Alterar dinamicamente

  isMoreMenuOpen: boolean = false; // Controla a exibição do menu "Mais"


  constructor(
    private router: Router,
    public authModalService: AuthModalService,
    private authenticationService: AuthenticationService,
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

    this.onLogIn();
  }

  goToProgressPanel() {
    //const userId = this.loggedUser.id;

    //this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    //this.router.navigate(['/progress-panel/users', 1]);
    //});

    this.router.navigateByUrl('/progress');
  }

  openLogin() {
    this.authModalService.open();
  }

  onLogIn(): void {
    this.openLogin();
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

  toggleMoreMenu() {
    this.isMoreMenuOpen = !this.isMoreMenuOpen;
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

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

}