/**
 * BBVision - Tela de Assinatura do Responsável e Termo de Veracidade
 * - Canvas de assinatura digital obrigatória
 * - Validação real de senha de acesso no servidor (bcrypt)
 * - Declaração de veracidade compulsória
 * - Finalização criptográfica com geração de PDF oficial, código único e bloqueio permanente
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';
import { renderBackButton } from '../components/backButton.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderAssinaturaResponsavel() {
  const vistoria = state.currentVistoria;
  const declaracaoAceita = Boolean(vistoria.declaracaoAceita);
  const nomeResponsavel = state.user?.nome || vistoria.responsavel || 'Assinatura Digital';

  return `
    <div class="page-container page-narrow fade-in" id="assinaturaResponsavelPage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarVerificacao',
            label: 'Voltar',
            variant: 'light',
            title: 'Voltar para Imagem Protegida',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">Assinatura do Responsável</h1>
            <span class="screen-topbar-sub">${escapeHtml(vistoria.obraNome || 'Vistoria')} • Selagem e bloqueio do laudo</span>
          </div>
        </div>
        <span class="screen-step-pill">Finalização</span>
      </header>

      <div class="assinatura-pad-card">
        <div class="canvas-wrapper">
          <canvas id="signatureCanvas" class="signature-canvas" width="340" height="180" style="touch-action: none;"></canvas>
          <div class="canvas-pen-indicator" id="penIndicator">
            <span class="pen-icon" style="display:inline-flex; align-items:center;">${Icons.penAssinatura(20)}</span>
            <span class="pen-sample-sig">${escapeHtml(nomeResponsavel)}</span>
          </div>
        </div>
        <div class="canvas-caption-row">
          <span class="canvas-caption-text">Assine com o dedo ou mouse no quadro acima</span>
          <button type="button" class="btn-clear-sig" id="btnClearSignature" title="Limpar Assinatura">Limpar traço</button>
        </div>
      </div>

      <div class="assinatura-declaracao-card">
        <div class="declaracao-inner-box">
          <div class="senha-field-group">
            <label class="senha-label" for="inputSenhaAssinatura">Confirme sua senha de acesso</label>
            <input
              type="password"
              id="inputSenhaAssinatura"
              class="senha-input"
              placeholder="Digite sua senha cadastrada"
              value=""
              autocomplete="current-password"
              required
            />
          </div>

          <div class="declaracao-check-row" id="rowDeclaracao" style="cursor: pointer; border-top: 1px solid #F1F5F9; padding-top: 12px;">
            <label class="declaracao-label-text" style="cursor: pointer;">
              Declaro que as informações e evidências registradas são verdadeiras
            </label>
            <div class="green-check-circle ${declaracaoAceita ? 'active' : ''}" id="chkDeclaracao">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="assinatura-action-footer">
        <button class="btn-primary-bb-yellow" id="btnFinalizarEAssinar" ${declaracaoAceita ? '' : 'disabled'}>
          Finalizar e Concluir Relatório
        </button>
      </div>

      <div class="vistoria-modal-overlay hidden" id="modalConfirmarConclusaoRelatorio">
        <div class="vistoria-modal-card">
          <div style="margin-bottom: 10px; display:flex; justify-content:center;">${Icons.lockShieldGold(48)}</div>
          <h3 style="color: #002D72; font-size: 17px; margin-bottom: 8px;">Concluir Relatório de Vistoria?</h3>
          <p style="font-size: 13.5px; color: #334155; line-height: 1.5; font-weight: 500;">
            Tem certeza que deseja concluir este relatório? Após a confirmação ele será selado criptograficamente e não poderá mais ser alterado.
          </p>
          <div style="display: flex; gap: 10px; margin-top: 18px;">
            <button type="button" class="btn-secondary-white" id="btnCancelarConclusaoModal" style="flex: 1;">
              Revisar Relatório
            </button>
            <button type="button" class="btn-submit-primary" id="btnConfirmarConclusaoModal" style="flex: 1.2;">
              Sim, Concluir Relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindAssinaturaResponsavelEvents() {
  document.getElementById('btnVoltarVerificacao')?.addEventListener('click', () => {
    state.navigate('imagem-protegida', null, { replace: true });
  });

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
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }

    function startDraw(e) {
      isDrawing = true;
      hasDrawn = true;
      if (canvas.setPointerCapture && e.pointerId !== undefined) {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
      if (penIndicator) penIndicator.style.display = 'none';
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      // Garante registro mesmo em toque curto
      ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
      ctx.stroke();
    }

    function draw(e) {
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function stopDraw(e) {
      if (!isDrawing) return;
      isDrawing = false;
      if (canvas.releasePointerCapture && e && e.pointerId !== undefined) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    }

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);

    btnClear?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (penIndicator) penIndicator.style.display = 'flex';
      hasDrawn = false;
    });
  }

  const rowDeclaracao = document.getElementById('rowDeclaracao');
  const chkDeclaracao = document.getElementById('chkDeclaracao');
  const inputSenha = document.getElementById('inputSenhaAssinatura');
  const btnFinalizar = document.getElementById('btnFinalizarEAssinar');
  const modalConfirmar = document.getElementById('modalConfirmarConclusaoRelatorio');
  const btnCancelarModal = document.getElementById('btnCancelarConclusaoModal');
  const btnConfirmarModal = document.getElementById('btnConfirmarConclusaoModal');

  if (rowDeclaracao && chkDeclaracao) {
    rowDeclaracao.addEventListener('click', () => {
      chkDeclaracao.classList.toggle('active');
      const ativo = chkDeclaracao.classList.contains('active');
      state.currentVistoria.declaracaoAceita = ativo;
      if (btnFinalizar) btnFinalizar.disabled = !ativo;
    });
  }

  btnFinalizar?.addEventListener('click', () => {
    if (!hasDrawn) {
      toast.warning('Assinatura Obrigatória', 'Desenhe sua assinatura no quadro acima antes de concluir.');
      return;
    }
    if (!state.currentVistoria.declaracaoAceita) {
      toast.warning('Declaração Obrigatória', 'Marque a declaração de veracidade das informações antes de concluir.');
      return;
    }
    const senhaDigitada = (inputSenha?.value || '').trim();
    if (senhaDigitada.length < 4) {
      toast.warning('Senha Obrigatória', 'Confirme sua senha de acesso antes de assinar e selar o relatório.');
      inputSenha?.focus();
      return;
    }
    if (modalConfirmar) {
      modalConfirmar.classList.remove('hidden');
    }
  });

  btnCancelarModal?.addEventListener('click', () => {
    modalConfirmar?.classList.add('hidden');
  });

  btnConfirmarModal?.addEventListener('click', async () => {
    const senhaDigitada = (inputSenha?.value || '').trim();
    const originalModalText = btnConfirmarModal.innerText;
    const originalBtnText = btnFinalizar ? btnFinalizar.innerText : '';

    btnConfirmarModal.disabled = true;
    btnConfirmarModal.innerText = 'Validando e Selando...';
    if (btnFinalizar) {
      btnFinalizar.disabled = true;
      btnFinalizar.innerText = 'Concluindo e Gerando PDF...';
    }

    const sigData = canvas && hasDrawn ? canvas.toDataURL('image/png') : null;

    try {
      const res = await state.finalizarVistoriaComAssinatura(sigData, senhaDigitada);
      modalConfirmar?.classList.add('hidden');

      if (res && res.offline) {
        toast.warning(
          'Salvo em Fila Offline',
          'Sem conexão com o servidor. O relatório assinado foi armazenado e será sincronizado automaticamente ao retornar a rede.'
        );
      } else {
        toast.success(
          'Relatório Concluído e Selado',
          'PDF oficial gerado com código único, assinatura digital e hash SHA-256.'
        );
      }

      state.navigate('relatorio-bloqueado', null, { clearHistory: true });
    } catch (err) {
      modalConfirmar?.classList.add('hidden');
      btnConfirmarModal.disabled = false;
      btnConfirmarModal.innerText = originalModalText;
      if (btnFinalizar) {
        btnFinalizar.disabled = !state.currentVistoria.declaracaoAceita;
        btnFinalizar.innerText = originalBtnText;
      }
      toast.error('Falha ao Concluir Relatório', err.message || 'Verifique sua senha de acesso e tente novamente.');
      if (err.status === 401 && inputSenha) {
        inputSenha.value = '';
        inputSenha.focus();
      }
    }
  });
}
