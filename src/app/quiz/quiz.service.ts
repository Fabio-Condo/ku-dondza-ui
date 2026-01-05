import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Quiz } from '../core/model/Quiz';
import { QuizFilter } from '../core/interface/QuizFilter';


@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private baseUrl = environment.apiUrl + '/quizzes';

  constructor(private http: HttpClient) { }

  getQuizzes(filter: QuizFilter): Observable<IApiResponse<Quiz>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('sort', filter.sort)
      .set('size', filter.itemsPerPage);

    if (filter.searchParam) {
      params = params.set('searchParam', filter.searchParam);
    }

    if (filter.subject) {
      params = params.set('subject', filter.subject);
    }

    if (filter.user) {
      params = params.set('user', filter.user);
    }

    return this.http.get<IApiResponse<Quiz>>(`${this.baseUrl}/filter`, { params });
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

  getQuizByQuizId(quizId: string, currentUserId: number): Observable<Quiz> {
    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());
    return this.http.get<Quiz>(`${this.baseUrl}/find-by-quizId/${quizId}`, { params });
  }

  saveQuiz(quiz: Quiz, questionIds: number[], userAnswerIds: any[], currentUserId: number): Observable<Quiz> {

    const params = new HttpParams()
      .set('questionIds', questionIds.join(','))
      .set('userAnswerIds', userAnswerIds.join(','))
      .set('currentUserId', currentUserId.toString());

    return this.http.post<Quiz>(`${this.baseUrl}`, quiz, { params });
  }

  saveQuizTopicTest(quiz: Quiz, questionIds: number[], userAnswerIds: any[], topicTestId: number, currentUserId: number): Observable<Quiz> {

    const params = new HttpParams()
      .set('questionIds', questionIds.join(','))
      .set('userAnswerIds', userAnswerIds.join(','))
      .set('topicTestId', topicTestId.toString())
      .set('currentUserId', currentUserId.toString());

    return this.http.post<Quiz>(`${this.baseUrl}/topic-test`, quiz, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {});
  }

  toggleAnonymous(id: number, status: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/anonymous`, status, {});
  }

}
