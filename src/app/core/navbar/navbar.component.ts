import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ErrorHandlerService } from '../error-handler.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  imagePath = './assets/images'

  constructor(
    private router: Router,
  ) { }

    ngOnInit(): void {
    }

    goToProfile(){
      this.router.navigate(['/user/profile']);
    }

    isActive(url: string): boolean {
      return this.router.isActive(url, true);
    }

  

}
