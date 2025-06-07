import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { User } from 'src/app/core/model/User';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

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
  }

  @Input() visible = true;
  @Input() totalLikes = 0;
  @Input() users: any[] = [];

  @Output() close = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('overlay')) {
      this.close.emit();
    }
  }

  closePopout() {
    this.close.emit();
  }
}
