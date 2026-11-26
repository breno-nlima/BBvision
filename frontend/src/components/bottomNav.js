/**
 * BBVision Bottom Navigation Bar Component
 * Barra inferior adaptativa conforme o perfil de acesso (Empreiteira ou Fiscal)
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderBottomNav() {
  const current = state.activeNav;
  const isFiscal = state.user?.cargo === 'fiscal';

  if (isFiscal) {
    return `
      <nav class="bottom-nav-bar fiscal-theme" id="bottomNav">
        <button class="nav-item-btn ${current === 'inicio' ? 'active' : ''}" data-nav="inicio" id="navItemInicio">
          <div class="nav-icon-container">
            ${Icons.iconeControle(20)}
          </div>
          <span class="nav-item-label">Controle</span>
        </button>

        <button class="nav-item-btn ${current === 'fiscal-auditoria' ? 'active' : ''}" data-nav="fiscal-auditoria" id="navItemAuditoria">
          <div class="nav-icon-container">
            ${Icons.iconeAuditoria(20)}
          </div>
          <span class="nav-item-label">Auditoria</span>
        </button>

        <button class="nav-item-btn ${current === 'obras' ? 'active' : ''}" data-nav="obras" id="navItemObras">
          <div class="nav-icon-container">
            ${Icons.navObras(current === 'obras')}
          </div>
          <span class="nav-item-label">Obras</span>
        </button>

        <button class="nav-item-btn ${current === 'perfil' ? 'active' : ''}" data-nav="perfil" id="navItemPerfil">
          <div class="nav-icon-container">
            ${Icons.navPerfil(current === 'perfil')}
          </div>
          <span class="nav-item-label">Perfil</span>
        </button>
      </nav>
    `;
  }

  return `
    <nav class="bottom-nav-bar" id="bottomNav">
      <button class="nav-item-btn ${current === 'inicio' ? 'active' : ''}" data-nav="inicio" id="navItemInicio">
        <div class="nav-icon-container">
          ${Icons.navHome(current === 'inicio')}
        </div>
        <span class="nav-item-label">Início</span>
      </button>

      <button class="nav-item-btn ${current === 'obras' ? 'active' : ''}" data-nav="obras" id="navItemObras">
        <div class="nav-icon-container">
          ${Icons.navObras(current === 'obras')}
        </div>
        <span class="nav-item-label">Obras</span>
      </button>

      <button class="nav-item-btn ${current === 'relatorios' ? 'active' : ''}" data-nav="relatorios" id="navItemRelatorios">
        <div class="nav-icon-container">
          ${Icons.navRelatorios(current === 'relatorios')}
        </div>
        <span class="nav-item-label">Relatórios</span>
      </button>

      <button class="nav-item-btn ${current === 'perfil' ? 'active' : ''}" data-nav="perfil" id="navItemPerfil">
        <div class="nav-icon-container">
          ${Icons.navPerfil(current === 'perfil')}
        </div>
        <span class="nav-item-label">Perfil</span>
      </button>
    </nav>
  `;
}

export function bindBottomNavEvents() {
  const navButtons = document.querySelectorAll('.nav-item-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNav = btn.getAttribute('data-nav');
      if (targetNav) {
        state.navigate(targetNav, targetNav, { clearHistory: true });
      }
    });
  });
}
