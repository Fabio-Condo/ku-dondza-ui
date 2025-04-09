import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-nao-encontrada',
  template: `
    <div class="error-container">
      <div class="error-content">
        <div class="error-number">404</div>
        <div class="error-divider"></div>
        <h1 class="error-title">Página não encontrada</h1>
        <p class="error-message">Ops! A página que você está procurando parece ter se perdido no espaço digital.</p>
        <button class="return-button" (click)="voltarParaHome()">
          <span class="button-icon">←</span>
          <span class="button-text">Voltar para a página inicial</span>
        </button>
      </div>
      <div class="error-animation">
        <div class="orbit">
          <div class="planet"></div>
          <div class="satellite"></div>
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
      background: white;
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
      background: linear-gradient(to right, #4299e1, #2563eb);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 1rem;
      line-height: 1;
      text-shadow: 0 0 30px rgba(69, 104, 220, 0.3);
      animation: pulse 3s infinite ease-in-out;
    }
    
    .error-divider {
      width: 80px;
      height: 4px;
      background: #4568dc;
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
    
    .return-button {
      align-items: center;
      background: linear-gradient(to right, #4299e1, #2563eb);
      color: white;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 30px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(69, 104, 220, 0.4);
    }
    
    .return-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(69, 104, 220, 0.6);
    }
    
    .button-icon {
      margin-right: 0.8rem;
      font-size: 1.2rem;
    }
    
    .error-animation {
      position: relative;
      width: 300px;
      height: 300px;
    }
    
    .orbit {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 280px;
      height: 280px;
      margin-top: -140px;
      margin-left: -140px;
      border: 2px solid #4568dc;
      border-radius: 50%;
      animation: rotate 15s linear infinite;
    }
    
    .planet {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      margin-top: -50px;
      margin-left: -50px;
      background: #4568dc;
      border-radius: 50%;
      box-shadow: 0 0 30px rgba(69, 104, 220, 0.8);
    }
    
    .satellite {
      position: absolute;
      top: 0;
      left: 50%;
      width: 30px;
      height: 30px;
      margin-top: -15px;
      margin-left: -15px;
      background: #b06ab3;
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(176, 106, 179, 0.8);
      animation: orbit 5s linear infinite;
    }
    
    @keyframes rotate {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
    
    @keyframes orbit {
      0% {
        transform: rotate(0deg) translateX(140px) rotate(0deg);
      }
      100% {
        transform: rotate(360deg) translateX(140px) rotate(-360deg);
      }
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

       /* Centralizando o botão */
      .return-button {
        margin-top: 2rem;
        align-self: center;
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
      
      .orbit {
        width: 140px;
        height: 140px;
        margin-top: -70px;
        margin-left: -70px;
      }
      
      .planet {
        width: 60px;
        height: 60px;
        margin-top: -30px;
        margin-left: -30px;
      }
      
      .satellite {
        width: 20px;
        height: 20px;
        margin-top: -10px;
        margin-left: -10px;
      }
    }
  `]
})
export class PaginaNaoEncontradaComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('404 - Página não encontrada');
  }

  voltarParaHome(): void {
    this.router.navigate(['/']);
  }
}