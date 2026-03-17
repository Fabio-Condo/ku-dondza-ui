import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';   //npm install @auth0/angular-jwt
import { User } from '../core/model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host = environment.apiUrl;
  private token: any;
  private loggedInUsername: any;

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { }

  public login(user: User): Observable<HttpResponse<User>> {
    return this.http.post<User>(`${this.host}/auth/login`, user, { observe: 'response' });
  }


  public loginWithGoogle(credential: string): Observable<HttpResponse<User>> {
    return this.http.post<User>(`${this.host}/auth/google`, { idToken: credential }, { observe: 'response' });
  }

  generateOtp(email: string): Observable<void> {
    return this.http.post<void>(`${this.host}/auth/generate-otp`, email);
  }

  validateOtp(email: string, otp: string): Observable<HttpResponse<User>> {
    return this.http.post<User>(`${this.host}/auth/validate-otp?email=${email}&otp=${otp}`, {}, {
      observe: 'response'
    });
  }

  startRegistrationViaOtp(email: string): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.host}/auth/start-registration?email=${email}`, {}, {
      observe: 'response'
    });
  }

  completeRegistrationViaOtp(fullName: string, email: string, otp: string): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.host}/auth/complete-registration?fullName=${fullName}&email=${email}&otp=${otp}`, {}, {
      observe: 'response'
    });
  }

  public register(user: User): Observable<User> {
    return this.http.post<User>(`${this.host}/user/register`, user);
  }

  public logOut(): void {
    this.token = null;
    this.loggedInUsername = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
    localStorage.clear();
    sessionStorage.clear();
  }

  public saveToken(token: any): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public addUserToLocalCache(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User {
    var retrievedObject = localStorage.getItem('user');
    if (retrievedObject) {
      return JSON.parse(retrievedObject);
    }
    return null as any;
  }

  public loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  public getToken(): string {
    return this.token;
  }

  public isUserLoggedIn(): any {
    this.loadToken();
    if (this.token != null && this.token !== '') {
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          this.loggedInUsername = this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    } else {
      this.logOut();
      return false;
    }
  }

  // Método para verificar se o usuário possui as funções necessárias
  hasRequiredRoles(requiredRoles: string[]): boolean {
    // Verifique se há alguma interseção entre as funções do usuário e as funções necessárias
    return requiredRoles.some(role => this.getUserFromLocalCache().role.includes(role));
  }

  // Para enviar o estado de login, se alguem fez login ou nao, e assim atualizo a navbar
  private loginStatus = new BehaviorSubject<boolean>(this.isUserLoggedIn());
  loginStatus$ = this.loginStatus.asObservable();

  notifyLoginStatus(loggedIn: boolean) {
    this.loginStatus.next(loggedIn);
  }

}
