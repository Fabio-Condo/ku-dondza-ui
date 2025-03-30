import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../core/model/User';
import { CustomHttpRespone } from '../core/model/custom-http-response';
import { IApiResponse } from '../core/interface/IApiResponse';
import { IUserFilter } from '../core/interface/IUserFilter';
import { OnlineCourse } from '../core/model/Online-course';
import { OnlineCourseFilter } from '../core/interface/OnlineCourseFilter';
import { Subject } from '../core/model/Subject';


@Injectable({ providedIn: 'root' })
export class UserService {
  private host = environment.apiUrl + '/user';

  constructor(private http: HttpClient) { }

  search(filter: IUserFilter): Observable<IApiResponse<User>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort)
      ;

    if (filter.searchParam) {
      params = params.set('searchParam', filter.searchParam);
    }

    return this.http.get<IApiResponse<User>>(`${this.host}/list/pageable`, { params });
  }

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/list`);
  }

  getAllInstrutors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/instrutores`, {});
  }

  save(user: User, profileImageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('fullName', user.fullName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('userType', user.userType);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImageFile);
    return this.http.post<User>(`${this.host}/add`, formData);
  }

  update(user: User, profileImageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('currentUsername', user.username);
    formData.append('fullName', user.fullName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('userType', user.userType);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImageFile);
    return this.http.put<User>(`${this.host}/update`, formData);
  }

  updateUserProfile(user: User): Observable<User> {
    const formData = new FormData();
    formData.append('currentUsername', user.username);
    formData.append('fullName', user.fullName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('bio', user.bio);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    return this.http.put<User>(`${this.host}/update-user-profile`, formData);
  }

  //updateUserProfile(user: User): Observable<User> {
  //  return this.http.put<User>(`${this.host}/${user.id}`, user, {});
  //}

  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`, {});
  }

  public resetPassword(email: string): Observable<CustomHttpRespone> {
    return this.http.get<CustomHttpRespone>(`${this.host}/resetpassword/${email}`);
  }

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User>> {
    return this.http.post<User>(`${this.host}/user/updateProfileImage`, formData,
      {
        reportProgress: true,
        observe: 'events'
      });  // You need to use reportProgress: true to show some progress of any HTTP request. If you want to see all events, including the progress of transfers you need to use observe: 'events' option as well and return an Observable of type HttpEvent .
  }

  public deleteUser(username: string): Observable<CustomHttpRespone> {
    return this.http.delete<CustomHttpRespone>(`${this.host}/delete/${username}`);
  }

  getUserByUserId(userId: string): Observable<User> {
    return this.http.get<User>(`${this.host}/find-by-user-id/${userId}`, {});
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

  changeStatusActive(username: string, active: boolean): Observable<void> {
    return this.http.put<void>(`${this.host}/${username}/active-user`, active, {});
  }

  changeStatusNotLocked(username: string, notLocked: boolean): Observable<void> {
    return this.http.put<void>(`${this.host}/${username}/notLocked-user`, notLocked, {});
  }

  getUserSubjectInterests(userId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.host}/${userId}/interests`);
  }

  addInterestToUserInterests(userId: number, interestId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/${userId}/interests/${interestId}`, {});
  }

  getSubscribedOnlineCoursesByUserId(userId: number, filtro: OnlineCourseFilter): Observable<IApiResponse<OnlineCourse>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    return this.http.get<IApiResponse<OnlineCourse>>(`${this.host}/${userId}/subscribedOnlineCourses`, { params });
  }

  countSubscribedOnlineCoursesByUserId(userId: number): Observable<number> {
    return this.http.get<number>(`${this.host}/${userId}/subscribedOnlineCourses/total`, {});
  }

  addCourseToSubscribedOnlineCourses(userId: number, onlineCourseId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/${userId}/subscribedOnlineCourses/${onlineCourseId}`, {});
  }

  removeCourseFromSubscribedOnlineCourses(userId: number, onlineCourseId: number): Observable<User> {
    return this.http.delete<User>(`${this.host}/${userId}/subscribedOnlineCourses/${onlineCourseId}`);
  }

  doesUserSubscribedOnlineCourse(userId: number, onlineCourseId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/${userId}/subscribedOnlineCourses/contains/${onlineCourseId}`);
  }

  updateProfilePhoto(username: string, file: File): Observable<User> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<User>(`${this.host}/${username}/profile-photo`, formData);
  }

  updateProfileCoverPhoto(username: string, file: File): Observable<User> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<User>(`${this.host}/${username}/cover-photo`, formData);
  }

  addContentToMarkedCourseContents(userId: number, onlineCourseContentId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/${userId}/marked-course-content/${onlineCourseContentId}`, {});
  }

  removeContentFromMarkedCourseContents(userId: number, onlineCourseContentId: number): Observable<User> {
    return this.http.delete<User>(`${this.host}/${userId}/marked-course-content/${onlineCourseContentId}`);
  }

  checkIfMarkedCourseContent(userId: number, onlineCourseContentId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/${userId}/marked-course-content/contains/${onlineCourseContentId}`);
  }

}
