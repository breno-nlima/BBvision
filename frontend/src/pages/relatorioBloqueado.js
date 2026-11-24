/**
 * BBVision - Tela de Relatório Concluído (Garantia de Imutabilidade)
 * - Bloqueio imediato para edições ou reenvios
 * - Exibição do código único oficial de 16 caracteres hex uppercase e Hash SHA-256
 * - Disponibilização do PDF oficial compilado via PDFKit com carimbo de integridade
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml, normalizeImageSrc, NEUTRAL_PHOTO_PLACEHOLDER, copyToClipboard } from '../utils/formatters.js';

export function renderRelatorioBloqueado() {
  const vistoria = state.currentVistoria;
  const isOfflineQueue = !vistoria.relatorioId;

  const rawImg = vistoria.fotoCamera || vistoria.fotoBase64 || vistoria.caminhoArquivoFoto || '';
  const fotoSrc = normalizeImageSrc(rawImg, NEUTRAL_PHOTO_PLACEHOLDER);

  return `
    <div class="page-container fade-in" id="relatorioBloqueadoPage">
      <header class="bloqueado-topbar">
        <button class="btn-icon-simple-sm" id="btnVoltarInicioBloqueado" title="Voltar ao Início">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div class="topbar-logo-center">
          ${Icons.logoBVisionBadge(28)}
        </div>
        <div style="width: 28px;"></div>
      </header>

      <div class="bloqueado-header-title">
        <h2>${isOfflineQueue ? 'Relatório Enfileirado (Offline)' : 'Relatório Concluído'}</h2>
      </div>

      <div class="bloqueado-hero-section">
        <div class="box-locked-visual">
          ${Icons.boxLocked3D(90)}
        </div>
        <p class="bloqueado-warning-text">
          ${
            isOfflineQueue
              ? 'Vistoria assinada e salva localmente.<br/>O PDF e o selo definitivo serão emitidos automaticamente ao reconectar.'
              : 'Este relatório foi formalmente concluído<br/>e possui fé pública inviolável'
          }
        </p>
        ${
          vistoria.validacaoManual
            ? `<span style="display:inline-block; margin-top:8px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;">
                Validação Manual Assistida — Sinalizado para Auditoria do Fiscal
              </span>`
            : ''
        }
      </div>

      <div class="bloqueado-status-rules-card" style="margin-bottom: 12px; padding: 12px;">
        <div style="font-size: 12px; font-weight: 700; color: #002D72; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>Evidência Fotográfica Registrada na Vistoria</span>
          <span style="font-size: 11px; color: #059669; font-weight: 700;">${
            isOfflineQueue ? 'Armazenada para Envio' : 'Registrada no Relatório & PDF'
          }</span>
        </div>
        <div style="border-radius: 10px; overflow: hidden; border: 1px solid #CBD5E1; background: #F1F5F9;">
          <img
            src="${escapeHtml(fotoSrc)}"
            alt="Foto capturada na vistoria"
            style="width: 100%; max-height: 190px; object-fit: cover; display: block;"
          />
        </div>
        <div style="font-size: 11px; color: #475569; margin-top: 6px; line-height: 1.35;">
          ${escapeHtml(vistoria.motivoIA || 'Evidência fotográfica capturada in-loco pela empreiteira.')}
        </div>
      </div>

      <div class="bloqueado-protocolo-card">
        <div class="proto-card-top-row">
          <span class="proto-card-label">${isOfflineQueue ? 'Código Provisório (Offline):' : 'Código Oficial:'}</span>
          <button type="button" class="proto-dots-btn" id="btnCopiarCodigoBloqueado" title="Copiar Código">
            Copiar
          </button>
        </div>

        <div class="proto-codigo-val" id="lblCodigoBloqueado">
          ${escapeHtml(vistoria.codigoUnico || 'Pendente')}
        </div>

        <div class="proto-meta-data">
          <span><strong>Registrado em:</strong> ${escapeHtml(vistoria.dataFoto)} às ${escapeHtml(vistoria.horaFoto)}</span>
          <span><strong>Responsável Técnico:</strong> ${escapeHtml(vistoria.responsavel || state.user?.nome || 'Responsável Técnico')}</span>
          ${
            vistoria.hashSha256
              ? `<span style="font-size: 11px; opacity: 0.85; font-family: monospace; word-break: break-all;">
                  <strong>SHA-256:</strong> ${escapeHtml(vistoria.hashSha256)}
                </span>`
              : `<span style="font-size: 11px; opacity: 0.85;">
                  <strong>SHA-256:</strong> Será consolidado no servidor após sincronização
                </span>`
          }
        </div>
      </div>

      <div class="bloqueado-status-rules-card">
        <div class="rule-status-row ${isOfflineQueue ? 'locked-state' : 'clickable'}" id="btnAbrirVisualizacao" style="${isOfflineQueue ? 'opacity: 0.65;' : ''}">
          <div class="rule-status-left">
            <span class="rule-icon-box" style="display:inline-flex; align-items:center; justify-content:center; color:#002D62;">${Icons.pdfDocument(17)}</span>
            <span class="rule-title-text">${
              isOfflineQueue ? 'PDF Oficial (Disponível após sincronização)' : 'Visualizar PDF Oficial (Carimbo BB)'
            }</span>
          </div>
          <div class="rule-arrow">
            ${
              isOfflineQueue
                ? '<span style="font-size: 11px; color: #94A3B8;">Offline</span>'
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`
            }
          </div>
        </div>

        <div class="rule-status-row locked-state" id="ruleEdicaoBloqueada">
          <div class="rule-status-left">
            <span class="rule-icon-box" style="display:inline-flex; align-items:center; justify-content:center; color:#64748B;">${Icons.lockInviolavel(17)}</span>
            <span class="rule-title-text">Edição bloqueada (Inviolabilidade)</span>
          </div>
          <div class="rule-arrow">
            <span style="font-size: 11px; color: #94A3B8;">Ativo</span>
          </div>
        </div>

        <div class="rule-status-row locked-state" id="ruleReenvioBloqueado">
          <div class="rule-status-left">
            <span class="rule-icon-box" style="display:inline-flex; align-items:center; justify-content:center; color:#64748B;">${Icons.shieldFePublica(17)}</span>
            <span class="rule-title-text">Reenvio vedado (Prevenção de duplicidade)</span>
          </div>
          <div class="rule-arrow">
            <span style="font-size: 11px; color: #94A3B8;">Ativo</span>
          </div>
        </div>
      </div>

      <div class="bloqueado-action-footer">
        ${
          !isOfflineQueue && vistoria.codigoUnico
            ? `<button class="btn-secondary-white" id="btnValidarFePublicaDoc" style="margin-bottom: 8px;">
                Validar Autenticidade (Fé Pública)
              </button>`
            : ''
        }
        <button class="btn-primary-bb-yellow" id="btnVoltarDashboard">
          Voltar para Minhas Obras
        </button>
      </div>
    </div>
  `;
}

export function bindRelatorioBloqueadoEvents() {
  document.getElementById('btnVoltarInicioBloqueado')?.addEventListener('click', () => {
    state.navigate('inicio', 'inicio');
  });

  document.getElementById('btnVoltarDashboard')?.addEventListener('click', () => {
    state.navigate('inicio', 'inicio');
  });

  document.getElementById('btnCopiarCodigoBloqueado')?.addEventListener('click', async () => {
    const cod = state.currentVistoria.codigoUnico;
    if (!cod) return;
    const ok = await copyToClipboard(cod);
    if (ok) {
      toast.success('Código Copiado', `Código ${cod} copiado para a área de transferência.`);
    }
  });

  document.getElementById('btnAbrirVisualizacao')?.addEventListener('click', () => {
    const relId = state.currentVistoria.relatorioId;
    if (!relId) {
      toast.info(
        'Aguardando Sincronização',
        'O relatório está na fila offline. Assim que a conexão retornar, o PDF oficial ficará disponível em Relatórios.'
      );
      return;
    }
    const pdfUrl = state.currentVistoria.pdfUrl || `/api/relatorios/${encodeURIComponent(relId)}/pdf`;
    modal.openPdfViewer({
      title: `Relatório BBVision • ${state.currentVistoria.obraNome || 'Vistoria'}`,
      pdfUrl,
      codigo: state.currentVistoria.codigoUnico,
      hash: state.currentVistoria.hashSha256,
    });
  });

  document.getElementById('btnValidarFePublicaDoc')?.addEventListener('click', () => {
    state.currentVistoria.codigoParaValidar = state.currentVistoria.codigoUnico;
    state.navigate('validador-publico');
  });

  document.querySelectorAll('.rule-status-row.locked-state').forEach(row => {
    if (row.id === 'btnAbrirVisualizacao') return;
    row.addEventListener('click', () => {
      toast.info(
        'Inviolabilidade Criptográfica Ativa',
        'Relatórios finalizados são selados por Hash SHA-256 e código único, impedindo qualquer alteração posterior.'
      );
    });
  });
}
