import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Wallet } from '../model/Wallet';


@Injectable({ providedIn: 'root' })
export class WalletService {
    private host = environment.apiUrl + '/wallets';

    constructor(private http: HttpClient) { }

    getWalletsByUser(userId: number): Observable<Wallet[]> {
        return this.http.get<Wallet[]>(`${this.host}/user/${userId}`, {});
    }

    add(userId: number, wallet: Wallet): Observable<Wallet> {
        return this.http.post<Wallet>(`${this.host}/user/${userId}/add`, wallet, {});
    }

    setDefault(walletId: number): Observable<Wallet> {
        return this.http.put<Wallet>(`${this.host}/${walletId}/set-default`, {});
    }
}
