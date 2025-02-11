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

  constructor(private http: HttpClient) {}

  getNotifications(userId: number): Observable<IApiResponse<Notification>> {
    return this.http.get<IApiResponse<Notification>>(`${this.apiUrl}/${userId}`);
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-as-read/${notificationId}`, {});
  }
}
