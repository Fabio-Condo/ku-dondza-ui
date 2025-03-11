import { Component, OnInit } from '@angular/core';
import { Role } from 'src/app/enum/role.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  isUserLoggedIn: boolean = false;

  constructor(
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.isUserLoggedIn = this.authenticationService.isUserLoggedIn();
  }

}
