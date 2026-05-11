import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Challenge } from '../core/model/Challenge';
import { environment } from 'src/environments/environment';
import { Question } from '../core/model/Question';
import { ChallengeFilter } from '../core/interface/ChallengeFilter';
import { IApiResponse } from '../core/interface/IApiResponse';
import { ChallengeRankingResultDTO } from '../core/model/ChallengeRankingResultDTO';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class ChallengeService {

    private baseUrl = environment.apiUrl + '/challenges';

    private challengesCache = new Map<string, CacheEntry<IApiResponse<Challenge>>>();
    private challengeCache = new Map<string, CacheEntry<Challenge>>();

    //private CACHE_TTL = 10 * 60 * 1000; // 5 minutos
    private CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

    private isCacheValid(entry: CacheEntry<any>): boolean {
        return (Date.now() - entry.timestamp) < this.CACHE_TTL;
    }

    clearCache() {
        this.challengesCache.clear();
        this.challengeCache.clear();
    }

    constructor(private http: HttpClient) { }

    findAll(filtro: ChallengeFilter): Observable<IApiResponse<Challenge>> {

        let params = new HttpParams()
            .set('page', filtro.page.toString())
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage.toString());

        // status
        if (filtro.status) {
            params = params.set('status', filtro.status);
        }

        // título
        if (filtro.title?.trim()) {
            params = params.set('title', filtro.title.trim());
        }

        // descrição
        if (filtro.description?.trim()) {
            params = params.set('description', filtro.description.trim());
        }

        // dificuldade
        if (filtro.difficultyLevel) {
            params = params.set(
                'difficultyLevel',
                filtro.difficultyLevel
            );
        }

        // disciplina
        if (filtro.subject?.id) {
            params = params.set(
                'subject.id',
                filtro.subject.id.toString()
            );
        }

        // data inicial
        if (filtro.startDate) {
            params = params.set(
                'startDate',
                filtro.startDate.toISOString()
            );
        }

        // data final
        if (filtro.endDate) {
            params = params.set(
                'endDate',
                filtro.endDate.toISOString()
            );
        }

        const cacheKey = params.toString();

        const cachedEntry = this.challengesCache.get(cacheKey);

        // Retorna cache se ainda estiver válido
        if (cachedEntry && this.isCacheValid(cachedEntry)) {
            return of(cachedEntry.data);
        }

        // Faz chamada API
        return this.http.get<IApiResponse<Challenge>>(
            `${this.baseUrl}/filter`,
            { params }
        ).pipe(
            tap(response => {
                this.challengesCache.set(cacheKey, {
                    data: response,
                    timestamp: Date.now()
                });
            })
        );
    }

    getById(challengeId: string): Observable<Challenge> {
        const cacheKey = challengeId;
        const cachedEntry = this.challengeCache.get(cacheKey);

        // Se cache existir e ainda for válido
        if (cachedEntry && this.isCacheValid(cachedEntry)) {
            return of(cachedEntry.data);
        }

        // Caso contrário, chama API
        return this.http.get<Challenge>(`${this.baseUrl}/${challengeId}`).pipe(
            tap(response => {
                this.challengeCache.set(cacheKey, {
                    data: response,
                    timestamp: Date.now()
                });
            })
        );
    }

    getQuestionsByChallengeId(id: number): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.baseUrl}/${id}/questions`);
    }

    addQuestionToChallengeQuestions(challengeId: number, questionId: number): Observable<Challenge> {
        return this.http.post<Challenge>(`${this.baseUrl}/${challengeId}/questions/${questionId}`, {});
    }

    removeQuestionFromChallengeQuestions(challengeId: number, questionId: number): Observable<Challenge> {
        return this.http.delete<Challenge>(`${this.baseUrl}/${challengeId}/questions/${questionId}`, {});
    }

    getRanking(challengeId: string): Observable<ChallengeRankingResultDTO[]> {
        return this.http.get<ChallengeRankingResultDTO[]>(
            `${this.baseUrl}/${challengeId}/ranking`
        );
    }
}