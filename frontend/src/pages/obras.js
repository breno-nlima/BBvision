/**
 * BVision Obras Screen
 * Fiel à Imagem 3 do Mockup Oficial (Grid em 2 Colunas, Busca e Registro de Vistoria)
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { toast } from '../components/toast.js';

export function renderObras() {
  const query = state.searchQuery || '';
  const filteredObras = state.obras.filter(o => 
    o.nome.toLowerCase().includes(query) || 
    o.responsavel.toLowerCase().includes(query) ||
    o.endereco.toLowerCase().includes(query)
  );

  const cardsHtml = filteredObras.map(obra => {
    // Escolhe a mídia correta de acordo com a imagem do mockup
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

    return `
      <div class="obra-card ${obra.destaque ? 'destaque' : ''}" data-id="${obra.id}">
        ${mediaHtml}
        
        <div class="obra-card-body">
          <div class="obra-card-header-row">
            <h3 class="obra-card-title">${obra.nome}</h3>
            <button class="obra-card-eye-btn" data-view-id="${obra.id}" title="Ver Detalhes">
              ${Icons.eye(16)}
            </button>
          </div>
          <span class="obra-card-subtitle">${obra.tipo}</span>
          
          <button class="btn-registrar-vistoria" data-action-id="${obra.id}">
            Registrar vistoria
          </button>
        </div>
      </div>
    `;
  }).join('');

  const isFiscal = state.user?.cargo === 'fiscal';

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
            placeholder="Buscar obra por nome ou responsável" 
            value="${state.searchQuery}"
          />
        </div>
        ${isFiscal ? `
          <button class="btn-pill-navy" id="btnNovaObraBar" title="Cadastrar Nova Unidade BB">
            Nova Obra
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

export function bindObrasEvents() {
  bindHeaderEvents();

  // Campo de busca com debounce
  const inputBusca = document.getElementById('inputBuscarObra');
  if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
      state.setSearchQuery(e.target.value);
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
      toast.info('Cadastro de Unidade', 'Formulário de credenciamento de nova agência bancária ou canteiro de obras BB.');
    });
  }

  // Botões 'Registrar vistoria' nos cards
  const btnRegistrarList = document.querySelectorAll('.btn-registrar-vistoria');
  btnRegistrarList.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const obraId = btn.getAttribute('data-action-id');
      state.selectObra(obraId);
      state.navigate('obra-detalhe');
    });
  });

  // Botões de olho (Ver detalhes)
  const eyeButtons = document.querySelectorAll('.obra-card-eye-btn');
  eyeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const obraId = btn.getAttribute('data-view-id');
      state.selectObra(obraId);
      state.navigate('obra-detalhe');
    });
  });
}

