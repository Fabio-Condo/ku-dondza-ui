import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Competition } from '../core/model/Competition';
import { CompetitionFilter } from '../core/interface/CompetitionFilter';
import { QuestionFilter } from '../core/interface/QuestionFilter';
import { Question } from '../core/model/Question';
import { User } from '../core/model/User';
import { IUserFilter } from '../core/interface/IUserFilter';


@Injectable({ providedIn: 'root' })
export class CompetitionService {
    private host = environment.apiUrl + '/competitions';

    constructor(private http: HttpClient) { }

    findAll(filtro: CompetitionFilter): Observable<IApiResponse<Competition>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        if (filtro.searchParam) {
            params = params.set('searchParam', filtro.searchParam);
        }

        return this.http.get<IApiResponse<Competition>>(`${this.host}/filter`, { params });

    }

    findById(id: number): Observable<Competition> {
        return this.http.get<Competition>(`${this.host}/${id}`, {});
    }

    getCompetitionByCompetitionId(competitionId: string): Observable<Competition> {
        return this.http.get<Competition>(`${this.host}/find-by-competitionId/${competitionId}`, {});
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

    addParticipantToCompetition(competitionId: number, userId: number): Observable<Competition> {
        return this.http.post<Competition>(`${this.host}/${competitionId}/participants/${userId}`, {});
    }

    removeParticipantFromCompetition(competitionId: number, userId: number): Observable<Competition> {
        return this.http.delete<Competition>(`${this.host}/${competitionId}/participants/${userId}`);
    }

    getParticipantsByCompetitionId(competitionId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${competitionId}/participants`, { params });
    }

    checkIfIsParticipant(competitionId: number, userId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.host}/${competitionId}/participants/contains/${userId}`);
    }

    countParticipantsByCompetitionId(competitionId: number): Observable<number> {
        return this.http.get<number>(`${this.host}/${competitionId}/participants/total`, {});
    }

    addQuestionToCompetition(competitionId: number, questionId: number): Observable<Competition> {
        return this.http.post<Competition>(`${this.host}/${competitionId}/questions/${questionId}`, {});
    }

    removeQuestionFromCompetition(competitionId: number, questionId: number): Observable<Competition> {
        return this.http.delete<Competition>(`${this.host}/${competitionId}/questions/${questionId}`);
    }

    getQuestionsByCompetitionId(competitionId: number, filtro: QuestionFilter): Observable<IApiResponse<Question>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<Question>>(`${this.host}/${competitionId}/questions`, { params });
    }

    countQuestionsByCompetitionId(competitionId: number): Observable<number> {
        return this.http.get<number>(`${this.host}/${competitionId}/questions/total`, {});
    }

    findParticipationRequestsByCompetitionId(competitionId: number, filtro: IUserFilter): Observable<IApiResponse<User>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        return this.http.get<IApiResponse<User>>(`${this.host}/${competitionId}/participation-requests`, { params });
    }

    checkIfRequestedParticipation(competitionId: number, userId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.host}/${competitionId}/participation-requests/contains/${userId}`);
    }

    sendParticipationRequest(competitionId: number, userId: number): Observable<Competition> {
        return this.http.post<Competition>(`${this.host}/${competitionId}/send-participation-request/${userId}`, {});
    }

    acceptParticipationRequest(competitionId: number, userId: number): Observable<Competition> {
        return this.http.post<Competition>(`${this.host}/${competitionId}/accept-participation-requests/${userId}`, {});
    }

    rejectParticipationRequest(competitionId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${competitionId}/reject-participation-requests/${userId}`);
    }

}
