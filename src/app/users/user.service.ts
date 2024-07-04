import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../core/model/User';
import { CustomHttpRespone } from '../core/model/custom-http-response';


@Injectable({ providedIn: 'root' })
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  public addUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  public updateUser(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, formData);
  }

  public resetPassword(email: string): Observable<CustomHttpRespone> {
    return this.http.get<CustomHttpRespone>(`${this.host}/user/resetpassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData,
      {
        reportProgress: true,
        observe: 'events'
      });  // You need to use reportProgress: true to show some progress of any HTTP request. If you want to see all events, including the progress of transfers you need to use observe: 'events' option as well and return an Observable of type HttpEvent .
  }

  public deleteUser(username: string): Observable<CustomHttpRespone> {
    return this.http.delete<CustomHttpRespone>(`${this.host}/user/delete/${username}`);
  }

  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUsersFromLocalCache(): User[] {
    var retrievedObject = localStorage.getItem('users');
    if (retrievedObject) {
      return JSON.parse(retrievedObject);
    }
    return null as any;
  }

  public getUserFromLocalCache(): any {
    return localStorage.getItem('user');
  }

  public createUserFormDate(loggedInUsername: any, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(true));
    formData.append('isNonLocked', JSON.stringify(true));
    return formData;
  }

  changeStatusActive(username: string, active: boolean): Observable<void> {
    return this.http.put<void>(`${this.host}/${username}/active-user`, active, {});
  }


  changeStatusNotLocked(username: string, notLocked: boolean): Observable<void> {
    return this.http.put<void>(`${this.host}/${username}/notLocked-user`, notLocked, {});
  }

}
