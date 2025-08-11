import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserSubjectSubscription } from '../core/model/UserSubjectSubscription';
import { IApiResponse } from '../core/interface/IApiResponse';
import { User } from '../core/model/User';
import { UserSubjectSubscriptionFilter } from '../core/interface/UserSubjectSubscriptionFilter';
import { IUserFilter } from '../core/interface/IUserFilter';



@Injectable({ providedIn: 'root' })
export class UserSubjectSubscriptionService {

    private host = environment.apiUrl + '/user-subjects-subscription';

    constructor(private http: HttpClient) { }

    addSubjectToUser(userSubjectSubscription: UserSubjectSubscription): Observable<UserSubjectSubscription> {
        return this.http.post<UserSubjectSubscription>(this.host, userSubjectSubscription, {});
    }

    updateUserSubjectSubscription(userSubjectSubscription: UserSubjectSubscription): Observable<UserSubjectSubscription> {
        return this.http.put<UserSubjectSubscription>(`${this.host}/${userSubjectSubscription.id}`, userSubjectSubscription, {});
    }

    removeSubscription(userSubjectSubscriptionId: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${userSubjectSubscriptionId}`);
    }

    getSubjectsByUser(userId: number, filter: UserSubjectSubscriptionFilter): Observable<IApiResponse<UserSubjectSubscription>> {
        const params = new HttpParams()
            .set('page', filter.page.toString())
            .set('size', filter.itemsPerPage.toString())
            .set('sort', filter.sort);

        return this.http.get<IApiResponse<UserSubjectSubscription>>(`${this.host}/user/${userId}`, { params });
    }

    getUsersBySubject(subjectId: number, filter: UserSubjectSubscriptionFilter): Observable<IApiResponse<UserSubjectSubscription>> {
        const params = new HttpParams()
            .set('page', filter.page.toString())
            .set('size', filter.itemsPerPage.toString())
            .set('sort', filter.sort);

        return this.http.get<IApiResponse<UserSubjectSubscription>>(`${this.host}/subject/${subjectId}`, { params });
    }

    checkEnrollment(userId: number, courseId: number): Observable<boolean> {
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('courseId', courseId.toString());

        return this.http.get<boolean>(`${this.host}/check-enrollment`, { params });
    }

    getEnrolledUsersBySubjectId(courseId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${courseId}/enrolled-users`, { params });
    }

}