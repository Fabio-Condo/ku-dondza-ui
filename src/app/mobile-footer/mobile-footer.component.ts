import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobile-footer',
  templateUrl: './mobile-footer.component.html',
  styleUrls: ['./mobile-footer.component.css']
})
export class MobileFooterComponent implements OnInit {

  constructor(
        private router: Router,
  ) { }

  ngOnInit(): void {
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

}
