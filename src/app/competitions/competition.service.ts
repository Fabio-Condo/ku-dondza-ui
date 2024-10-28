import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Competition } from '../core/model/Competition';
import { CompetitionFilter } from '../core/interface/CompetitionFilter';


@Injectable({ providedIn: 'root' })
export class CompetitionService {
    private host = environment.apiUrl + '/competitions';

    constructor(private http: HttpClient) { }

    findAll(filtro: CompetitionFilter): Observable<IApiResponse<Competition>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        if (filtro.title) {
            params = params.set('title', filtro.title);
        }

        return this.http.get<IApiResponse<Competition>>(`${this.host}/filter`, { params });

    }

    add(competition: Competition): Observable<Competition> {
        return this.http.post<Competition>(this.host, competition, {});
    }

    update(competition: Competition): Observable<Competition> {
        return this.http.put<Competition>(`${this.host}/${competition.id}`, competition, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
