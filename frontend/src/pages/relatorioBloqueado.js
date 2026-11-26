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
import { renderBackButton } from '../components/backButton.js';
import { escapeHtml, normalizeImageSrc, NEUTRAL_PHOTO_PLACEHOLDER, copyToClipboard } from '../utils/formatters.js';

export function renderRelatorioBloqueado() {
  const vistoria = state.currentVistoria;
  const isOfflineQueue = !vistoria.relatorioId;

  const rawImg = vistoria.fotoCamera || vistoria.fotoBase64 || vistoria.caminhoArquivoFoto || '';
  const fotoSrc = normalizeImageSrc(rawImg, NEUTRAL_PHOTO_PLACEHOLDER);

  return `
    <div class="page-container page-narrow fade-in" id="relatorioBloqueadoPage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarInicioBloqueado',
            label: 'Início',
            variant: 'light',
            title: 'Voltar para a tela inicial',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">${isOfflineQueue ? 'Relatório em Fila Offline' : 'Relatório Concluído'}</h1>
            <span class="screen-topbar-sub">${escapeHtml(vistoria.obraNome || 'Vistoria selada com Fé Pública')}</span>
          </div>
        </div>
        <span class="status-badge-chip concluido">${isOfflineQueue ? 'Fila local' : 'Selado'}</span>
      </header>

      <div class="bloqueado-hero-section">
        <div class="box-locked-visual" style="margin-bottom: 8px;">
          ${Icons.boxLocked3D(56)}
        </div>
        <p class="bloqueado-warning-text">
          ${
            isOfflineQueue
              ? 'Vistoria assinada e salva localmente. O PDF definitivo será emitido automaticamente ao reconectar.'
              : 'Relatório formalmente concluído e protegido contra edições ou reenvios.'
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

      <div class="bloqueado-protocolo-card">
        <div class="proto-card-top-row">
          <span class="proto-card-label">${isOfflineQueue ? 'Código provisório (Offline)' : 'Código Oficial de Fé Pública'}</span>
          <button type="button" class="proto-dots-btn" id="btnCopiarCodigoBloqueado" title="Copiar Código">
            Copiar código
          </button>
        </div>

        <div class="proto-codigo-val" id="lblCodigoBloqueado">
          ${escapeHtml(vistoria.codigoUnico || 'Pendente')}
        </div>

        <div class="proto-meta-data">
          <span><strong>Data e hora:</strong> ${escapeHtml(vistoria.dataFoto)} às ${escapeHtml(vistoria.horaFoto)}</span>
          <span><strong>Responsável:</strong> ${escapeHtml(vistoria.responsavel || state.user?.nome || 'Responsável Técnico')}</span>
          ${
            vistoria.hashSha256
              ? `<span style="font-size: 11px; opacity: 0.88; font-family: ui-monospace, Consolas, monospace; word-break: break-all;">
                  <strong>SHA-256:</strong> ${escapeHtml(vistoria.hashSha256)}
                </span>`
              : `<span style="font-size: 11px; opacity: 0.85;">
                  <strong>SHA-256:</strong> Consolidado após sincronização com o servidor
                </span>`
          }
        </div>
      </div>

      <div class="bloqueado-status-rules-card">
        <div style="display: flex; align-items: center; gap: 14px; padding: 4px 0 12px 0; border-bottom: 1px solid #F1F5F9;">
          <img
            src="${escapeHtml(fotoSrc)}"
            alt="Foto capturada na vistoria"
            style="width: 84px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0; flex-shrink: 0;"
          />
          <div style="min-width: 0; flex: 1;">
            <strong style="display: block; font-size: 13px; color: #002D62;">Evidência fotográfica anexada</strong>
            <span style="font-size: 12px; color: #64748B;">${escapeHtml(vistoria.motivoIA || 'Capturada ao vivo in-loco')}</span>
          </div>
        </div>

        <div class="rule-status-row ${isOfflineQueue ? 'locked-state' : 'clickable'}" id="btnAbrirVisualizacao" style="${isOfflineQueue ? 'opacity: 0.6;' : ''}">
          <div class="rule-status-left">
            <span style="display:inline-flex; align-items:center; color:#002D62;">${Icons.pdfDocument(18)}</span>
            <span class="rule-title-text" style="font-weight: 700; color: #002D62;">${
              isOfflineQueue ? 'PDF Oficial (disponível após sincronização)' : 'Visualizar PDF Oficial com Carimbo BB'
            }</span>
          </div>
          <div class="rule-arrow">
            ${isOfflineQueue ? '<span style="font-size: 11px; color: #94A3B8;">Offline</span>' : Icons.chevronRight(16)}
          </div>
        </div>
      </div>

      <div class="bloqueado-security-strip locked-state" id="ruleEdicaoBloqueada" style="cursor: pointer;">
        ${Icons.lockInviolavel(15, '#64748B')}
        <span>Edição e reenvio bloqueados permanentemente por integridade criptográfica SHA-256.</span>
      </div>

      <div class="bloqueado-action-footer">
        ${
          !isOfflineQueue && vistoria.codigoUnico
            ? `<button type="button" class="btn-secondary-white" id="btnValidarFePublicaDoc">
                Validar Autenticidade no Portal Público
              </button>`
            : ''
        }
        <button class="btn-primary-bb-yellow" id="btnVoltarDashboard">
          Ir para Minhas Obras
        </button>
      </div>
    </div>
  `;
}

export function bindRelatorioBloqueadoEvents() {
  document.getElementById('btnVoltarInicioBloqueado')?.addEventListener('click', () => {
    state.navigate('inicio', 'inicio', { clearHistory: true });
  });

  document.getElementById('btnVoltarDashboard')?.addEventListener('click', () => {
    state.navigate('obras', 'obras', { clearHistory: true });
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

  document.querySelectorAll('.locked-state').forEach(row => {
    if (row.id === 'btnAbrirVisualizacao') return;
    row.addEventListener('click', () => {
      toast.info(
        'Inviolabilidade Criptográfica Ativa',
        'Relatórios finalizados são selados por Hash SHA-256 e código único, impedindo qualquer alteração posterior.'
      );
    });
  });
}
