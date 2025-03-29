import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse, HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../authentication.service';
import { User } from 'src/app/core/model/User';
declare var google: any; // Declaração para evitar erro de "google is not defined"


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  imagePath = './assets/scilogo.png'
  public showLoading: any;
  private subscriptions: Subscription[] = [];
  value3: any;

  constructor(
    private ngZone: NgZone, 
    private http: HttpClient,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {

    if (this.authenticationService.isUserLoggedIn()) {  // Se estiver autenticado, apenas abe a tela principal
      this.router.navigateByUrl('/quizzes');
    } else {
      this.router.navigateByUrl('/login');
    }

    this.scrollToTop();

    // Inicializar o Google Login
    google.accounts.id.initialize({
      client_id: '170476897572-k758vjru9e2qqa707qhb5ns2kaaegquc.apps.googleusercontent.com',
      callback: (response: any) => {
        const credential = response.credential;  // Aqui você captura o token de autenticação
        //localStorage.setItem('google_token', credential); // Armazena de maneira segura
        this.handleGoogleResponse(response);  // Processa a resposta
      }
    });

    // Renderizar o botão de login do Google
    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular'
      }
    );

    google.accounts.id.prompt(); // Solicitar ao usuário para fazer login
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public handleGoogleResponse(resp: any): void {
    this.showLoading = true;
    const credential = resp.credential;  // Obter o token (credential)

    this.subscriptions.push(
      this.authenticationService.loginWithGoogle(credential).subscribe(

        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(response.body);
          this.ngZone.run(() => {
            this.router.navigateByUrl('/quizzes');
          });
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(errorResponse.error.message);  // Recebendo a reesposta do backend
          this.showLoading = false;
        }
      )
    );
  }

  public onLogin(user: User): void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(

        (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(response.body);
          this.router.navigateByUrl('/quizzes');
          this.showLoading = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(errorResponse.error.message);  // Recebendo a reesposta do backend
          this.showLoading = false;
        }
      )
    );
  }

  private sendErrorNotification(message: string): void {
    if (message) {
      this.messageService.add({ severity: 'error', detail: message });
    } else {
      this.messageService.add({ severity: 'error', detail: 'An error occurred. Please try again.' });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
