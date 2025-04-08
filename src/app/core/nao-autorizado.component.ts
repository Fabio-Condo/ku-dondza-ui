import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nao-autorizado',
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-number">401</div>
        <div class="error-divider"></div>
        <h1 class="error-title">Acesso negado</h1>
        <p class="error-message">Ops! Você não tem permissão para acessar esta página. Por favor, verifique suas credenciais ou entre em contato com o administrador.</p>
        <div class="buttons-container">
          <button class="return-button" (click)="voltarParaHome()">
            <span class="button-icon">←</span>
            <span class="button-text">Voltar</span>
          </button>
          <button class="login-button" (click)="irParaLogin()">
            <span class="button-icon">↑</span>
            <span class="button-text">Fazer login</span>
          </button>
        </div>
      </div>
      <div class="error-animation">
        <div class="lock-container">
          <div class="lock-body"></div>
          <div class="lock-shackle"></div>
          <div class="lock-keyhole"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      color: #ffffff;
      overflow: hidden;
    }
    
    .error-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      width: 90%;
      max-width: 1200px;
      gap: 5rem;
    }
    
    .error-content {
      text-align: left;
      max-width: 600px;
    }
    
    .error-number {
      font-size: 8rem;
      font-weight: 700;
      background: linear-gradient(90deg, #e43a15, #e65245);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 1rem;
      line-height: 1;
      text-shadow: 0 0 30px rgba(228, 58, 21, 0.3);
      animation: pulse 3s infinite ease-in-out;
    }
    
    .error-divider {
      width: 80px;
      height: 4px;
      background: #e43a15;
      margin: 1.5rem 0;
      border-radius: 2px;
    }
    
    .error-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #f0f0f0;
    }
    
    .error-message {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      color: #b8b8b8;
      line-height: 1.6;
    }
    
    .buttons-container {
      display: flex;
      gap: 1rem;
    }
    
    .return-button, .login-button {
      display: flex;
      align-items: center;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 30px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .return-button {
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }
    
    .login-button {
      background: linear-gradient(90deg, #e43a15, #e65245);
      color: white;
      box-shadow: 0 4px 12px rgba(228, 58, 21, 0.4);
    }
    
    .return-button:hover {
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-3px);
    }
    
    .login-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(228, 58, 21, 0.6);
    }
    
    .button-icon {
      margin-right: 0.8rem;
      font-size: 1.2rem;
    }
    
    .error-animation {
      position: relative;
      width: 300px;
      height: 300px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .lock-container {
      position: relative;
      width: 150px;
      height: 200px;
      animation: float 3s ease-in-out infinite;
    }
    
    .lock-body {
      position: absolute;
      bottom: 0;
      width: 150px;
      height: 120px;
      background: #e43a15;
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(228, 58, 21, 0.6);
    }
    
    .lock-shackle {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 100px;
      border: 16px solid #e43a15;
      border-bottom: none;
      border-radius: 40px 40px 0 0;
      box-shadow: 0 0 20px rgba(228, 58, 21, 0.4);
    }
    
    .lock-keyhole {
      position: absolute;
      bottom: 45px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 30px;
      background: #16213e;
      border-radius: 50%;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.6);
    }
    
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.8;
      }
      100% {
        opacity: 1;
      }
    }
    
    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
      100% {
        transform: translateY(0px);
      }
    }

    /* Responsividade */
    @media (max-width: 992px) {
      .error-container {
        flex-direction: column;
        gap: 2rem;
        text-align: center;
      }
      
      .error-content {
        text-align: center;
        order: 2;
      }
      
      .error-animation {
        order: 1;
        width: 200px;
        height: 200px;
      }
      
      .error-divider {
        margin: 1.5rem auto;
      }
      
      .buttons-container {
        justify-content: center;
      }
    }
    
    @media (max-width: 576px) {
      .error-number {
        font-size: 6rem;
      }
      
      .error-title {
        font-size: 2rem;
      }
      
      .error-message {
        font-size: 1rem;
      }
      
      .error-animation {
        width: 150px;
        height: 150px;
      }
      
      .lock-container {
        width: 100px;
        height: 140px;
      }
      
      .lock-body {
        width: 100px;
        height: 80px;
      }
      
      .lock-shackle {
        width: 60px;
        height: 80px;
        border-width: 12px;
      }
      
      .lock-keyhole {
        width: 20px;
        height: 20px;
        bottom: 30px;
      }
      
      .buttons-container {
        flex-direction: column;
      }
    }
  `]
})
export class NaoAutorizadoComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('401 - Acesso negado');
  }

  voltarParaHome(): void {
    this.router.navigate(['/']);
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }
}