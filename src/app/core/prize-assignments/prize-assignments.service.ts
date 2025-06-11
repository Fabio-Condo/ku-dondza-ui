import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PrizeAssignment } from '../model/PrizeAssignment';


@Injectable({ providedIn: 'root' })
export class PrizeAssignmentsService {
    private host = environment.apiUrl + '/prize-assignments';

    constructor(private http: HttpClient) { }

    assignPrize(prizeId: number, userId: number): Observable<PrizeAssignment> {
        let params = new HttpParams()
            .set('prizeId', prizeId)
            .set('userId', userId);
        return this.http.post<PrizeAssignment>(`${this.host}/assign`, { params });
    }

}