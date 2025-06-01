import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Like } from '../core/model/Like';
import { LikeFilter } from '../core/interface/LikeFilter';
import { IApiResponse } from '../core/interface/IApiResponse';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  private apiUrl = environment.apiUrl + '/likes';

  constructor(private http: HttpClient) { }

  toggleLike(articleId: number, currentUserId: number): Observable<Like> {
    return this.http.post<Like>(`${this.apiUrl}/articles/${articleId}/users/${currentUserId}`, { });
  }

  checkIfLiked(articleId: number): Observable<boolean> { //boolean
    return this.http.get<boolean>(`${this.apiUrl}/articles/${articleId}/check`);
  }

  countLikesByArticleId(articleId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${articleId}`);
  }

  findLikesByArticleId(articleId: number, filter: LikeFilter): Observable<IApiResponse<Like>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);

    return this.http.get<IApiResponse<Like>>(`${this.apiUrl}/articles/${articleId}`, { params });
  }

}