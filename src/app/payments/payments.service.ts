import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IApiResponse } from '../core/interface/IApiResponse';
import { Payment } from '../core/model/Payment';
import { PaymentFilter } from '../core/interface/PaymentFilter';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  host: string;

  constructor(private http: HttpClient) {
    this.host = `${environment.apiUrl}/payments`;
  }

  filter(filtro: PaymentFilter): Observable<IApiResponse<Payment>> {
    let params = new HttpParams()
      .set('page', filtro.pagina)
      .set('sort', filtro.ordenamento)
      .set('size', filtro.itensPorPagina);

    if (filtro.searchParam) {
      params = params.set('searchParam', filtro.searchParam);
    }

    if (filtro.status) {
      params = params.set('status', filtro.status);
    }

    return this.http.get<IApiResponse<Payment>>(`${this.host}/filter`, { params });
  }

}
