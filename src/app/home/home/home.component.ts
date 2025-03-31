import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from 'src/app/core/model/User';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { AuthenticationService } from 'src/app/users/authentication.service';
declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public showLoading: any;
  private subscriptions: Subscription[] = [];
  value3: any;
  loadingMessage = "Carregando..."; // Alterar dinamicamente

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
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

  onLogIn(): void {
    this.router.navigate(['/login']);
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  public handleGoogleResponse(resp: any): void {
    this.loadingMessage = "Estamos quase lá...";
    this.showLoading = true;

    const credential = resp.credential;

    this.subscriptions.push(
      this.authenticationService.loginWithGoogle(credential).subscribe({
        next: (response: HttpResponse<User>) => {
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(response.body);
          this.showLoading = false;
          this.ngZone.run(() => {
            this.router.navigateByUrl('/quizzes');
          });
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.sendErrorNotification(errorResponse.error.message);
          this.showLoading = false;
        }
      })
    );
  }

  public onLogin(user: User): void {
    this.loadingMessage = "Estamos quase lá...";
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

}
