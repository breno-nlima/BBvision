/**
 * BVision Login Screen
 * Fiel à Imagem 1 do Mockup Oficial com Seleção Explícita de Personas (Rodrigo vs Mariana)
 * Implementa Seção 1.4 do Documento de Entrega TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderLogin() {
  return `
    <div class="login-screen-wrapper fade-in">
      <div class="login-brand-container">
        <div class="login-logo-box">
          ${Icons.logoBVision(88)}
        </div>
        <h1 class="login-brand-title">BBVision</h1>
        <p class="login-brand-subtitle">Fiscalização Inteligente de Obras • Banco do Brasil</p>
      </div>

      <!-- Seletor de Tipo de Acesso por Persona -->
      <div class="login-persona-selector-card">
        <span class="selector-heading">Selecione o seu perfil de acesso:</span>
        <div class="persona-tab-pills">
          <button type="button" class="persona-tab-btn active" id="tabAcessoRodrigo" data-role="empreiteira">
            👷‍♂️ Empreiteira (Rodrigo)
          </button>
          <button type="button" class="persona-tab-btn" id="tabAcessoMariana" data-role="fiscal">
            👩‍💼 Fiscal BB (Mariana)
          </button>
        </div>

        <div class="persona-scope-banner" id="personaScopeDesc">
          <strong>Acesso de Campo:</strong> Captura com IA, preenchimento de checklists e emissão inviolável de vistorias.
        </div>
      </div>

      <form class="login-form" id="loginForm" onsubmit="event.preventDefault();">
        <div class="form-input-group">
          <label class="login-input-label">E-mail corporativo</label>
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
          <label class="login-input-label">Senha de autenticação</label>
          <input 
            type="password" 
            id="loginSenha" 
            class="form-input-field" 
            placeholder="Senha" 
            value="123456" 
            required 
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-submit-primary" id="btnEntrar">
          Entrar como Empreiteira
        </button>

        <div class="login-links-container">
          <a href="#" class="link-criar-conta" id="linkValidadorPublicoLogin" style="color: #002D62; font-size: 13px; font-weight: 700;">
            🛡️ Validar Autenticidade de Documento
          </a>
          <a href="#" class="link-esqueci-senha" id="linkEsqueciSenha">
            Esqueci minha senha
          </a>
        </div>
      </form>
    </div>
  `;
}

export function bindLoginEvents() {
  const tabRodrigo = document.getElementById('tabAcessoRodrigo');
  const tabMariana = document.getElementById('tabAcessoMariana');
  const inputEmail = document.getElementById('loginEmail');
  const btnEntrar = document.getElementById('btnEntrar');
  const scopeDesc = document.getElementById('personaScopeDesc');

  function selecionarPersona(tipo) {
    if (tipo === 'fiscal') {
      tabRodrigo?.classList.remove('active');
      tabMariana?.classList.add('active');
      if (inputEmail) inputEmail.value = 'mariana@bb.com.br';
      if (btnEntrar) btnEntrar.innerText = 'Entrar como Fiscal BB';
      if (scopeDesc) {
        scopeDesc.innerHTML = `<strong>Acesso Institucional BB:</strong> Centro de controle, auditoria de hashes SHA-256, conferência de PDFs e julgamento de obras (Aprovar/Reprovar).`;
      }
    } else {
      tabMariana?.classList.remove('active');
      tabRodrigo?.classList.add('active');
      if (inputEmail) inputEmail.value = 'rodrigo@empreiteira.com';
      if (btnEntrar) btnEntrar.innerText = 'Entrar como Empreiteira';
      if (scopeDesc) {
        scopeDesc.innerHTML = `<strong>Acesso de Campo:</strong> Captura com IA, preenchimento de checklists e emissão inviolável de vistorias.`;
      }
    }
  }

  if (tabRodrigo) {
    tabRodrigo.addEventListener('click', () => selecionarPersona('empreiteira'));
  }

  if (tabMariana) {
    tabMariana.addEventListener('click', () => selecionarPersona('fiscal'));
  }

  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = inputEmail?.value || 'rodrigo@empreiteira.com';
      const senha = document.getElementById('loginSenha')?.value || '123456';
      await state.login(email, senha);
    });
  }

  if (btnEntrar) {
    btnEntrar.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = inputEmail?.value || 'rodrigo@empreiteira.com';
      const senha = document.getElementById('loginSenha')?.value || '123456';
      await state.login(email, senha);
    });
  }

  const linkValidador = document.getElementById('linkValidadorPublicoLogin');
  if (linkValidador) {
    linkValidador.addEventListener('click', (e) => {
      e.preventDefault();
      state.navigate('validador-publico');
    });
  }

  const linkEsqueci = document.getElementById('linkEsqueciSenha');
  if (linkEsqueci) {
    linkEsqueci.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Instruções para recuperação de acesso enviadas ao seu e-mail funcional.');
    });
  }
}
