import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IUserFilter } from '../core/model/IUserFilter';
import { User } from '../core/model/User';
import { PostOption } from '../core/model/PostOption';


@Injectable({ providedIn: 'root' })
export class PostOptionService {
    private host = environment.apiUrl + '/post_options';

    constructor(private http: HttpClient) { }

    getPeopleWhoSelectedByOptionId(optionId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${optionId}/people`, { params });
    }

    addUserToOption(optionId: number, userId: number): Observable<PostOption> {
        return this.http.post<PostOption>(`${this.host}/${optionId}/people/${userId}`, {});
      }

    countPeopleWhoSelectedByOptionId(optionId: number): Observable<number> {
        return this.http.get<number>(`${this.host}/${optionId}/people/total`, {});
    }

    checkIfSelected(optionId: number, userId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.host}/${optionId}/people/contains/${userId}`);
    }
}
