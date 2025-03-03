import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { QuizQuestionStatisticsDTO } from '../core/model/QuizQuestionStatisticsDTO';


@Injectable({ providedIn: 'root' })
export class QuestionStatisticsService {
  private baseUrl = environment.apiUrl + '/questions-statistics';

  constructor(private http: HttpClient) { }

  getQuizStatisticsByQuestionId(id: number): Observable<QuizQuestionStatisticsDTO> {
    return this.http.get<QuizQuestionStatisticsDTO>(`${this.baseUrl}/${id}/quizzes`, {});
  }
}
