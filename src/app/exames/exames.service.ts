import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Exame } from '../core/model/Exame';
import { ExameFilter } from '../core/interface/ExameFilter';
import { DatePipe } from '@angular/common';


@Injectable({providedIn: 'root'})
export class ExamesService {
  private host = environment.apiUrl + '/exames';

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

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

      if (filtro.level) {
        params = params.set('level', filtro.level);
      }

      if (filtro.subject) {
        params = params.set('subject', filtro.subject);
      }

      if (filtro.institution) {
        params = params.set('institution', filtro.institution);
      }
      
      if (filtro.description) {
        params = params.set('description', filtro.description);
      }

      if (filtro.beginDate) {
        params = params.set('beginDate', this.datePipe.transform(filtro.beginDate, 'yyyy-MM-dd')!);
      }
      if (filtro.endDate) {
        params = params.set('endDate', this.datePipe.transform(filtro.endDate, 'yyyy-MM-dd')!);
      }


    return this.http.get<IApiResponse<Exame>>(`${this.host}/filter`, { params });

  }

  save(institution: string, subject: string, description: string, level: string, date: Date, file: File): Observable<Exame> {
    const formData = new FormData();
    formData.append('institution', institution);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('level', level);
    formData.append('date', date.toISOString()); // Convertendo para o formato ISO string
    formData.append('file', file);
    return this.http.post<Exame>(`${this.host}`, formData);
  }
  
  update(id: number, institution: string, subject: string, description: string, level: string, date: Date, file: File): Observable<Exame> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('institution', institution);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('level', level);
    formData.append('date', date.toISOString()); // Convertendo para o formato ISO string
    formData.append('file', file);
    return this.http.put<Exame>(`${this.host}`, formData);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`, {});
  }

  download(id: number, filename: string): Observable<Blob> {
    return this.http.get(`${this.host}/download/${id}/${filename}`, { responseType: 'blob' });
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`, {});
  }
}
