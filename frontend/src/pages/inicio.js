/**
 * BBVision Início / Dashboard Screen
 * Painel limpo e adaptativo para Empreiteiras (campo) e Fiscais de Obra (auditoria e gestão).
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderInicio() {
  const userName = escapeHtml(state.user?.nome || 'Usuário');
  const primeiroNome = escapeHtml((state.user?.nome || 'Usuário').split(' ')[0]);
  const isFiscal = state.user?.cargo === 'fiscal';

  if (isFiscal) {
    const totalObras = state.obras.length;
    const relatoriosFinalizados = state.relatorios.filter(r => r.statusRaw !== 'EM_ANDAMENTO');
    const relatoriosPendentes = state.relatorios.filter(
      r => r.statusRaw === 'FINALIZADO' || r.statusRaw === 'PENDENTE_AJUSTE'
    ).length;
    const comHash = relatoriosFinalizados.filter(r => Boolean(r.hash)).length;
    const integridadeLabel =
      relatoriosFinalizados.length > 0 ? `${Math.round((comHash / relatoriosFinalizados.length) * 100)}%` : '—';

    const relatoriosHtml =
      state.relatorios.length > 0
        ? state.relatorios
            .map(rel => {
              const isHomologado = rel.statusRaw === 'APROVADO';
              const isReprovado = rel.statusRaw === 'PENDENTE_AJUSTE';
              const pillClass = isHomologado ? 'concluido' : isReprovado ? 'pendente' : 'andamento';
              const pillText = isHomologado ? 'Homologado' : isReprovado ? 'Ajuste' : 'Auditar';
              return `
                <div class="analysis-item-card fiscal-card-interactive" data-rel-id="${escapeHtml(rel.id)}" data-obra-nome="${escapeHtml(rel.obraNome)}">
                  <div class="analysis-left">
                    <span class="analysis-status-dot ${pillClass}" aria-hidden="true"></span>
                    <div class="analysis-info">
                      <h4>${escapeHtml(rel.obraNome)}</h4>
                      <p>Protocolo ${escapeHtml(rel.codigoUnico)} • ${escapeHtml(rel.data)}</p>
                    </div>
                  </div>
                  <div class="analysis-right">
                    <span class="analysis-status-pill ${pillClass}">${pillText}</span>
                    <span class="analysis-row-chevron">${Icons.chevronRight(16)}</span>
                  </div>
                </div>
              `;
            })
            .join('')
        : `
          <div class="resultado-empty-hint" style="grid-column: 1 / -1; text-align: center; padding: 32px 20px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 14px;">
            <p style="font-weight: 700; color: #002D62; margin-bottom: 4px;">Nenhuma vistoria recebida até o momento</p>
            <p style="font-size: 13px; color: #64748B;">Cadastre obras e vincule uma empreiteira para receber relatórios para auditoria.</p>
          </div>
        `;

    return `
      <div class="page-container fade-in" id="inicioPage">
        ${renderHeader('inicio')}

        ${
          state.isOffline
            ? `
          <div class="offline-banner-notice">
            <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.signalOffline(16)} Modo Offline ativo. Reconecte para sincronizar dados com o servidor.</span>
          </div>
        `
            : ''
        }

        <section class="hero-fiscal-card">
          <div class="hero-fiscal-header">
            <span class="bb-institucional-tag">Fiscalização e Governança</span>
            <h1 class="hero-fiscal-title">Olá, ${primeiroNome}</h1>
            <p class="hero-fiscal-sub">${userName} • Fiscal de Obra</p>
            <div class="hero-actions-row">
              <button class="btn-pill-yellow" id="btnHeroNovaObra" title="Cadastrar Nova Obra">
                + Nova Obra
              </button>
              <button class="btn-hero-ghost" id="btnHeroGerenciarPerguntas" title="Gerenciar Perguntas do Checklist">
                Perguntas do Checklist
              </button>
              <button class="btn-hero-ghost" id="btnIrAuditoriaDirect" title="Abrir Painel de Auditoria">
                Painel de Auditoria
              </button>
            </div>
          </div>
          <div class="hero-fiscal-badge-wrap">
            ${Icons.logoBBOficial(40, '#FED304')}
          </div>
        </section>

        <section class="fiscal-dashboard-metrics">
          <div class="fiscal-metric-box interactive" id="kpiObras" title="Ver obras cadastradas">
            <span class="fmb-num">${totalObras}</span>
            <span class="fmb-label">Obras cadastradas</span>
          </div>
          <div class="fiscal-metric-box warning interactive" id="kpiPendentes" title="Abrir auditoria de vistorias">
            <span class="fmb-num">${relatoriosPendentes}</span>
            <span class="fmb-label">Aguardando parecer</span>
          </div>
          <div class="fiscal-metric-box success interactive" id="kpiIntegridade" title="Validar autenticidade e Fé Pública">
            <span class="fmb-num">${integridadeLabel}</span>
            <span class="fmb-label">Integridade SHA-256</span>
          </div>
        </section>

        <section class="analyses-section">
          <div class="section-header">
            <h2 class="section-title">Vistorias para Homologação</h2>
            <span class="section-count-meta">${state.relatorios.length} ${state.relatorios.length === 1 ? 'registro' : 'registros'}</span>
          </div>

          <div class="analyses-list">
            ${relatoriosHtml}
          </div>
        </section>
      </div>
    `;
  }

  // Visão da Empreiteira
  const obrasHtml =
    state.obras.length > 0
      ? state.obras
          .map(obra => {
            const statusLabel =
              obra.status === 'REGULAR'
                ? 'Regular'
                : obra.status === 'PENDENTE_AJUSTE'
                ? 'Ajuste pendente'
                : obra.status === 'CONCLUIDO'
                ? 'Concluída'
                : 'Em andamento';
            const pillClass =
              obra.status === 'REGULAR' || obra.status === 'CONCLUIDO'
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
                    <p>${escapeHtml(obra.subtitulo || obra.endereco || 'Unidade Banco do Brasil')}</p>
                  </div>
                </div>
                <div class="analysis-right">
                  <span class="analysis-status-pill ${pillClass}">${statusLabel}</span>
                  <span class="analysis-row-chevron">${Icons.chevronRight(16)}</span>
                </div>
              </div>
            `;
          })
          .join('')
      : `
        <div class="resultado-empty-hint" style="grid-column: 1 / -1; text-align: center; padding: 32px 20px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 14px;">
          <p style="font-weight: 700; color: #002D62; margin-bottom: 4px;">Nenhuma obra atribuída à sua conta</p>
          <p style="font-size: 13px; color: #64748B;">Assim que um Fiscal de Obra vincular uma unidade à sua conta, ela aparecerá aqui.</p>
        </div>
      `;

  return `
    <div class="page-container fade-in" id="inicioPage">
      ${renderHeader('inicio')}

      ${
        state.isOffline
          ? `
        <div class="offline-banner-notice">
          <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.signalOffline(16)} Modo Offline ativo. Vistorias finalizadas serão sincronizadas ao reconectar.</span>
        </div>
      `
          : ''
      }

      <section class="hero-banner-card">
        <div class="hero-text-content">
          <div class="hero-greeting">Olá, ${primeiroNome}</div>
          <div class="hero-role-tag">${userName} • Empreiteira de Campo</div>
        </div>
      </section>

      <section class="quick-actions-grid" aria-label="Ações rápidas">
        <button type="button" class="quick-action-card highlight-card" id="qaNovaVistoria" title="Iniciar nova vistoria de obra">
          <span class="quick-action-icon-badge">${Icons.iconeAuditoria(22)}</span>
          <span class="quick-action-label">Nova Vistoria</span>
        </button>
        <button type="button" class="quick-action-card" id="qaMinhasObras" title="Ver obras atribuídas">
          <span class="quick-action-icon-badge">${Icons.iconeObras(22)}</span>
          <span class="quick-action-label">Minhas Obras</span>
        </button>
        <button type="button" class="quick-action-card" id="qaRelatorios" title="Ver relatórios emitidos">
          <span class="quick-action-icon-badge">${Icons.iconeRelatorio(22)}</span>
          <span class="quick-action-label">Relatórios</span>
        </button>
        <button type="button" class="quick-action-card" id="qaValidarHash" title="Validar autenticidade e Fé Pública">
          <span class="quick-action-icon-badge">${Icons.shieldFePublica(22)}</span>
          <span class="quick-action-label">Validar Hash</span>
        </button>
      </section>

      <section class="analyses-section">
        <div class="section-header">
          <h2 class="section-title">Minhas Obras Atribuídas</h2>
          <span class="section-count-meta">${state.obras.length} ${state.obras.length === 1 ? 'unidade' : 'unidades'}</span>
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
        onSave: async dados => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso.`);
        },
      });
    };

    document.getElementById('btnHeroNovaObra')?.addEventListener('click', triggerNovaObra);

    document.getElementById('btnHeroGerenciarPerguntas')?.addEventListener('click', () => {
      modal.openGerenciadorPerguntasModal({ fiscalUser: state.user });
    });

    document.getElementById('btnIrAuditoriaDirect')?.addEventListener('click', () => {
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    });

    document.getElementById('kpiObras')?.addEventListener('click', () => {
      state.navigate('obras', 'obras');
    });

    document.getElementById('kpiPendentes')?.addEventListener('click', () => {
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    });

    document.getElementById('kpiIntegridade')?.addEventListener('click', () => {
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

  const iniciarNovaVistoria = () => {
    if (state.obras.length === 0) {
      toast.info(
        'Nenhuma Obra Atribuída',
        'Aguarde um Fiscal de Obra vincular uma unidade à sua conta para iniciar uma vistoria.'
      );
      return;
    }
    if (state.obras.length === 1) {
      state.selectObra(state.obras[0].id);
      state.navigate('tipo-local');
    } else {
      state.navigate('obras', 'obras');
    }
  };

  document.getElementById('qaNovaVistoria')?.addEventListener('click', iniciarNovaVistoria);

  document.getElementById('qaMinhasObras')?.addEventListener('click', () => {
    state.navigate('obras', 'obras');
  });

  document.getElementById('qaRelatorios')?.addEventListener('click', () => {
    state.navigate('relatorios', 'relatorios');
  });

  document.getElementById('qaValidarHash')?.addEventListener('click', () => {
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
