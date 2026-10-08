/**
 * BVision Início / Dashboard Screen
 * Fiel à Imagem 2 do Mockup Oficial
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';

export function renderInicio() {
  const userName = state.user?.nome || 'usuário';

  return `
    <div class="page-container fade-in" id="inicioPage">
      ${renderHeader('inicio')}

      <!-- Card Amarelo Hero / Banner de Boas-Vindas -->
      <section class="hero-banner-card">
        <div class="hero-text-content">
          <div class="hero-greeting">Olá, ${userName.toLowerCase()}!</div>
          <div class="hero-accent-line"></div>
        </div>
        <div class="hero-illustration">
          ${Icons.logoBVision(90)}
        </div>
      </section>

      <!-- Grade de Ações Rápidas (3 Colunas) -->
      <section class="quick-actions-grid">
        <div class="quick-action-card" id="btnNovaAnalise">
          <div class="quick-action-icon-badge">
            ${Icons.shieldYellow(28)}
          </div>
          <span class="quick-action-label">Nova análise</span>
        </div>

        <div class="quick-action-card" id="btnObrasRecentes">
          <div class="quick-action-icon-badge">
            ${Icons.folderObras(28)}
          </div>
          <span class="quick-action-label">Obras recentes</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoRelatorios">
          <div class="quick-action-icon-badge">
            ${Icons.reportsHex(28)}
          </div>
          <span class="quick-action-label">Relatórios</span>
        </div>
      </section>

      <!-- Indicadores do Carrossel (Azul ativo / Cinza inativo) -->
      <div class="carousel-dots">
        <div class="dot active"></div>
        <div class="dot"></div>
      </div>

      <!-- Seção Últimas Análises -->
      <section class="analyses-section">
        <div class="section-header" id="toggleAnalisesList">
          <h2 class="section-title">Últimas análises</h2>
          <div class="section-chevron">
            ${Icons.chevronDown(18)}
          </div>
        </div>

        <div class="analyses-list" id="analisesContainer">
          <!-- Item 1: Obra Centro -->
          <div class="analysis-item-card" data-obra="obr-001">
            <div class="analysis-left">
              <div class="analysis-icon">
                ${Icons.shieldYellow(24)}
              </div>
              <div class="analysis-info">
                <h4>Obra Centro</h4>
                <p>Futura unidade</p>
              </div>
            </div>
            <div class="analysis-status-pill concluido">
              <span>Concluído</span>
              ${Icons.chevronDown(14)}
            </div>
          </div>

          <!-- Item 2: Obra Zona Sul -->
          <div class="analysis-item-card" data-obra="obr-002">
            <div class="analysis-left">
              <div class="analysis-icon">
                ${Icons.folderObras(24)}
              </div>
              <div class="analysis-info">
                <h4>Obra Zona Sul</h4>
                <p>Residência</p>
              </div>
            </div>
            <div class="analysis-status-pill concluido">
              <span>Concluído</span>
              ${Icons.chevronDown(14)}
            </div>
          </div>

          <!-- Item 3: Residência Alpha -->
          <div class="analysis-item-card" data-obra="obr-003">
            <div class="analysis-left">
              <div class="analysis-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#002D62" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div class="analysis-info">
                <h4>Residência Alpha</h4>
                <p>Construção nova</p>
              </div>
            </div>
            <div class="analysis-status-pill">
              <span>Em andamento</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function bindInicioEvents() {
  bindHeaderEvents();

  // Ação Rápida: Nova Análise -> Vai para Obras para escolher a obra e registrar
  const btnNovaAnalise = document.getElementById('btnNovaAnalise');
  if (btnNovaAnalise) {
    btnNovaAnalise.addEventListener('click', () => {
      state.navigate('obras');
    });
  }

  // Ação Rápida: Obras Recentes
  const btnObrasRecentes = document.getElementById('btnObrasRecentes');
  if (btnObrasRecentes) {
    btnObrasRecentes.addEventListener('click', () => {
      state.navigate('obras');
    });
  }

  // Ação Rápida: Relatórios
  const btnAtalhoRelatorios = document.getElementById('btnAtalhoRelatorios');
  if (btnAtalhoRelatorios) {
    btnAtalhoRelatorios.addEventListener('click', () => {
      state.navigate('relatorios', 'relatorios');
    });
  }

  // Clique em uma análise para ver detalhes ou vistoria
  const cards = document.querySelectorAll('.analysis-item-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const obraId = card.getAttribute('data-obra');
      if (obraId) {
        state.selectObra(obraId);
        state.navigate('vistoria');
      }
    });
  });
}
