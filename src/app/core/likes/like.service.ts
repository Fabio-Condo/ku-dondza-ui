import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Like } from '../model/Like';

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

}
