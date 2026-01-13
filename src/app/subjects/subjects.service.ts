import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from '../core/model/Subject';
import { IApiResponse } from '../core/interface/IApiResponse';
import { SubjectFilter } from '../core/interface/SubjectFilter';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  host: string;

  // CACHE EM MEMÓRIA
  private subjectsCache: Subject[] | null = null;

  constructor(private http: HttpClient) {
    this.host = `${environment.apiUrl}/subjects`;
  }

  //getAll() : Promise<any> { 
  // return firstValueFrom(this.http.get(this.host, { })); 
  //}

  //findAll(): Observable<Subject[]> { 
  //  return this.http.get<Subject[]>(this.host, {}); 
  //}

  // FIND ALL COM CACHE
  findAll(): Observable<Subject[]> {
    if (this.subjectsCache) {
      console.log('Returning subjects from cache');
      return of(this.subjectsCache);
    }

    console.log('Fetching subjects from API')
    return this.http.get<Subject[]>(this.host).pipe(
      tap(subjects => this.subjectsCache = subjects)
    );
  }

  // Opcional: limpar cache manualmente
  clearCache(): void {
    this.subjectsCache = null;
  }

  filter(filtro: SubjectFilter, currentUserId: number): Observable<IApiResponse<Subject>> {
    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString())
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    if (filtro.name) {
      params = params.set('name', filtro.name);
    }

    return this.http.get<IApiResponse<Subject>>(`${this.host}/filter`, { params });
  }

  getById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.host}/${id}`);
  }

  getSubjectBySubjectId(subjectId: string, currentUserId: number): Observable<Subject> {
    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());
    return this.http.get<Subject>(`${this.host}/find-by-subjectId/${subjectId}`, { params });
  }

  add(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.host, subject);
  }

  update(subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.host}/${subject.id}`, subject);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`);
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`);
  }
}
