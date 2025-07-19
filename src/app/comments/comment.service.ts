import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../core/model/Comment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { CommentFilter } from '../core/interface/ArticleFilter copy';


@Injectable({ providedIn: 'root' })
export class CommentService {
    private host = environment.apiUrl + '/comments';

    constructor(private http: HttpClient) { }

    getCommentsByQuestion(questionId: number, filter: CommentFilter): Observable<IApiResponse<Comment>> {
        let params = new HttpParams()
            .set('questionId', questionId.toString())
            .set('page', filter.page)
            .set('sort', filter.sort)
            .set('size', filter.itemsPerPage);
            
        return this.http.get<IApiResponse<Comment>>(`${this.host}/question/${questionId}`, { params });
    }

    add(comment: Comment): Observable<Comment> {
        return this.http.post<Comment>(this.host, comment, {});
    }

    update(comment: Comment): Observable<Comment> {
        return this.http.put<Comment>(`${this.host}/${comment.id}`, comment, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }
}