import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification-service.service';
import { User } from 'src/app/core/model/User';
import { Notification } from 'src/app/core/model/Notification';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { CompetitionService } from 'src/app/competitions/competition.service';
import { Competition } from 'src/app/core/model/Competition';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  loggedUser: User = new User();
  isPopoutVisible = false;
  activeTab: number = 1;

  constructor(
    private notificationService: NotificationService,
    private competitionService: CompetitionService,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.loggedUser = this.authenticationService.getUserFromLocalCache();
    this.loadNotifications();
    this.scrollToTop();
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

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      notification.read = true;
      //this.notifications = this.notifications.filter(n => n.id !== notification.id);
    },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    );
  }

  acceptParticipationInvite(competition: Competition, friend: User) {
    this.competitionService.acceptParticipationInvite(competition.id, friend.id).subscribe(
      (response) => {

      },
      (errorResponse: HttpErrorResponse) => {
        this.sendErrorNotification(errorResponse.error.message);
      }
    )
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
