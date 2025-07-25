import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { DatePipe } from '@angular/common';
import { ArticleFilter } from '../core/interface/ArticleFilter';
import { Article } from '../core/model/Article';


@Injectable({ providedIn: 'root' })
export class ArticlesService {
    private host = environment.apiUrl + '/articles';

    constructor(private http: HttpClient, private datePipe: DatePipe) { }

    findAll(filtro: ArticleFilter, currentUserId: number): Observable<IApiResponse<Article>> {

        let params = new HttpParams()
            .set('currentUserId', currentUserId.toString())
            .set('page', filtro.page)
            .set('sort', filtro.sort)
            .set('size', filtro.itemsPerPage);

        if (filtro.searchParam) {
            params = params.set('searchParam', filtro.searchParam);
        }

        if (filtro.title) {
            params = params.set('title', filtro.title);
        }

        if (filtro.category) {
            params = params.set('category', filtro.category);
        }

        // Envia o userId se estiver definido
        if (filtro.userId) {
            params = params.set('userId', filtro.userId.toString());
        }

        return this.http.get<IApiResponse<Article>>(`${this.host}/filter`, { params });

    }

    save(aticle: Article, file: File): Observable<Article> {
        const formData = new FormData();
        formData.append('title', aticle.title);
        formData.append('content', aticle.content);
        formData.append('category', aticle.category);
        formData.append('readingTimeMinutes', aticle.readingTimeMinutes.toString());
        formData.append('file', file);
        return this.http.post<Article>(`${this.host}`, formData);
    }

    update(aticle: Article, file: File): Observable<Article> {
        const formData = new FormData();
        formData.append('id', aticle.id.toString());
        formData.append('title', aticle.title);
        formData.append('content', aticle.content);
        formData.append('category', aticle.category);
        formData.append('readingTimeMinutes', aticle.readingTimeMinutes.toString());
        formData.append('file', file);
        return this.http.put<Article>(`${this.host}`, formData);
    }

    findById(id: number): Observable<Article> {
        return this.http.get<Article>(`${this.host}/${id}`, {});
    }

    getArticleByArticleId(aticleId: string, currentUserId: number): Observable<Article> {
        let params = new HttpParams()
            .set('currentUserId', currentUserId.toString());
        return this.http.get<Article>(`${this.host}/find-by-articleId/${aticleId}`, { params });
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}