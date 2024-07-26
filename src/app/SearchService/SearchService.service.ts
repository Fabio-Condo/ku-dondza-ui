import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchResultDTO } from '../core/model/SearchResultDTO';
import { IApiResponse } from '../core/interface/IApiResponse';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl  = environment.apiUrl + '/api/search';


  constructor(private http: HttpClient) { }

  search(query: string, page: number): Observable<IApiResponse<SearchResultDTO>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString());

    return this.http.get<IApiResponse<SearchResultDTO>>(this.apiUrl , { params });
  }
}
