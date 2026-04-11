import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nao-autorizado',
  template: `
    <div class="page">
      <div class="wrap">

        <div class="content">
          <div class="badge">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Erro 401
          </div>

          <div class="num"><span>4</span>0<span>1</span></div>
          <h1 class="title">Acesso negado</h1>
          <p class="desc">
            Não tens permissão para aceder a esta página.
            Verifica as tuas credenciais ou volta ao início.
          </p>

          <div class="actions">
            <button class="btn-primary" (click)="voltarParaHome()">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Voltar ao início
            </button>
            <button class="btn-ghost" (click)="irParaLogin()">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Fazer login
            </button>
          </div>
        </div>

        <div class="scene">
          <div class="lock-wrap">
            <svg class="lock-svg" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="60" width="100" height="75" rx="14" fill="#f1efe8" stroke="#d3d1c7" stroke-width="1"/>
              <path d="M35 60V42a25 25 0 0 1 50 0v18" stroke="#b4b2a9" stroke-width="10"
                stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <circle cx="60" cy="97" r="12" fill="#d3d1c7"/>
              <rect x="56" y="97" width="8" height="14" rx="4" fill="#b4b2a9"/>
            </svg>
            <div class="pulse-ring r1"></div>
            <div class="pulse-ring r2"></div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #ffffff;
    }

    .page {
      width: 100%;
      padding: 3rem 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wrap {
      display: flex;
      align-items: center;
      gap: 5rem;
      max-width: 900px;
      width: 100%;
    }

    .content { flex: 1; min-width: 0; }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f1efe8;
      color: #444441;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 20px;
      border: 0.5px solid #d3d1c7;
      margin-bottom: 1.5rem;
    }

    .num {
      font-size: 7rem;
      font-weight: 500;
      line-height: 1;
      color: #1a1a1a;
      letter-spacing: -6px;
      margin-bottom: 0.5rem;
    }

    .num span { color: #888780; }

    .title {
      font-size: 22px;
      font-weight: 500;
      color: #1a1a1a;
      margin: 0 0 0.75rem;
    }

    .desc {
      font-size: 15px;
      color: #888780;
      line-height: 1.7;
      margin: 0 0 2rem;
      max-width: 380px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #1a1a1a;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-primary:hover { opacity: 0.75; }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      color: #5f5e5a;
      border: 0.5px solid #b4b2a9;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-ghost:hover { background: #f1efe8; }

    /* ── Ilustração ── */
    .scene {
      flex-shrink: 0;
      width: 240px;
      height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lock-wrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 180px;
      height: 180px;
    }

    .lock-svg {
      width: 120px;
      height: 140px;
      position: relative;
      z-index: 2;
      animation: float 4s ease-in-out infinite;
    }

    .pulse-ring {
      position: absolute;
      border-radius: 50%;
      border: 0.5px solid #d3d1c7;
      animation: pulse-out 3s ease-out infinite;
    }

    .r1 { width: 130px; height: 130px; animation-delay: 0s; }
    .r2 { width: 170px; height: 170px; animation-delay: 0.8s; }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }

    @keyframes pulse-out {
      0%   { opacity: 0.6; transform: scale(0.9); }
      100% { opacity: 0;   transform: scale(1.2); }
    }

    /* ── Responsividade ── */
    @media (max-width: 768px) {
      .wrap {
        flex-direction: column;
        gap: 2rem;
        text-align: center;
      }

      .scene { order: -1; width: 160px; height: 160px; }
      .lock-wrap { width: 130px; height: 130px; }
      .lock-svg  { width: 80px; height: 94px; }
      .r1 { width: 90px;  height: 90px; }
      .r2 { width: 120px; height: 120px; }

      .desc    { max-width: none; }
      .num     { font-size: 5rem; letter-spacing: -4px; }
      .actions { justify-content: center; }
    }
  `]
})
export class NaoAutorizadoComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('401 — Acesso negado | Dikahub');
  }

  voltarParaHome(): void {
    this.router.navigate(['/quizzes']);
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }
}