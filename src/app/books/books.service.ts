import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { DatePipe } from '@angular/common';
import { BookFilter } from '../core/interface/BookFilter';
import { Book } from '../core/model/Book';


@Injectable({providedIn: 'root'})
export class BooksService {
  private host = environment.apiUrl + '/books';

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  findAll(filtro: BookFilter): Observable<IApiResponse<Book>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);
  
      if (filtro.searchParam) {
        params = params.set('searchParam', filtro.searchParam);
      }

      if (filtro.subject) {
        params = params.set('subject', filtro.subject);
      }

      if (filtro.name) {
        params = params.set('name', filtro.name);
      }
      
      if (filtro.description) {
        params = params.set('description', filtro.description);
      }


    return this.http.get<IApiResponse<Book>>(`${this.host}/filter`, { params });

  }

  save(book: Book, file: File): Observable<Book> {
    const formData = new FormData();
    formData.append('name', book.name);
    formData.append('description', book.description);
    formData.append('subjectId', book.subject.id.toString());
    formData.append('file', file);
    return this.http.post<Book>(`${this.host}`, formData);
  }
  
  update(book: Book, file: File): Observable<Book> {
    const formData = new FormData();
    formData.append('id', book.id.toString());
    formData.append('name', book.name);
    formData.append('description', book.description);
    formData.append('subjectId', book.subject.id.toString());
    formData.append('file', file);
    return this.http.put<Book>(`${this.host}`, formData);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`, {});
  }

  download(id: number, filename: string): Observable<Blob> {
    return this.http.get(`${this.host}/download/${id}/${filename}`, { responseType: 'blob' });
  }

}
