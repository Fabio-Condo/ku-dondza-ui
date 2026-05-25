import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var google: any;

@Injectable({
    providedIn: 'root'
})
export class GoogleAuthServiceV2 {

    private callback?: (credential: string) => void;

    private initialized = false;

    private hiddenGoogleButton?: HTMLElement;

    async initOnce(): Promise<void> {

        if (this.initialized) return;

        await this.loadScript();

        google.accounts.id.initialize({
            client_id: environment.googleClientId,

            callback: (response: any) => {
                this.handleResponse(response);
            }
        });

        // botão escondido para popup grande
        const container = document.createElement('div');

        container.style.position = 'fixed';
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';
        container.style.top = '-9999px';

        document.body.appendChild(container);

        google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular'
        });

        // pega botão interno da Google
        setTimeout(() => {

            this.hiddenGoogleButton =
                container.querySelector('div[role="button"]') as HTMLElement;

        }, 500);

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

    // ONE TAP PEQUENO
    showOneTap(callback: (credential: string) => void) {

        if (!this.initialized) return;

        this.callback = callback;

        google.accounts.id.disableAutoSelect();

        google.accounts.id.prompt();
    }

    // POPUP GRANDE CENTRAL
    loginWithPopup(callback: (credential: string) => void) {

        if (!this.initialized) return;

        this.callback = callback;

        google.accounts.id.disableAutoSelect();

        this.hiddenGoogleButton?.click();
    }

    private handleResponse(response: any) {

        if (response.credential) {
            this.callback?.(response.credential);
        }
    }
}