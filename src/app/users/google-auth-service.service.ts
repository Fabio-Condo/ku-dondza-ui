import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  
  constructor(private messageService: MessageService) {}

  async initializeGoogleButton(buttonId: string): Promise<(callback: (credential: string) => void) => void> {
    await this.loadGoogleScript();
    return this.setupGoogleButton(buttonId);
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar o Google'));
      document.head.appendChild(script);
    });
  }

  private setupGoogleButton(buttonId: string): (callback: (credential: string) => void) => void {
    return (callback) => {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => callback(response.credential),
        error_callback: (error: any) => this.handleGoogleError(error)
      });

      const buttonContainer = document.getElementById(buttonId);
      if (buttonContainer) {
        google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          width: buttonContainer.offsetWidth,
          text: 'signin_with'
        });
      }
    };
  }

  private handleGoogleError(error: any): void {
    console.error('Erro Google:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha na autenticação com Google',
      life: 5000
    });
  }
}