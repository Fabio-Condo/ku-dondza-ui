import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IPostFilter } from '../core/interface/IPostFilter';
import { Post } from '../core/model/Post';

@Injectable({providedIn: 'root'})
export class FeedsService {
  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(filter: IPostFilter): Observable<IApiResponse<Post>> {  

    let params = new HttpParams()  
      .set('page', filter.page)  
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort)
      ;  

    if (filter.property) {  
      params = params.set('property', filter.property); 
    }

    return this.http.get<IApiResponse<Post>>(`${this.host}/post/all`, { params });
  }

  public addPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.host}/post/add`, formData);  
  }

  public createPostFormDate(post: Post, postImage: File): FormData {  
    const formData = new FormData();
    formData.append('text', post.text);
    formData.append('type', post.type);
    formData.append('postImage', postImage);
    return formData;
  }

}
