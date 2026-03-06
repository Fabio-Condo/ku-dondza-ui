import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Question } from '../core/model/Question';
import { QuestionFilter } from '../core/interface/QuestionFilter';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}


@Injectable({ providedIn: 'root' })
export class QuestionService {
  private baseUrl = environment.apiUrl + '/questions';

  constructor(private http: HttpClient) { }

  private questionsCache = new Map<string, CacheEntry<IApiResponse<Question>>>();
  private questionCache = new Map<string, CacheEntry<Question>>();

  private CACHE_TTL = 10 * 60 * 1000; // 5 minutos

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return (Date.now() - entry.timestamp) < this.CACHE_TTL;
  }

  clearCache() {
    this.questionsCache.clear();
    this.questionCache.clear();
  }

  getQuestions(filter: QuestionFilter, currentUserId: number): Observable<IApiResponse<Question>> {

    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString())
      .set('page', filter.page)
      .set('sort', filter.sort)
      .set('size', filter.itemsPerPage);

    if (filter.searchParam) {
      params = params.set('searchParam', filter.searchParam);
    }

    if (filter.subject) {
      params = params.set('subject', filter.subject);
    }

    if (filter.topic) {
      params = params.set('topic', filter.topic);
    }

    if (filter.text) {
      params = params.set('text', filter.text);
    }

    if (filter.difficultyLevel) {
      params = params.set('difficultyLevel', filter.difficultyLevel);
    }

    if (filter.userId) {
      params = params.set('userId', filter.userId.toString());
    }

    const cacheKey = params.toString();
    const cachedEntry = this.questionsCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}/filter`, { params }).pipe(
      tap(response => {
        this.questionsCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  getQuestionByQuestionId(questionId: string, currentUserId: number): Observable<Question> {

    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());

    const cacheKey = `question_${questionId}_user_${currentUserId}`;
    const cachedEntry = this.questionCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<Question>(`${this.baseUrl}/find-by-questionId/${questionId}`, { params }).pipe(
      tap(response => {
        this.questionCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

add(question: Question): Observable<Question> {
  return this.http.post<Question>(this.baseUrl, question).pipe(
    tap(() => this.clearCache())
  );
}

update(question: Question): Observable<Question> {
  return this.http.put<Question>(`${this.baseUrl}/${question.id}`, question).pipe(
    tap(() => this.clearCache())
  );
}

delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
    tap(() => this.clearCache())
  );
}

  //getQuestionsByTopics(questionIds: number[]): Observable<IApiResponse<Question>> {
  //  return this.http.get<IApiResponse<Question>>(`${this.baseUrl}/random-by-subject/${subjectId}`, {});
  //}

  //getQuestionsByTopics(topicIds: number[], limitPerTopic: number): Observable<Question[]> {

  //  const params = new HttpParams()
  //    .set('topicIds', topicIds.join(','))
  //    .set('limitPerTopic', limitPerTopic);

  //  return this.http.get<Question[]>(`${this.baseUrl}/by-topics`, { params });
  //}

  getQuestionsByTopics(topicIds: number[], difficultyLevel: string, limitPerTopic: number): Observable<Question[]> {

    const params = new HttpParams()
      .set('topicIds', topicIds.join(','))
      .set('limitPerTopic', limitPerTopic)
      .set('difficultyLevel', difficultyLevel);

    return this.http.get<Question[]>(`${this.baseUrl}/by-topics`, { params });
  }

  getQuestionsByTopicId(topicId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/topics/${topicId}`, {});
  }

  findAll(): Observable<IApiResponse<Question>> {
    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}`, {});
  }

  getAll(): Observable<Question[]> {
    return this.http.get<Question[]>(this.baseUrl);
  }

  // PARA TESTE DE TOPIC TEST COM QUESTÕES MARCADAS // USAR NO PROGESSO
  findAllByTopicAndMarkSelected(topicTestId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/topic-tests/${topicTestId}`, {});
  }

  //findById(id: number): Observable<Question> {
  //  return this.http.get<Question>(`${this.baseUrl}/${id}`, {});
  //}

  toggleValidated(id: number, status: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/validated`, status, {});
  }

  generateAdvancedQuestionFromAI(topicId: number, extraRule: string, numberOfOptions: number, exerciseFormat: string): Observable<Question> {
    const params = new HttpParams()
      .set('topicId', topicId.toString())
      .set('extraRule', extraRule)
      .set('exerciseFormat', exerciseFormat)
      .set('numberOfOptions', numberOfOptions.toString());
    return this.http.get<Question>(`${this.baseUrl}/generate-from-ai`, { params });
  }

  updateQuestionImage(id: number, file: File): Observable<Question> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<Question>(`${this.baseUrl}/${id}/question-image`, formData);
  }

}
