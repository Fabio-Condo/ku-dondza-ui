import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Quiz } from '../core/model/Quiz';
import { QuizFilter } from '../core/interface/QuizFilter';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}


@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private baseUrl = environment.apiUrl + '/quizzes';

  constructor(private http: HttpClient) { }

  private quizzesCache = new Map<string, CacheEntry<IApiResponse<Quiz>>>();
  private quizCache = new Map<string, CacheEntry<Quiz>>();

  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  clearCache() {
    this.quizzesCache.clear();
    this.quizCache.clear();
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return (Date.now() - entry.timestamp) < this.CACHE_TTL;
  }

  getQuizzesWithCash(filter: QuizFilter): Observable<IApiResponse<Quiz>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('sort', filter.sort)
      .set('size', filter.itemsPerPage);

    if (filter.searchParam) {
      params = params.set('searchParam', filter.searchParam);
    }

    if (filter.subjectId) {
      params = params.set('subjectId', filter.subjectId.toString());
    }

    if (filter.userId) {
      params = params.set('userId', filter.userId.toString());
    }

    const cacheKey = params.toString();
    const cachedEntry = this.quizzesCache.get(cacheKey);

    // Se cache existir e ainda for válido
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    // Caso contrário, chama API
    return this.http.get<IApiResponse<Quiz>>(`${this.baseUrl}/filter-with-cach`, { params }).pipe(
      tap(response => {
        this.quizzesCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  getQuizByQuizIdWithCash(quizId: string, currentUserId: number): Observable<Quiz> {

    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());

    const cacheKey = `quiz_${quizId}_user_${currentUserId}`;
    const cachedEntry = this.quizCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<Quiz>(`${this.baseUrl}/find-by-quizId/${quizId}`, { params }).pipe(
      tap(response => {
        this.quizCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
    
  }

  getQuizzes(filter: QuizFilter): Observable<IApiResponse<Quiz>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('sort', filter.sort)
      .set('size', filter.itemsPerPage);

    if (filter.searchParam) {
      params = params.set('searchParam', filter.searchParam);
    }

    if (filter.subjectId) {
      params = params.set('subjectId', filter.subjectId.toString());
    }

    if (filter.userId) {
      params = params.set('userId', filter.userId.toString());
    }

    const cacheKey = params.toString();
    const cachedEntry = this.quizzesCache.get(cacheKey);

    // Se cache existir e ainda for válido
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    // Caso contrário, chama API
    return this.http.get<IApiResponse<Quiz>>(`${this.baseUrl}/filter`, { params }).pipe(
      tap(response => {
        this.quizzesCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  getQuizByQuizId(quizId: string, currentUserId: number): Observable<Quiz> {

    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());

    const cacheKey = `quiz_${quizId}_user_${currentUserId}`;
    const cachedEntry = this.quizCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<Quiz>(`${this.baseUrl}/find-by-quizId/${quizId}`, { params }).pipe(
      tap(response => {
        this.quizCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  findAll(): Observable<IApiResponse<Quiz>> {
    return this.http.get<IApiResponse<Quiz>>(`${this.baseUrl}`, {});
  }

  getQuizzesByQuestionId(questionId: number, filter: QuizFilter): Observable<IApiResponse<Quiz>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('sort', filter.sort)
      .set('size', filter.itemsPerPage);

    return this.http.get<IApiResponse<Quiz>>(`${this.baseUrl}/by-question/${questionId}`, { params });
  }

  findById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/${id}`, {});
  }

  saveQuiz(quiz: Quiz, questionIds: number[], userAnswerIds: any[], currentUserId: number): Observable<Quiz> {

    const params = new HttpParams()
      .set('questionIds', questionIds.join(','))
      .set('userAnswerIds', userAnswerIds.join(','))
      .set('currentUserId', currentUserId.toString());

    return this.http.post<Quiz>(`${this.baseUrl}`, quiz, { params }).pipe(
      tap(() => this.clearCache()) // limpa cache após salvar
    );
  }

  saveQuizTopicTest(quiz: Quiz, questionIds: number[], userAnswerIds: any[], topicTestId: number, currentUserId: number): Observable<Quiz> {

    const params = new HttpParams()
      .set('questionIds', questionIds.join(','))
      .set('userAnswerIds', userAnswerIds.join(','))
      .set('topicTestId', topicTestId.toString())
      .set('currentUserId', currentUserId.toString());

    return this.http.post<Quiz>(`${this.baseUrl}/topic-test`, quiz, { params });
  }

  saveQuizChallenge(quiz: Quiz, questionIds: number[], userAnswerIds: any[], challengeId: number, currentUserId: number): Observable<Quiz> {

    const params = new HttpParams()
      .set('questionIds', questionIds.join(','))
      .set('userAnswerIds', userAnswerIds.join(','))
      .set('challengeId', challengeId.toString())
      .set('currentUserId', currentUserId.toString());

    return this.http.post<Quiz>(`${this.baseUrl}/challenge`, quiz, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {});
  }

  toggleAnonymous(id: number, status: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/anonymous`, status, {});
  }

}
