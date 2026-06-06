import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { TutorMessageResponse } from '../model/TutorMessageResponse';
import { IApiResponse } from '../interface/IApiResponse';


@Injectable({ providedIn: 'root' })
export class TutorConversationService {

    private host = environment.apiUrl + '/conversations';

    constructor(private http: HttpClient) { }

    getConversationsMessages(userId: number, questionId: number): Observable<IApiResponse<TutorMessageResponse>> {
        let params = new HttpParams()
            .set('userId', userId)
            .set('questionId', questionId);

        return this.http.get<IApiResponse<TutorMessageResponse>>(`${this.host}/${userId}/messages`, { params });
    }
}
