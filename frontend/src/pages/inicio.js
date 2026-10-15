/**
 * BVision Início / Dashboard Screen
 * Adaptado dinamicamente para os 2 tipos de acesso:
 * - Acesso Rodrigo: Empreiteira (Campo)
 * - Acesso Mariana: Fiscal de Serviço (Engenharia e Governança BB)
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';

export function renderInicio() {
  const userName = state.user?.nome || 'usuário';
  const isFiscal = state.user?.cargo === 'fiscal';

  if (isFiscal) {
    // ------------------------------------------------------------------------
    // VISÃO DA PERSONA MARIANA — FISCALIZAÇÃO E AUDITORIA (BANCO DO BRASIL)
    // ------------------------------------------------------------------------
    return `
      <div class="page-container fade-in" id="inicioPage">
        ${renderHeader('inicio')}

        ${state.isOffline ? `
          <div class="offline-banner-notice">
            <span>📡 Modo Offline ativo. Operando com dados locais em cache.</span>
          </div>
        ` : ''}

        <!-- Hero Card Azul Marinho Institucional do Fiscal BB -->
        <section class="hero-fiscal-card">
          <div class="hero-fiscal-header">
            <span class="bb-institucional-tag">Banco do Brasil • Fiscalização Remota</span>
            <h2 class="hero-fiscal-title">Centro de Controle</h2>
            <p class="hero-fiscal-sub">Mariana Souza — Fiscal de Serviço / Engenharia BB</p>
          </div>
          <div class="hero-fiscal-badge-wrap">
            ${Icons.logoBBOficial(48)}
          </div>
        </section>

        <!-- Indicadores de Gestão e Governança (3 Métricas) -->
        <section class="fiscal-dashboard-metrics">
          <div class="fiscal-metric-box">
            <span class="fmb-num">4</span>
            <span class="fmb-label">Obras no Radar</span>
          </div>
          <div class="fiscal-metric-box warning">
            <span class="fmb-num">2</span>
            <span class="fmb-label">Aguardando Parecer</span>
          </div>
          <div class="fiscal-metric-box success">
            <span class="fmb-num">100%</span>
            <span class="fmb-label">Integridade SHA-256</span>
          </div>
        </section>

        <!-- Card de Destaque para Ação Imediata de Auditoria -->
        <section class="fiscal-action-callout" id="btnIrAuditoriaDirect">
          <div class="callout-icon">⚖️</div>
          <div class="callout-text">
            <h4>Auditar Vistoria Recente</h4>
            <p>Obra Centro — 12 fotos com códigos criptográficos pendentes de aprovação.</p>
          </div>
          <div class="callout-btn-arrow">→</div>
        </section>

        <!-- Ações Rápidas do Fiscal -->
        <section class="quick-actions-grid">
          <div class="quick-action-card" id="btnAtalhoAuditoriaGrid">
            <div class="quick-action-icon-badge">
              ${Icons.shieldYellow(28)}
            </div>
            <span class="quick-action-label">Painel Auditoria</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoObrasGrid">
            <div class="quick-action-icon-badge">
              ${Icons.folderObras(28)}
            </div>
            <span class="quick-action-label">Agências BB</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoRelatoriosGrid">
            <div class="quick-action-icon-badge">
              ${Icons.reportsHex(28)}
            </div>
            <span class="quick-action-label">PDFs Oficiais</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoValidadorGrid">
            <div class="quick-action-icon-badge">
              🛡️
            </div>
            <span class="quick-action-label">Validar Fé Pública</span>
          </div>
        </section>

        <!-- Seção: Fila de Vistorias para Homologação -->
        <section class="analyses-section">
          <div class="section-header">
            <h2 class="section-title">Vistorias para Homologação</h2>
            <span class="badge-role-tag">Exclusivo Fiscal</span>
          </div>

          <div class="analyses-list">
            <!-- Obra Centro -->
            <div class="analysis-item-card fiscal-card-interactive" data-obra="obr-001">
              <div class="analysis-left">
                <div class="analysis-icon">
                  ${Icons.shieldYellow(24)}
                </div>
                <div class="analysis-info">
                  <h4>Obra Centro (Agência Sede)</h4>
                  <p>Enviado por: Rodrigo Silva • 10/10/2025</p>
                </div>
              </div>
              <div class="analysis-action-chip">
                <span>Auditar</span>
                ${Icons.chevronDown(14)}
              </div>
            </div>

            <!-- Obra Zona Sul -->
            <div class="analysis-item-card fiscal-card-interactive" data-obra="obr-002">
              <div class="analysis-left">
                <div class="analysis-icon">
                  ${Icons.folderObras(24)}
                </div>
                <div class="analysis-info">
                  <h4>Obra Zona Sul</h4>
                  <p>Enviado por: Rodrigo Silva • 01/10/2026</p>
                </div>
              </div>
              <div class="analysis-status-pill concluido">
                <span>Homologado</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // ------------------------------------------------------------------------
  // VISÃO DA PERSONA RODRIGO — OPERAÇÃO DE CAMPO (EMPREITEIRA)
  // ------------------------------------------------------------------------
  return `
    <div class="page-container fade-in" id="inicioPage">
      ${renderHeader('inicio')}

      ${state.isOffline ? `
        <div class="offline-banner-notice">
          <span>📡 Modo Offline ativo. Os dados serão sincronizados automaticamente (HU05).</span>
        </div>
      ` : ''}

      <!-- Card Amarelo Hero / Banner de Boas-Vindas da Empreiteira -->
      <section class="hero-banner-card">
        <div class="hero-text-content">
          <div class="hero-greeting">Olá, ${userName.toLowerCase()}!</div>
          <div class="hero-accent-line"></div>
          <div class="hero-role-tag">Empreiteira Homologada • Campo</div>
        </div>
        <div class="hero-illustration">
          ${Icons.logoBVision(90)}
        </div>
      </section>

      <!-- Grade de Ações Rápidas de Campo (3 Colunas) -->
      <section class="quick-actions-grid">
        <div class="quick-action-card" id="btnNovaAnalise">
          <div class="quick-action-icon-badge">
            ${Icons.shieldYellow(28)}
          </div>
          <span class="quick-action-label">Nova vistoria</span>
        </div>

        <div class="quick-action-card" id="btnObrasRecentes">
          <div class="quick-action-icon-badge">
            ${Icons.folderObras(28)}
          </div>
          <span class="quick-action-label">Minhas obras</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoRelatorios">
          <div class="quick-action-icon-badge">
            ${Icons.reportsHex(28)}
          </div>
          <span class="quick-action-label">Meus relatórios</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoValidadorRodrigo">
          <div class="quick-action-icon-badge">
            🛡️
          </div>
          <span class="quick-action-label">Validar Hash</span>
        </div>
      </section>

      <!-- Indicadores do Carrossel -->
      <div class="carousel-dots">
        <div class="dot active"></div>
        <div class="dot"></div>
      </div>

      <!-- Seção Minhas Obras em Vistoria -->
      <section class="analyses-section">
        <div class="section-header">
          <h2 class="section-title">Minhas Obras Ativas</h2>
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
                <p>Agência Sede • Estrutura em execução</p>
              </div>
            </div>
            <div class="analysis-status-pill concluido">
              <span>Registrar</span>
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
                <p>Fachada e Alvenaria</p>
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
  const isFiscal = state.user?.cargo === 'fiscal';

  if (isFiscal) {
    // Eventos exclusivos do Fiscal Mariana
    const btnCallout = document.getElementById('btnIrAuditoriaDirect');
    if (btnCallout) {
      btnCallout.addEventListener('click', () => {
        state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      });
    }

    const btnAuditoriaGrid = document.getElementById('btnAtalhoAuditoriaGrid');
    if (btnAuditoriaGrid) {
      btnAuditoriaGrid.addEventListener('click', () => {
        state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      });
    }

    const btnObrasGrid = document.getElementById('btnAtalhoObrasGrid');
    if (btnObrasGrid) {
      btnObrasGrid.addEventListener('click', () => {
        state.navigate('obras', 'obras');
      });
    }

    const btnRelatoriosGrid = document.getElementById('btnAtalhoRelatoriosGrid');
    if (btnRelatoriosGrid) {
      btnRelatoriosGrid.addEventListener('click', () => {
        state.navigate('relatorios', 'relatorios');
      });
    }

    const btnValidadorGrid = document.getElementById('btnAtalhoValidadorGrid');
    if (btnValidadorGrid) {
      btnValidadorGrid.addEventListener('click', () => {
        state.navigate('validador-publico');
      });
    }

    const cards = document.querySelectorAll('.fiscal-card-interactive');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const obraId = card.getAttribute('data-obra');
        if (obraId) state.selectObra(obraId);
        state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      });
    });

    return;
  }

  // Eventos exclusivos da Empreiteira Rodrigo
  const btnNovaAnalise = document.getElementById('btnNovaAnalise');
  if (btnNovaAnalise) {
    btnNovaAnalise.addEventListener('click', () => {
      state.navigate('obras', 'obras');
    });
  }

  const btnObrasRecentes = document.getElementById('btnObrasRecentes');
  if (btnObrasRecentes) {
    btnObrasRecentes.addEventListener('click', () => {
      state.navigate('obras', 'obras');
    });
  }

  const btnAtalhoRelatorios = document.getElementById('btnAtalhoRelatorios');
  if (btnAtalhoRelatorios) {
    btnAtalhoRelatorios.addEventListener('click', () => {
      state.navigate('relatorios', 'relatorios');
    });
  }

  const btnValidadorRodrigo = document.getElementById('btnAtalhoValidadorRodrigo');
  if (btnValidadorRodrigo) {
    btnValidadorRodrigo.addEventListener('click', () => {
      state.navigate('validador-publico');
    });
  }

  const cards = document.querySelectorAll('.analysis-item-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const obraId = card.getAttribute('data-obra');
      if (obraId) {
        state.selectObra(obraId);
        state.navigate('obra-detalhe');
      }
    });
  });
}
