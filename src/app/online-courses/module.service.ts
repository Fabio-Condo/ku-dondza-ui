import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom, Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { ModuleFilter } from '../core/interface/ModuleFilter';
import { Module } from '../core/model/Module';


@Injectable({ providedIn: 'root' })
export class ModuleService {
    private host = environment.apiUrl + '/modules';

    constructor(private http: HttpClient) { }

    findAll(filtro: ModuleFilter): Observable<IApiResponse<Module>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        return this.http.get<IApiResponse<Module>>(`${this.host}/filter`, { params });
    }


    findByOnlineCourseId(courseId: number): Observable<Module[]> {

        let params = new HttpParams()
            .set('courseId', courseId);

        return this.http.get<Module[]>(`${this.host}/findByCourseId`, { params });
    }

    save(module: Module): Observable<Module> {
        const formData = new FormData();
        formData.append('name', module.name);
        formData.append('onlineCourseId', module.onlineCourse.id.toString());
        formData.append('position', module.position.toString());
        return this.http.post<Module>(`${this.host}`, formData);
    }

    update(module: Module): Observable<Module> {
        const formData = new FormData();
        formData.append('id', module.id.toString());
        formData.append('name', module.name);
        formData.append('onlineCourseId', module.onlineCourse.id.toString());
        formData.append('position', module.position.toString());
        return this.http.put<Module>(`${this.host}`, formData);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    findById(id: number): Observable<Module> {
        return this.http.get<Module>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
