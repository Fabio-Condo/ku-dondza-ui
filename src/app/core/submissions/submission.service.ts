import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Submission } from '../model/Submission';


@Injectable({ providedIn: 'root' })
export class SubmissionService {
    private host = environment.apiUrl + '/submissions';

    constructor(private http: HttpClient) { }

    findById(id: number): Observable<Submission> {
        return this.http.get<Submission>(`${this.host}/${id}`, {});
    }

    //add(submission: Submission): Observable<Submission> {
    //    return this.http.post<Submission>(this.host, submission, {});
    //}

    add(submission: Submission, userAnswerIds: any[]): Observable<Submission> {

        const params = new HttpParams()
            .set('userAnswerIds', userAnswerIds.join(','));

        return this.http.post<Submission>(`${this.host}`, submission, { params });
    }
}
