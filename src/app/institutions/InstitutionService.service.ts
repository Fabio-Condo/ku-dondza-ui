import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { InstitutionFilter } from '../core/interface/InstitutionFilter';
import { Institution } from '../core/model/Institution';


@Injectable({ providedIn: 'root' })
export class InstitutionService {
    private host = environment.apiUrl + '/institutions';

    constructor(private http: HttpClient) { }

    findAll(filtro: InstitutionFilter): Observable<IApiResponse<Institution>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.global) {
            params = params.set('global', filtro.global);
        }
        if (filtro.name) {
            params = params.set('name', filtro.name);
        }
        if (filtro.type) {
            params = params.set('type', filtro.type);
        }
        if (filtro.administrationType) {
            params = params.set('administrationType', filtro.administrationType);
        }

        return this.http.get<IApiResponse<Institution>>(`${this.host}/filter`, { params });

    }

    listarTodos(): Observable<IApiResponse<Institution>> {
        return this.http.get<IApiResponse<Institution>>(`${this.host}/filter`, {});
    }

    add(institution: Institution): Observable<Institution> {
        return this.http.post<Institution>(this.host, institution, {});
    }

    update(institution: Institution): Observable<Institution> {
        return this.http.put<Institution>(`${this.host}/${institution.id}`, institution, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
