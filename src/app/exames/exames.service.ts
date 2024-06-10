import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IPostFilter } from '../core/interface/IPostFilter';
import { Post } from '../core/model/Post';
import { Exame } from '../core/model/Exame';
import { ExameFilter } from '../core/interface/ExameFilter';

@Injectable({providedIn: 'root'})
export class ExamesService {
  private host = environment.apiUrl + '/exames';

  constructor(private http: HttpClient) {}

  //findAll(filtro: ExameFilter): Observable<IApiResponse<Exame>> {
  //  return this.http.get<IApiResponse<Exame>>(`${this.host}`, {});
  //}

  findAll(filtro: ExameFilter): Observable<IApiResponse<Exame>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

      //if (filtro.sort) {
      //  params = params.set('employeeOrderBy', filter.sort);
      //}
  
      if (filtro.global) {
        params = params.set('global', filtro.global);
      }

    return this.http.get<IApiResponse<Exame>>(`${this.host}`, { params });

  }

  save(subject: string, description: string, level: string, file: File): Observable<Exame> {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('level', level);
    formData.append('file', file);
    return this.http.post<Exame>(`${this.host}`, formData);
  }
  
  update(id: number, subject: string, description: string, level: string, file: File): Observable<Exame> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('level', level);
    formData.append('file', file);
    return this.http.put<Exame>(`${this.host}`, formData);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`, {});
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`, {});
  }
}
