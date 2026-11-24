/**
 * BBVision - Tela de Relatórios & Auditoria
 * Listagem, busca, filtros por status e acesso direto ao PDF oficial e auditoria fiscal.
 */

import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml, normalizeImageSrc, NEUTRAL_PHOTO_PLACEHOLDER } from '../utils/formatters.js';

let filtroStatusRel = 'TODOS';
let buscaRelatorio = '';

export function renderRelatorios() {
  const isFiscal = state.user?.cargo === 'fiscal';
  const todos = state.relatorios || [];

  const filtrados = todos.filter(rel => {
    const matchStatus = filtroStatusRel === 'TODOS' || rel.statusRaw === filtroStatusRel;
    const q = buscaRelatorio.trim().toLowerCase();
    const matchQuery =
      !q ||
      (rel.obraNome || '').toLowerCase().includes(q) ||
      (rel.codigoUnico || '').toLowerCase().includes(q) ||
      (rel.responsavel || '').toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const filtros = [
    { key: 'TODOS', label: `Todos (${todos.length})` },
    { key: 'FINALIZADO', label: `Aguardando (${todos.filter(r => r.statusRaw === 'FINALIZADO').length})` },
    { key: 'APROVADO', label: `Homologados (${todos.filter(r => r.statusRaw === 'APROVADO').length})` },
    { key: 'PENDENTE_AJUSTE', label: `Ajustes (${todos.filter(r => r.statusRaw === 'PENDENTE_AJUSTE').length})` },
  ];

  const itemsHtml = filtrados
    .map(rel => {
      const isAprovado = rel.statusRaw === 'APROVADO';
      const isPendenteAjuste = rel.statusRaw === 'PENDENTE_AJUSTE';
      const isEmAndamento = rel.statusRaw === 'EM_ANDAMENTO';
      const primeiraFotoObj = Array.isArray(rel.fotos) && rel.fotos.length > 0 ? rel.fotos[0] : null;
      const rawImg = primeiraFotoObj
        ? primeiraFotoObj.previewDataUrl || primeiraFotoObj.url || primeiraFotoObj.caminho_arquivo
        : '';
      const fotoSrc = normalizeImageSrc(rawImg, NEUTRAL_PHOTO_PLACEHOLDER);
      const motivoFoto =
        primeiraFotoObj?.motivo ||
        primeiraFotoObj?.motivo_ia ||
        (primeiraFotoObj ? 'Evidência fotográfica capturada in-loco com carimbo temporal.' : 'Nenhuma foto anexada.');
      const statusChipClass = isAprovado ? 'concluido' : isPendenteAjuste ? 'pendente' : 'andamento';
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
            <span class="rel-sub">${escapeHtml(rel.subtitulo ? rel.subtitulo + ' • ' : '')}Emitido em ${escapeHtml(rel.data)}</span>
          </div>
          <span class="status-badge-chip ${statusChipClass}">
            ${escapeHtml(statusChipLabel)}
          </span>
        </div>

        <div class="rel-photo-preview-box" style="margin: 10px 0; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; background: #F8FAFC; display: flex; align-items: center; gap: 12px; padding: 8px;">
          <img
            src="${escapeHtml(fotoSrc)}"
            alt="Foto da vistoria - ${escapeHtml(rel.obraNome)}"
            style="width: 96px; height: 68px; object-fit: cover; border-radius: 8px; border: 1px solid #CBD5E1; flex-shrink: 0; background: #F1F5F9;"
          />
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 11.5px; font-weight: 700; color: #002D72; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span>Evidência da Vistoria</span>
              ${
                rel.validacaoManual
                  ? '<span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; background: #FEF3C7; color: #92400E; font-weight: 700;">Validação Manual</span>'
                  : ''
              }
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
          ${
            rel.confiancaIA !== null && rel.confiancaIA !== undefined
              ? `
            <div class="audit-field">
              <span class="af-label">Auditoria IA:</span>
              <span class="af-val">${Math.round(rel.confiancaIA * 100)}% Confiança</span>
            </div>
          `
              : ''
          }
        </div>

        ${
          rel.hash
            ? `
          <div class="rel-hash-row">
            <span class="af-label">Hash SHA-256 Inviolável:</span>
            <code class="af-hash">${escapeHtml(rel.hash.substring(0, 32))}...</code>
          </div>
        `
            : ''
        }

        ${
          rel.justificativaFiscal
            ? `
          <div style="margin: 8px 0; padding: 8px 10px; border-radius: 8px; background: ${
            isPendenteAjuste ? '#FEF2F2' : '#ECFDF5'
          }; border-left: 3px solid ${isPendenteAjuste ? '#DC2626' : '#059669'}; font-size: 11.5px; color: #1E293B;">
            <strong>Parecer Fiscal:</strong> ${escapeHtml(rel.justificativaFiscal)}
          </div>
        `
            : ''
        }

        <div class="rel-action-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button
            class="btn-ver-pdf"
            data-rel-id="${escapeHtml(rel.id)}"
            data-obra-nome="${escapeHtml(rel.obraNome)}"
            data-codigo="${escapeHtml(rel.codigoUnico)}"
            data-hash="${escapeHtml(rel.hash || '')}"
            data-em-andamento="${isEmAndamento ? '1' : '0'}"
            ${isEmAndamento ? 'disabled' : ''}
            style="flex: 1.4; ${isEmAndamento ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
          >
            ${isEmAndamento ? 'PDF após Conclusão' : 'Visualizar PDF Oficial'}
          </button>

          ${
            isFiscal && !isEmAndamento
              ? `
            <button type="button" class="btn-secondary-white btn-auditar-rel" data-rel-id="${escapeHtml(rel.id)}" style="flex: 1; font-size: 12px; padding: 10px 12px; border-color: #002D62; color: #002D62; font-weight: 700;">
              Auditar / Parecer
            </button>
          `
              : ''
          }

          ${
            rel.codigoUnico && rel.codigoUnico !== 'Pendente'
              ? `
            <button type="button" class="btn-secondary-white btn-validar-fe-rel" data-codigo="${escapeHtml(rel.codigoUnico)}" style="flex: 1; font-size: 12px; padding: 10px 12px;">
              Validar Fé Pública
            </button>
          `
              : ''
          }
        </div>
      </div>
    `;
    })
    .join('');

  return `
    <div class="page-container fade-in" id="relatoriosPage">
      ${renderHeader('relatorios')}

      <div class="relatorios-intro-header">
        <h2 class="section-title">Relatórios & Auditoria</h2>
        <p class="section-subtitle">Documentos oficiais com inviolabilidade matemática, carimbo temporal e fé pública.</p>
      </div>

      ${
        todos.length > 0
          ? `
        <div style="margin-bottom: 14px; display: flex; flex-direction: column; gap: 8px;">
          <input
            type="search"
            id="inputBuscaRelatorios"
            placeholder="Buscar por obra, código único ou responsável..."
            value="${escapeHtml(buscaRelatorio)}"
            style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px; background: #FFFFFF; outline: none;"
          />
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${filtros
              .map(
                f => `
              <button
                type="button"
                class="btn-filtro-rel"
                data-filtro="${f.key}"
                style="padding: 6px 11px; border-radius: 999px; font-size: 11.5px; font-weight: 700; cursor: pointer; border: 1px solid ${
                  filtroStatusRel === f.key ? '#002D62' : '#CBD5E1'
                }; background: ${filtroStatusRel === f.key ? '#002D62' : '#FFFFFF'}; color: ${
                  filtroStatusRel === f.key ? '#FFFFFF' : '#334155'
                };"
              >
                ${escapeHtml(f.label)}
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <div class="relatorios-list-container">
        ${
          itemsHtml.length > 0
            ? itemsHtml
            : `<div class="resultado-empty-hint">${
                todos.length === 0
                  ? 'Nenhum relatório registrado até o momento.'
                  : 'Nenhum relatório encontrado para o filtro selecionado.'
              }</div>`
        }
      </div>
    </div>
  `;
}

export function bindRelatoriosEvents() {
  bindHeaderEvents();

  const inputBusca = document.getElementById('inputBuscaRelatorios');
  if (inputBusca) {
    inputBusca.addEventListener('input', e => {
      buscaRelatorio = e.target.value;
      const cursor = e.target.selectionStart;
      state.notify();
      const refreshed = document.getElementById('inputBuscaRelatorios');
      if (refreshed) {
        refreshed.focus();
        try {
          refreshed.setSelectionRange(cursor, cursor);
        } catch (_) {}
      }
    });
  }

  document.querySelectorAll('.btn-filtro-rel').forEach(btn => {
    btn.addEventListener('click', () => {
      filtroStatusRel = btn.getAttribute('data-filtro') || 'TODOS';
      state.notify();
    });
  });

  document.querySelectorAll('.btn-ver-pdf').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-em-andamento') === '1') {
        toast.info('Relatório em Andamento', 'O PDF oficial será gerado após a conclusão e assinatura da vistoria.');
        return;
      }
      const relId = btn.getAttribute('data-rel-id');
      if (!relId) {
        toast.error('Relatório Inválido', 'Identificador do relatório indisponível.');
        return;
      }
      const obraNome = btn.getAttribute('data-obra-nome') || 'Vistoria';
      const codigo = btn.getAttribute('data-codigo') || '';
      const hash = btn.getAttribute('data-hash') || '';

      modal.openPdfViewer({
        title: `Relatório de Fiscalização • ${obraNome}`,
        pdfUrl: `/api/relatorios/${encodeURIComponent(relId)}/pdf`,
        codigo,
        hash,
      });
    });
  });

  document.querySelectorAll('.btn-auditar-rel').forEach(btn => {
    btn.addEventListener('click', () => {
      const relId = btn.getAttribute('data-rel-id');
      if (!relId) return;
      state.selecionarRelatorioParaAuditoria(relId);
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    });
  });

  document.querySelectorAll('.btn-validar-fe-rel').forEach(btn => {
    btn.addEventListener('click', () => {
      const codigo = btn.getAttribute('data-codigo');
      if (codigo) {
        state.currentVistoria.codigoParaValidar = codigo;
      }
      state.navigate('validador-publico');
    });
  });
}
