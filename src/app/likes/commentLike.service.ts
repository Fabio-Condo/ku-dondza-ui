import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { CommentLike } from '../core/model/CommentLike';
import { CommentLikeFilter } from '../core/interface/CommentLikeFilter';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  private apiUrl = environment.apiUrl + '/comment-likes';

  constructor(private http: HttpClient) { }

  toggleLike(commentId: number, currentUserId: number): Observable<CommentLike> {
    return this.http.post<CommentLike>(`${this.apiUrl}/comments/${commentId}/users/${currentUserId}`, {});
  }

  checkIfLiked(commentId: number): Observable<boolean> { //boolean
    return this.http.get<boolean>(`${this.apiUrl}/comments/${commentId}/check`);
  }

  countLikesByCommentId(commentId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${commentId}`);
  }

  findLikesByCommentId(commentId: number, filter: CommentLikeFilter): Observable<IApiResponse<CommentLike>> {

    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);

    return this.http.get<IApiResponse<CommentLike>>(`${this.apiUrl}/comments/${commentId}`, { params });
  }

}