/**
 * BBVision Início / Dashboard Screen
 * Painel adaptativo para Empreiteiras (operação de campo) e Fiscais de Obra (auditoria e gestão).
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
    const totalObras = state.obras.length;
    const relatoriosFinalizados = state.relatorios.filter(r => r.statusRaw !== 'EM_ANDAMENTO');
    const relatoriosPendentes = state.relatorios.filter(r => r.statusRaw === 'FINALIZADO' || r.statusRaw === 'PENDENTE_AJUSTE').length;
    const comHash = relatoriosFinalizados.filter(r => Boolean(r.hash)).length;
    const integridadeLabel = relatoriosFinalizados.length > 0
      ? `${Math.round((comHash / relatoriosFinalizados.length) * 100)}%`
      : '—';

    const relatoriosHtml = state.relatorios.length > 0
      ? state.relatorios.map(rel => {
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
        }).join('')
      : `
        <div class="resultado-empty-hint" style="text-align: center; padding: 28px 18px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 14px;">
          <p style="font-weight: 700; color: #002D62; margin-bottom: 4px;">Nenhuma vistoria recebida até o momento</p>
          <p style="font-size: 12.5px; color: #64748B;">Cadastre obras e vincule uma empreiteira para receber relatórios de vistoria in-loco para auditoria.</p>
        </div>
      `;

    return `
      <div class="page-container fade-in" id="inicioPage">
        ${renderHeader('inicio')}

        ${state.isOffline ? `
          <div class="offline-banner-notice">
            <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.signalOffline(16)} Modo Offline ativo. Reconecte para sincronizar dados com o servidor.</span>
          </div>
        ` : ''}

        <section class="hero-fiscal-card">
          <div class="hero-fiscal-header">
            <span class="bb-institucional-tag">
              Banco do Brasil S.A. • Fiscalização e Auditoria Remota
            </span>
            <h2 class="hero-fiscal-title" style="margin: 6px 0 4px 0;">Centro de Controle & Governança</h2>
            <p class="hero-fiscal-sub">${userName} — Fiscal de Obra / Engenharia</p>
            <div style="margin-top: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <button class="btn-pill-yellow" id="btnHeroNovaObra" title="Cadastrar Nova Obra">
                + Nova Obra
              </button>
              <button class="btn-pill-navy" id="btnHeroGerenciarPerguntas" title="Gerenciar Perguntas do Checklist" style="background: rgba(255, 255, 255, 0.14); color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.28); padding: 7px 15px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer;">
                Perguntas Checklist
              </button>
            </div>
          </div>
          <div class="hero-fiscal-badge-wrap">
            ${Icons.logoBBOficial(44, '#FED304')}
          </div>
        </section>

        <section class="fiscal-dashboard-metrics">
          <div class="fiscal-metric-box">
            <span class="fmb-num">${totalObras}</span>
            <span class="fmb-label">Obras Cadastradas</span>
          </div>
          <div class="fiscal-metric-box warning">
            <span class="fmb-num">${relatoriosPendentes}</span>
            <span class="fmb-label">Aguardando Parecer</span>
          </div>
          <div class="fiscal-metric-box success">
            <span class="fmb-num">${integridadeLabel}</span>
            <span class="fmb-label">Integridade SHA-256</span>
          </div>
        </section>

        <section class="fiscal-action-callout" id="btnIrAuditoriaDirect">
          <div class="callout-icon">${Icons.iconeAuditoria(24, '#002D62')}</div>
          <div class="callout-text">
            <h4>Painel de Auditoria de Vistorias</h4>
            <p>${state.relatorios.length > 0 ? 'Inspecione evidências fotográficas, PDFs oficiais e emita parecer técnico.' : 'Quando as empreiteiras concluírem vistorias, elas aparecerão aqui para homologação.'}</p>
          </div>
          <div class="callout-btn-arrow">→</div>
        </section>

        <section class="quick-actions-grid">
          <div class="quick-action-card highlight-card" id="btnAtalhoNovaObraGrid">
            <div class="quick-action-icon-badge">${Icons.iconeCadastro(20)}</div>
            <span class="quick-action-label" style="font-weight: 700; color: #002D62;">Nova Obra</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoAuditoriaGrid">
            <div class="quick-action-icon-badge">${Icons.iconeAuditoria(20)}</div>
            <span class="quick-action-label">Painel Auditoria</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoObrasGrid">
            <div class="quick-action-icon-badge">${Icons.iconeBanco(20)}</div>
            <span class="quick-action-label">Obras & Unidades</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoRelatoriosGrid">
            <div class="quick-action-icon-badge">${Icons.iconeRelatorio(20)}</div>
            <span class="quick-action-label">PDFs Oficiais</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoChecklistFiscal">
            <div class="quick-action-icon-badge">${Icons.checklistBb(20)}</div>
            <span class="quick-action-label" style="font-weight: 700; color: #002D62;">Checklist BB</span>
          </div>

          <div class="quick-action-card" id="btnAtalhoValidadorGrid">
            <div class="quick-action-icon-badge">${Icons.shieldFePublica(20)}</div>
            <span class="quick-action-label">Validar Fé Pública</span>
          </div>
        </section>

        <section class="analyses-section">
          <div class="section-header">
            <h2 class="section-title">Vistorias para Homologação</h2>
            <span class="badge-role-tag">Exclusivo Fiscal</span>
          </div>

          <div class="analyses-list">
            ${relatoriosHtml}
          </div>
        </section>
      </div>
    `;
  }

  // Visão da Empreiteira
  const obrasHtml = state.obras.length > 0
    ? state.obras.map(obra => {
        const statusLabel = obra.status === 'REGULAR'
          ? 'Regular'
          : obra.status === 'PENDENTE_AJUSTE'
          ? 'Pendente de Ajuste'
          : obra.status === 'CONCLUIDO'
          ? 'Concluída'
          : 'Em andamento';
        const pillClass = obra.status === 'REGULAR' || obra.status === 'CONCLUIDO'
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
      }).join('')
    : `
      <div class="resultado-empty-hint" style="text-align: center; padding: 28px 18px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 14px;">
        <p style="font-weight: 700; color: #002D62; margin-bottom: 4px;">Nenhuma obra atribuída à sua conta</p>
        <p style="font-size: 12.5px; color: #64748B;">Assim que um Fiscal de Obra vincular uma unidade à sua conta de empreiteira, ela aparecerá aqui para início da vistoria técnica.</p>
      </div>
    `;

  return `
    <div class="page-container fade-in" id="inicioPage">
      ${renderHeader('inicio')}

      ${state.isOffline ? `
        <div class="offline-banner-notice">
          <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.signalOffline(16)} Modo Offline ativo. Vistorias finalizadas serão sincronizadas automaticamente ao reconectar.</span>
        </div>
      ` : ''}

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

      <section class="quick-actions-grid">
        <div class="quick-action-card highlight-card" id="btnNovaAnalise">
          <div class="quick-action-icon-badge">${Icons.iconeAuditoria(20)}</div>
          <span class="quick-action-label">Nova Vistoria</span>
        </div>

        <div class="quick-action-card" id="btnObrasRecentes">
          <div class="quick-action-icon-badge">${Icons.iconeObras(20)}</div>
          <span class="quick-action-label">Minhas Obras</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoRelatorios">
          <div class="quick-action-icon-badge">${Icons.iconeRelatorio(20)}</div>
          <span class="quick-action-label">Relatórios</span>
        </div>

        <div class="quick-action-card" id="btnAtalhoValidadorEmpreiteira">
          <div class="quick-action-icon-badge">${Icons.shieldFePublica(20)}</div>
          <span class="quick-action-label">Validar Hash</span>
        </div>
      </section>

      <section class="analyses-section">
        <div class="section-header">
          <h2 class="section-title">Minhas Obras Atribuídas (${state.obras.length})</h2>
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
    const triggerNovaObra = async () => {
      const empreiteiras = await state.carregarEmpreiteiras();
      modal.openNovaObraModal({
        fiscalUser: state.user,
        empreiteiras,
        onSave: async (dados) => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso.`);
        },
      });
    };

    document.getElementById('btnHeroNovaObra')?.addEventListener('click', triggerNovaObra);
    document.getElementById('btnAtalhoNovaObraGrid')?.addEventListener('click', triggerNovaObra);

    const triggerGerenciarChecklist = () => {
      modal.openGerenciadorPerguntasModal({ fiscalUser: state.user });
    };

    document.getElementById('btnHeroGerenciarPerguntas')?.addEventListener('click', triggerGerenciarChecklist);
    document.getElementById('btnAtalhoChecklistFiscal')?.addEventListener('click', triggerGerenciarChecklist);

    document.getElementById('btnIrAuditoriaDirect')?.addEventListener('click', () => {
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    });
    document.getElementById('btnAtalhoAuditoriaGrid')?.addEventListener('click', () => {
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    });
    document.getElementById('btnAtalhoObrasGrid')?.addEventListener('click', () => {
      state.navigate('obras', 'obras');
    });
    document.getElementById('btnAtalhoRelatoriosGrid')?.addEventListener('click', () => {
      state.navigate('relatorios', 'relatorios');
    });
    document.getElementById('btnAtalhoValidadorGrid')?.addEventListener('click', () => {
      state.navigate('validador-publico');
    });

    document.querySelectorAll('.fiscal-card-interactive').forEach(card => {
      card.addEventListener('click', () => {
        const relId = card.getAttribute('data-rel-id');
        if (relId) {
          state.selecionarRelatorioParaAuditoria(relId);
        }
        state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      });
    });

    return;
  }

  document.getElementById('btnNovaAnalise')?.addEventListener('click', () => {
    if (state.obras.length === 0) {
      toast.info('Nenhuma Obra Atribuída', 'Aguarde um Fiscal de Obra vincular uma unidade à sua conta para iniciar uma vistoria.');
      return;
    }
    if (state.obras.length === 1) {
      state.selectObra(state.obras[0].id);
      state.navigate('tipo-local');
    } else {
      state.navigate('obras', 'obras');
    }
  });

  document.getElementById('btnObrasRecentes')?.addEventListener('click', () => {
    state.navigate('obras', 'obras');
  });

  document.getElementById('btnAtalhoRelatorios')?.addEventListener('click', () => {
    state.navigate('relatorios', 'relatorios');
  });

  document.getElementById('btnAtalhoValidadorEmpreiteira')?.addEventListener('click', () => {
    state.navigate('validador-publico');
  });

  document.querySelectorAll('.analysis-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const obraId = card.getAttribute('data-obra');
      if (obraId && state.selectObra(obraId)) {
        state.navigate('obra-detalhe');
      }
    });
  });
}
