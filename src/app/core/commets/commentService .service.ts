import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../model/Comment';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../interface/IApiResponse';
import { CommentFilter } from '../interface/CommentFilter';


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = environment.apiUrl + '/comments'; // Ajuste a URL conforme necessário

  constructor(private http: HttpClient) { }

  createComment(comment: Comment): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment, { });
  }

  createReplyComment(postId: number, parentCommentId: number | null, content: string): Observable<Comment> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('postId', postId.toString());
    formData.append('parentCommentId', parentCommentId!.toString());
    return this.http.post<Comment>(`${this.apiUrl}/v2`, formData);
  }

  countCommentsByPostId(postId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${postId}`);
  }

  
  findCommentsByPostId(postId: number, filter: CommentFilter): Observable<IApiResponse<Comment>> {  

    let params = new HttpParams()  
      .set('page', filter.page)  
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);  
      
    return this.http.get<IApiResponse<Comment>>(`${this.apiUrl}/post/${postId}`, { params });
  }
}
