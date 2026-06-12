import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FlashCard } from 'src/app/core/model/FlashCard';
import { FlashCardDeckResponse } from 'src/app/core/model/FlashCardDeckResponse';
import { FlashCardProgressRequest } from 'src/app/core/model/FlashCardProgressRequest';
import { SaveFlashCardRequest } from 'src/app/core/model/SaveFlashCardRequest';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlashCardsService {

  private host: string;

  constructor(private http: HttpClient) {
    this.host = `${environment.apiUrl}/flash-cards`;
  }

  /**
   * Carrega todos os flash cards do tópico
   */
  getDeck(topicId: number): Observable<FlashCardDeckResponse> {
    return this.http.get<FlashCardDeckResponse>(
      `${this.host}/topic/${topicId}`
    );
  }

  /**
   * Actualiza progresso do cartão
   */
  updateProgress(request: FlashCardProgressRequest): Observable<void> {
    return this.http.put<void>(
      `${this.host}/progress`,
      request
    );
  }

  /**
   * Guardar / remover favorito
   */
  saveCard(request: SaveFlashCardRequest): Observable<void> {
    return this.http.put<void>(
      `${this.host}/save`,
      request
    );
  }

  /**
   * Buscar favoritos do aluno
   */
  getSavedCards(): Observable<FlashCard[]> {
    return this.http.get<FlashCard[]>(
      `${this.host}/saved`
    );
  }
}