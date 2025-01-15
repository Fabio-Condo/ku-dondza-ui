import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { DatePipe } from '@angular/common';
import { BlogFilter } from '../core/interface/BlogFilter';
import { Blog } from '../core/model/Blog';


@Injectable({ providedIn: 'root' })
export class BlogService {
  private host = environment.apiUrl + '/blog';

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  findAll(filtro: BlogFilter): Observable<IApiResponse<Blog>> {

    let params = new HttpParams()
      .set('page', filtro.page)
      .set('sort', filtro.sort)
      .set('size', filtro.itemsPerPage);

    if (filtro.searchParam) {
      params = params.set('searchParam', filtro.searchParam);
    }

    if (filtro.subject) {
      params = params.set('subject', filtro.subject);
    }

    if (filtro.title) {
      params = params.set('title', filtro.title);
    }

    return this.http.get<IApiResponse<Blog>>(`${this.host}/filter`, { params });

  }

  save(book: Blog, file: File): Observable<Blog> {
    const formData = new FormData();
    formData.append('title', book.title);
    formData.append('content', book.content);
    formData.append('subjectId', book.subject.id.toString());
    formData.append('file', file);
    return this.http.post<Blog>(`${this.host}`, formData);
  }

  update(book: Blog, file: File): Observable<Blog> {
    const formData = new FormData();
    formData.append('id', book.id.toString());
    formData.append('title', book.title);
    formData.append('content', book.content);
    formData.append('subjectId', book.subject.id.toString());
    formData.append('file', file);
    return this.http.put<Blog>(`${this.host}`, formData);
  }

  findById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.host}/${id}`, {});
  }

  getBlogByBlogId(blogId: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.host}/find-by-blogId/${blogId}`, {});
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`, {});
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`, {});
  }
}
