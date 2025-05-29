import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { QuestionFilter } from '../core/interface/QuestionFilter';
import { Question } from '../core/model/Question';
import { Topic } from '../core/model/Topic';
import { Competition } from '../core/model/Competition';
import { CompetitionFilter } from '../core/interface/CompetitionFilter';


@Injectable({ providedIn: 'root' })
export class CompetitionService {
    private host = environment.apiUrl + '/competitions';

    constructor(private http: HttpClient) { }

    findAll(filter: CompetitionFilter): Observable<IApiResponse<Competition>> {

        let params = new HttpParams()
            .set('page', filter.page)
            .set('sort', filter.sort)
            .set('size', filter.itemsPerPage);

        if (filter.searchParam) {
            params = params.set('searchParam', filter.searchParam);
        }

        if (filter.title) {
            params = params.set('title', filter.title);
        }

        if (filter.subject) {
            params = params.set('subject', filter.subject);
        }

        if (filter.difficultyLevel) {
            params = params.set('difficultyLevel', filter.difficultyLevel);
        }

        return this.http.get<IApiResponse<Competition>>(`${this.host}/filter`, { params });

    }

    getCompetitionsByQuestionId(questionId: number, filter: CompetitionFilter): Observable<IApiResponse<Competition>> {

        let params = new HttpParams()
            .set('page', filter.page)
            .set('sort', filter.sort)
            .set('size', filter.itemsPerPage);

        return this.http.get<IApiResponse<Competition>>(`${this.host}/by-question/${questionId}`, { params });
    }

    findById(id: number): Observable<Competition> {
        return this.http.get<Competition>(`${this.host}/${id}`, {});
    }

    getCompetitionByCompetitionId(competitionId: string): Observable<Competition> {
        return this.http.get<Competition>(`${this.host}/find-by-competitionId/${competitionId}`, {});
    }

    add(competition: Competition, topicIds: number[]): Observable<Competition> {

        const params = new HttpParams()
            .set('topicIds', topicIds.join(','));

        return this.http.post<Competition>(this.host, competition, { params });
    }

    update(competition: Competition, topicIds: number[], generateQuestions: boolean): Observable<Competition> {

        const params = new HttpParams()
            .set('generateQuestions', generateQuestions)
            .set('topicIds', topicIds.join(','));

        return this.http.put<Competition>(`${this.host}/${competition.id}`, competition, { params });
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

    addQuestionToCompetition(competitionId: number, questionId: number): Observable<Competition> {
        return this.http.post<Competition>(`${this.host}/${competitionId}/questions/${questionId}`, {});
    }

    removeQuestionFromCompetition(competitionId: number, questionId: number): Observable<Competition> {
        return this.http.delete<Competition>(`${this.host}/${competitionId}/questions/${questionId}`);
    }

    getTopicsByCompetitionId(competitionId: number): Observable<Topic[]> {
        return this.http.get<Topic[]>(`${this.host}/${competitionId}/topics`);
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

}