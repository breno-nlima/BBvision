/**
 * BBVision - Tela de Auditoria do Fiscal de Obra
 * - Seletor interativo de relatórios reais para auditoria
 * - Inspeção pericial das evidências fotográficas vinculadas ao relatório selecionado
 * - Julgamento técnico com Fé Pública: Aprovar ('REGULAR') ou Solicitar Ajuste ('PENDENTE_AJUSTE')
 * - Visualização do PDF oficial compilado via PDFKit com carimbo de integridade
 */

import { Icons } from '../assets/icons.js?v=2.5';
import { state } from '../services/state.js?v=2.5';
import { modal } from '../components/modal.js?v=2.5';
import { toast } from '../components/toast.js?v=2.5';
import { renderBackButton } from '../components/backButton.js?v=2.5';
import { escapeHtml, normalizeImageSrc, NEUTRAL_PHOTO_PLACEHOLDER } from '../utils/formatters.js?v=2.5';

function obterRelatorioAtivoParaAuditoria() {
  const lista = state.relatorios || [];
  if (lista.length === 0) return null;

  if (state.currentVistoria?.relatorioId) {
    const encontrado = lista.find(r => r.id === state.currentVistoria.relatorioId);
    if (encontrado) return encontrado;
  }

  // Prioriza o primeiro relatório finalizado aguardando auditoria
  const pendenteAuditoria = lista.find(r => r.statusRaw === 'FINALIZADO');
  return pendenteAuditoria || lista[0];
}

export function renderFiscalAuditoria() {
  const relatorios = state.relatorios || [];
  const selectedRel = obterRelatorioAtivoParaAuditoria();

  // Sincroniza referência silenciosa no currentVistoria para julgamento e PDF
  if (selectedRel && state.currentVistoria.relatorioId !== selectedRel.id) {
    state.currentVistoria.relatorioId = selectedRel.id;
    state.currentVistoria.obraId = selectedRel.obraId;
    state.currentVistoria.obraNome = selectedRel.obraNome;
    state.currentVistoria.responsavel = selectedRel.responsavel;
    state.currentVistoria.codigoUnico = selectedRel.codigoUnico;
    state.currentVistoria.hashSha256 = selectedRel.hash || '';
    state.currentVistoria.pdfUrl = selectedRel.pdfUrl;
    state.currentVistoria.statusRelatorio = selectedRel.statusRaw;
    state.currentVistoria.statusObra = selectedRel.obraStatus || 'REGULAR';
    state.currentVistoria.justificativaFiscal = selectedRel.justificativaFiscal || null;
  }

  const fotosRelatorio = selectedRel
    ? (state.fiscalRegistros || []).filter(f => f.relatorioId === selectedRel.id)
    : [];

  const podeJulgar = Boolean(selectedRel && selectedRel.statusRaw !== 'EM_ANDAMENTO');
  const temPdfOficial = Boolean(selectedRel && selectedRel.statusRaw !== 'EM_ANDAMENTO');
  const obraStatusAtual = selectedRel ? selectedRel.obraStatus || 'REGULAR' : null;
  const respostasRel = Array.isArray(selectedRel?.respostas) ? selectedRel.respostas : [];

  const gridCardsHtml =
    fotosRelatorio.length > 0
      ? fotosRelatorio
          .map(reg => {
            const confLabel =
              reg.confianca !== null && reg.confianca !== undefined
                ? `IA ${Math.round(reg.confianca * 100)}%`
                : reg.status === 'Manual'
                ? 'Validação Manual'
                : 'Registrada';
            return `
            <div class="fiscal-photo-card" data-reg-id="${escapeHtml(reg.id)}" title="Clique para inspecionar perícia visual">
              <div class="photo-thumbnail-wrap">
                <img
                  src="${escapeHtml(normalizeImageSrc(reg.img, NEUTRAL_PHOTO_PLACEHOLDER))}"
                  alt="${escapeHtml(reg.titulo)}"
                  class="photo-thumbnail-img"
                />
                <div class="photo-check-indicator ${reg.status === 'Validado' ? 'validated' : 'pending'}">
                  ${reg.status === 'Validado' ? '✓' : '!'}
                </div>
              </div>
              <div class="photo-meta-box">
                <strong class="photo-code">${escapeHtml(reg.codigo)}</strong>
                <span class="photo-subtitle">${escapeHtml(reg.local)}</span>
                <span class="photo-ia-badge">${escapeHtml(confLabel)}</span>
              </div>
            </div>
          `;
          })
          .join('')
      : `
      <div style="grid-column: 1 / -1; padding: 36px 16px; text-align: center; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px;">
        <span style="display: flex; justify-content: center; margin-bottom: 8px; color: #64748B;">${Icons.cameraAiLens(28)}</span>
        <h4 style="font-size: 15px; font-weight: 700; color: #002D62; margin-bottom: 6px;">
          ${selectedRel ? 'Nenhuma foto anexada a este relatório' : 'Nenhum relatório disponível para auditoria'}
        </h4>
        <p style="font-size: 12px; color: #64748B; max-width: 380px; margin: 0 auto;">
          ${
            selectedRel
              ? 'As evidências fotográficas enviadas pela empreiteira nesta vistoria serão exibidas aqui.'
              : 'Assim que uma empreiteira concluir uma vistoria técnica, o relatório aparecerá automaticamente neste painel.'
          }
        </p>
      </div>
    `;

  return `
    <div class="page-container page-medium fade-in" id="fiscalAuditoriaPage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarInicioFiscal',
            label: 'Voltar',
            variant: 'light',
            title: 'Voltar para a tela anterior',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">Auditoria Técnica</h1>
            <span class="screen-topbar-sub">${escapeHtml(selectedRel?.obraNome || 'Aguardando relatórios para homologação')}</span>
          </div>
        </div>
        ${
          selectedRel
            ? `<span class="status-badge-chip ${
                selectedRel.statusRaw === 'APROVADO'
                  ? 'concluido'
                  : selectedRel.statusRaw === 'PENDENTE_AJUSTE'
                  ? 'pendente'
                  : 'andamento'
              }">${
                selectedRel.statusRaw === 'APROVADO'
                  ? 'Homologado'
                  : selectedRel.statusRaw === 'PENDENTE_AJUSTE'
                  ? 'Ajuste pendente'
                  : 'Para auditar'
              }</span>`
            : ''
        }
      </header>

      ${
        relatorios.length > 0
          ? `
        <div class="fiscal-selector-card">
          <label for="selectRelatorioAuditoria">
            Selecionar relatório (${relatorios.length} ${relatorios.length === 1 ? 'disponível' : 'disponíveis'})
          </label>
          <select id="selectRelatorioAuditoria">
            ${relatorios
              .map(r => {
                const sel = selectedRel && r.id === selectedRel.id ? 'selected' : '';
                const label = `[${r.codigoUnico}] ${r.obraNome} — ${r.status} (${r.data})`;
                return `<option value="${escapeHtml(r.id)}" ${sel}>${escapeHtml(label)}</option>`;
              })
              .join('')}
          </select>
        </div>
      `
          : ''
      }

      <div class="fiscal-metrics-row">
        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Evidências</span>
          </div>
          <div class="metric-large-number">${fotosRelatorio.length}</div>
          <span class="metric-bottom-hint">${
            selectedRel?.validacaoManual ? 'Validação manual assistida' : 'Carimbo SHA-256'
          }</span>
        </div>

        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Envio de campo</span>
          </div>
          <div class="metric-large-number timestamp">${escapeHtml(selectedRel ? selectedRel.dataHora || selectedRel.data : '—')}</div>
          <span class="metric-bottom-hint">${escapeHtml(selectedRel?.responsavel || '—')}</span>
        </div>

        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Protocolo único</span>
          </div>
          <div class="metric-large-number" style="font-size: 14px; font-family: ui-monospace, Consolas, monospace;">${escapeHtml(selectedRel?.codigoUnico || '—')}</div>
          <span class="metric-bottom-hint">${selectedRel?.hash ? 'Integridade verificada' : 'Aguardando selo'}</span>
        </div>
      </div>

      ${
        respostasRel.length > 0
          ? `
        <details class="bb-details-accordion" ${respostasRel.length <= 4 ? 'open' : ''}>
          <summary>Respostas do checklist (${respostasRel.length} ${respostasRel.length === 1 ? 'item' : 'itens'})</summary>
          <div class="bb-details-body" style="display: flex; flex-direction: column; gap: 8px;">
            ${respostasRel
              .map(
                resp => `
              <div style="font-size: 12.5px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 9px 12px;">
                <div style="font-weight: 700; color: #0F172A; margin-bottom: 2px;">${escapeHtml(resp.pergunta || 'Item')}</div>
                <div style="color: #475569;">${escapeHtml(resp.valor || resp.resposta || 'Não informado')}</div>
                ${
                  resp.justificativa
                    ? `<div style="color: #B45309; font-size: 11.5px; margin-top: 4px;"><strong>Justificativa:</strong> ${escapeHtml(resp.justificativa)}</div>`
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        </details>
      `
          : ''
      }

      <div class="status-grid-header">
        <span class="grid-status-label">Evidências fotográficas</span>
        <span style="font-size: 12px; color: var(--text-muted);">Clique na imagem para ampliar</span>
      </div>

      <div class="fiscal-photos-grid">
        ${gridCardsHtml}
      </div>

      <div class="fiscal-analysis-decision-card">
        <div class="decision-action-box">
          <div>
            <strong class="decision-prompt-text" style="display:block;">
              ${
                !selectedRel
                  ? 'Nenhum relatório disponível'
                  : !podeJulgar
                  ? 'Relatório ainda em andamento'
                  : 'Emitir parecer técnico oficial'
              }
            </strong>
            <span style="font-size: 12px; color: var(--text-secondary);">Atualiza o status da obra e registra o carimbo de homologação</span>
          </div>

          <div class="decision-buttons-row">
            <button class="btn-decision-reprovar" id="btnReprovarObra" title="Solicitar correções técnicas na obra" ${podeJulgar ? '' : 'disabled'}>
              Solicitar Ajuste
            </button>
            <button class="btn-decision-aprovar" id="btnAprovarObra" title="Aprovar e homologar avanço físico" ${podeJulgar ? '' : 'disabled'}>
              Aprovar Vistoria
            </button>
          </div>
        </div>

        ${
          selectedRel
            ? `
          <div class="status-obra-badge-banner ${obraStatusAtual === 'REGULAR' ? 'status-regular' : 'status-pendente'}">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
              <div>
                <strong>Status da obra:</strong>
                <span id="lblStatusObraAtual" style="font-weight: 800; margin-left: 4px;">${escapeHtml(obraStatusAtual)}</span>
              </div>
              <span style="font-size: 11px; font-weight: 700;">${
                selectedRel.statusRaw === 'APROVADO'
                  ? 'HOMOLOGADO'
                  : selectedRel.statusRaw === 'PENDENTE_AJUSTE'
                  ? 'PENDENTE DE CORREÇÃO'
                  : 'AGUARDANDO PARECER'
              }</span>
            </div>
            ${selectedRel.justificativaFiscal ? `<p class="justificativa-text">"${escapeHtml(selectedRel.justificativaFiscal)}"</p>` : ''}
          </div>
        `
            : ''
        }
      </div>

      <div class="fiscal-action-footer">
        <button class="btn-primary-bb-yellow" id="btnVerDetalhesCompletos" ${temPdfOficial ? '' : 'disabled'}>
          Visualizar Relatório Oficial (PDF)
        </button>
      </div>

      <div class="vistoria-modal-overlay hidden" id="modalInspecaoFoto">
        <div class="vistoria-modal-card" style="max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #002D62; background: #FED304; padding: 3px 10px; border-radius: 4px;">EVIDÊNCIA PERICIAL</span>
            <button class="btn-icon-simple-sm" id="btnFecharModalInspecao" style="font-size: 16px; cursor: pointer;">✕</button>
          </div>
          <div style="border-radius: 12px; overflow: hidden; margin-bottom: 12px; border: 1px solid #CBD5E1;">
            <img id="imgInspecaoModal" src="" alt="Foto da vistoria" style="width: 100%; height: 220px; object-fit: cover; display: block;" />
          </div>
          <h4 id="tituloInspecaoModal" style="font-size: 15px; color: #002D62; margin-bottom: 4px;">Evidência de Vistoria</h4>
          <p id="localInspecaoModal" style="font-size: 11px; color: #64748B; margin-bottom: 10px;">Unidade • Responsável de Campo</p>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-size: 11px; margin-bottom: 14px; text-align: left;">
            <div style="margin-bottom: 6px;"><strong>Código Único:</strong> <code id="codigoInspecaoModal" style="color: #002D62; font-weight: 700; background: #FFF9D2; padding: 2px 6px; border-radius: 4px;">-</code></div>
            <div style="margin-bottom: 6px; word-break: break-all;"><strong>Hash SHA-256:</strong> <code id="hashInspecaoModal" style="font-size: 10px; color: #475569;">-</code></div>
            <div><strong>Avaliação:</strong> <span id="iaInspecaoModal" style="color: #059669; font-weight: 700;">-</span></div>
          </div>

          <button class="btn-submit-primary" id="btnFecharModalInspecaoBtn" style="width: 100%;">
            Concluir Inspeção
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindFiscalAuditoriaEvents() {
  document.getElementById('btnVoltarInicioFiscal')?.addEventListener('click', () => {
    state.goBack('inicio', 'inicio');
  });

  const selectRel = document.getElementById('selectRelatorioAuditoria');
  if (selectRel) {
    selectRel.addEventListener('change', e => {
      state.selecionarRelatorioParaAuditoria(e.target.value);
    });
  }

  const abrirParecer = (initialDecision = 'APROVADO') => {
    const selectedRel = obterRelatorioAtivoParaAuditoria();
    if (!selectedRel || selectedRel.statusRaw === 'EM_ANDAMENTO') {
      toast.warning('Relatório Indisponível', 'Selecione um relatório concluído para emitir parecer técnico.');
      return;
    }

    modal.openParecerFiscal({
      obraNome: selectedRel.obraNome,
      initialDecision,
      onConfirm: async (decisao, justificativa) => {
        const statusObra = decisao === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
        try {
          state.currentVistoria.relatorioId = selectedRel.id;
          await state.julgarVistoriaFiscal(statusObra, justificativa);

          if (statusObra === 'REGULAR') {
            toast.success('Vistoria Homologada', 'Obra atestada como REGULAR. Parecer registrado e PDF atualizado.');
          } else {
            toast.warning('Ajuste Solicitado', 'Obra classificada como PENDENTE_AJUSTE. Parecer registrado e PDF atualizado.');
          }
        } catch (err) {
          toast.error('Erro ao Registrar Parecer', err.message || 'Não foi possível salvar o parecer técnico.');
        }
      },
    });
  };

  document.getElementById('btnAprovarObra')?.addEventListener('click', () => abrirParecer('APROVADO'));
  document.getElementById('btnReprovarObra')?.addEventListener('click', () => abrirParecer('REPROVADO'));

  document.getElementById('btnVerDetalhesCompletos')?.addEventListener('click', () => {
    const selectedRel = obterRelatorioAtivoParaAuditoria();
    if (!selectedRel || selectedRel.statusRaw === 'EM_ANDAMENTO') {
      toast.warning('PDF Indisponível', 'O PDF oficial fica disponível somente após a conclusão da vistoria.');
      return;
    }
    const pdfUrl = `/api/relatorios/${encodeURIComponent(selectedRel.id)}/pdf`;
    modal.openPdfViewer({
      title: `Auditoria de Relatório • ${selectedRel.obraNome}`,
      pdfUrl,
      codigo: selectedRel.codigoUnico,
      hash: selectedRel.hash || '',
    });
  });

  const modalFoto = document.getElementById('modalInspecaoFoto');
  const imgFoto = document.getElementById('imgInspecaoModal');
  const tituloFoto = document.getElementById('tituloInspecaoModal');
  const localFoto = document.getElementById('localInspecaoModal');
  const codigoFoto = document.getElementById('codigoInspecaoModal');
  const hashFoto = document.getElementById('hashInspecaoModal');
  const iaFoto = document.getElementById('iaInspecaoModal');
  const btnFecharX = document.getElementById('btnFecharModalInspecao');
  const btnFecharBtn = document.getElementById('btnFecharModalInspecaoBtn');

  document.querySelectorAll('.fiscal-photo-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const regId = card.getAttribute('data-reg-id');
      const reg = (state.fiscalRegistros || []).find(r => r.id === regId);
      if (!reg) return;
      if (imgFoto) imgFoto.src = normalizeImageSrc(reg.img, NEUTRAL_PHOTO_PLACEHOLDER);
      if (tituloFoto) tituloFoto.textContent = reg.motivo || reg.titulo;
      if (localFoto) localFoto.textContent = `${reg.local} • Responsável: ${reg.responsavel || 'Não informado'}`;
      if (codigoFoto) codigoFoto.textContent = reg.codigo || 'Pendente';
      if (hashFoto) hashFoto.textContent = reg.hash || 'Hash SHA-256 registrado';
      if (iaFoto) {
        iaFoto.textContent =
          reg.confianca !== null && reg.confianca !== undefined
            ? `IA BBVision • ${Math.round(reg.confianca * 100)}% Confiança (${reg.status || 'Validado'})`
            : `Modo ${reg.status || 'Manual'} (Auditoria Humana)`;
      }
      if (modalFoto) modalFoto.classList.remove('hidden');
    });
  });

  btnFecharX?.addEventListener('click', () => modalFoto?.classList.add('hidden'));
  btnFecharBtn?.addEventListener('click', () => modalFoto?.classList.add('hidden'));
}
