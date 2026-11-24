/**
 * BBVision - Tela de Imagem Protegida / Inviolabilidade Criptográfica
 * Confirmação dos metadados invioláveis da captura fotográfica antes da assinatura digital.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';
import { escapeHtml, copyToClipboard } from '../utils/formatters.js';

export function renderImagemProtegida() {
  const vistoria = state.currentVistoria;
  const hashFoto = vistoria.hashSha256 || '';
  const codigoLabel = vistoria.codigoUnico || 'Gerado na assinatura digital';

  return `
    <div class="page-container fade-in" id="imagemProtegidaPage">
      <header class="imagem-protegida-topbar">
        <button class="btn-icon-simple" id="btnVoltarCamera" title="Voltar">
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

      <div class="protegida-header-title">
        <h2>Imagem Protegida</h2>
      </div>

      <div class="protegida-hero-card">
        <div class="protegida-badge-visual">
          ${Icons.lockShieldGold(110)}
        </div>

        <h3 class="protegida-subtitle">
          Foto registrada com proteção digital inviolável
        </h3>

        ${
          vistoria.validacaoManual
            ? `<span style="display:inline-block; margin-top:6px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; background:rgba(245,158,11,0.18); color:#FCD34D; border:1px solid rgba(245,158,11,0.45);">
                Validação Manual Assistida — Auditoria Humana pelo Fiscal
              </span>`
            : ''
        }

        ${
          vistoria.fotoCamera
            ? `
          <div style="margin: 12px auto 6px; max-width: 240px; border-radius: 10px; overflow: hidden; border: 2px solid #FED304; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <img src="${escapeHtml(vistoria.fotoCamera)}" alt="Foto protegida" style="width: 100%; height: 120px; object-fit: cover; display: block;" />
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
            <span class="proto-text">Data e hora carimbadas</span>
          </div>
          <div class="proto-code-tag">${escapeHtml(vistoria.dataFoto)} ${escapeHtml(vistoria.horaFoto)}</div>
        </div>

        <div class="protegida-item-row">
          <div class="protegida-item-left">
            <span class="analysis-status-dot concluido" aria-hidden="true"></span>
            <span class="proto-text">GPS registrado</span>
          </div>
          <div class="proto-code-tag">${escapeHtml(vistoria.localizacaoFoto || 'Registrado')}</div>
        </div>

        <div class="protegida-item-row" id="itemHashFoto" style="cursor: ${hashFoto ? 'pointer' : 'default'};" title="${hashFoto ? 'Toque para copiar hash SHA-256' : ''}">
          <div class="protegida-item-left">
            <span class="analysis-status-dot concluido" aria-hidden="true"></span>
            <span class="proto-text">Hash de verificação (SHA-256)</span>
          </div>
          <div class="proto-code-tag" style="font-family: monospace; font-size: 10.5px;">
            ${hashFoto ? escapeHtml(hashFoto.substring(0, 16) + '...') : 'Aplicado na finalização'}
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
    state.navigate('camera-ia');
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
      toast.info('Protocolo de Fé Pública', 'O código único de 16 caracteres será gerado assim que você concluir a assinatura digital.');
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
