import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Question } from '../core/model/Question';
import { QuestionFilter } from '../core/interface/QuestionFilter';


@Injectable({ providedIn: 'root' })
export class QuestionService {
  private baseUrl = environment.apiUrl + '/questions';

  constructor(private http: HttpClient) { }

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

    // Envia o userId se estiver definido
    if (filter.userId) {
      params = params.set('userId', filter.userId.toString());
    }

    return this.http.get<IApiResponse<Question>>(`${this.baseUrl}/filter`, { params });
  }

  //getQuestionsByTopics(questionIds: number[]): Observable<IApiResponse<Question>> {
  //  return this.http.get<IApiResponse<Question>>(`${this.baseUrl}/random-by-subject/${subjectId}`, {});
  //}

  getQuestionsByTopics(topicIds: number[], limitPerTopic: number): Observable<Question[]> {

    const params = new HttpParams()
      .set('topicIds', topicIds.join(','))
      .set('limitPerTopic', limitPerTopic);

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

  findById(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`, {});
  }

  getQuestionByQuestionId(questionId: string, currentUserId: number): Observable<Question> {
    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());
    return this.http.get<Question>(`${this.baseUrl}/find-by-questionId/${questionId}`, { params });
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

  toggleValidated(id: number, status: boolean): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/validated`, status, {});
  }

  generateAdvancedQuestionFromAI(topicId: number, difficultyLevel: string, extraRule: string, numberOfOptions: number): Observable<Question> {
    const params = new HttpParams()
      .set('topicId', topicId.toString())
      .set('difficultyLevel', difficultyLevel)
      .set('extraRule', extraRule)
      .set('numberOfOptions', numberOfOptions.toString());
    return this.http.get<Question>(`${this.baseUrl}/generate-from-ai`, { params });
  }

  updateQuestionImage(id: number, file: File): Observable<Question> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<Question>(`${this.baseUrl}/${id}/question-image`, formData);
  }

}
