import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/users/authentication.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticationService, private router: Router) { }


  private publicUrls = [
    `${this.authenticationService.host}/subjects`,
    `${this.authenticationService.host}/submissions`,
    `${this.authenticationService.host}/competitions`,
    `${this.authenticationService.host}/auth/login`,
    `${this.authenticationService.host}/auth/google`,
    `${this.authenticationService.host}/generate-otp`,
    `${this.authenticationService.host}/validate-otp`,
    `${this.authenticationService.host}/user/register`

    // Adicione outras URLs públicas aqui
  ];

  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    if (this.publicUrls.some(url => httpRequest.url.includes(url))) {
      return httpHandler.handle(httpRequest);
    }

    this.authenticationService.loadToken();
    const token = this.authenticationService.getToken();
    const request = httpRequest.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return httpHandler.handle(request);
  }
}
