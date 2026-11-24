/**
 * BBVision Obras Screen
 * Grid de obras reais com busca instantânea, badges de status e ações por perfil (RBAC).
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';

function renderObrasCardsHtml(query, isFiscal) {
  const q = (query || '').trim().toLowerCase();
  const filteredObras = state.obras.filter(o =>
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
        <p style="font-size: 12.5px; color: #64748B;">
          ${isFiscal
            ? 'Clique em "+ Nova Obra" acima para cadastrar a primeira unidade e atribuí-la a uma empreiteira.'
            : 'Aguarde o credenciamento e a vinculação de obras por um Fiscal de Obra.'}
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

  return filteredObras.map(obra => {
    let mediaHtml = '';
    if (obra.imagemTipo === 'logo') {
      mediaHtml = `<div class="obra-card-media yellow-media">${Icons.logoBVision(86)}</div>`;
    } else if (obra.imagemTipo === 'cad1') {
      mediaHtml = `<div class="obra-card-media">${Icons.cadHouse1('100%', 88)}</div>`;
    } else {
      mediaHtml = `<div class="obra-card-media">${Icons.cadHouse2('100%', 88)}</div>`;
    }

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
        ? 'Pendente Ajuste'
        : obra.status === 'CONCLUIDO'
        ? 'Concluída'
        : 'Em andamento';

    const actionLabel = isFiscal ? 'Gerenciar / Auditar' : 'Registrar vistoria';

    return `
      <div class="obra-card ${obra.destaque ? 'destaque' : ''}" data-id="${escapeHtml(obra.id)}">
        ${mediaHtml}
        
        <div class="obra-card-body">
          <div class="obra-card-header-row">
            <h3 class="obra-card-title">${escapeHtml(obra.nome)}</h3>
            <button class="obra-card-eye-btn" data-view-id="${escapeHtml(obra.id)}" title="Ver Detalhes">
              ${Icons.eye(16)}
            </button>
          </div>
          <span class="obra-card-subtitle">${escapeHtml(obra.tipo)}</span>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:10px; font-size:11px; color:#64748B;">
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(obra.responsavel || 'A definir')}</span>
            <span class="status-badge-chip ${statusBadgeClass}" style="flex-shrink:0;">${statusText}</span>
          </div>
          
          <button class="btn-registrar-vistoria" data-action-id="${escapeHtml(obra.id)}">
            ${actionLabel}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

export function renderObras() {
  const isFiscal = state.user?.cargo === 'fiscal';
  const cardsHtml = renderObrasCardsHtml(state.searchQuery || '', isFiscal);

  return `
    <div class="page-container fade-in" id="obrasPage">
      ${renderHeader('obras')}

      <section class="search-bar-row">
        <div class="search-input-wrapper">
          <div class="search-icon">
            ${Icons.search(16)}
          </div>
          <input 
            type="text" 
            id="inputBuscarObra" 
            class="search-input" 
            placeholder="Buscar obra por nome, endereço ou responsável" 
            value="${escapeHtml(state.searchQuery || '')}"
          />
        </div>
        ${isFiscal ? `
          <button class="btn-pill-yellow" id="btnNovaObraBar" title="Cadastrar Nova Obra">
            + Nova Obra
          </button>
        ` : ''}
      </section>

      <section class="obras-grid-container" id="obrasGrid">
        ${cardsHtml}
      </section>
    </div>
  `;
}

function bindObrasCardClicks() {
  document.querySelectorAll('.btn-registrar-vistoria').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const obraId = btn.getAttribute('data-action-id');
      if (state.selectObra(obraId)) {
        state.navigate('obra-detalhe');
      }
    });
  });

  document.querySelectorAll('.obra-card-eye-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const obraId = btn.getAttribute('data-view-id');
      if (state.selectObra(obraId)) {
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
    inputBusca.addEventListener('input', (e) => {
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
        onSave: async (dados) => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso.`);
        },
      });
    });
  }

  bindObrasCardClicks();
}
