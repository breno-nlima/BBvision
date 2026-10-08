/**
 * BVision Login Screen
 * Fiel à Imagem 1 do Mockup Oficial
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderLogin() {
  return `
    <div class="login-screen-wrapper fade-in">
      <div class="login-brand-container">
        <div class="login-logo-box">
          ${Icons.logoBVision(92)}
        </div>
        <h1 class="login-brand-title">BBVision</h1>
      </div>

      <form class="login-form" id="loginForm" onsubmit="event.preventDefault();">
        <div class="form-input-group">
          <input 
            type="email" 
            id="loginEmail" 
            class="form-input-field" 
            placeholder="E-mail" 
            value="rodrigo@empreiteira.com" 
            required 
            autocomplete="email"
          />
        </div>

        <div class="form-input-group">
          <input 
            type="password" 
            id="loginSenha" 
            class="form-input-field" 
            placeholder="Senha" 
            value="••••••••" 
            required 
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-submit-primary" id="btnEntrar">
          Entrar
        </button>

        <div class="login-links-container">
          <a href="#" class="link-esqueci-senha" id="linkEsqueciSenha">
            Esqueci minha senha
          </a>
          <a href="#" class="link-criar-conta" id="linkCriarConta">
            Criar conta
          </a>
        </div>
      </form>
    </div>
  `;
}

export function bindLoginEvents() {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value || 'rodrigo@empreiteira.com';
      const senha = document.getElementById('loginSenha')?.value || '';
      state.login(email, senha);
    });
  }

  const btnEntrar = document.getElementById('btnEntrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value || 'rodrigo@empreiteira.com';
      const senha = document.getElementById('loginSenha')?.value || '';
      state.login(email, senha);
    });
  }

  const linkCriar = document.getElementById('linkCriarConta');
  if (linkCriar) {
    linkCriar.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Cadastro de empreiteiras integrado ao sistema do Banco do Brasil.');
    });
  }

  const linkEsqueci = document.getElementById('linkEsqueciSenha');
  if (linkEsqueci) {
    linkEsqueci.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Um e-mail para recuperação de acesso será enviado ao e-mail cadastrado.');
    });
  }
}
