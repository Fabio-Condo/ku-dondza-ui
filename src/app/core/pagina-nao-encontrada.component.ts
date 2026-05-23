import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-nao-encontrada',
  template: `
    <div class="page">
      <div class="content">

        <div class="glitch-wrap">
          <span class="glitch" data-text="404">404</span>
        </div>

        <h1 class="title">Página não encontrada</h1>
        <p class="desc">Este endereço não existe ou foi removido.</p>

        <button class="btn" (click)="voltarParaHome()">
          Ir para o início
        </button>

      </div>
    </div>
  `,
  styles: [`
    .page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
    }

    .content {
      text-align: center;
      padding: 2rem;
    }

    /* ── Glitch number ── */
    .glitch-wrap {
      margin-bottom: 1.5rem;
      line-height: 1;
    }

    .glitch {
      position: relative;
      display: inline-block;
      font-size: clamp(5rem, 18vw, 10rem);
      font-weight: 800;
      letter-spacing: -6px;
      color: #4361ee;
      font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif;
    }

    .glitch::before,
    .glitch::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .glitch::before {
      color: #c0c8ff;
      animation: glitch-top 3.2s infinite;
      clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
      transform: translate(-4px, -2px);
    }

    .glitch::after {
      color: #a5b4fc;
      animation: glitch-bot 3.2s infinite;
      clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
      transform: translate(4px, 2px);
    }

    @keyframes glitch-top {
      0%, 90%, 100% { transform: translate(-4px, -2px); opacity: 1; }
      92%            { transform: translate(6px, -2px); opacity: 0.8; }
      94%            { transform: translate(-6px, 0);   opacity: 0.9; }
      96%            { transform: translate(2px, -4px); opacity: 1; }
    }

    @keyframes glitch-bot {
      0%, 90%, 100% { transform: translate(4px, 2px); opacity: 1; }
      92%            { transform: translate(-6px, 2px); opacity: 0.8; }
      94%            { transform: translate(4px, 4px);  opacity: 0.9; }
      96%            { transform: translate(-2px, 0);   opacity: 1; }
    }

    /* ── Text ── */
    .title {
      font-size: clamp(1.1rem, 3vw, 1.4rem);
      font-weight: 600;
      color: #1a1a2e;
      margin: 0 0 0.6rem;
      letter-spacing: -0.3px;
    }

    .desc {
      font-size: 0.95rem;
      color: #8b92aa;
      margin: 0 0 2.2rem;
      line-height: 1.6;
    }

    /* ── Button ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #4361ee;
      color: #ffffff;
      border: none;
      border-radius: 50px;
      padding: 13px 28px;
      font-size: 14px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      letter-spacing: 0.1px;
      transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      box-shadow: 0 4px 18px rgba(67, 97, 238, 0.32);
    }

    .btn:hover {
      background: #3451d1;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(67, 97, 238, 0.42);
    }

    .btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(67, 97, 238, 0.25);
    }
  `]
})
export class PaginaNaoEncontradaComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.title.setTitle('404 — Página não encontrada | Dikahub');
  }

  voltarParaHome(): void {
    this.router.navigate(['/main-panel']);
  }
}