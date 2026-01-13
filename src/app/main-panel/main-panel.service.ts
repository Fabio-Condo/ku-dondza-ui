import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { TopicTestDTO } from '../core/model/TopicTestDTO';
import { TopicWithTestsDTO } from '../core/model/TopicWithTestsDTO';
import { Question } from '../core/model/Question';
import { Quiz } from '../core/model/Quiz';
import { User } from '../core/model/User';

@Injectable({
    providedIn: 'root'
})
export class MainPanelService {

    private host = environment.apiUrl + '/topic-tests';

    constructor(private http: HttpClient) { }

    getBySubjectId(subjectId: number, userId: number): Observable<TopicWithTestsDTO[]> {
        return this.http.get<TopicWithTestsDTO[]>(`${this.host}/${subjectId}/subjects/users/${userId}`, {});
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

    getQuestionsByTopicTestId(id: number): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.host}/${id}/questions`);
    }

    addQuestionToTopicTestQuestions(topicTestId: number, questionId: number): Observable<TopicTestDTO> {
        return this.http.post<TopicTestDTO>(`${this.host}/${topicTestId}/questions/${questionId}`, {});
    }

    removeQuestionFromTopicTestQuestions(topicTestId: number, questionId: number): Observable<TopicTestDTO> {
        return this.http.delete<TopicTestDTO>(`${this.host}/${topicTestId}/questions/${questionId}`, {});
    }
}