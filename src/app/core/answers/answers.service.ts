import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Answer } from '../model/Answer';


@Injectable({ providedIn: 'root' })
export class AnswerService {
    private host = environment.apiUrl + '/answers';

    constructor(private http: HttpClient) { }

    findById(id: number): Observable<Answer> {
        return this.http.get<Answer>(`${this.host}/${id}`, {});
    }

    findAll(): Observable<Answer[]> {
        return this.http.get<Answer[]>(`${this.host}/list`, {});
    }
}
