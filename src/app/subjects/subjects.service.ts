
import { Observable, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from '../core/model/Subject';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  host: string;

  constructor(private http: HttpClient) {
    this.host = `${environment.apiUrl}/subjects`;
  }

  //findAll() : Promise<any> {
  //  return firstValueFrom(this.http.get(this.host, { }));
  //}

  findAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.host, {});
  }

  getById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.host}/${id}`, {});
  }

}
