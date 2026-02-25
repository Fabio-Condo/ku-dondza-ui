import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Topic } from '../core/model/Topic';
import { environment } from 'src/environments/environment';
import { TopicFilter } from '../core/interface/TopicFilter';
import { IApiResponse } from '../core/interface/IApiResponse';
import { shareReplay } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class TopicService {
    private host = environment.apiUrl + '/topics';

    private cache: { [key: number]: Observable<Topic[]> } = {};

    constructor(private http: HttpClient) { }

    filter(filtro: TopicFilter): Observable<IApiResponse<Topic>> {
        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.searchParam) {
            params = params.set('searchParam', filtro.searchParam);
        }

        if (filtro.subject) {
            params = params.set('subject', filtro.subject);
        }

        if (filtro.name) {
            params = params.set('name', filtro.name);
        }

        return this.http.get<IApiResponse<Topic>>(`${this.host}/filter`, { params });
    }

    getBySubjectId(subjectId: number): Observable<Topic[]> {
        return this.http.get<Topic[]>(`${this.host}/${subjectId}/subjects`);
    }

    getBySubjectIdWithCache(subjectId: number): Observable<Topic[]> {

        // Se já existe no cache, retorna
        if (!this.cache[subjectId]) {
            this.cache[subjectId] = this.http
                .get<Topic[]>(`${this.host}/${subjectId}/subjects`)
                .pipe(
                    shareReplay(1) // mantém resposta em memória
                );
        }

        return this.cache[subjectId];
    }

    //getSubjectsById(subjectId: number): Observable<Topic[]> {
    //    return this.http.get<Topic[]>(`${this.host}/${subjectId}/subjects`);
    //}

    findById(id: number): Observable<Topic> {
        return this.http.get<Topic>(`${this.host}/${id}`, {});
    }

    //getTopicByTopicId(topicId: string): Observable<Topic> {
    //    return this.http.get<Topic>(`${this.host}/find-by-topicId/${topicId}`, {});
    //}

    getTopicByTopicId(topicId: string, currentUserId: number): Observable<Topic> {
        let params = new HttpParams()
            .set('currentUserId', currentUserId.toString());
        return this.http.get<Topic>(`${this.host}/find-by-topicId/${topicId}`, { params });
    }

    add(topic: Topic): Observable<Topic> {
        return this.http.post<Topic>(this.host, topic, {});
    }

    update(topic: Topic): Observable<Topic> {
        return this.http.put<Topic>(`${this.host}/${topic.id}`, topic, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

}
