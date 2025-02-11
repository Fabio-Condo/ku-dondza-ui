import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification-service.service';
import { User } from 'src/app/core/model/User';
import { Notification } from 'src/app/core/model/Notification';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  loggedUser: User = new User();

  constructor(
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications(this.loggedUser.id).subscribe(
      (data: IApiResponse<Notification>) => {
        this.notifications = data.content;
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  markAsRead(notificationId: number): void {
    this.notificationService.markAsRead(notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
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
