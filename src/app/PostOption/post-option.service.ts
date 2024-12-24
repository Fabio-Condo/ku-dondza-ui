import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IUserFilter } from '../core/model/IUserFilter';
import { User } from '../core/model/User';
import { PollOption } from '../core/model/PollOption';


@Injectable({ providedIn: 'root' })
export class PostOptionService {
    private host = environment.apiUrl + '/poll_options';

    constructor(private http: HttpClient) { }

    getPeopleWhoSelectedByOptionId(optionId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${optionId}/people`, { params });
    }

    toggleUserVote(optionId: number, userId: number): Observable<PollOption> {
        return this.http.post<PollOption>(`${this.host}/${optionId}/people/${userId}/vote`, {});
    }

    removeUserVote(postId: number, userId: number): Observable<PollOption> {
        return this.http.post<PollOption>(`${this.host}/${postId}/people/${userId}/remove-vote`, {});
    }

    hasUserVoted(postId: number, userId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.host}/${postId}/people/votes/contains/${userId}`);
    }

    countPeopleWhoSelectedByOptionId(optionId: number): Observable<number> {
        return this.http.get<number>(`${this.host}/${optionId}/people/total`, {});
    }

    checkIfSelected(optionId: number, userId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.host}/${optionId}/people/contains/${userId}`);
    }
}
