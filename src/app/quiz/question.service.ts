import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Question } from '../core/model/Question';
import { QuestionFilter } from '../core/interface/QuestionFilter';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private baseUrl = environment.apiUrl + '/questions';

  constructor(private http: HttpClient) { }

  getQuestions(filter: QuestionFilter): Observable<IApiResponse<Question>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('sort', filter.sort)
      .set('size', filter.itemsPerPage);

    console.log(params);

    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}`, { params });
  }

  findAll(): Observable<IApiResponse<Question>> {
    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}`, {});
  }

  findById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`, {});
  }

  add(question: Question): Observable<Question> {
    return this.http.post<Question>(this.baseUrl, question, {});
  }

  update(question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/${question.id}`, question, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {});
  }

  getTotal(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total`, {});
  }

  findQuestionsByQuizId(quizId: number, filtro: QuestionFilter): Observable<IApiResponse<Question>> {

    let params = new HttpParams()
      .set('page', filtro.page)
      .set('sort', filtro.sort)
      .set('size', filtro.itemsPerPage)
      .set('quizId', quizId);

    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}/findQuestionsByQuizId`, { params });
  }

  updateQuestionImage(id: number, file: File): Observable<Question> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<Question>(`${this.baseUrl}/${id}/question-image`, formData);
  }

}
