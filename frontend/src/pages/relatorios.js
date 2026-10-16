/**
 * BVision Relatórios Screen
 * Visualização e Auditoria dos Relatórios Gerados com Fé Pública
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderRelatorios() {
  const itemsHtml = state.relatorios.map(rel => {
    const isAprovado = rel.statusRaw === 'APROVADO';
    return `
      <div class="relatorio-card-item">
        <div class="rel-top-row">
          <div>
            <h4 class="rel-title">${rel.obraNome}</h4>
            <span class="rel-sub">${rel.subtitulo} • Emitido em ${rel.data}</span>
          </div>
          <span class="status-badge-chip ${isAprovado ? 'concluido' : (rel.status === 'Concluído' ? 'concluido' : 'andamento')}">
            ${isAprovado ? '✓ Homologado' : rel.status}
          </span>
        </div>

        <div class="rel-audit-grid">
          <div class="audit-field">
            <span class="af-label">Código Único Oficial:</span>
            <span class="af-code">${rel.codigoUnico}</span>
          </div>
          ${rel.confiancaIA ? `
            <div class="audit-field">
              <span class="af-label">Auditoria IA (Gemini):</span>
              <span class="af-val">${(rel.confiancaIA * 100).toFixed(0)}% Confiança</span>
            </div>
          ` : ''}
        </div>

        ${rel.hash ? `
          <div class="rel-hash-row">
            <span class="af-label">Hash SHA-256 Inviolável:</span>
            <code class="af-hash">${rel.hash.substring(0, 32)}...</code>
          </div>
        ` : ''}

        <div class="rel-action-row">
          <button class="btn-ver-pdf" data-rel-id="${rel.id}" data-obra-nome="${rel.obraNome}" data-codigo="${rel.codigoUnico}" data-hash="${rel.hash || ''}">
            📄 Visualizar Relatório em PDF (Carimbo BB)
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="page-container fade-in" id="relatoriosPage">
      ${renderHeader('relatorios')}

      <div class="relatorios-intro-header">
        <h2 class="section-title">Relatórios & Auditoria</h2>
        <p class="section-subtitle">Documentos oficiais com inviolabilidade matemática, carimbo temporal e fé pública do Banco do Brasil.</p>
      </div>

      <div class="relatorios-list-container">
        ${itemsHtml.length > 0 ? itemsHtml : '<div class="resultado-empty-hint">Nenhum relatório finalizado até o momento.</div>'}
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
      const obraNome = btn.getAttribute('data-obra-nome');
      const codigo = btn.getAttribute('data-codigo');
      const hash = btn.getAttribute('data-hash');

      const targetId = relId || 'rel-seed-001';
      const pdfUrl = `/api/relatorios/${targetId}/pdf`;

      modal.openPdfViewer({
        title: `Relatório de Fiscalização • ${obraNome}`,
        pdfUrl: pdfUrl,
        codigo: codigo,
        hash: hash
      });
    });
  });
}
