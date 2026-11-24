/**
 * BBVision App Header Component
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderHeader(type = 'default') {
  const isObrasPage = state.currentPage === 'obras';
  const userName = escapeHtml(state.user?.nome || 'usuário');

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
      <h1 class="header-title">Olá, ${userName}!</h1>
    `;

  const isFiscal = state.user?.cargo === 'fiscal';
  let actionButton = '';
  if (isFiscal) {
    if (isObrasPage) {
      actionButton = `<button class="btn-pill-yellow" id="btnHeaderNovaObra" title="Cadastrar Nova Obra">+ Nova Obra</button>`;
    } else {
      actionButton = `<button class="btn-pill-navy" id="btnHeaderAction" title="Painel de Auditoria">Auditoria</button>`;
    }
  }

  const logoutButton = state.user
    ? `
      <button class="btn-header-logout" id="btnHeaderLogout" title="Sair da Conta (Encerrar Sessão)" aria-label="Sair da Conta">
        ${Icons.logOut(15)}
        <span class="btn-header-logout-text">Sair</span>
      </button>
    `
    : '';

  return `
    <header class="app-header">
      <div class="header-brand">
        ${brandContent}
      </div>
      
      <div class="header-actions">
        ${actionButton}
        ${logoutButton}
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
      }
    });
  }

  const btnNovaObra = document.getElementById('btnHeaderNovaObra');
  if (btnNovaObra) {
    btnNovaObra.addEventListener('click', async () => {
      const empreiteiras = await state.carregarEmpreiteiras();
      modal.openNovaObraModal({
        fiscalUser: state.user,
        empreiteiras,
        onSave: async (dados) => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso.`);
        },
      });
    });
  }

  const btnLogout = document.getElementById('btnHeaderLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      modal.confirmLogout({
        user: state.user,
        onConfirm: async () => {
          await state.logout();
          toast.info('Sessão Encerrada', 'Você saiu com sucesso do sistema BBVision.');
        },
      });
    });
  }
}
