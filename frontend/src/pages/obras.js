/**
 * BVision Obras Screen
 * Fiel à Imagem 3 do Mockup Oficial (Grid em 2 Colunas, Busca e Registro de Vistoria)
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';

function renderObrasCardsHtml(query, isFiscal) {
  const q = (query || '').toLowerCase();
  const filteredObras = state.obras.filter(o =>
    (o.nome || '').toLowerCase().includes(q) ||
    (o.responsavel || '').toLowerCase().includes(q) ||
    (o.endereco || '').toLowerCase().includes(q)
  );

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
      mediaHtml = `
        <div class="obra-card-media yellow-media">
          ${Icons.logoBVision(86)}
        </div>
      `;
    } else if (obra.imagemTipo === 'cad1') {
      mediaHtml = `
        <div class="obra-card-media">
          ${Icons.cadHouse1('100%', 88)}
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="obra-card-media">
          ${Icons.cadHouse2('100%', 88)}
        </div>
      `;
    }

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

      <!-- Linha de Busca -->
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
          <button class="btn-pill-yellow" id="btnNovaObraBar" title="Cadastrar Nova Obra (Exclusivo Fiscal BB)">
            + Nova Obra
          </button>
        ` : ''}
      </section>

      <!-- Grid de Obras (2 Colunas) -->
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
      state.selectObra(obraId);
      state.navigate('obra-detalhe');
    });
  });

  document.querySelectorAll('.obra-card-eye-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const obraId = btn.getAttribute('data-view-id');
      state.selectObra(obraId);
      state.navigate('obra-detalhe');
    });
  });
}

export function bindObrasEvents() {
  bindHeaderEvents();
  const isFiscal = state.user?.cargo === 'fiscal';

  // Filtro instantâneo no grid SEM recriar o input (evita perda de foco ao digitar)
  const inputBusca = document.getElementById('inputBuscarObra');
  const obrasGrid = document.getElementById('obrasGrid');
  if (inputBusca && obrasGrid) {
    inputBusca.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      obrasGrid.innerHTML = renderObrasCardsHtml(state.searchQuery, isFiscal);
      bindObrasCardClicks();
    });
  }

  // Botão Nova Obra (exclusivo para Fiscal BB)
  const btnNovaObraBar = document.getElementById('btnNovaObraBar');
  if (btnNovaObraBar) {
    btnNovaObraBar.addEventListener('click', () => {
      if (state.user?.cargo !== 'fiscal') {
        toast.warning('Acesso Restrito', 'Apenas fiscais do Banco do Brasil podem cadastrar novas obras.');
        return;
      }
      modal.openNovaObraModal({
        fiscalUser: state.user,
        onSave: async (dados) => {
          await state.criarNovaObra(dados);
          toast.success('Obra Cadastrada', `A unidade "${dados.nome}" foi cadastrada com sucesso e vinculada à empreiteira.`);
        }
      });
    });
  }

  bindObrasCardClicks();
}

