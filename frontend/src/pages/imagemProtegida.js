/**
 * BVision - Tela de Imagem Protegida / Inviolabilidade Criptográfica
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.19 (1).jpeg
 * Conforme Requisitos E4, HU06 e Regras de Integridade do Documento Oficial TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderImagemProtegida() {
  const vistoria = state.currentVistoria;

  return `
    <div class="page-container fade-in" id="imagemProtegidaPage">
      <!-- Header Superior com Voltar e Logo BVision -->
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

      <!-- Título Principal -->
      <div class="protegida-header-title">
        <h2>Imagem Protegida</h2>
      </div>

      <!-- Card Central do Cadeado Dourado / Holograma Inviolável -->
      <div class="protegida-hero-card">
        <div class="protegida-badge-visual">
          ${Icons.lockShieldGold(110)}
        </div>
        
        <h3 class="protegida-subtitle">
          Foto registrada com proteção digital inviolável
        </h3>
        
        <div class="carousel-dots-mini">
          <span class="dot-mini active"></span>
          <span class="dot-mini"></span>
          <span class="dot-mini"></span>
          <span class="dot-mini"></span>
          <span class="dot-mini"></span>
        </div>
      </div>

      <!-- Card com os 4 Pilares de Integridade Jurídica e Digital -->
      <div class="protegida-checklist-box">
        <div class="protegida-item-row" id="itemCodigoUnico">
          <div class="protegida-item-left">
            <span class="proto-symbol">◇</span>
            <span class="proto-text">Código único gravado</span>
          </div>
          <div class="proto-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="protegida-item-row">
          <div class="protegida-item-left">
            <span class="proto-symbol">🛡️</span>
            <span class="proto-text">Data e hora carimbadas</span>
          </div>
          <div class="proto-code-tag">${vistoria.dataFoto} ${vistoria.horaFoto}</div>
        </div>

        <div class="protegida-item-row">
          <div class="protegida-item-left">
            <span class="proto-symbol">📍</span>
            <span class="proto-text">GPS registrado</span>
          </div>
          <div class="proto-code-tag">${vistoria.localizacaoFoto}</div>
        </div>

        <div class="protegida-item-row">
          <div class="protegida-item-left">
            <span class="proto-symbol">🔒</span>
            <span class="proto-text">Hash de verificação aplicado</span>
          </div>
          <div class="proto-code-tag">SHA-256</div>
        </div>
      </div>

      <!-- Botão Amarelo de Continuação -->
      <div class="protegida-action-footer">
        <button class="btn-primary-bb-yellow" id="btnContinuarChecklist">
          Continuar
        </button>
      </div>
    </div>
  `;
}

export function bindImagemProtegidaEvents() {
  const btnVoltar = document.getElementById('btnVoltarCamera');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('camera-ia');
    });
  }

  const btnContinuar = document.getElementById('btnContinuarChecklist');
  if (btnContinuar) {
    btnContinuar.addEventListener('click', () => {
      // Avança para a tela de Pergunta do Checklist
      state.navigate('checklist-pergunta');
    });
  }

  const itemCodigo = document.getElementById('itemCodigoUnico');
  if (itemCodigo) {
    itemCodigo.addEventListener('click', () => {
      alert(`Código Único Inviolável:\n${state.currentVistoria.codigoUnico} (${state.currentVistoria.codigoHexDoc})\nHash SHA-256:\n${state.currentVistoria.hashSha256}`);
    });
  }
}
