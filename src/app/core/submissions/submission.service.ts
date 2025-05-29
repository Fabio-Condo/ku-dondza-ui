import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Submission } from '../model/Submission';
import { IApiResponse } from '../interface/IApiResponse';
import { SubmissionFilter } from '../interface/SubmissionFilter';


@Injectable({ providedIn: 'root' })
export class SubmissionService {
    private host = environment.apiUrl + '/submissions';

    constructor(private http: HttpClient) { }

    getSubmissionsByCompetitionId(competitionId: number, filtro: SubmissionFilter): Observable<IApiResponse<Submission>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<Submission>>(`${this.host}/${competitionId}/submissions`, { params });
    }

    findById(id: number): Observable<Submission> {
        return this.http.get<Submission>(`${this.host}/${id}`, {});
    }

    add(submission: Submission, userAnswerIds: any[]): Observable<Submission> {

        const params = new HttpParams()
            .set('userAnswerIds', userAnswerIds.join(','));

        return this.http.post<Submission>(`${this.host}`, submission, { params });
    }

    getSubmissionByUserAndCompetition(userId: number, competitionId: number): Observable<Submission> {
        return this.http.get<Submission>(`${this.host}/user/${userId}/competition/${competitionId}`);
    }
}