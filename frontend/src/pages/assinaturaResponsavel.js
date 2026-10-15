/**
 * BVision - Tela de Assinatura do Responsável e Termo de Veracidade
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.19 (4).jpeg
 * Conforme Requisitos E4, HU06 e Padrões de Inviolabilidade do Documento Oficial TakeOff:
 * - Canvas de assinatura com caneta digital
 * - Senha de acesso e fé pública do operador
 * - Declaração de veracidade compulsória
 * - Finalização criptográfica com bloqueio de edições posteriores
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderAssinaturaResponsavel() {
  const vistoria = state.currentVistoria;

  return `
    <div class="page-container fade-in" id="assinaturaResponsavelPage">
      <!-- Header Superior com BVision e Banco do Brasil Oficial -->
      <header class="assinatura-topbar">
        <button class="btn-icon-simple-sm" id="btnVoltarVerificacao" title="Voltar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="assinatura-brands-row">
          <div class="brand-item">
            ${Icons.logoBVisionBadge(26)}
          </div>
          <div class="brand-item bb-official-badge">
            ${Icons.logoBBOficial(28)}
            <span class="bb-name-bold">Banco do Brasil</span>
          </div>
        </div>
      </header>

      <!-- Título da Tela -->
      <div class="assinatura-header-title">
        <h2>Assinatura do Responsável</h2>
      </div>

      <!-- Card do Canvas de Assinatura Digital -->
      <div class="assinatura-pad-card">
        <div class="canvas-wrapper">
          <canvas id="signatureCanvas" class="signature-canvas" width="340" height="180"></canvas>
          <div class="canvas-pen-indicator" id="penIndicator">
            <span class="pen-icon">✍️</span>
            <span class="pen-sample-sig">${vistoria.responsavel || 'Rodrigo Silva'}</span>
          </div>
        </div>
        <div class="canvas-caption-row">
          <span class="canvas-caption-text">Assine com o dedo ou mouse aqui</span>
          <button class="btn-clear-sig" id="btnClearSignature" title="Limpar Assinatura">Limpar</button>
        </div>
      </div>

      <!-- Card com Confirmação e Declaração de Fé Pública -->
      <div class="assinatura-declaracao-card">
        <div class="declaracao-inner-box">
          <div class="senha-field-group">
            <label class="senha-label">Digite sua senha de acesso</label>
            <input 
              type="password" 
              id="inputSenhaAssinatura" 
              class="senha-input" 
              placeholder="••••••••" 
              value="123456"
            />
          </div>

          <div class="declaracao-check-row" id="rowDeclaracao">
            <label class="declaracao-label-text">
              Declaro que as informações acima são verdadeiras
            </label>
            <div class="green-check-circle active" id="chkDeclaracao">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão Amarelo de Finalização Criptográfica -->
      <div class="assinatura-action-footer">
        <button class="btn-primary-bb-yellow" id="btnFinalizarEAssinar">
          Finalizar e Assinar
        </button>
      </div>
    </div>
  `;
}

export function bindAssinaturaResponsavelEvents() {
  const btnVoltar = document.getElementById('btnVoltarVerificacao');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('checklist-verificacao');
    });
  }

  // Interação do canvas de assinatura com mouse e toque
  const canvas = document.getElementById('signatureCanvas');
  const penIndicator = document.getElementById('penIndicator');
  const btnClear = document.getElementById('btnClearSignature');

  let isDrawing = false;
  let hasDrawn = false;

  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#002D62';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDraw(e) {
      isDrawing = true;
      hasDrawn = true;
      if (penIndicator) penIndicator.style.display = 'none';
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: true });
    window.addEventListener('touchend', stopDraw);

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (penIndicator) penIndicator.style.display = 'flex';
        hasDrawn = false;
      });
    }
  }

  // Alternar check de declaração
  const chkDeclaracao = document.getElementById('chkDeclaracao');
  if (chkDeclaracao) {
    chkDeclaracao.addEventListener('click', () => {
      chkDeclaracao.classList.toggle('active');
      state.currentVistoria.declaracaoAceita = chkDeclaracao.classList.contains('active');
    });
  }

  // Finalizar e Assinar com Processamento Criptográfico e Bloqueio
  const btnFinalizar = document.getElementById('btnFinalizarEAssinar');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', async () => {
      btnFinalizar.disabled = true;
      btnFinalizar.innerText = 'Processando e Bloqueando Relatório...';

      let sigData = null;
      if (canvas && hasDrawn) {
        sigData = canvas.toDataURL();
      }

      await state.finalizarVistoriaComAssinatura(sigData);
      
      // Avança para a tela de Relatório Bloqueado
      state.navigate('relatorio-bloqueado');
    });
  }
}
