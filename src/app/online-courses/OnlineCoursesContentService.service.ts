import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { InstitutionFilter } from '../core/interface/InstitutionFilter';
import { OnlineCourseContent } from '../core/model/Online-course-content';
import { CourseFilter } from '../core/interface/CourseFilter';


@Injectable({ providedIn: 'root' })
export class OnlineCoursesContentService {
    private host = environment.apiUrl + '/online-course-content';

    constructor(private http: HttpClient) { }

    findAll(filtro: InstitutionFilter): Observable<IApiResponse<OnlineCourseContent>> {

        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina);

        return this.http.get<IApiResponse<OnlineCourseContent>>(`${this.host}/filter`, { params });
    }

    listarTodos(): Observable<IApiResponse<OnlineCourseContent>> {
        return this.http.get<IApiResponse<OnlineCourseContent>>(`${this.host}/filter`, {});
    }

    findByOnlineCourseId(onlineCourseId: number, filtro: CourseFilter): Observable<IApiResponse<OnlineCourseContent>> {
        
        let params = new HttpParams()
            .set('page', filtro.pagina)
            .set('sort', filtro.ordenamento)
            .set('size', filtro.itensPorPagina)
            .set('onlineCourseId', onlineCourseId);

        return this.http.get<IApiResponse<OnlineCourseContent>>(`${this.host}/findByOnlineCourseId`, { params });
    }

    save(content: OnlineCourseContent, file: File): Observable<OnlineCourseContent> {
        const formData = new FormData();
        formData.append('description', content.description);
        formData.append('contentType', content.contentType);
        formData.append('temaId', content.tema.id.toString());
        formData.append('position', content.position.toString());
        formData.append('file', file);
        return this.http.post<OnlineCourseContent>(`${this.host}`, formData);
    }

    update(content: OnlineCourseContent, file: File): Observable<OnlineCourseContent> {
        const formData = new FormData();
        formData.append('id', content.id.toString());
        formData.append('description', content.description);
        formData.append('contentType', content.contentType);
        formData.append('temaId', content.tema.id.toString());
        formData.append('position', content.position.toString());
        formData.append('file', file);
        return this.http.put<OnlineCourseContent>(`${this.host}`, formData);
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
