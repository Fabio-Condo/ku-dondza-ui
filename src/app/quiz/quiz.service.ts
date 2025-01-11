import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Quiz } from '../core/model/Quiz';
import { QuizFilter } from '../core/interface/QuizFilter';
import { Question } from '../core/model/Question';
import { QuestionFilter } from '../core/interface/QuestionFilter';

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

    if (filter.title) {
      params = params.set('title', filter.title);
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

  findById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/${id}`, {});
  }

  getQuizByQuizId(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/find-by-quizId/${quizId}`, {});
  }

  add(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.baseUrl, quiz, {});
  }

  update(quiz: Quiz): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.baseUrl}/${quiz.id}`, quiz, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {});
  }

  getTotal(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total`, {});
  }

  addQuestionToQuiz(quizId: number, questionId: number): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.baseUrl}/${quizId}/questions/${questionId}`, {});
  }

  removeQuestionFromQuiz(quizId: number, questionId: number): Observable<Quiz> {
    return this.http.delete<Quiz>(`${this.baseUrl}/${quizId}/questions/${questionId}`);
  }

  getQuestionsByQuizId(quizId: number, filtro: QuestionFilter): Observable<IApiResponse<Question>> {

    let params = new HttpParams()
      .set('page', filtro.page)
      .set('sort', filtro.sort)
      .set('size', filtro.itemsPerPage);

    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}/${quizId}/questions`, { params });
  }

  countQuestionsByQuizId(quizId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${quizId}/questions/total`, {});
  }

}
