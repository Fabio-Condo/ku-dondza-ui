import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { InstitutionFilter } from '../core/interface/InstitutionFilter';
import { OnlineCourseContent } from '../core/model/Online-course-content';
import { CourseFilter } from '../core/interface/CourseFilter';
import { Tema } from '../core/model/Tema';


@Injectable({ providedIn: 'root' })
export class TemaService {
    private host = environment.apiUrl + '/temas';

    constructor(private http: HttpClient) { }

    findAll(filtro: InstitutionFilter): Observable<IApiResponse<Tema>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        return this.http.get<IApiResponse<Tema>>(`${this.host}/filter`, { params });
    }


    getAll(courseId: number): Promise<any> {

        let params = new HttpParams()
            .set('courseId', courseId);

        return firstValueFrom(this.http.get(this.host + '/getListByCourseId', {params}));
    }

    findByOnlineCourseId(courseId: number, filtro: CourseFilter): Observable<IApiResponse<Tema>> {
        
        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina)
            .set('courseId', courseId);

        return this.http.get<IApiResponse<Tema>>(`${this.host}/findByCourseId`, { params });
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    findById(id: number): Observable<Tema> {
        return this.http.get<Tema>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
