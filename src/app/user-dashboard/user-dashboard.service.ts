import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserDashboardDTO } from '../core/interface/UserDashboardDTO';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private baseUrl = environment.apiUrl + '/user';

  constructor(private http: HttpClient) { }

  getUserDashboard(userId: number): Observable<UserDashboardDTO> {
    return this.http.get<UserDashboardDTO>(`${this.baseUrl}/${userId}/dashboard`, {});
  }


}
