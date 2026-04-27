import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { UserSubjectRankingDTO } from '../model/UserSubjectRankingDTO';
import { IApiResponse } from '../interface/IApiResponse';
import { RankingFilter } from '../interface/RankingFilter';
import { UserSubjectRankingSummaryDTO } from '../model/UserSubjectRankingSummaryDTO';


@Injectable({ providedIn: 'root' })
export class RankingService {
    private host = environment.apiUrl + '/ranking';

    constructor(private http: HttpClient) { }

    getRanking(subjectId: number, filter: RankingFilter): Observable<IApiResponse<UserSubjectRankingDTO>> {
        let params = new HttpParams()
            .set('page', filter.page)
            .set('sort', filter.sort)
            .set('size', filter.itemsPerPage);

        return this.http.get<IApiResponse<UserSubjectRankingDTO>>(`${this.host}/subject/${subjectId}`, { params });
    }

    getSummary(userId: number, subjectId: string): Observable<UserSubjectRankingSummaryDTO> {
        return this.http.get<UserSubjectRankingSummaryDTO>(
            `${this.host}/subjects/${subjectId}/users/${userId}/summary`
        );
    }

}
