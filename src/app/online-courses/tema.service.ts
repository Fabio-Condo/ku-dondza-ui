import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { InstitutionFilter } from '../core/interface/InstitutionFilter';
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

    save(tema: Tema): Observable<Tema> {
        const formData = new FormData();
        formData.append('name', tema.name);
        formData.append('onlineCourseId', tema.onlineCourse.id.toString());
        formData.append('position', tema.position.toString());
        return this.http.post<Tema>(`${this.host}`, formData);
    }

    update(tema: Tema): Observable<Tema> {
        const formData = new FormData();
        formData.append('id', tema.id.toString());
        formData.append('name', tema.name);
        formData.append('onlineCourseId', tema.onlineCourse.id.toString());
        formData.append('position', tema.position.toString());
        return this.http.put<Tema>(`${this.host}`, formData);
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
