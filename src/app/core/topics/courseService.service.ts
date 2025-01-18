import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { Topic } from '../model/Topic';
import { environment } from 'src/environments/environment';


@Injectable({ providedIn: 'root' })
export class TopicService {
    private host = environment.apiUrl + '/topics';

    constructor(private http: HttpClient) { }

    getBySubjectId(subjectId: number): Observable<Topic[]> {
        return this.http.get<Topic[]>(`${this.host}/${subjectId}/subjects`);
    }

    getSubjectsById(subjectId: number): Observable<Topic[]> {
        return this.http.get<Topic[]>(`${this.host}/${subjectId}/subjects`);
    }

    findById(id: number): Observable<Topic> {
        return this.http.get<Topic>(`${this.host}/${id}`, {});
    }

}
