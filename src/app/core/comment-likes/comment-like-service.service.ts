import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Like } from '../model/Like';
import { IApiResponse } from '../interface/IApiResponse';
import { LikeFilter } from '../interface/LikeFilter';

@Injectable({
  providedIn: 'root'
})
export class CommentLikeService {

  private apiUrl = environment.apiUrl + '/comment-likes';

  constructor(private http: HttpClient) { }

  toggleLike(commentId: number): Observable<Like> {
    return this.http.post<Like>(`${this.apiUrl}/${commentId}/toggle`, {});
  }

  checkIfLiked(commentId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${commentId}/is-liked`);
  }

  countLikesByCommentId(commentId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${commentId}/likes-count`);
  }

  findLikesByCommentId(commentId: number, filter: LikeFilter): Observable<IApiResponse<Like>> {
    let params = new HttpParams()  
      .set('page', filter.page)  
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);  

    return this.http.get<IApiResponse<Like>>(`${this.apiUrl}/${commentId}/likes`, { params });
  }
}
