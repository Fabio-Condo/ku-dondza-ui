
import { Observable, firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from '../core/model/Subject';
import { IApiResponse } from '../core/interface/IApiResponse';
import { SubjectFilter } from '../core/interface/SubjectFilter';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  host: string;

  constructor(private http: HttpClient) {
    this.host = `${environment.apiUrl}/subjects`;
  }

  //getAll() : Promise<any> {
  //  return firstValueFrom(this.http.get(this.host, { }));
  //}

  findAll(): Observable<Subject[]> {
    return this.http.get<Subject[]>(this.host, {});
  }

  filter(filtro: SubjectFilter): Observable<IApiResponse<Subject>> {
    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    if (filtro.searchParam) {
      params = params.set('searchParam', filtro.searchParam);
    }

    return this.http.get<IApiResponse<Subject>>(`${this.host}/filter`, { params });
  }

  getById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.host}/${id}`, {});
  }

  add(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.host, subject, {});
  }

  update(subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.host}/${subject.id}`, subject, {});
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`, {});
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`, {});
  }

}
