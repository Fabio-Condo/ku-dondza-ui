import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
import { IApiResponse } from 'src/app/core/interface/IApiResponse';
import { InstitutionFilter } from '../core/interface/InstitutionFilter';
import { Institution } from '../core/model/Institution';


@Injectable({providedIn: 'root'})
export class InstitutionService {
  private host = environment.apiUrl + '/institutions';

  constructor(private http: HttpClient) {}

  findAll(filtro: InstitutionFilter): Observable<IApiResponse<Institution>> {

    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);


    return this.http.get<IApiResponse<Institution>>(`${this.host}/filter`, { params });

  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.host}/${id}`, {});
  }


  buscarTotal(): Observable<number> {
    return this.http.get<number>(`${this.host}/total`, {});
  }
}
