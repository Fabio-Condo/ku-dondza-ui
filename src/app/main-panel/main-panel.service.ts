import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { TopicTestDTO } from '../core/model/TopicTestDTO';
import { TopicWithTestsDTO } from '../core/model/TopicWithTestsDTO';

@Injectable({
  providedIn: 'root'
})
export class MainPanelService {

  private host = environment.apiUrl + '/topic-tests';

  constructor(private http: HttpClient) { }

    getBySubjectId(subjectId: number): Observable<TopicWithTestsDTO[]> {
        return this.http.get<TopicWithTestsDTO[]>(`${this.host}/${subjectId}/subjects`);
    }

    findById(id: number): Observable<TopicTestDTO> {
        return this.http.get<TopicTestDTO>(`${this.host}/${id}`, {});
    }

    add(TopicTest: TopicTestDTO): Observable<TopicTestDTO> {
        return this.http.post<TopicTestDTO>(this.host, TopicTest, {});
    }

    update(TopicTest: TopicTestDTO): Observable<TopicTestDTO> {
        return this.http.put<TopicTestDTO>(`${this.host}/${TopicTest.id}`, TopicTest, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }
}
