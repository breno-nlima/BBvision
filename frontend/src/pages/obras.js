/**
 * BBVision Obras Screen
 * Listagem limpa e responsiva de obras com busca instantânea, status e ações por perfil (RBAC).
 */

import { Icons } from '../assets/icons.js?v=2.5';
import { state } from '../services/state.js?v=2.5';
import { renderHeader, bindHeaderEvents } from '../components/header.js?v=2.5';
import { modal } from '../components/modal.js?v=2.5';
import { toast } from '../components/toast.js?v=2.5';
import { escapeHtml } from '../utils/formatters.js?v=2.5';

function renderObrasCardsHtml(query, isFiscal) {
  const q = (query || '').trim().toLowerCase();
  const filteredObras = state.obras.filter(
    o =>
      (o.nome || '').toLowerCase().includes(q) ||
      (o.responsavel || '').toLowerCase().includes(q) ||
      (o.endereco || '').toLowerCase().includes(q) ||
      (o.tipo || '').toLowerCase().includes(q)
  );

  if (state.obras.length === 0) {
    return `
      <div class="resultado-empty-hint" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; background: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 14px;">
        <p style="font-weight: 700; color: #002D62; margin-bottom: 6px;">
          ${isFiscal ? 'Nenhuma obra cadastrada no sistema' : 'Nenhuma obra atribuída à sua conta'}
        </p>
        <p style="font-size: 13px; color: #64748B;">
          ${
            isFiscal
              ? 'Clique em "+ Nova Obra" acima para cadastrar a primeira unidade e atribuí-la a uma empreiteira.'
              : 'Aguarde o credenciamento e a vinculação de obras por um Fiscal de Obra.'
          }
        </p>
      </div>
    `;
  }

  if (filteredObras.length === 0) {
    return `
      <div class="resultado-empty-hint" style="grid-column: 1 / -1; text-align: center; padding: 28px 16px;">
        <p>Nenhuma obra encontrada para "${escapeHtml(query)}".</p>
      </div>
    `;
  }

  return filteredObras
    .map(obra => {
      const statusBadgeClass =
        obra.status === 'REGULAR' || obra.status === 'CONCLUIDO'
          ? 'concluido'
          : obra.status === 'PENDENTE_AJUSTE'
          ? 'pendente'
          : 'andamento';
      const statusText =
        obra.status === 'REGULAR'
          ? 'Regular'
          : obra.status === 'PENDENTE_AJUSTE'
          ? 'Pendente ajuste'
          : obra.status === 'CONCLUIDO'
          ? 'Concluída'
          : 'Em andamento';

      const actionLabel = isFiscal ? 'Abrir gestão e auditoria' : 'Iniciar vistoria';

      return `
        <article class="obra-card" data-id="${escapeHtml(obra.id)}">
          <div class="obra-card-top">
            <div class="obra-card-icon-pill">
              ${Icons.iconeObras(20)}
            </div>
            <span class="status-badge-chip ${statusBadgeClass}">${statusText}</span>
          </div>

          <div class="obra-card-body">
            <h3 class="obra-card-title">${escapeHtml(obra.nome)}</h3>
            <p class="obra-card-subtitle">${escapeHtml(obra.endereco || obra.tipo || 'Unidade Banco do Brasil')}</p>
            <div class="obra-card-meta-line">
              <span>${escapeHtml(obra.responsavel || 'Responsável a definir')}</span>
              <span>${escapeHtml(obra.tipo || 'Obra')}</span>
            </div>
          </div>

          <button type="button" class="btn-registrar-vistoria" data-action-id="${escapeHtml(obra.id)}">
            ${actionLabel}
          </button>
        </article>
      `;
    })
    .join('');
}

export function renderObras() {
  const isFiscal = state.user?.cargo === 'fiscal';
  const cardsHtml = renderObrasCardsHtml(state.searchQuery || '', isFiscal);

  return `
    <div class="page-container fade-in" id="obrasPage">
      ${renderHeader('obras')}

      <div class="page-intro-bar">
        <div>
          <h1>${isFiscal ? 'Obras & Unidades' : 'Minhas Obras'}</h1>
          <p>${
            isFiscal
              ? 'Gerencie unidades cadastradas, checklists técnicos e auditorias.'
              : 'Selecione uma unidade para registrar vistoria fotográfica in-loco.'
          }</p>
        </div>
        ${
          isFiscal
            ? `
          <button type="button" class="btn-pill-yellow" id="btnNovaObraBar" title="Cadastrar Nova Obra">
            + Nova Obra
          </button>
        `
            : ''
        }
      </div>

      <section class="search-bar-row">
        <div class="search-input-wrapper">
          <div class="search-icon">
            ${Icons.search(16)}
          </div>
          <input
            type="text"
            id="inputBuscarObra"
            class="search-input"
            placeholder="Buscar por unidade, endereço ou responsável..."
            value="${escapeHtml(state.searchQuery || '')}"
          />
        </div>
      </section>

      <section class="obras-grid-container" id="obrasGrid">
        ${cardsHtml}
      </section>
    </div>
  `;
}

function bindObrasCardClicks() {
  document.querySelectorAll('.obra-card').forEach(card => {
    card.addEventListener('click', () => {
      const obraId = card.getAttribute('data-id');
      if (obraId && state.selectObra(obraId)) {
        state.navigate('obra-detalhe');
      }
    });
  });

  document.querySelectorAll('.btn-registrar-vistoria').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const obraId = btn.getAttribute('data-action-id');
      if (obraId && state.selectObra(obraId)) {
        state.navigate('obra-detalhe');
      }
    });
  });
}

export function bindObrasEvents() {
  bindHeaderEvents();
  const isFiscal = state.user?.cargo === 'fiscal';

  const inputBusca = document.getElementById('inputBuscarObra');
  const obrasGrid = document.getElementById('obrasGrid');
  if (inputBusca && obrasGrid) {
    inputBusca.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      obrasGrid.innerHTML = renderObrasCardsHtml(state.searchQuery, isFiscal);
      bindObrasCardClicks();
    });
  }

  const btnNovaObraBar = document.getElementById('btnNovaObraBar');
  if (btnNovaObraBar) {
    btnNovaObraBar.addEventListener('click', async () => {
      if (state.user?.cargo !== 'fiscal') {
        toast.warning('Acesso Restrito', 'Apenas fiscais de obra podem cadastrar novas obras.');
        return;
      }
      const empreiteiras = await state.carregarEmpreiteiras();
      modal.openNovaObraModal({
        fiscalUser: state.user,
        empreiteiras,
        onSave: async dados => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso.`);
        },
      });
    });
  }

  bindObrasCardClicks();
}
