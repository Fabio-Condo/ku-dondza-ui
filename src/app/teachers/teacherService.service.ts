import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { TeacherFilter } from '../core/interface/TeacherFilter';
import { Teacher } from '../core/model/Teacher';


@Injectable({ providedIn: 'root' })
export class TeacherService {
    private host = environment.apiUrl + '/teachers';

    constructor(private http: HttpClient) { }

    findAll(filtro: TeacherFilter): Observable<IApiResponse<Teacher>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.name) {
            params = params.set('name', filtro.name);
        }

        return this.http.get<IApiResponse<Teacher>>(`${this.host}/filter`, { params });

    }

    listarTodos(): Observable<IApiResponse<Teacher>> {
        return this.http.get<IApiResponse<Teacher>>(`${this.host}/filter`, {});
    }

    add(teacher: Teacher): Observable<Teacher> {
        return this.http.post<Teacher>(this.host, teacher, {});
    }

    update(teacher: Teacher): Observable<Teacher> {
        return this.http.put<Teacher>(`${this.host}/${teacher.id}`, teacher, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

}