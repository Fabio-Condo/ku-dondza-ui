import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { OnlineCourseContent } from '../core/model/Online-course-content';
import { TopicContent } from '../core/model/Topic-content';


@Injectable({ providedIn: 'root' })
export class TopicContentService {
    private host = environment.apiUrl + '/topic-content';

    constructor(private http: HttpClient) { }

    save(content: TopicContent, file: File): Observable<TopicContent> {
        const formData = new FormData();
        formData.append('description', content.description);
        formData.append('contentType', content.contentType);
        formData.append('time', content.time.toString());
        formData.append('topicId', content.topic.id.toString());
        formData.append('position', content.position.toString());
        formData.append('file', file);
        return this.http.post<TopicContent>(`${this.host}`, formData);
    }

    update(content: TopicContent, file: File): Observable<TopicContent> {
        const formData = new FormData();
        formData.append('id', content.id.toString());
        formData.append('description', content.description);
        formData.append('contentType', content.contentType);
        formData.append('time', content.time.toString());
        formData.append('topicId', content.topic.id.toString());
        formData.append('position', content.position.toString());
        formData.append('file', file);
        return this.http.put<TopicContent>(`${this.host}`, formData);
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    findById(id: number): Observable<OnlineCourseContent> {
        return this.http.get<OnlineCourseContent>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

    download(id: number, filename: string): Observable<Blob> {
        return this.http.get(`${this.host}/download/${id}/${filename}`, { responseType: 'blob' });
    }
}
