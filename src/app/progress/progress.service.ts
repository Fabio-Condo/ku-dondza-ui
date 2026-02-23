import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Test } from '../core/model/Test';
import { TopicTestsDTO } from '../core/model/TopicTestsDTO';
import { Question } from '../core/model/Question';

@Injectable({
    providedIn: 'root'
})
export class ProgressService {

    private host = environment.apiUrl + '/tests';

    constructor(private http: HttpClient) { }

    getBySubjectId(subjectId: number, userId: number): Observable<TopicTestsDTO[]> {
        return this.http.get<TopicTestsDTO[]>(`${this.host}/subjects/${subjectId}/users/${userId}`, {});
    }

    findById(id: number): Observable<Test> {
        return this.http.get<Test>(`${this.host}/${id}`, {});
    }

    add(test: Test): Observable<Test> {
        return this.http.post<Test>(this.host, test, {});
    }

    update(test: Test): Observable<Test> {
        return this.http.put<Test>(`${this.host}/${test.id}`, test, {});
    }

    excluir(id: number): Observable<void> {
        return this.http.delete<void>(`${this.host}/${id}`, {});
    }

    buscarTotal(): Observable<number> {
        return this.http.get<number>(`${this.host}/total`, {});
    }

    getQuestionsByTestId(id: number): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.host}/${id}/questions`);
    }

    addQuestionToTestQuestions(testId: number, questionId: number): Observable<Test> {
        return this.http.post<Test>(`${this.host}/${testId}/questions/${questionId}`, {});
    }

    removeQuestionFromTestQuestions(testId: number, questionId: number): Observable<Test> {
        return this.http.delete<Test>(`${this.host}/${testId}/questions/${questionId}`, {});
    }
}