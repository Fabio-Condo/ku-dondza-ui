import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Interest } from '../core/model/Interest';

@Injectable({
  providedIn: 'root'
})
export class InterestService {
  private apiUrl  = environment.apiUrl + '/interests';


  constructor(private http: HttpClient) { }

  getAll(): Observable<Interest[]> {
    return this.http.get<Interest[]>(this.apiUrl);
  }
}
