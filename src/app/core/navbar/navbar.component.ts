import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../error-handler.service';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { User } from '../model/User';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  imagePath = './assets/images'
  isUserLoggedIn: boolean = false;

  loggedUser: User = new User;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
  ) { }

    ngOnInit(): void {
      this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
      this.loggedUser = this.authenticationService.getUserFromLocalCache();
    }

    goToProfile(){
      this.router.navigate(['/user/profile']);
    }

    isActive(url: string): boolean {
      return this.router.isActive(url, true);
    }

  

}
