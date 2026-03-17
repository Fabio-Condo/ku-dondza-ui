import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  isUserLoggedIn: boolean = false;
  loggedUser: User = new User();

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
    this.loggedUser = this.authenticationService.getUserFromLocalCache();

    this.authenticationService.loginStatus$.subscribe(logged => {
      this.isUserLoggedIn = logged;
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    });
  }

  enterOnGroup() {
    window.open('https://chat.whatsapp.com/B95NsSxUWFYETIMvKBRynV?mode=ac_t', '_blank');
  }

  onLogOut(): void {
    this.authenticationService.logOut();
    this.authenticationService.notifyLoginStatus(false);
    //this.router.navigate(['/home']);
    this.router.navigateByUrl('/main-panel');
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
