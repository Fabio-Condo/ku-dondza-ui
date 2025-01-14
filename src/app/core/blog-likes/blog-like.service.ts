import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../interface/IApiResponse';
import { LikeFilter } from '../interface/LikeFilter';
import { BlogLike } from '../model/BlogLike';

@Injectable({
  providedIn: 'root'
})
export class BlogLikeService {

  private apiUrl = environment.apiUrl + '/blog-likes';

  constructor(private http: HttpClient) { }

  toggleLike(blogId: number): Observable<BlogLike> {
    return this.http.post<BlogLike>(`${this.apiUrl}/blog/${blogId}`, {});
  }

  checkIfLiked(blogId: number): Observable<boolean> { //boolean
    return this.http.get<boolean>(`${this.apiUrl}/blog/${blogId}/check`);
  }

  countLikesByBlogId(blogId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${blogId}`);
  }

  findLikesByBlogId(blogId: number, filter: LikeFilter): Observable<IApiResponse<BlogLike>> {  

    let params = new HttpParams()  
      .set('page', filter.page)  
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);  
      
    return this.http.get<IApiResponse<BlogLike>>(`${this.apiUrl}/blog/${blogId}`, { params });
  }

}
