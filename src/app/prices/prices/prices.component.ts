import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.css']
})
export class PricesComponent implements OnInit {

  loggedUser: User = new User;

  constructor(
    private authenticationService: AuthenticationService,
    private title: Title, 
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Prices page');
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log(this.loggedUser.plan);
  }

}
