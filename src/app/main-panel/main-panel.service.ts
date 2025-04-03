import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainPanelService {
  private baseUrl = environment.apiUrl + '/user';

  constructor(private http: HttpClient) { }


}
