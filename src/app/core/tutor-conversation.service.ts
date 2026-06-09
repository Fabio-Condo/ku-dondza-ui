import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { TutorMessageResponse } from './model/TutorMessageResponse';
import { IApiResponse } from './interface/IApiResponse';
import { ConversationFilter } from './interface/ConversationFilter';


@Injectable({ providedIn: 'root' })
export class TutorConversationService {

    private host = environment.apiUrl + '/conversations';

    constructor(private http: HttpClient) { }

    getQuestionConversationsMessages(userId: number, questionId: number, filtro: ConversationFilter): Observable<IApiResponse<TutorMessageResponse>> {
        let params = new HttpParams()

            .set('page', filtro.page)
            .set('size', filtro.itemsPerPage)
            .set('sort', filtro.sort)

            .set('userId', userId)
            .set('questionId', questionId);

        return this.http.get<IApiResponse<TutorMessageResponse>>(`${this.host}/${userId}/messages/question`, { params });
    }

    getTopicConversationsMessages(userId: number, topicId: number, filtro: ConversationFilter): Observable<IApiResponse<TutorMessageResponse>> {
        let params = new HttpParams()

            .set('page', filtro.page)
            .set('size', filtro.itemsPerPage)
            .set('sort', filtro.sort)

            .set('userId', userId)
            .set('topicId', topicId);

        return this.http.get<IApiResponse<TutorMessageResponse>>(`${this.host}/${userId}/messages/topic`, { params });
    }
}
