import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { OnlineCourse } from '../core/model/Online-course';
import { IUserFilter } from '../core/model/IUserFilter';
import { User } from '../core/model/User';
import { OnlineCourseFilter } from '../core/interface/OnlineCourseFilter';
import { QuestionFilter } from '../core/interface/QuestionFilter';
import { Question } from '../core/model/Question';


@Injectable({ providedIn: 'root' })
export class OnlineCoursesService {
    private host = environment.apiUrl + '/online-course';

    constructor(private http: HttpClient) { }

    findAll(filtro: OnlineCourseFilter): Observable<IApiResponse<OnlineCourse>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.searchParam) {
            params = params.set('searchParam', filtro.searchParam);
        }

        return this.http.get<IApiResponse<OnlineCourse>>(`${this.host}/filter`, { params });
    }

    listarTodos(): Observable<IApiResponse<OnlineCourse>> {
        return this.http.get<IApiResponse<OnlineCourse>>(`${this.host}/filter`, {});
    }

    save(course: OnlineCourse, file: File): Observable<OnlineCourse> {
        const formData = new FormData();
        formData.append('name', course.name);
        formData.append('description', course.description);
        formData.append('requirements', course.requirements);
        formData.append('lunchDate', course.lunchDate);
        formData.append('instrutorName', course.instrutorName);
        formData.append('instrutorDescription', course.instrutorDescription);
        formData.append('instrutorSpecialization', course.instrutorSpecialization);
        formData.append('file', file);
        return this.http.post<OnlineCourse>(`${this.host}`, formData);
    }

    update(course: OnlineCourse, file: File): Observable<OnlineCourse> {
        const formData = new FormData();
        formData.append('id', course.id.toString());
        formData.append('name', course.name);
        formData.append('description', course.description);
        formData.append('requirements', course.requirements);
        formData.append('lunchDate', course.lunchDate);
        formData.append('instrutorName', course.instrutorName);
        formData.append('instrutorDescription', course.instrutorDescription);
        formData.append('instrutorSpecialization', course.instrutorSpecialization);
        formData.append('file', file);
        return this.http.put<OnlineCourse>(`${this.host}`, formData);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    findById(id: number): Observable<OnlineCourse> {
        return this.http.get<OnlineCourse>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

    getStudentsByCourseId(courseId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${courseId}/students`, { params });
    }

    countOnlineCourseStudentsByCourseId(courseId: number): Observable<number> {
        return this.http.get<number>(`${this.host}/${courseId}/students/total`, {});
    }

    addQuestionToCourse(courseId: number, questionId: number): Observable<OnlineCourse> {
        return this.http.post<OnlineCourse>(`${this.host}/${courseId}/questions/${questionId}`, {});
    }

    removeQuestionFromCourse(courseId: number, questionId: number): Observable<OnlineCourse> {
        return this.http.delete<OnlineCourse>(`${this.host}/${courseId}/questions/${questionId}`);
    }

    getQuestionsByCourseId(courseId: number, filtro: QuestionFilter): Observable<IApiResponse<Question>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<Question>>(`${this.host}/${courseId}/questions`, { params });
    }

    countQuestionsByCourseId(courseId: number): Observable<number> {
        return this.http.get<number>(`${this.host}/${courseId}/questions/total`, {});
    }
}
