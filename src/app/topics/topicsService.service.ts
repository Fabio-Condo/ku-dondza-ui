import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Topic } from '../core/model/Topic';
import { environment } from 'src/environments/environment';
import { TopicFilter } from '../core/interface/TopicFilter';
import { IApiResponse } from '../core/interface/IApiResponse';
import { shareReplay, tap } from 'rxjs/operators';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}


@Injectable({ providedIn: 'root' })
export class TopicService {
    private host = environment.apiUrl + '/topics';


    private topicsCache = new Map<string, CacheEntry<IApiResponse<Topic>>>();
    private topicCache = new Map<string, CacheEntry<Topic>>();
    private subjectTopicListCache: { [key: number]: Observable<Topic[]> } = {};

    private CACHE_TTL = 5 * 60 * 1000; // 5 minutos
    //private CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

    private isCacheValid(entry: CacheEntry<any>): boolean {
        return (Date.now() - entry.timestamp) < this.CACHE_TTL;
    }

    clearCache() {
        this.topicsCache.clear();
        this.topicCache.clear();
    }

    constructor(private http: HttpClient) { }

    filter(filtro: TopicFilter): Observable<IApiResponse<Topic>> {
        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        if (filtro.searchParam) {
            params = params.set('searchParam', filtro.searchParam);
        }

        if (filtro.subjectId) {
            params = params.set('subjectId', filtro.subjectId.toString());
        }

        if (filtro.name) {
            params = params.set('name', filtro.name);
        }

        const cacheKey = params.toString();
        const cachedEntry = this.topicsCache.get(cacheKey);

        if (cachedEntry && this.isCacheValid(cachedEntry)) {
            return of(cachedEntry.data);
        }

        return this.http.get<IApiResponse<Topic>>(`${this.host}/filter`, { params }).pipe(
            tap(response => {
                this.topicsCache.set(cacheKey, {
                    data: response,
                    timestamp: Date.now()
                });
            })
        );
    }

    getTopicByTopicId(topicId: string, currentUserId: number): Observable<Topic> {
        let params = new HttpParams()
            .set('currentUserId', currentUserId.toString());

        const cacheKey = `topic_${topicId}_user_${currentUserId}`;
        const cachedEntry = this.topicCache.get(cacheKey);

        if (cachedEntry && this.isCacheValid(cachedEntry)) {
            return of(cachedEntry.data);
        }

        return this.http.get<Topic>(`${this.host}/find-by-topicId/${topicId}`, { params }).pipe(
            tap(response => {
                this.topicCache.set(cacheKey, {
                    data: response,
                    timestamp: Date.now()
                });
            })
        );
    }

    getBySubjectIdWithCache(subjectId: number): Observable<Topic[]> {

        // Se já existe no cache, retorna
        if (!this.subjectTopicListCache[subjectId]) {
            this.subjectTopicListCache[subjectId] = this.http
                .get<Topic[]>(`${this.host}/subjects/${subjectId}`)
                .pipe(
                    shareReplay(1) // mantém resposta em memória
                );
        }

        return this.subjectTopicListCache[subjectId];
    }

    getSubjectsById(subjectId: number): Observable<Topic[]> {
        return this.http.get<Topic[]>(`${this.host}/subjects/${subjectId}`);
    }

    findById(id: number): Observable<Topic> {
        return this.http.get<Topic>(`${this.host}/${id}`, {});
    }

    getBySubjectId2(subjectId: number): Observable<Topic[]> {
        return this.http.get<Topic[]>(`${this.host}/subjects/${subjectId}`);
    }

    add(topic: Topic): Observable<Topic> {
        return this.http.post<Topic>(this.host, topic).pipe(
            tap(() => this.clearCache())
        );
    }

    update(topic: Topic): Observable<Topic> {
        return this.http.put<Topic>(`${this.host}/${topic.id}`, topic).pipe(
            tap(() => this.clearCache())
        );
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`).pipe(
            tap(() => this.clearCache())
        );
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

}
