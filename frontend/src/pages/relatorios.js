/**
 * BBVision - Tela de Relatórios & Auditoria
 * Listagem limpa com busca, filtros por status, visualização de PDF oficial e acesso à auditoria fiscal.
 */

import { Icons } from '../assets/icons.js';
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
        ? 'Pendente ajuste'
        : rel.status;

      const metaAuditoria = rel.validacaoManual
        ? 'Validação manual'
        : rel.confiancaIA !== null && rel.confiancaIA !== undefined
        ? `IA ${Math.round(rel.confiancaIA * 100)}%`
        : '';

      return `
        <article class="relatorio-card-item">
          <div class="rel-top-row">
            <div>
              <h3 class="rel-title">${escapeHtml(rel.obraNome)}</h3>
              <span class="rel-sub">${escapeHtml(rel.data)}${rel.responsavel ? ` • ${escapeHtml(rel.responsavel)}` : ''}</span>
            </div>
            <span class="status-badge-chip ${statusChipClass}">
              ${escapeHtml(statusChipLabel)}
            </span>
          </div>

          <div class="rel-body-row">
            <img
              src="${escapeHtml(fotoSrc)}"
              alt="Evidência - ${escapeHtml(rel.obraNome)}"
              class="rel-thumb"
            />
            <div class="rel-meta-summary">
              <div class="rel-meta-chips">
                <span>Protocolo: <code>${escapeHtml(rel.codigoUnico)}</code></span>
                ${metaAuditoria ? `<span>${escapeHtml(metaAuditoria)}</span>` : ''}
                ${rel.hash ? `<span>SHA-256: <code>${escapeHtml(rel.hash.substring(0, 12))}…</code></span>` : ''}
              </div>
              <p class="rel-motivo-line">${escapeHtml(motivoFoto)}</p>
            </div>
          </div>

          ${
            rel.justificativaFiscal
              ? `
            <div style="padding: 9px 12px; border-radius: 8px; background: ${
              isPendenteAjuste ? '#FEF2F2' : '#ECFDF5'
            }; border-left: 3px solid ${isPendenteAjuste ? '#DC2626' : '#059669'}; font-size: 12px; color: #1E293B;">
              <strong>Parecer fiscal:</strong> ${escapeHtml(rel.justificativaFiscal)}
            </div>
          `
              : ''
          }

          <div class="rel-action-row">
            <button
              type="button"
              class="btn-ver-pdf"
              data-rel-id="${escapeHtml(rel.id)}"
              data-obra-nome="${escapeHtml(rel.obraNome)}"
              data-codigo="${escapeHtml(rel.codigoUnico)}"
              data-hash="${escapeHtml(rel.hash || '')}"
              data-em-andamento="${isEmAndamento ? '1' : '0'}"
              ${isEmAndamento ? 'disabled' : ''}
              style="${isEmAndamento ? 'opacity: 0.55; cursor: not-allowed;' : ''}"
            >
              ${isEmAndamento ? 'PDF disponível após conclusão' : 'Visualizar PDF Oficial'}
            </button>

            ${
              isFiscal && !isEmAndamento
                ? `
              <button type="button" class="btn-rel-secondary btn-auditar-rel" data-rel-id="${escapeHtml(rel.id)}">
                Auditar / Parecer
              </button>
            `
                : ''
            }

            ${
              rel.codigoUnico && rel.codigoUnico !== 'Pendente'
                ? `
              <button type="button" class="btn-rel-secondary btn-validar-fe-rel" data-codigo="${escapeHtml(rel.codigoUnico)}">
                Validar Fé Pública
              </button>
            `
                : ''
            }
          </div>
        </article>
      `;
    })
    .join('');

  return `
    <div class="page-container page-medium fade-in" id="relatoriosPage">
      ${renderHeader('relatorios')}

      <div class="page-intro-bar">
        <div>
          <h1>Relatórios & Auditoria</h1>
          <p>Laudos oficiais selados com código único, carimbo temporal e hash SHA-256.</p>
        </div>
      </div>

      ${
        todos.length > 0
          ? `
        <div class="relatorios-toolbar">
          <div class="search-input-wrapper">
            <div class="search-icon">${Icons.search(16)}</div>
            <input
              type="search"
              id="inputBuscaRelatorios"
              class="search-input"
              placeholder="Buscar por obra, código único ou responsável..."
              value="${escapeHtml(buscaRelatorio)}"
            />
          </div>
          <div class="relatorios-filters-row">
            ${filtros
              .map(
                f => `
              <button
                type="button"
                class="btn-filtro-rel ${filtroStatusRel === f.key ? 'active' : ''}"
                data-filtro="${f.key}"
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
