import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from '../core/model/Subject';
import { IApiResponse } from '../core/interface/IApiResponse';
import { SubjectFilter } from '../core/interface/SubjectFilter';
import { tap } from 'rxjs/operators';
import { SubjectProgressDTO } from '../core/model/SubjectProgressDTO';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  host: string;

  private subjectsCache = new Map<string, CacheEntry<IApiResponse<Subject>>>();
  private subjectCache = new Map<string, CacheEntry<Subject>>();

  private progressSubjectsCache = new Map<string, CacheEntry<SubjectProgressDTO[]>>();
  private progressSubjectCache = new Map<string, CacheEntry<SubjectProgressDTO>>();

  private subjectsListCache: Subject[] | null = null;


  //private CACHE_TTL = 10 * 60 * 1000; // 5 minutos
  private CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return (Date.now() - entry.timestamp) < this.CACHE_TTL;
  }

  clearCache() {
    this.subjectsCache.clear();
    this.subjectCache.clear();
  }

  clearProgressSubjectsCache() {
    this.progressSubjectsCache.clear();
    this.progressSubjectCache.clear();
  }

  constructor(private http: HttpClient) {
    this.host = `${environment.apiUrl}/subjects`;
  }

  //getAll() : Promise<any> { 
  // return firstValueFrom(this.http.get(this.host, { })); 
  //}

  getUserProgressSubjects(userId: number): Observable<SubjectProgressDTO[]> {
    let params = new HttpParams()
      .set('currentUserId', userId.toString());

    const cacheKey = params.toString();
    const cachedEntry = this.progressSubjectsCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<SubjectProgressDTO[]>(`${this.host}/progress/users`, { params }).pipe(
      tap(response => {
        this.progressSubjectsCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  getUserProgressSubject(currentUserId: number, subjectId: number): Observable<SubjectProgressDTO> {
    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString())
      .set('subjectId', subjectId.toString());

    const cacheKey = `subject_${subjectId}_user_${currentUserId}`;
    const cachedEntry = this.progressSubjectCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<SubjectProgressDTO>(`${this.host}/progress/users/view`, { params }).pipe(
      tap(response => {
        this.progressSubjectCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  // FIND ALL COM CACHE
  findAll(): Observable<Subject[]> {
    //if (this.subjectsListCache) {
    //  console.log('Returning subjects from cache');
    //  return of(this.subjectsListCache);
    //}

    console.log('Fetching subjects from API')
    return this.http.get<Subject[]>(this.host).pipe(
      tap(subjects => this.subjectsListCache = subjects)
    );
  }

  filter(filtro: SubjectFilter, currentUserId: number): Observable<IApiResponse<Subject>> {

    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString())
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    if (filtro.enabled !== undefined && filtro.enabled !== null) {
      params = params.set('enabled', filtro.enabled.toString());
    }

    if (filtro.name) {
      params = params.set('name', filtro.name);
    }

    const cacheKey = params.toString();
    const cachedEntry = this.subjectsCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<IApiResponse<Subject>>(`${this.host}/filter`, { params }).pipe(
      tap(response => {
        this.subjectsCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  getSubjectBySubjectId(subjectId: string, currentUserId: number): Observable<Subject> {

    let params = new HttpParams()
      .set('currentUserId', currentUserId.toString());

    const cacheKey = `subject_${subjectId}_user_${currentUserId}`;
    const cachedEntry = this.subjectCache.get(cacheKey);

    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return of(cachedEntry.data);
    }

    return this.http.get<Subject>(`${this.host}/find-by-subjectId/${subjectId}`, { params }).pipe(
      tap(response => {
        this.subjectCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      })
    );
  }

  getById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.host}/${id}`);
  }

  save(subject: Subject, file: File): Observable<Subject> {
    const formData = new FormData();
    formData.append('name', subject.name);
    formData.append('description', subject.description)
    formData.append('category', subject.category);

    formData.append('quizEnabled', String(subject.quizEnabled));
    formData.append('courseEnabled', String(subject.courseEnabled));
    formData.append('progressEnabled', String(subject.progressEnabled));
    formData.append('examEnabled', String(subject.examEnabled));

    formData.append('file', file);

    //return this.http.post<Exam>(`${this.host}`, formData);
    return this.http.post<Subject>(`${this.host}`, formData).pipe(
      tap(() => this.clearCache()) // limpa cache após salvar
    );
  }

  update(subject: Subject, file: File): Observable<Subject> {
    const formData = new FormData();

    formData.append('id', subject.id.toString());
    formData.append('name', subject.name);
    formData.append('description', subject.description);
    formData.append('category', subject.category);

    formData.append('quizEnabled', String(subject.quizEnabled));
    formData.append('courseEnabled', String(subject.courseEnabled));
    formData.append('progressEnabled', String(subject.progressEnabled));
    formData.append('examEnabled', String(subject.examEnabled));

    formData.append('file', file);

    return this.http.put<Subject>(`${this.host}`, formData).pipe(
      tap(() => this.clearCache())
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`);
  }
}
