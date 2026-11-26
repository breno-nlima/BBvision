/**
 * BBVision - Tela de Seleção de Tipo de Local
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderBackButton } from '../components/backButton.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderTipoLocal() {
  const currentTipo = state.currentVistoria.tipoLocal || 'Agência Bancária';
  const obraNome = state.currentVistoria.obraNome || 'Obra Selecionada';

  const locais = [
    { id: 'agencia', titulo: 'Agência Bancária', descricao: 'Fachada, interior e salão de atendimento' },
    { id: 'caixa', titulo: 'Caixa Eletrônico', descricao: 'Terminais TAA, câmeras e acessibilidade' },
    { id: 'externa', titulo: 'Área Externa', descricao: 'Estacionamento, calçada e entorno' },
    { id: 'predio', titulo: 'Prédio Administrativo', descricao: 'Recepção, corredores e salas técnicas' },
  ];

  const cardsHtml = locais
    .map(loc => {
      const isSelected = loc.titulo === currentTipo;
      const cardClass = isSelected ? 'tipo-card-amarelo selected' : 'tipo-card-azul';

      let iconSvg = '';
      if (loc.id === 'agencia') iconSvg = Icons.iconAgencia(24, 'currentColor');
      else if (loc.id === 'caixa') iconSvg = Icons.iconAtm(24, 'currentColor');
      else if (loc.id === 'externa') iconSvg = Icons.iconAreaExterna(24, 'currentColor');
      else iconSvg = Icons.iconPredioAdmin(24, 'currentColor');

      return `
        <div class="tipo-local-card ${cardClass}" data-tipo="${escapeHtml(loc.titulo)}" data-desc="${escapeHtml(loc.descricao)}">
          <div class="tipo-card-header">
            <div class="tipo-card-icon-area">${iconSvg}</div>
            <div class="tipo-card-arrow" style="color: ${isSelected ? '#002D62' : '#94A3B8'};">
              ${Icons.chevronRight(18)}
            </div>
          </div>

          <div class="tipo-card-body">
            <h3 class="tipo-card-title">${escapeHtml(loc.titulo)}</h3>
            <p class="tipo-card-desc">${escapeHtml(loc.descricao)}</p>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="page-container page-narrow fade-in" id="tipoLocalPage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarDetalheObra',
            label: 'Voltar',
            variant: 'light',
            title: 'Voltar para Detalhes da Obra',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">Tipo de Local</h1>
            <span class="screen-topbar-sub">${escapeHtml(obraNome)} • Selecione o ambiente da vistoria</span>
          </div>
        </div>
        <span class="screen-step-pill">Etapa 1</span>
      </header>

      <div class="tipo-local-grid">
        ${cardsHtml}
      </div>

      <div class="tipo-local-footer">
        <button class="btn-primary-bb-yellow" id="btnConfirmarTipo">
          Continuar para o Checklist →
        </button>
      </div>
    </div>
  `;
}

export function bindTipoLocalEvents() {
  document.getElementById('btnVoltarDetalheObra')?.addEventListener('click', () => {
    state.goBack('obra-detalhe');
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
