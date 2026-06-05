import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TutorRequest } from './model/TutorRequest';

//export interface TutorRequest {
//    questionId: number;
//    selectedAnswerId: number;
//    message: string;
//}

@Injectable({
    providedIn: 'root'
})
export class TutorAiService {

    host: string;

    constructor(private http: HttpClient) {
        this.host = `${environment.apiUrl}/tutor-ai`;
    }

    /**
     * Envia pergunta do aluno para o Tutor AI
     */
    askTutor(request: TutorRequest): Observable<string> {
        return this.http.post(`${this.host}/ask`, 
            request,
            { responseType: 'text' } // importante porque backend retorna String
        );
    }
}