/**
 * BVision Relatórios Screen
 * Visualização e Auditoria dos Relatórios Gerados com Fé Pública
 */

import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml, normalizeImageSrc } from '../utils/formatters.js';

export function renderRelatorios() {
  const itemsHtml = state.relatorios.map(rel => {
    const isAprovado = rel.statusRaw === 'APROVADO';
    const isPendenteAjuste = rel.statusRaw === 'PENDENTE_AJUSTE';
    const primeiraFotoObj = Array.isArray(rel.fotos) && rel.fotos.length > 0 ? rel.fotos[0] : null;
    const rawImg = primeiraFotoObj
      ? (primeiraFotoObj.previewDataUrl || primeiraFotoObj.url || primeiraFotoObj.caminho_arquivo)
      : (rel.id === 'rel-seed-002' ? 'uploads/evidencias/seed_acessibilidade_bb.png' : 'uploads/evidencias/seed_fachada_bb.png');
    const fotoSrc = normalizeImageSrc(rawImg);
    const motivoFoto = primeiraFotoObj?.motivo || primeiraFotoObj?.motivo_ia || 'Evidência fotográfica capturada in-loco com carimbo temporal BBVision.';
    const statusChipClass = isAprovado
      ? 'concluido'
      : isPendenteAjuste
      ? 'pendente'
      : (rel.status === 'Concluído' ? 'concluido' : 'andamento');
    const statusChipLabel = isAprovado
      ? 'Homologado'
      : isPendenteAjuste
      ? 'Pendente de Ajuste'
      : rel.status;

    return `
      <div class="relatorio-card-item">
        <div class="rel-top-row">
          <div>
            <h4 class="rel-title">${escapeHtml(rel.obraNome)}</h4>
            <span class="rel-sub">${escapeHtml(rel.subtitulo)} • Emitido em ${escapeHtml(rel.data)}</span>
          </div>
          <span class="status-badge-chip ${statusChipClass}">
            ${escapeHtml(statusChipLabel)}
          </span>
        </div>

        <!-- Evidência Fotográfica Vinculada ao Relatório (Item 15.2) -->
        <div class="rel-photo-preview-box" style="margin: 10px 0; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; background: #F8FAFC; display: flex; align-items: center; gap: 12px; padding: 8px;">
          <img
            src="${escapeHtml(fotoSrc)}"
            alt="Foto da vistoria - ${escapeHtml(rel.obraNome)}"
            style="width: 96px; height: 68px; object-fit: cover; border-radius: 8px; border: 1px solid #CBD5E1; flex-shrink: 0; background: #0F172A;"
            onerror="this.onerror=null; this.src='/uploads/evidencias/seed_fachada_bb.png';"
          />
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 11.5px; font-weight: 700; color: #002D72; margin-bottom: 2px;">
              Foto Registrada na Vistoria
            </div>
            <div style="font-size: 11px; color: #475569; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${escapeHtml(motivoFoto)}
            </div>
          </div>
        </div>

        <div class="rel-audit-grid">
          <div class="audit-field">
            <span class="af-label">Código Único Oficial:</span>
            <span class="af-code">${escapeHtml(rel.codigoUnico)}</span>
          </div>
          ${rel.confiancaIA ? `
            <div class="audit-field">
              <span class="af-label">Auditoria IA BBVision:</span>
              <span class="af-val">${(rel.confiancaIA * 100).toFixed(0)}% Confiança</span>
            </div>
          ` : ''}
        </div>

        ${rel.hash ? `
          <div class="rel-hash-row">
            <span class="af-label">Hash SHA-256 Inviolável:</span>
            <code class="af-hash">${escapeHtml(rel.hash.substring(0, 32))}...</code>
          </div>
        ` : ''}

        <div class="rel-action-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn-ver-pdf" data-rel-id="${escapeHtml(rel.id)}" data-obra-nome="${escapeHtml(rel.obraNome)}" data-codigo="${escapeHtml(rel.codigoUnico)}" data-hash="${escapeHtml(rel.hash || '')}" style="flex: 1.5;">
            Visualizar Relatório PDF
          </button>
          ${rel.codigoUnico && rel.codigoUnico !== 'Pendente' ? `
            <button type="button" class="btn-secondary-white btn-validar-fe-rel" data-codigo="${escapeHtml(rel.codigoUnico)}" style="flex: 1; font-size: 12px; padding: 10px 12px;">
              Validar Fé Pública
            </button>
          ` : ''}
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

  const btnsValidar = document.querySelectorAll('.btn-validar-fe-rel');
  btnsValidar.forEach(btn => {
    btn.addEventListener('click', () => {
      const codigo = btn.getAttribute('data-codigo');
      if (codigo) {
        state.currentVistoria.codigoParaValidar = codigo;
      }
      state.navigate('validador-publico');
    });
  });
}
