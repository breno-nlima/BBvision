/**
 * BBVision - Tela de Imagem Protegida / Inviolabilidade Criptográfica
 * Confirmação dos metadados invioláveis da captura fotográfica antes da assinatura digital.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';
import { renderBackButton } from '../components/backButton.js';
import { escapeHtml, copyToClipboard } from '../utils/formatters.js';

export function renderImagemProtegida() {
  const vistoria = state.currentVistoria;
  const hashFoto = vistoria.hashSha256 || '';
  const codigoLabel = vistoria.codigoUnico || 'Emitido na assinatura';

  return `
    <div class="page-container page-narrow fade-in" id="imagemProtegidaPage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarCamera',
            label: 'Voltar',
            variant: 'light',
            title: 'Voltar para a Câmera',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">Imagem Protegida</h1>
            <span class="screen-topbar-sub">Metadados e integridade criptográfica registrados</span>
          </div>
        </div>
        <span class="screen-step-pill">Evidência</span>
      </header>

      <div class="protegida-hero-card">
        <div class="protegida-badge-visual" style="margin-bottom: 10px;">
          ${Icons.lockShieldGold(56)}
        </div>

        <h2 class="protegida-subtitle" style="margin-bottom: 4px;">
          Evidência registrada com proteção inviolável
        </h2>

        ${
          vistoria.validacaoManual
            ? `<span style="display:inline-block; margin-top:4px; padding:4px 10px; border-radius:999px; font-size:11.5px; font-weight:700; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A;">
                Validação Manual Assistida — Auditoria Humana pelo Fiscal
              </span>`
            : ''
        }

        ${
          vistoria.fotoCamera
            ? `
          <div class="protegida-photo-frame">
            <img src="${escapeHtml(vistoria.fotoCamera)}" alt="Foto protegida da vistoria" />
          </div>
        `
            : ''
        }
      </div>

      <div class="protegida-checklist-box">
        <div class="protegida-item-row" id="itemCodigoUnico" style="cursor: pointer;">
          <div class="protegida-item-left">
            <span class="analysis-status-dot concluido" aria-hidden="true"></span>
            <span class="proto-text">Protocolo de Fé Pública</span>
          </div>
          <div class="proto-code-tag">${escapeHtml(codigoLabel)}</div>
        </div>

        <div class="protegida-item-row">
          <div class="protegida-item-left">
            <span class="analysis-status-dot concluido" aria-hidden="true"></span>
            <span class="proto-text">Data e hora</span>
          </div>
          <div class="proto-code-tag">${escapeHtml(vistoria.dataFoto)} • ${escapeHtml(vistoria.horaFoto)}</div>
        </div>

        <div class="protegida-item-row">
          <div class="protegida-item-left">
            <span class="analysis-status-dot concluido" aria-hidden="true"></span>
            <span class="proto-text">Geolocalização</span>
          </div>
          <div class="proto-code-tag" style="max-width: 58%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(vistoria.localizacaoFoto || 'Registrada')}</div>
        </div>

        <div class="protegida-item-row" id="itemHashFoto" style="cursor: ${hashFoto ? 'pointer' : 'default'};" title="${hashFoto ? 'Toque para copiar hash SHA-256' : ''}">
          <div class="protegida-item-left">
            <span class="analysis-status-dot concluido" aria-hidden="true"></span>
            <span class="proto-text">Hash SHA-256</span>
          </div>
          <div class="proto-code-tag" style="font-family: ui-monospace, Consolas, monospace;">
            ${hashFoto ? escapeHtml(hashFoto.substring(0, 16) + '…') : 'Aplicado na conclusão'}
          </div>
        </div>
      </div>

      <div class="protegida-action-footer">
        <button class="btn-primary-bb-yellow" id="btnContinuarChecklist">
          Avançar para Assinatura →
        </button>
      </div>
    </div>
  `;
}

export function bindImagemProtegidaEvents() {
  document.getElementById('btnVoltarCamera')?.addEventListener('click', () => {
    state.navigate('camera-ia', null, { replace: true });
  });

  document.getElementById('btnContinuarChecklist')?.addEventListener('click', () => {
    if (!state.currentVistoria.fotoCamera) {
      toast.warning('Foto Obrigatória', 'Capture uma foto válida da obra antes de prosseguir para a assinatura.');
      state.navigate('camera-ia');
      return;
    }
    state.navigate('assinatura-responsavel');
  });

  document.getElementById('itemCodigoUnico')?.addEventListener('click', async () => {
    const cod = state.currentVistoria.codigoUnico;
    if (!cod) {
      toast.info(
        'Protocolo de Fé Pública',
        'O código único de 16 caracteres será gerado assim que você concluir a assinatura digital.'
      );
      return;
    }
    const ok = await copyToClipboard(cod);
    if (ok) {
      toast.info('Código Copiado', `Protocolo ${cod} copiado para a área de transferência.`);
    }
  });

  document.getElementById('itemHashFoto')?.addEventListener('click', async () => {
    const hash = state.currentVistoria.hashSha256;
    if (!hash) return;
    const ok = await copyToClipboard(hash);
    if (ok) {
      toast.info('Hash Copiado', 'Hash SHA-256 da evidência fotográfica copiado.');
    }
  });
}
