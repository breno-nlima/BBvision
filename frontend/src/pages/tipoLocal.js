/**
 * BBVision - Tela de Seleção de Tipo de Local
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderTipoLocal() {
  const currentTipo = state.currentVistoria.tipoLocal || 'Agência Bancária';

  const locais = [
    { id: 'agencia', titulo: 'Agência Bancária', descricao: 'Fachada, interior, atendimento' },
    { id: 'caixa', titulo: 'Caixa Eletrônico', descricao: 'Atendimento, câmeras, acesso' },
    { id: 'externa', titulo: 'Área Externa', descricao: 'Estacionamento, entorno, segurança' },
    { id: 'predio', titulo: 'Prédio Administrativo', descricao: 'Entrada, corredores, salas' },
  ];

  const cardsHtml = locais.map(loc => {
    const isSelected = loc.titulo === currentTipo;
    const cardClass = isSelected ? 'tipo-card-amarelo' : 'tipo-card-azul';

    let iconSvg = '';
    if (loc.id === 'agencia') iconSvg = Icons.iconAgencia(30, 'currentColor');
    else if (loc.id === 'caixa') iconSvg = Icons.iconAtm(30, 'currentColor');
    else if (loc.id === 'externa') iconSvg = Icons.iconAreaExterna(30, 'currentColor');
    else iconSvg = Icons.iconPredioAdmin(30, 'currentColor');

    return `
      <div class="tipo-local-card ${cardClass} ${isSelected ? 'selected' : ''}" data-tipo="${escapeHtml(loc.titulo)}" data-desc="${escapeHtml(loc.descricao)}">
        <div class="tipo-card-header">
          <div class="tipo-card-icon-area">${iconSvg}</div>
          <div class="tipo-card-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="tipo-card-body">
          <h3 class="tipo-card-title">${escapeHtml(loc.titulo)}</h3>
          <p class="tipo-card-desc">${escapeHtml(loc.descricao)}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-container fade-in" id="tipoLocalPage">
      <header class="tipo-local-topbar">
        <button class="btn-icon-simple" id="btnVoltarDetalheObra" title="Voltar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 class="tipo-local-header-title">Tipo de Local</h1>
        <button class="btn-icon-simple" id="btnOpcoesTipo" title="Ajuda">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </header>

      <div class="tipo-local-grid">
        ${cardsHtml}
      </div>

      <div class="tipo-local-footer">
        <button class="btn-primary-bb-yellow" id="btnConfirmarTipo">
          Confirmar Tipo
        </button>
      </div>
    </div>
  `;
}

export function bindTipoLocalEvents() {
  document.getElementById('btnVoltarDetalheObra')?.addEventListener('click', () => {
    state.navigate('obra-detalhe');
  });

  document.getElementById('btnOpcoesTipo')?.addEventListener('click', () => {
    toast.info('Seleção de Local', 'Escolha o ambiente principal da vistoria para direcionar o checklist técnico da obra.');
  });

  const cards = document.querySelectorAll('.tipo-local-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => {
        c.classList.remove('selected', 'tipo-card-amarelo');
        c.classList.add('tipo-card-azul');
      });
      card.classList.remove('tipo-card-azul');
      card.classList.add('tipo-card-amarelo', 'selected');

      const tipo = card.getAttribute('data-tipo');
      const desc = card.getAttribute('data-desc');
      state.setTipoLocal(tipo, desc);
    });
  });

  document.getElementById('btnConfirmarTipo')?.addEventListener('click', () => {
    state.checklistQuestionIndex = 0;
    state.navigate('checklist-pergunta');
  });
}
