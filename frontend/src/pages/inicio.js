/**
 * BVision Início / Dashboard Screen
 * Padrão Corporativo Banco do Brasil:
 * - Acesso Rodrigo: Operação de Campo (Empreiteira)
 * - Acesso Mariana: Fiscalização de Engenharia e Governança BB
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderInicio() {
  const userName = state.user?.nome || 'Usuário';
  const isFiscal = state.user?.cargo === 'fiscal';

  if (isFiscal) {
    // ------------------------------------------------------------------------
    // VISÃO DA PERSONA MARIANA — FISCALIZAÇÃO E AUDITORIA (BANCO DO BRASIL)
    // ------------------------------------------------------------------------
    const totalObras = state.obras.length;
    const relatoriosPendentes = state.relatorios.filter(r => r.statusRaw !== 'APROVADO').length;
    const relatoriosHomologados = state.relatorios.filter(r => r.statusRaw === 'APROVADO').length;

    const relatoriosHtml = state.relatorios.map(rel => {
      const isHomologado = rel.statusRaw === 'APROVADO';
      return `
        <div class="analysis-item-card fiscal-card-interactive" data-rel-id="${rel.id}" data-obra-nome="${rel.obraNome}">
          <div class="analysis-left">
            <div class="analysis-icon">
              ${isHomologado ? Icons.shieldYellow(24) : Icons.folderObras(24)}
            </div>
            <div class="analysis-info">
              <h4>${rel.obraNome}</h4>
              <p>Código: ${rel.codigoUnico} • Data: ${rel.data}</p>
            </div>
          </div>
          <div class="analysis-status-pill ${isHomologado ? 'concluido' : 'pendente'}">
            <span>${isHomologado ? 'Homologado' : 'Auditar'}</span>
            ${Icons.chevronDown(14)}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="page-container fade-in" id="inicioPage">
        ${renderHeader('inicio')}

        ${state.isOffline ? `
          <div class="offline-banner-notice">
            <span>📡 Modo Offline ativo. Operando com dados locais em cache resiliente.</span>
          </div>
        ` : ''}

        <!-- Hero Card Azul Marinho Institucional do Fiscal BB -->
        <section class="hero-fiscal-card">
          <div class="hero-fiscal-header">
            <span class="bb-institucional-tag">Banco do Brasil S.A. • Fiscalização e Auditoria Remota</span>
            <h2 class="hero-fiscal-title">Centro de Controle & Governança</h2>
            <p class="hero-fiscal-sub">${userName} — Fiscal de Serviço / Engenharia BB</p>
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="btn-pill-yellow" id="btnHeroNovaObra" title="Cadastrar Nova Obra (Exclusivo Fiscal BB)">
                + Nova Obra
              </button>
              <button class="btn-pill-navy" id="btnHeroGerenciarPerguntas" title="Gerenciar Perguntas do Checklist Oficial BB" style="background: rgba(255, 255, 255, 0.15); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.3); padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s ease;">
                📋 Perguntas Checklist
              </button>
            </div>
          </div>
          <div class="hero-fiscal-badge-wrap">
            ${Icons.logoBBOficial(48)}
          </div>
        </section>

        <!-- Indicadores de Gestão e Governança (3 Métricas) -->
        <section class="fiscal-dashboard-metrics">
          <div class="fiscal-metric-box">
            <span class="fmb-num">${totalObras}</span>
            <span class="fmb-label">Obras no Radar</span>
          </div>
          <div class="fiscal-metric-box warning">
            <span class="fmb-num">${relatoriosPendentes}</span>
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
            <p>Selecione um relatório pendente para emitir parecer técnico ou visualizar PDF oficial.</p>
          </div>
          <div class="callout-btn-arrow">→</div>
        </section>

        <!-- Ações Rápidas do Fiscal -->
        <section class="quick-actions-grid">
          <div class="quick-action-card highlight-card" id="btnAtalhoNovaObraGrid" title="Cadastrar Nova Obra (Exclusivo Fiscal BB)">
            <div class="quick-action-icon-badge" style="background: rgba(254, 211, 4, 0.25); color: #002D62; font-size: 20px; font-weight: 800;">
              ➕
            </div>
            <span class="quick-action-label" style="font-weight: 700; color: #002D62;">Nova Obra</span>
          </div>

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

          <div class="quick-action-card" id="btnAtalhoChecklistFiscal" title="Visualizar e Editar Perguntas do Checklist Oficial BB">
            <div class="quick-action-icon-badge" style="background: rgba(0, 45, 98, 0.08); color: #002D62; font-size: 20px;">
              📋
            </div>
            <span class="quick-action-label" style="font-weight: 700; color: #002D62;">Checklist BB</span>
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
            <span class="badge-role-tag">Exclusivo Fiscal BB</span>
          </div>

          <div class="analyses-list">
            ${relatoriosHtml}
          </div>
        </section>
      </div>
    `;
  }

  // ------------------------------------------------------------------------
  // VISÃO DA PERSONA RODRIGO — OPERAÇÃO DE CAMPO (EMPREITEIRA)
  // ------------------------------------------------------------------------
  const obrasHtml = state.obras.map(obra => {
    return `
      <div class="analysis-item-card" data-obra="${obra.id}">
        <div class="analysis-left">
          <div class="analysis-icon">
            ${Icons.shieldYellow(24)}
          </div>
          <div class="analysis-info">
            <h4>${obra.nome}</h4>
            <p>${obra.subtitulo} • ${obra.status === 'REGULAR' ? 'Regular' : 'Em andamento'}</p>
          </div>
        </div>
        <div class="analysis-status-pill ${obra.status === 'REGULAR' ? 'concluido' : ''}">
          <span>Vistoriar</span>
          ${Icons.chevronDown(14)}
        </div>
      </div>
    `;
  }).join('');

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
          <div class="hero-greeting">Olá, ${userName}!</div>
          <div class="hero-accent-line"></div>
          <div class="hero-role-tag">Empreiteira de Obra • Responsável Técnico de Campo</div>
        </div>
        <div class="hero-illustration">
          ${Icons.logoBVision(90)}
        </div>
      </section>

      <!-- Grade de Ações Rápidas de Campo (4 Colunas) -->
      <section class="quick-actions-grid">
        <div class="quick-action-card" id="btnNovaAnalise">
          <div class="quick-action-icon-badge">
            ${Icons.shieldYellow(28)}
          </div>
          <span class="quick-action-label">Nova Vistoria</span>
        </div>

        <div class="quick-action-card" id="btnObrasRecentes">
          <div class="quick-action-icon-badge">
            ${Icons.folderObras(28)}
          </div>
          <span class="quick-action-label">Minhas Obras</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoRelatorios">
          <div class="quick-action-icon-badge">
            ${Icons.reportsHex(28)}
          </div>
          <span class="quick-action-label">Relatórios</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoValidadorEmpreiteira">
          <div class="quick-action-icon-badge">
            🛡️
          </div>
          <span class="quick-action-label">Validar Hash</span>
        </div>
      </section>

      <!-- Seção Minhas Obras em Vistoria -->
      <section class="analyses-section">
        <div class="section-header">
          <h2 class="section-title">Minhas Obras Cadastradas</h2>
          <span class="badge-role-tag">Campo In-Loco</span>
        </div>

        <div class="analyses-list" id="analisesContainer">
          ${obrasHtml}
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
    const triggerNovaObra = () => {
      modal.openNovaObraModal({
        fiscalUser: state.user,
        onSave: async (dados) => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso e vinculada à empreiteira.`);
        }
      });
    };

    const btnHeroNovaObra = document.getElementById('btnHeroNovaObra');
    if (btnHeroNovaObra) {
      btnHeroNovaObra.addEventListener('click', triggerNovaObra);
    }

    const triggerGerenciarChecklist = () => {
      modal.openGerenciadorPerguntasModal({
        fiscalUser: state.user
      });
    };

    const btnHeroGerenciarPerguntas = document.getElementById('btnHeroGerenciarPerguntas');
    if (btnHeroGerenciarPerguntas) {
      btnHeroGerenciarPerguntas.addEventListener('click', triggerGerenciarChecklist);
    }

    const btnNovaObraGrid = document.getElementById('btnAtalhoNovaObraGrid');
    if (btnNovaObraGrid) {
      btnNovaObraGrid.addEventListener('click', triggerNovaObra);
    }

    const btnChecklistGrid = document.getElementById('btnAtalhoChecklistFiscal');
    if (btnChecklistGrid) {
      btnChecklistGrid.addEventListener('click', triggerGerenciarChecklist);
    }

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
        const relId = card.getAttribute('data-rel-id');
        const obraNome = card.getAttribute('data-obra-nome');
        const rel = state.relatorios.find(r => r.id === relId);
        if (rel) {
          state.currentVistoria.relatorioId = rel.id;
          state.currentVistoria.obraNome = rel.obraNome;
          state.currentVistoria.codigoUnico = rel.codigoUnico;
          state.currentVistoria.hashSha256 = rel.hash || state.currentVistoria.hashSha256;
          state.currentVistoria.pdfUrl = rel.pdfUrl;
        }
        state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      });
    });

    return;
  }

  // Eventos exclusivos da Empreiteira Rodrigo
  const btnNovaAnalise = document.getElementById('btnNovaAnalise');
  if (btnNovaAnalise) {
    btnNovaAnalise.addEventListener('click', () => {
      state.selectObra(state.obras[0]?.id || 'obr-001');
      state.navigate('tipo-local');
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

  const btnValidadorEmpreiteira = document.getElementById('btnAtalhoValidadorEmpreiteira');
  if (btnValidadorEmpreiteira) {
    btnValidadorEmpreiteira.addEventListener('click', () => {
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
