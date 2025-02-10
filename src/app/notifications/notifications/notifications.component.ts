import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification-service.service';
import { User } from 'src/app/core/model/User';
import { Notification } from 'src/app/core/model/Notification';
import { AuthenticationService } from 'src/app/users/authentication.service';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: any[] = [];
  loggedUser: User = new User();

  constructor(
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(this.loggedUser.id).subscribe(data => {
      this.notifications = data;
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    });
  }

}
