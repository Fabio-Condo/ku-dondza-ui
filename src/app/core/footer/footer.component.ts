import { Component, HostListener, OnInit } from '@angular/core';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  isUserLoggedIn: boolean = false;
  loggedUser: User = new User();

  isAndroid = /Android/i.test(navigator.userAgent);
  showPwaButton = false;
  isInstalled = false;
  deferredPrompt: any;

  constructor(
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.authenticationService.loginStatus$.subscribe(logged => {
      this.isUserLoggedIn = logged;
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e: any) {
    e.preventDefault();
    this.deferredPrompt = e;
    this.showPwaButton = true;
  }

  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(() => {
        this.deferredPrompt = null;
      });
    }
  }

  enterOnGroup() {
    window.open('https://chat.whatsapp.com/B95NsSxUWFYETIMvKBRynV?mode=ac_t', '_blank');
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

}
