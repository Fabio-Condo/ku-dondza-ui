import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HeaderType } from 'src/app/enum/header-type.enum';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../authentication.service';
import { User } from 'src/app/core/model/User';


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
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public onLogin(user: User): void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe(

        (response: HttpResponse<User>) => {
          this.showLoading = false;
          const token = response.headers.get(HeaderType.JWT_TOKEN);
          this.authenticationService.saveToken(token);
          this.authenticationService.addUserToLocalCache(response.body);
            this.router.navigateByUrl('/quizzes');
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
