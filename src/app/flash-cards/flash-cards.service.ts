import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FlashCardDeckResponse } from 'src/app/core/model/FlashCardDeckResponse';
import { environment } from 'src/environments/environment';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { FlashCardFilter } from 'src/app/core/interface/FlashCardFilter';
import { FlashCard } from 'src/app/core/model/FlashCard';


@Injectable({
    providedIn: 'root'
})
export class FlashCardsService {

    private host: string;

    constructor(private http: HttpClient) {
        this.host = `${environment.apiUrl}/flash-cards`;
    }

    findAll(filtro: FlashCardFilter): Observable<IApiResponse<FlashCard>> {

        let params = new HttpParams()
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        if (filtro.subjectId) {
            params = params.set('subjectId', filtro.subjectId.toString());
        }

        if (filtro.topicId) {
            params = params.set('topicId', filtro.topicId.toString());
        }

        return this.http.get<IApiResponse<FlashCard>>(`${this.host}/filter`, { params });

    }

    /**
     * Carrega todos os flash cards do tópico
     */
    getDeck(topicId: number, userId: number): Observable<FlashCardDeckResponse> {

        let params = new HttpParams()
            .set('userId', userId);

        return this.http.get<FlashCardDeckResponse>(
            `${this.host}/topic/${topicId}`, { params }
        );
    }

    save(flashCard: FlashCard): Observable<FlashCard> {
       return this.http.post<FlashCard>(this.host, flashCard);
    }

    update(flashCard: FlashCard): Observable<FlashCard> {
        return this.http.put<FlashCard>(`${this.host}/${flashCard.id}`, flashCard);
    }
}