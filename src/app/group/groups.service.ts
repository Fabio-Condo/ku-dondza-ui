import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../core/model/Group';
import { environment } from 'src/environments/environment';
import { GroupFilter } from '../core/interface/GroupFilter';
import { IApiResponse } from '../core/interface/IApiResponse';
import { User } from '../core/model/User';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private baseUrl  = environment.apiUrl + '/groups';

  constructor(private http: HttpClient) {}

  findAll(filtro: GroupFilter): Observable<IApiResponse<Group>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);
      
      if (filtro.description) {
        params = params.set('description', filtro.description);
      }

    return this.http.get<IApiResponse<Group>>(`${this.baseUrl}/filter`, { params });

  }

  save(name: string, description: string, file: File): Observable<Group> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    return this.http.post<Group>(`${this.baseUrl}`, formData);
  }
  
  update(id: number, name: string, description: string, file: File): Observable<Group> {
    const formData = new FormData();
    formData.append('id', id.toString());
    formData.append('name', name);
    formData.append('description', description);
    formData.append('file', file);
    return this.http.put<Group>(`${this.baseUrl}`, formData);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {});
  }
    
  getGroupById(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/${id}`);
  }

  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total`, {});
  }

  addMemberToGroup(groupId: number, userId: number): Observable<Group> {
    return this.http.post<Group>(`${this.baseUrl}/${groupId}/members/${userId}`, {});
  }

  removeMemberFromGroup(groupId: number, userId: number): Observable<Group> {
    return this.http.delete<Group>(`${this.baseUrl}/${groupId}/members/${userId}`);
  }

  doesUserMemberOfGroup(groupId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${groupId}/members/contains/${userId}`);
  }

  getGroupMembers(groupId: number, filtro: GroupFilter): Observable<IApiResponse<User>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    return this.http.get<IApiResponse<User>>(`${this.baseUrl}/${groupId}/members`, { params });
  }
   
}
