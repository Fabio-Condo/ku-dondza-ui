import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { CourseFilter } from '../core/interface/CourseFilter';
import { Course } from '../core/model/Course';
import { IApiResponse } from '../core/interface/IApiResponse';


@Injectable({ providedIn: 'root' })
export class CourseService {
    private host = environment.apiUrl + '/courses';

    constructor(private http: HttpClient) { }

    findAll(filtro: CourseFilter): Observable<IApiResponse<Course>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.name) {
            params = params.set('name', filtro.name);
        }

        return this.http.get<IApiResponse<Course>>(`${this.host}/filter`, { params });

    }

    findByInstitutionId(institutionId: number, filtro: CourseFilter): Observable<IApiResponse<Course>> {
        
        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina)
            .set('institutionId', institutionId);

        return this.http.get<IApiResponse<Course>>(`${this.host}/findByInstitutionId`, { params });
    }

    getAll(): Observable<IApiResponse<Course>> {
        return this.http.get<IApiResponse<Course>>(`${this.host}/filter`, {});
    }

    getByInstitutionId(institutionId: number): Promise<Course[]> {
        const params = new HttpParams()
          .set('institutionId', institutionId);
        return firstValueFrom(this.http.get<Course[]>(`${this.host}/institutions`, { params }));
    }

    findById(id: number): Observable<Course> {
        return this.http.get<Course>(`${this.host}/${id}`, {});
    }

    add(course: Course): Observable<Course> {
        return this.http.post<Course>(this.host, course, {});
    }

    update(course: Course): Observable<Course> {
        return this.http.put<Course>(`${this.host}/${course.id}`, course, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
