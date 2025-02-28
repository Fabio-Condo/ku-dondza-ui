import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Quiz } from '../core/model/Quiz';
import { QuizFilter } from '../core/interface/QuizFilter';
import { Question } from '../core/model/Question';
import { QuestionFilter } from '../core/interface/QuestionFilter';
import { Answer } from '../core/model/Answer';
import { Topic } from '../core/model/Topic';

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

    if (filter.difficultyLevel) {
      params = params.set('difficultyLevel', filter.difficultyLevel);
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

  getQuizByQuizId(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/find-by-quizId/${quizId}`, {});
  }

  saveQuiz(quiz: Quiz, questionIds: number[], userAnswerIds: any[]): Observable<Quiz> {

    const params = new HttpParams()
      .set('questionIds', questionIds.join(','))
      .set('userAnswerIds', userAnswerIds.join(','));

    return this.http.post<Quiz>(`${this.baseUrl}`, quiz, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {});
  }

  getTotal(userId: number): Observable<number> {
    const params = new HttpParams()
    .set('userId', userId);

    return this.http.get<number>(`${this.baseUrl}/total`, {params});
  }

  getQuestionsByQuizId(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.baseUrl}/${quizId}/questions`);
  }

  countQuestionsByQuizId(quizId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${quizId}/questions/total`, {});
  }

  getUserSubmittedAnswersByQuizId(quizId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.baseUrl}/${quizId}/submitted-answers`);
  }

  getTopicsByQuizId(quizId: number): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.baseUrl}/${quizId}/topics`);
}

}
