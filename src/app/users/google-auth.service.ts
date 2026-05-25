import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthServiceV2 {

  private callback?: (credential: string) => void;

  private initialized = false;

  async initOnce(): Promise<void> {
    if (this.initialized) return;

    await this.loadScript();

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (res: any) => this.handleResponse(res)
    });

    this.initialized = true;
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();

      document.head.appendChild(script);
    });
  }

  login(callback: (credential: string) => void) {
    if (!this.initialized) return;

    this.callback = callback;

    google.accounts.id.disableAutoSelect();
    google.accounts.id.prompt();
  }

  private handleResponse(response: any) {
    this.callback?.(response.credential);
  }
}