import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../core/model/User';
import { CustomHttpRespone } from '../core/model/custom-http-response';
import { IApiResponse } from '../core/interface/IApiResponse';
import { UserFilter } from '../core/interface/UserFilter';
import { Post } from '../core/model/Post';
import { IUserFilter } from '../core/model/IUserFilter';
import { IPostFilter } from '../core/interface/IPostFilter';


@Injectable({ providedIn: 'root' })
export class UserService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  search(filter: IUserFilter): Observable<IApiResponse<User>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort)
      ;

    if (filter.name) {
      params = params.set('name', filter.name);
    }

    console.log(params);
    console.log("Getting list");

    return this.http.get<IApiResponse<User>>(`${this.host}/user/list/pageable`, { params });
  }

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/list`);
  }

  save(user: User, profileImageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImageFile);
    return this.http.post<User>(`${this.host}/user/add`, formData);
  }

  update(user: User, profileImageFile: File): Observable<User> {
    const formData = new FormData();
    formData.append('currentUsername', user.username);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImageFile);
    return this.http.put<User>(`${this.host}/user/update`, formData);
  }

  
  updateUserProfile(user: User): Observable<User> {
    const formData = new FormData();
    formData.append('currentUsername', user.username);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('username', user.username);
    formData.append('email', user.email);
    formData.append('institution', user.institution);
    formData.append('bio', user.bio);
    formData.append('course', user.course);
    formData.append('role', user.role);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    return this.http.put<User>(`${this.host}/user/update-user-profile`, formData);
  }

  //updateUserProfile(user: User): Observable<User> {
  //  return this.http.put<User>(`${this.host}/${user.id}`, user, {});
  //}

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

  getUserByUserId(userId: string): Observable<User> {
    return this.http.get<User>(`${this.host}/user/find-by-user-id/${userId}`, {});
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

  addPostToSavedPosts(userId: number, postId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/user/${userId}/savedPosts/${postId}`, {});
  }

  removePostFromSavedPosts(userId: number, postId: number): Observable<User> {
    return this.http.delete<User>(`${this.host}/user/${userId}/savedPosts/${postId}`);
  }

  doesUserSavedPost(userId: number, postId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/user/${userId}/savedPosts/contains/${postId}`);
  }

  getSavedPosts(userId: number, filtro: IPostFilter): Observable<IApiResponse<Post>> {

    let params = new HttpParams()
      .set('page', filtro.page)
      .set('sort', filtro.sort)
      .set('size', filtro.itemsPerPage);

    return this.http.get<IApiResponse<Post>>(`${this.host}/user/${userId}/savedPosts`, { params });
  }

  countSavedPostsByUser(userId: number): Observable<number> {
    return this.http.get<number>(`${this.host}/user/${userId}/savedPosts/count`, {});
  }

  getFriendRequests(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/friend-requests`, {});
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/friends`, {});
  }

  acceptFriendRequest(friendId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/user/accept-friend-requests/${friendId}`, {});
  }

  rejectFriendRequest(friendId: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/user/reject-friend-requests/${friendId}`, {});
  }

  removeFriend(friendId: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/user/friends/${friendId}`, {});
  }

  sendFriendRequest(user: User): Observable<User> {
    return this.http.post<User>(`${this.host}/user/send-friend-request`, user, {});
  }

  addInterestToUserInterests(userId: number, interestId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/${userId}/interests/${interestId}`, { });
  }

  addCourseToSubscribedOnlineCourses(userId: number, onlineCourseId: number): Observable<User> {
    return this.http.post<User>(`${this.host}/user/${userId}/subscribedOnlineCourses/${onlineCourseId}`, {});
  }

  removeCourseFromSubscribedOnlineCourses(userId: number, onlineCourseId: number): Observable<User> {
    return this.http.delete<User>(`${this.host}/user/${userId}/subscribedOnlineCourses/${onlineCourseId}`);
  }

  doesUserSubscribedOnlineCourse(userId: number, onlineCourseId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/user/${userId}/subscribedOnlineCourses/contains/${onlineCourseId}`);
  }

  updateProfilePhoto(username: string, file: File): Observable<User> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<User>(`${this.host}/user/${username}/profile-photo`, formData);
  }

  updateProfileCoverPhoto(username: string, file: File): Observable<User> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<User>(`${this.host}/user/${username}/cover-photo`, formData);
  }

}
