import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { IPostFilter } from '../core/interface/IPostFilter';
import { Post } from '../core/model/Post';

@Injectable({providedIn: 'root'})
export class FeedsService {
  private host = environment.apiUrl + '/post';

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

    return this.http.get<IApiResponse<Post>>(`${this.host}/all`, { params });
  }

  public addPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.host}/add`, formData);  
  }

  public createPostFormData(post: Post, file: File): FormData {  
    const formData = new FormData();
    formData.append('text', post.text);
    formData.append('type', post.type);
    formData.append('file', file);
    return formData;
  }

  public addPostFromGroup(formData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.host}/add-from-group`, formData);  
  }

  public createPostFromGroupFormData(groupId: number, post: Post, file: File): FormData {  
    const formData = new FormData();
    
    formData.append('groupId', groupId.toString());
    formData.append('text', post.text);
    formData.append('type', post.type);
    formData.append('file', file);
    return formData;
  }

  public addQuizPost(post: Post): Observable<Post> {
    console.log(post.pollOptions.length);

    return this.http.post<Post>(`${this.host}/add_quiz_post`, post, {});  
  }

  getUserPostsByUserId(userId: number, filter: IPostFilter): Observable<IApiResponse<Post>> {  

    let params = new HttpParams()  
      .set('page', filter.page)  
      .set('size', filter.itemsPerPage)
      .set('sort', filter.sort);  

    return this.http.get<IApiResponse<Post>>(`${this.host}/user/${userId}`, { params });
  }

  findByGroupId(groupId: number, filtro: IPostFilter): Observable<IApiResponse<Post>> {
        
    let params = new HttpParams()
        .set('page', filtro.page)
        .set('sort', filtro.sort)
        .set('size', filtro.itemsPerPage)
        .set('groupId', groupId);

    return this.http.get<IApiResponse<Post>>(`${this.host}/findByGroupId`, { params });
}

}
