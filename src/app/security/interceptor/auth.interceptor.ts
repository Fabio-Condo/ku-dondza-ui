import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService, private router: Router) {}

  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    // Pula a interceptação para certos endpoints, como login, registro e Google OAuth
    if (httpRequest.url.includes(`${this.authenticationService.host}/auth/login`) ||
        httpRequest.url.includes(`${this.authenticationService.host}/auth/google`) ||
        httpRequest.url.includes(`${this.authenticationService.host}/user/register`) ||
        httpRequest.url.includes(`${this.authenticationService.host}/generate-otp`) || // Para o envio do OTP
        httpRequest.url.includes(`${this.authenticationService.host}/validate-otp`)) {  // Para a validação do OTP
      return httpHandler.handle(httpRequest);
    }

    // Carrega o token antes de enviar a requisição
    this.authenticationService.loadToken();  
    const token = this.authenticationService.getToken();  // Obtem o token armazenado

    // Se houver um token, adiciona no header Authorization
    if (token) {
      const clonedRequest = httpRequest.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      return httpHandler.handle(clonedRequest);
    } else {
      // Se não houver token, redireciona o usuário para o login
      this.router.navigate(['/login']);
      return httpHandler.handle(httpRequest);
    }
  }
}
