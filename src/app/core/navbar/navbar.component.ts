import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';
import { Role } from 'src/app/enum/role.enum';

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


  constructor(
    private router: Router,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
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

  goToProfile() {
    const userId = this.loggedUser.userId;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/user/profile', userId]);
    });
  }

  goToProgressPanel() {
    const userId = this.loggedUser.id;

    //this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/progress-panel/users', 1]);
    //});
  }

  onLogIn(): void {
    this.router.navigate(['/login']);
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.authenticationService.notifyLoginStatus(false);
    this.router.navigate(['/home']);
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
