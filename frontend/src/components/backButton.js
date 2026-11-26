/**
 * BBVision - Componente Padronizado de Botão Voltar
 * Garante consistência visual, área de toque acessível (>= 38px) e seta direcional clara (←)
 * em todas as telas internas do sistema.
 */

import { escapeHtml } from '../utils/formatters.js';

/**
 * @param {object} opts
 * @param {string} opts.id - ID do elemento botão
 * @param {string} [opts.label='Voltar'] - Texto exibido ao lado da seta
 * @param {'light'|'yellow'|'navy'|'camera'} [opts.variant='light'] - Variante visual conforme fundo do cabeçalho
 * @param {string} [opts.title] - Tooltip/aria-label descritivo
 */
export function renderBackButton({ id, label = 'Voltar', variant = 'light', title = '' }) {
  const safeId = escapeHtml(id);
  const safeLabel = escapeHtml(label);
  const safeTitle = escapeHtml(title || label);
  const safeVariant = ['light', 'yellow', 'navy', 'camera'].includes(variant) ? variant : 'light';

  return `
    <button
      type="button"
      class="bb-back-btn bb-back-btn--${safeVariant}"
      id="${safeId}"
      title="${safeTitle}"
      aria-label="${safeTitle}"
    >
      <svg class="bb-back-btn__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      <span class="bb-back-btn__label">${safeLabel}</span>
    </button>
  `;
}
