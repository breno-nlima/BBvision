/**
 * BVision Bottom Navigation Bar Component
 * Barra inferior flutuante com indicador ativo em pílula amarela
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderBottomNav() {
  const current = state.activeNav;

  return `
    <nav class="bottom-nav-bar" id="bottomNav">
      <button class="nav-item-btn ${current === 'inicio' ? 'active' : ''}" data-nav="inicio" id="navItemInicio">
        <div class="nav-icon-container">
          ${Icons.navInicio(20)}
        </div>
        <span class="nav-item-label">Início</span>
      </button>

      <button class="nav-item-btn ${current === 'obras' ? 'active' : ''}" data-nav="obras" id="navItemObras">
        <div class="nav-icon-container">
          ${Icons.navObras(20)}
        </div>
        <span class="nav-item-label">Obras</span>
      </button>

      <button class="nav-item-btn ${current === 'relatorios' ? 'active' : ''}" data-nav="relatorios" id="navItemRelatorios">
        <div class="nav-icon-container">
          ${Icons.navRelatorios(20)}
        </div>
        <span class="nav-item-label">Relatórios</span>
      </button>

      <button class="nav-item-btn ${current === 'perfil' ? 'active' : ''}" data-nav="perfil" id="navItemPerfil">
        <div class="nav-icon-container">
          ${Icons.navPerfil(20)}
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
        state.navigate(targetNav, targetNav);
      }
    });
  });
}
