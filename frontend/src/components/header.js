/**
 * BVision App Header Component
 * Cabeçalho unificado seguindo o design do sistema
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderHeader(type = 'default') {
  const isObrasPage = state.currentPage === 'obras';
  const userName = state.user?.nome || 'usuário';

  const brandContent = isObrasPage
    ? `
      <div class="header-brand-logo">
        ${Icons.logoBVision(30)}
      </div>
      <h1 class="header-title">BBVision</h1>
    `
    : `
      <div class="header-brand-logo">
        ${Icons.logoBVision(30)}
      </div>
      <h1 class="header-title">Olá, ${userName.toLowerCase()}!</h1>
    `;

  const isFiscal = state.user?.cargo === 'fiscal';
  const actionButton = isFiscal
    ? `<button class="btn-pill-navy" id="btnHeaderAction" title="Painel de Auditoria">Auditoria</button>`
    : `<button class="btn-pill-yellow" id="btnHeaderAction" title="Cadastrar ou Listar Obras">Nova Obra</button>`;

  return `
    <header class="app-header">
      <div class="header-brand">
        ${brandContent}
      </div>
      
      <div class="header-actions">
        ${actionButton}
      </div>
    </header>
  `;
}

export function bindHeaderEvents() {
  const btnAction = document.getElementById('btnHeaderAction');
  if (btnAction) {
    btnAction.addEventListener('click', () => {
      if (state.user?.cargo === 'fiscal') {
        state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      } else {
        state.navigate('obras', 'obras');
      }
    });
  }
}
