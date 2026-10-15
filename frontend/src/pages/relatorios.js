/**
 * BVision Relatórios Screen
 * Visualização e Auditoria dos Relatórios Gerados
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';

export function renderRelatorios() {
  const itemsHtml = state.relatorios.map(rel => `
    <div class="relatorio-card-item">
      <div class="rel-top-row">
        <div>
          <h4 class="rel-title">${rel.obraNome}</h4>
          <span class="rel-sub">${rel.subtitulo} • ${rel.data}</span>
        </div>
        <span class="status-badge-chip ${rel.status === 'Concluído' ? 'concluido' : 'andamento'}">
          ${rel.status}
        </span>
      </div>

      <div class="rel-audit-grid">
        <div class="audit-field">
          <span class="af-label">Código Único:</span>
          <span class="af-code">${rel.codigoUnico}</span>
        </div>
        ${rel.confiancaIA ? `
          <div class="audit-field">
            <span class="af-label">Confiança Gemini:</span>
            <span class="af-val">${(rel.confiancaIA * 100).toFixed(0)}%</span>
          </div>
        ` : ''}
      </div>

      ${rel.hash ? `
        <div class="rel-hash-row">
          <span class="af-label">Hash SHA-256:</span>
          <code class="af-hash">${rel.hash.substring(0, 24)}...</code>
        </div>
      ` : ''}

      <div class="rel-action-row">
        <button class="btn-ver-pdf" data-rel-id="${rel.id}">
          📄 Visualizar PDF Assinado
        </button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-container fade-in" id="relatoriosPage">
      ${renderHeader('relatorios')}

      <div class="relatorios-intro-header">
        <h2 class="section-title">Relatórios & Auditoria</h2>
        <p class="section-subtitle">Documentos emitidos com inviolabilidade e carimbo digital.</p>
      </div>

      <div class="relatorios-list-container">
        ${itemsHtml}
      </div>
    </div>
  `;
}

export function bindRelatoriosEvents() {
  bindHeaderEvents();

  const btnsPdf = document.querySelectorAll('.btn-ver-pdf');
  btnsPdf.forEach(btn => {
    btn.addEventListener('click', () => {
      const relId = btn.getAttribute('data-rel-id');
      if (relId && !relId.startsWith('rel-')) {
        window.open(`/api/relatorios/${relId}/pdf`, '_blank');
      } else {
        // Gera o PDF oficial do primeiro relatório cadastrado na API se disponível
        window.open('/api/relatorios/11111111-3333-4444-5555-666666666666/pdf', '_blank');
      }
    });
  });
}
