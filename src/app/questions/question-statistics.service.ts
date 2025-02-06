import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { QuestionStatisticsDTO } from '../core/model/QuestionStatisticsDTO';


@Injectable({ providedIn: 'root' })
export class QuestionStatisticsService {
  private baseUrl = environment.apiUrl + '/questions-statistics';

  constructor(private http: HttpClient) { }

  getStatisticsByQuestionId(id: number): Observable<QuestionStatisticsDTO> {
    return this.http.get<QuestionStatisticsDTO>(`${this.baseUrl}/${id}`, {});
  }

}
