import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/users/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard implements CanActivate {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private messageService: MessageService,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.isUserLoggedInAndhasRequiredRoles(next);
    //return this.isUserLoggedIn();
  }

  private isUserLoggedInAndhasRequiredRoles(next: ActivatedRouteSnapshot): boolean {
    if (this.authenticationService.isUserLoggedIn()) { // Verifique se o usuário está autenticado
      if (next.data['requiresRoleCheck']) { // Verifique se a rota tem a propriedade 'requiresRoleCheck' definida como true
        if(!this.authenticationService.hasRequiredRoles(next.data['roles'])){ // Verifique se o usuário possui as funções necessárias para acessar a rota
          this.router.navigate(['/nao-autorizado']);
        }
      }
      return true;
    }
    this.router.navigate(['/login']);
    this.messageService.add({ severity: 'error', detail: 'You need to log in to access this page' });
    return false;
  }

  private hasRequiredRoles(next: ActivatedRouteSnapshot) {
    if(!this.authenticationService.hasRequiredRoles(next.data['roles'])){
      this.router.navigate(['/nao-autorizado']);
    }
  }

  /*
  private isUserLoggedIn(): boolean {
    if (this.authenticationService.isUserLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    this.messageService.add({ severity: 'error', detail: 'You need to log in to access this page' });
    return false;
  }
  */



}
