import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserCourse } from '../model/UserCourse';
import { IApiResponse } from '../interface/IApiResponse';
import { UserCourseFilter } from '../interface/UserCourseFilter';



@Injectable({ providedIn: 'root' })
export class UserCourseService {

    private host = environment.apiUrl + '/user-courses';

    constructor(private http: HttpClient) { }

    addCourseToUser(userCourse: UserCourse): Observable<UserCourse> {
        return this.http.post<UserCourse>(this.host, userCourse, {});
    }

    updateUserCourse(userCourse: UserCourse): Observable<UserCourse> {
        return this.http.put<UserCourse>(`${this.host}/${userCourse.id}`, userCourse, {});
    }

    removeUserCourse(userCourseId: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${userCourseId}`);
    }

    getCoursesByUser(userId: number, filter: UserCourseFilter): Observable<IApiResponse<UserCourse>> {
        const params = new HttpParams()
            .set('page', filter.page.toString())
            .set('size', filter.itemsPerPage.toString())
            .set('sort', filter.sort);

        return this.http.get<IApiResponse<UserCourse>>(`${this.host}/user/${userId}`, { params });
    }

    getUsersByCourse(courseId: number, filter: UserCourseFilter): Observable<IApiResponse<UserCourse>> {
        const params = new HttpParams()
            .set('page', filter.page.toString())
            .set('size', filter.itemsPerPage.toString())
            .set('sort', filter.sort);

        return this.http.get<IApiResponse<UserCourse>>(`${this.host}/course/${courseId}`, { params });
    }

    checkEnrollment(userId: number, courseId: number): Observable<boolean> {
        const params = new HttpParams()
            .set('userId', userId.toString())
            .set('courseId', courseId.toString());

        return this.http.get<boolean>(`${this.host}/check-enrollment`, { params });
    }

}