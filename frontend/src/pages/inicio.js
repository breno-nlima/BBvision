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
import { escapeHtml } from '../utils/formatters.js';

export function renderInicio() {
  const userName = escapeHtml(state.user?.nome || 'Usuário');
  const isFiscal = state.user?.cargo === 'fiscal';

  if (isFiscal) {
    // ------------------------------------------------------------------------
    // VISÃO DA PERSONA MARIANA — FISCALIZAÇÃO E AUDITORIA (BANCO DO BRASIL)
    // ------------------------------------------------------------------------
    const totalObras = state.obras.length;
    const relatoriosPendentes = state.relatorios.filter(r => r.statusRaw !== 'APROVADO').length;

    const relatoriosHtml = state.relatorios.map(rel => {
      const isHomologado = rel.statusRaw === 'APROVADO';
      const isReprovado = rel.statusRaw === 'PENDENTE_AJUSTE';
      const pillClass = isHomologado ? 'concluido' : 'pendente';
      const pillText = isHomologado ? 'Homologado' : (isReprovado ? 'Ajuste' : 'Auditar');
      return `
        <div class="analysis-item-card fiscal-card-interactive" data-rel-id="${escapeHtml(rel.id)}" data-obra-nome="${escapeHtml(rel.obraNome)}">
          <div class="analysis-left">
            <span class="analysis-status-dot ${pillClass}" aria-hidden="true"></span>
            <div class="analysis-info">
              <h4>${escapeHtml(rel.obraNome)}</h4>
              <p>Código: ${escapeHtml(rel.codigoUnico)} • Data: ${escapeHtml(rel.data)}</p>
            </div>
          </div>
          <div class="analysis-status-pill ${pillClass}">
            <span>${pillText}</span>
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
            <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.signalOffline(16)} Modo Offline ativo. Operando com dados locais em cache resiliente.</span>
          </div>
        ` : ''}

        <!-- Hero Card Azul Marinho Institucional do Fiscal BB -->
        <section class="hero-fiscal-card">
          <div class="hero-fiscal-header">
            <span class="bb-institucional-tag">
              Banco do Brasil S.A. • Fiscalização e Auditoria Remota
            </span>
            <h2 class="hero-fiscal-title" style="margin: 6px 0 4px 0;">Centro de Controle & Governança</h2>
            <p class="hero-fiscal-sub">${userName} — Fiscal de Serviço / Engenharia BB</p>
            <div style="margin-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="btn-pill-yellow" id="btnHeroNovaObra" title="Cadastrar Nova Obra (Exclusivo Fiscal BB)">
                + Nova Obra
              </button>
              <button class="btn-pill-navy" id="btnHeroGerenciarPerguntas" title="Gerenciar Perguntas do Checklist Oficial BB" style="background: rgba(255, 255, 255, 0.14); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.28); padding: 7px 15px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background 0.15s ease;">
                Perguntas Checklist
              </button>
            </div>
          </div>
          <div class="hero-fiscal-badge-wrap">
            ${Icons.logoBBOficial(44, '#FED304')}
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
          <div class="callout-icon">${Icons.iconeAuditoria(24, '#002D62')}</div>
          <div class="callout-text">
            <h4>Auditar Vistoria Recente</h4>
            <p>Selecione um relatório pendente para emitir parecer técnico ou visualizar PDF oficial.</p>
          </div>
          <div class="callout-btn-arrow">→</div>
        </section>

        <!-- Ações Rápidas do Fiscal -->
        <section class="quick-actions-grid">
          <div class="quick-action-card highlight-card" id="btnAtalhoNovaObraGrid" title="Cadastrar Nova Obra (Exclusivo Fiscal BB)">
            <div class="quick-action-icon-badge">
              ${Icons.iconeCadastro(20)}
            </div>
            <span class="quick-action-label" style="font-weight: 700; color: #002D62;">Nova Obra</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoAuditoriaGrid">
            <div class="quick-action-icon-badge">
              ${Icons.iconeAuditoria(20)}
            </div>
            <span class="quick-action-label">Painel Auditoria</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoObrasGrid">
            <div class="quick-action-icon-badge">
              ${Icons.iconeBanco(20)}
            </div>
            <span class="quick-action-label">Agências BB</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoRelatoriosGrid">
            <div class="quick-action-icon-badge">
              ${Icons.iconeRelatorio(20)}
            </div>
            <span class="quick-action-label">PDFs Oficiais</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoChecklistFiscal" title="Visualizar e Editar Perguntas do Checklist Oficial BB">
            <div class="quick-action-icon-badge">
              ${Icons.checklistBb(20)}
            </div>
            <span class="quick-action-label" style="font-weight: 700; color: #002D62;">Checklist BB</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoValidadorGrid">
            <div class="quick-action-icon-badge">
              ${Icons.shieldFePublica(20)}
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
    const statusLabel = obra.status === 'REGULAR'
      ? 'Regular'
      : obra.status === 'PENDENTE_AJUSTE'
      ? 'Pendente de Ajuste'
      : 'Em andamento';
    const pillClass = obra.status === 'REGULAR'
      ? 'concluido'
      : obra.status === 'PENDENTE_AJUSTE'
      ? 'pendente'
      : 'andamento';
    return `
      <div class="analysis-item-card" data-obra="${escapeHtml(obra.id)}">
        <div class="analysis-left">
          <span class="analysis-status-dot ${pillClass}" aria-hidden="true"></span>
          <div class="analysis-info">
            <h4>${escapeHtml(obra.nome)}</h4>
            <p>${escapeHtml(obra.subtitulo)} • ${statusLabel}</p>
          </div>
        </div>
        <div class="analysis-status-pill ${pillClass}">
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
          <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.signalOffline(16)} Modo Offline ativo. Os dados serão sincronizados automaticamente (HU05).</span>
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
          ${Icons.logoBVision(82)}
        </div>
      </section>

      <!-- Grade de Ações Rápidas de Campo (4 Colunas) -->
      <section class="quick-actions-grid">
        <div class="quick-action-card highlight-card" id="btnNovaAnalise">
          <div class="quick-action-icon-badge">
            ${Icons.iconeAuditoria(20)}
          </div>
          <span class="quick-action-label">Nova Vistoria</span>
        </div>

        <div class="quick-action-card" id="btnObrasRecentes">
          <div class="quick-action-icon-badge">
            ${Icons.iconeObras(20)}
          </div>
          <span class="quick-action-label">Minhas Obras</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoRelatorios">
          <div class="quick-action-icon-badge">
            ${Icons.iconeRelatorio(20)}
          </div>
          <span class="quick-action-label">Relatórios</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoValidadorEmpreiteira">
          <div class="quick-action-icon-badge">
            ${Icons.shieldFePublica(20)}
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
        const rel = state.relatorios.find(r => r.id === relId);
        if (rel) {
          state.currentVistoria.relatorioId = rel.id;
          state.currentVistoria.obraId = rel.obraId || state.currentVistoria.obraId;
          state.currentVistoria.obraNome = rel.obraNome;
          state.currentVistoria.codigoUnico = rel.codigoUnico;
          state.currentVistoria.hashSha256 = rel.hash || state.currentVistoria.hashSha256;
          state.currentVistoria.pdfUrl = rel.pdfUrl;
          state.currentVistoria.statusObra = rel.obraStatus || (rel.statusRaw === 'PENDENTE_AJUSTE' ? 'PENDENTE_AJUSTE' : 'REGULAR');
          state.currentVistoria.justificativaFiscal = rel.justificativaFiscal || null;
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
