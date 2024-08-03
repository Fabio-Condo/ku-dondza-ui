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

        if (filtro.country) {
            params = params.set('country', filtro.country);
        }
        return this.http.get<IApiResponse<Institution>>(`${this.host}/filter`, { params });

    }

    listarTodos(): Observable<IApiResponse<Institution>> {
        return this.http.get<IApiResponse<Institution>>(`${this.host}/filter`, {});
    }

    save(name: string, acronym: string, type: string, administrationType: string, country: string, address: string, description: string, website: string, file: File): Observable<Institution> {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('acronym', acronym);
        formData.append('type', type);
        formData.append('administrationType', administrationType);
        formData.append('country', country);
        formData.append('address', address);
        formData.append('description', description);
        formData.append('website', website);
        formData.append('file', file);
        return this.http.post<Institution>(`${this.host}`, formData);
    }

    update(id: number, name: string, acronym: string, type: string, administrationType: string, country: string, address: string, description: string, website: string, file: File): Observable<Institution> {
        const formData = new FormData();
        formData.append('id', id.toString());
        formData.append('name', name);
        formData.append('acronym', acronym);
        formData.append('type', type);
        formData.append('administrationType', administrationType);
        formData.append('country', country);
        formData.append('address', address);
        formData.append('description', description);
        formData.append('website', website);
        formData.append('file', file);
        return this.http.put<Institution>(`${this.host}`, formData);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    findById(id: number): Observable<Institution> {
        return this.http.get<Institution>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
