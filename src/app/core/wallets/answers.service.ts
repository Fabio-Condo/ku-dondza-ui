import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, tap } from 'rxjs';
import { Wallet } from '../model/Wallet';


@Injectable({ providedIn: 'root' })
export class WalletService {
    private host = environment.apiUrl + '/wallets';

    private walletsCache: Wallet[] | null = null;


    clearCache() {
        this.walletsCache = null;
    }

    constructor(private http: HttpClient) { }

    getWalletsByUser(userId: number): Observable<Wallet[]> {
        if (this.walletsCache) {
            console.log('Returning wallets from cache');
            return of(this.walletsCache);
        }

        console.log('Fetching wallet from API')
        return this.http.get<Wallet[]>(`${this.host}/user/${userId}`, {}).pipe(
            tap(wallets => this.walletsCache = wallets)
        );
    }

    add(userId: number, wallet: Wallet): Observable<Wallet> {
        return this.http.post<Wallet>(`${this.host}/user/${userId}/add`, wallet, {}).pipe(
            tap(() => this.clearCache())
        );
    }

    setDefault(walletId: number): Observable<Wallet> {
        return this.http.put<Wallet>(`${this.host}/${walletId}/set-default`, {}).pipe(
            tap(() => this.clearCache())
        );
    }
}
