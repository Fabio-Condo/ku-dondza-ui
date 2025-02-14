import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Notification } from '../core/model/Notification';
import { IApiResponse } from '../core/interface/IApiResponse';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notifications';

  events!: EventSource;
  unreadNotificationsCount!: number;

  constructor(private http: HttpClient) { }

  getNotifications(userId: number): Observable<IApiResponse<Notification>> {
    return this.http.get<IApiResponse<Notification>>(`${this.apiUrl}/${userId}`);
  }

  markAllNotificationsAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-all-read?userId=${userId}`, {});
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-as-read/${notificationId}`, {});
  }

  getUnreadNotificationsCount(userId: number): Observable<number> {
    this.events = new EventSource(`${this.apiUrl}/unread-count?userId=${userId}`);

    return new Observable<number>(observer => {
      this.events.addEventListener('unreadNotificationsCount', (event: MessageEvent) => {
        this.unreadNotificationsCount = +event.data;
        observer.next(this.unreadNotificationsCount);
      });

      this.events.onerror = (error) => {
        console.error('EventSource failed:', error);
        observer.error(error);
        this.events.close();
      };
    });
  }

  //getUnreadNotificationsCount(userId: number): Observable<number> {
  //  return this.http.get<number>(`${this.apiUrl}/unread-count?userId=${userId}`);
  //}

  closeConnection() {
    if (this.events) {
      this.events.close();
    }
  }
}
