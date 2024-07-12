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
export class LikeService {

  private apiUrl = environment.apiUrl + '/likes';

  constructor(private http: HttpClient) { }

  toggleLike(postId: number): Observable<Like> {
    return this.http.post<Like>(`${this.apiUrl}/posts/${postId}`, {});
  }

  checkIfLiked(postId: number): Observable<boolean> { //boolean
    return this.http.get<boolean>(`${this.apiUrl}/posts/${postId}/check`);
  }

  countLikesByPostId(postId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${postId}`);
  }

  findLikesByPostId(postId: number, filter: LikeFilter): Observable<IApiResponse<Like>> {  

    let params = new HttpParams()  
      .set('page', filter.page)  
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);  
      
    return this.http.get<IApiResponse<Like>>(`${this.apiUrl}/post/${postId}`, { params });
  }

}
