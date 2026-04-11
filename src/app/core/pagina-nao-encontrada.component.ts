import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-nao-encontrada',
  template: `
    <div class="page">
      <div class="wrap">

        <div class="content">
          <div class="badge">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Erro 404
          </div>

          <div class="num"><span>4</span>0<span>4</span></div>
          <h1 class="title">Página não encontrada</h1>
          <p class="desc">
            A página que procuras não existe ou foi movida.
            Verifica o endereço ou regressa ao início.
          </p>

          <div class="actions">
            <button class="btn-primary" (click)="voltarParaHome()">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Voltar ao início
            </button>
            <button class="btn-ghost" (click)="irParaQuizzes()">
              Ver quizzes
            </button>
          </div>
        </div>

        <div class="scene">
          <div class="ring r1"></div>
          <div class="ring r2"></div>
          <div class="core">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none"
              stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="dot d1"></div>
          <div class="dot d2"></div>
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
      background: #e8ecfd;
      color: #2a3fa8;
      border: 0.5px solid #b8c4f8;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 1.5rem;
    }

    .num {
      font-size: 7rem;
      font-weight: 500;
      line-height: 1;
      color: #1a1a2e;
      letter-spacing: -6px;
      margin-bottom: 0.5rem;
    }

    .num span { color: #4361ee; }

    .title {
      font-size: 22px;
      font-weight: 500;
      color: #1a1a2e;
      margin: 0 0 0.75rem;
    }

    .desc {
      font-size: 15px;
      color: #9aa3b8;
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
      background: #4361ee;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-primary:hover { opacity: 0.8; }

    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      color: #9aa3b8;
      border: 0.5px solid #9aa3b8;
      border-radius: 12px;
      padding: 10px 20px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-ghost:hover { background: #f0f2fd; }

    /* ── Animação orbital ── */
    .scene {
      flex-shrink: 0;
      width: 260px;
      height: 260px;
      position: relative;
    }

    .ring {
      position: absolute;
      top: 50%; left: 50%;
      border: 0.5px solid #9aa3b8;
      border-radius: 50%;
      animation: spin linear infinite;
    }

    .r1 {
      width: 200px; height: 200px;
      margin: -100px 0 0 -100px;
      animation-duration: 18s;
    }

    .r2 {
      width: 130px; height: 130px;
      margin: -65px 0 0 -65px;
      animation-duration: 12s;
      animation-direction: reverse;
    }

    .core {
      position: absolute;
      top: 50%; left: 50%;
      width: 54px; height: 54px;
      margin: -27px 0 0 -27px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8ecfd;
      color: #4361ee;
    }

    .dot {
      position: absolute;
      border-radius: 50%;
      top: 50%; left: 50%;
    }

    .d1 {
      width: 10px; height: 10px;
      margin: -5px 0 0 -5px;
      background: #4361ee;
      animation: orbit1 18s linear infinite;
    }

    .d2 {
      width: 7px; height: 7px;
      margin: -3.5px 0 0 -3.5px;
      background: #9aa3b8;
      animation: orbit2 12s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @keyframes orbit1 {
      from { transform: rotate(0deg) translateX(100px); }
      to   { transform: rotate(360deg) translateX(100px); }
    }

    @keyframes orbit2 {
      from { transform: rotate(0deg) translateX(65px); }
      to   { transform: rotate(360deg) translateX(65px); }
    }

    /* ── Responsividade ── */
    @media (max-width: 768px) {
      .wrap {
        flex-direction: column;
        gap: 2.5rem;
        text-align: center;
      }

      .scene {
        order: -1;
        width: 160px;
        height: 160px;
      }

      .r1 { width: 130px; height: 130px; margin: -65px 0 0 -65px; }
      .r2 { width: 80px;  height: 80px;  margin: -40px 0 0 -40px; }

      .core { width: 38px; height: 38px; margin: -19px 0 0 -19px; }

      .d1 { animation: orbit1-sm 18s linear infinite; }
      .d2 { animation: orbit2-sm 12s linear infinite; }

      @keyframes orbit1-sm {
        from { transform: rotate(0deg) translateX(65px); }
        to   { transform: rotate(360deg) translateX(65px); }
      }

      @keyframes orbit2-sm {
        from { transform: rotate(0deg) translateX(40px); }
        to   { transform: rotate(360deg) translateX(40px); }
      }

      .desc { max-width: none; }
      .num  { font-size: 5rem; letter-spacing: -4px; }
      .actions { justify-content: center; }
    }
  `]
})
export class PaginaNaoEncontradaComponent implements OnInit {
  constructor(
    private title: Title,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.title.setTitle('404 — Página não encontrada | Dikahub');
  }

  voltarParaHome(): void {
    this.router.navigate(['/']);
  }

  irParaQuizzes(): void {
    this.router.navigate(['/quizzes']);
  }
}