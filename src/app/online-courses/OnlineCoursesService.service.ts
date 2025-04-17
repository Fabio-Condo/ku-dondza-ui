import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IUserFilter } from '../core/interface/IUserFilter';
import { User } from '../core/model/User';
import { OnlineCourseFilter } from '../core/interface/OnlineCourseFilter';
import { QuestionFilter } from '../core/interface/QuestionFilter';
import { Question } from '../core/model/Question';
import { Course } from '../core/model/Course';


@Injectable({ providedIn: 'root' })
export class OnlineCoursesService {
    private host = environment.apiUrl + '/online-course';

    constructor(private http: HttpClient) { }

    findAll(filtro: OnlineCourseFilter): Observable<IApiResponse<Course>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.searchParam) {
            params = params.set('searchParam', filtro.searchParam);
        }

        if (filtro.name) {
            params = params.set('name', filtro.name);
        }
    
        if (filtro.instrutor) {
            params = params.set('instrutor', filtro.instrutor);
        }

        if (filtro.user) {
            params = params.set('user', filtro.user);
        }

        return this.http.get<IApiResponse<Course>>(`${this.host}/filter`, { params });
    }

    listarTodos(): Observable<IApiResponse<Course>> {
        return this.http.get<IApiResponse<Course>>(`${this.host}/filter`, {});
    }

    save(course: Course, file: File): Observable<Course> {
        const formData = new FormData();
        formData.append('name', course.name);
        formData.append('description', course.description);
        formData.append('lunchDate', course.lunchDate);
        formData.append('instrutorId', course.instrutor.id.toString());
        formData.append('file', file);
        return this.http.post<Course>(`${this.host}`, formData);
    }

    update(course: Course, file: File): Observable<Course> {
        const formData = new FormData();
        formData.append('id', course.id.toString());
        formData.append('name', course.name);
        formData.append('description', course.description);
        formData.append('lunchDate', course.lunchDate);
        formData.append('instrutorId', course.instrutor.id.toString());
        formData.append('file', file);
        return this.http.put<Course>(`${this.host}`, formData);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    findById(id: number): Observable<Course> {
        return this.http.get<Course>(`${this.host}/${id}`, {});
    }

    getOnlineCourseByOnlineCourseId(onlineCourseId: string): Observable<Course> {
        return this.http.get<Course>(`${this.host}/find-by-courseId/${onlineCourseId}`, {});
    }

    getStudentsByCourseId(courseId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${courseId}/students`, { params });
    }

}
