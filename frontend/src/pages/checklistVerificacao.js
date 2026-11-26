/**
 * BBVision - Tela de Checklist de Verificação
 * Confirmação final de prontidão do local antes da captura fotográfica in-loco com IA.
 */

import { Icons } from '../assets/icons.js?v=2.5';
import { state } from '../services/state.js?v=2.5';
import { toast } from '../components/toast.js?v=2.5';
import { renderBackButton } from '../components/backButton.js?v=2.5';
import { escapeHtml } from '../utils/formatters.js?v=2.5';

export function renderChecklistVerificacao() {
  const vistoria = state.currentVistoria;
  const respostas = (vistoria.respostas = vistoria.respostas || {});
  const userEmail = state.user?.email || 'Não informado';
  const responsavelNome = state.user?.nome || vistoria.responsavel || 'Responsável Técnico';
  const responsavelDoc = state.user?.registro_profissional || vistoria.matricula || '';

  const itensVerificacao = [
    { key: 'check1', num: 1, texto: 'A estrutura está conforme o projeto?' },
    { key: 'check2', num: 2, texto: 'Não há danos ou irregularidades visíveis?' },
    { key: 'check3', num: 3, texto: 'A sinalização de segurança está correta?' },
    { key: 'check4', num: 4, texto: 'A etapa da obra foi atualizada corretamente?' },
    { key: 'check5', num: 5, texto: 'O local está pronto para registro fotográfico in-loco?' },
  ];

  const totalMarcados = itensVerificacao.filter(item => Boolean(respostas[item.key])).length;
  const podeAvancar = totalMarcados >= 1;

  return `
    <div class="page-container page-narrow fade-in" id="checklistVerificacaoPage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarChecklistDinamico',
            label: 'Voltar',
            variant: 'light',
            title: 'Voltar para Checklist Complementar',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">Verificação Pré-Captura</h1>
            <span class="screen-topbar-sub">Confirme a prontidão do canteiro antes de abrir a câmera</span>
          </div>
        </div>
        <span class="screen-step-pill">Pré-Câmera</span>
      </header>

      <div class="verificacao-checklist-card">
        <div class="checkbox-toolbar" style="margin-bottom: 12px;">
          <div class="toolbar-buttons-cluster">
            <button type="button" class="btn-quick-check" id="btnMarcarTodosVerificacao">Marcar todos</button>
            <button type="button" class="btn-quick-check" id="btnLimparVerificacao">Limpar</button>
          </div>
          <span class="badge-selection-count" id="badgeVerificacaoCount">
            ${totalMarcados} de ${itensVerificacao.length} marcados
          </span>
        </div>

        <div class="checklist-items-list">
          ${itensVerificacao
            .map(item => {
              const isChecked = Boolean(respostas[item.key]);
              return `
              <div class="check-item-row" data-check="${item.key}" style="cursor: pointer;">
                <div class="item-number-circle">${item.num}</div>
                <p class="item-text">${escapeHtml(item.texto)}</p>
                <div class="custom-checkbox-btn ${isChecked ? 'checked' : ''}" id="chk_${item.key}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <div class="responsavel-info-card">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${Icons.perfilObras(38)}
          <div class="resp-text-group">
            <strong class="resp-nome">${escapeHtml(responsavelNome)}</strong>
            <span class="resp-matricula">${escapeHtml(userEmail)}${responsavelDoc ? ` • ${escapeHtml(responsavelDoc)}` : ''}</span>
          </div>
        </div>
      </div>

      <div class="verificacao-action-footer">
        <button class="btn-primary-bb-yellow" id="btnFinalizarChecklist" ${podeAvancar ? '' : 'disabled'}>
          Avançar para Câmera & IA →
        </button>
      </div>
    </div>
  `;
}

export function bindChecklistVerificacaoEvents() {
  const respostas = (state.currentVistoria.respostas = state.currentVistoria.respostas || {});
  const btnFinalizar = document.getElementById('btnFinalizarChecklist');
  const badgeCount = document.getElementById('badgeVerificacaoCount');
  const checkRows = document.querySelectorAll('.check-item-row');
  const keys = ['check1', 'check2', 'check3', 'check4', 'check5'];

  function atualizarEstadoVerificacao() {
    const marcados = keys.filter(k => Boolean(respostas[k])).length;
    if (badgeCount) {
      badgeCount.innerText = `${marcados} de ${keys.length} marcados`;
    }
    if (btnFinalizar) {
      btnFinalizar.disabled = marcados < 1;
    }
  }

  document.getElementById('btnVoltarChecklistDinamico')?.addEventListener('click', () => {
    state.navigate('checklist-dinamico', null, { replace: true });
  });

  checkRows.forEach(row => {
    row.addEventListener('click', () => {
      const key = row.getAttribute('data-check');
      const chkBtn = row.querySelector('.custom-checkbox-btn');
      if (!key || !chkBtn) return;
      const novoValor = !chkBtn.classList.contains('checked');
      chkBtn.classList.toggle('checked', novoValor);
      respostas[key] = novoValor;
      atualizarEstadoVerificacao();
    });
  });

  document.getElementById('btnMarcarTodosVerificacao')?.addEventListener('click', () => {
    keys.forEach(k => {
      respostas[k] = true;
    });
    checkRows.forEach(row => {
      const chkBtn = row.querySelector('.custom-checkbox-btn');
      if (chkBtn) chkBtn.classList.add('checked');
    });
    atualizarEstadoVerificacao();
  });

  document.getElementById('btnLimparVerificacao')?.addEventListener('click', () => {
    keys.forEach(k => {
      respostas[k] = false;
    });
    checkRows.forEach(row => {
      const chkBtn = row.querySelector('.custom-checkbox-btn');
      if (chkBtn) chkBtn.classList.remove('checked');
    });
    atualizarEstadoVerificacao();
  });

  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      if (btnFinalizar.disabled) {
        toast.warning('Seleção Obrigatória', 'Marque pelo menos um item do checklist de verificação antes de avançar.');
        return;
      }
      state.navigate('camera-ia');
    });
  }
}
