import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { Exam } from '../core/model/Exam';
import { ExameFilter } from '../core/interface/ExameFilter';
import { DatePipe } from '@angular/common';


@Injectable({providedIn: 'root'})
export class ExamesService {
  private host = environment.apiUrl + '/exames';

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  findAll(filtro: ExameFilter): Observable<IApiResponse<Exam>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

      //if (filtro.sort) {
      //  params = params.set('employeeOrderBy', filter.sort);
      //}
  
      if (filtro.searchParam) {
        params = params.set('searchParam', filtro.searchParam);
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


    return this.http.get<IApiResponse<Exam>>(`${this.host}/filter`, { params });

  }

  save(description: string, status: string, date: Date, subjectId: number, institutionId: number, file: File): Observable<Exam> {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('status', status)
    formData.append('date', date.toISOString()); // Convertendo para o formato ISO string
    formData.append('subjectId', subjectId.toString());
    formData.append('institutionId', institutionId.toString());
    formData.append('file', file);
    return this.http.post<Exam>(`${this.host}`, formData);
  }
  
  update(id: number, description: string, status: string, date: Date, subjectId: number, institutionId: number, file: File): Observable<Exam> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('description', description);
    formData.append('status', status)
    formData.append('date', date.toISOString()); // Convertendo para o formato ISO string
    formData.append('subjectId', subjectId.toString());
    formData.append('institutionId', institutionId.toString());
    formData.append('file', file);
    return this.http.put<Exam>(`${this.host}`, formData);
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
