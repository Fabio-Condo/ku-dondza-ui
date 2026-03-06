import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { IApiResponse } from '../core/interface/IApiResponse';
import { DatePipe } from '@angular/common';
import { Exam } from '../core/model/Exame';
import { ExameFilter } from '../core/interface/ExameFilter';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}


@Injectable({ providedIn: 'root' })
export class ExamesService {
  private host = environment.apiUrl + '/exames';

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  private examsCache = new Map<string, CacheEntry<IApiResponse<Exam>>>();
  private examCache = new Map<string, CacheEntry<Exam>>();

  private CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return (Date.now() - entry.timestamp) < this.CACHE_TTL;
  }

  clearCache() {
    this.examsCache.clear();
    this.examCache.clear();
  }

  findAll(filtro: ExameFilter): Observable<IApiResponse<Exam>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    //if (filtro.searchParam) {
    //  params = params.set('searchParam', filtro.searchParam);
    //}

    if (filtro.subject) {
      params = params.set('subject', filtro.subject);
    }

    if (filtro.examType) {
      params = params.set('examType', filtro.examType);
    }

    if (filtro.institution) {
      params = params.set('institution', filtro.institution);
    }

    if (filtro.beginDate) {
      params = params.set('beginDate', this.datePipe.transform(filtro.beginDate, 'yyyy-MM-dd')!);
    }
    if (filtro.endDate) {
      params = params.set('endDate', this.datePipe.transform(filtro.endDate, 'yyyy-MM-dd')!);
    }

    const cacheKey = params.toString();
    const cachedEntry = this.examsCache.get(cacheKey);

    // Se cache existir e ainda for válido
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    // Caso contrário, chama API
    return this.http.get<IApiResponse<Exam>>(`${this.host}/filter`, { params }).pipe(
      tap(response => {
        this.examsCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );

  }

  save(examType: string, institution: string, premium: boolean, date: Date, subjectId: number, number: string, file: File): Observable<Exam> {
    const formData = new FormData();
    formData.append('examType', examType)
    formData.append('premium', premium.toString());
    formData.append('institution', institution);
    formData.append('number', number);
    formData.append('date', date.toISOString()); // Convertendo para o formato ISO string
    formData.append('subjectId', subjectId.toString());
    formData.append('file', file);
    return this.http.post<Exam>(`${this.host}`, formData);
  }

  update(id: number, examType: string, institution: string, premium: boolean, date: Date, subjectId: number, number: string, file: File): Observable<Exam> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('premium', premium.toString());
    formData.append('examType', examType)
    formData.append('institution', institution);
    formData.append('number', number);
    formData.append('date', date.toISOString()); // Convertendo para o formato ISO string
    formData.append('subjectId', subjectId.toString());
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