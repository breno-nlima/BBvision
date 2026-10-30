/**
 * BVision - Tela de Checklist de Verificação (Etapa 2 de 3)
 * Fiel aos prints de referência: WhatsApp Image 2026-10-08 at 11.43.17 (1).jpeg e 11.43.19.jpeg
 * Conforme Requisitos E3, E4 e HU04 do Documento Oficial TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';

export function renderChecklistVerificacao() {
  const vistoria = state.currentVistoria;
  const respostas = vistoria.respostas = vistoria.respostas || {};
  const user = state.user || { nome: 'Responsável Técnico', email: 'responsavel@empresa.com.br' };
  const responsavelNome = state.user?.nome || vistoria.responsavel || 'Responsável Técnico';
  const responsavelDoc = state.user?.registro_profissional || vistoria.matricula || 'CREA/CAU Cadastrado';

  const itensVerificacao = [
    { key: 'check1', num: 1, texto: 'A estrutura está conforme o projeto?' },
    { key: 'check2', num: 2, texto: 'Não há danos ou irregularidades visíveis?' },
    { key: 'check3', num: 3, texto: 'A sinalização de segurança está correta?' },
    { key: 'check4', num: 4, texto: 'A etapa da obra foi atualizada corretamente?' },
    { key: 'check5', num: 5, texto: 'O local está pronto para registro fotográfico in-loco?' }
  ];

  const totalMarcados = itensVerificacao.filter(item => Boolean(respostas[item.key])).length;
  const podeAvancar = totalMarcados >= 1;

  return `
    <div class="page-container fade-in" id="checklistVerificacaoPage">
      <!-- Header Superior com Indicador de Etapa e Barra de Progresso Amarela -->
      <header class="verificacao-topbar">
        <div class="verificacao-header-row">
          <div class="verificacao-title-group">
            <button class="btn-icon-simple-sm" id="btnVoltarChecklistDinamico" title="Voltar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h1 class="verificacao-title">Checklist de Verificação</h1>
          </div>
          <span class="etapa-indicator-text">etapa 1 de 3</span>
        </div>

        <div class="progress-bar-track">
          <div class="progress-bar-fill-yellow" style="width: 35%;"></div>
        </div>
      </header>

      <!-- Card do Código Único e Destino do E-mail -->
      <div class="verificacao-codigo-card">
        <span class="card-mini-label">Código Único</span>
        <div class="codigo-pill-highlight">
          ${vistoria.codigoUnico}
        </div>
        <p class="codigo-email-notice">
          Código vinculado a: ${user.email || 'responsavel@empresa.com.br'}
        </p>
      </div>

      <!-- Lista de Itens de Verificação Conforme o Gabarito Oficial (Inicia em branco) -->
      <div class="verificacao-checklist-card">
        <div class="checkbox-toolbar" style="margin-bottom: 10px;">
          <div class="toolbar-buttons-cluster">
            <button type="button" class="btn-quick-check" id="btnMarcarTodosVerificacao">Marcar Todos</button>
            <button type="button" class="btn-quick-check" id="btnLimparVerificacao">Limpar</button>
          </div>
          <span class="badge-selection-count" id="badgeVerificacaoCount">
            ${totalMarcados} de ${itensVerificacao.length} marcados
          </span>
        </div>

        <div class="checklist-items-list">
          ${itensVerificacao.map(item => {
            const isChecked = Boolean(respostas[item.key]);
            return `
              <div class="check-item-row" data-check="${item.key}" style="cursor: pointer;">
                <div class="item-number-circle">${item.num}</div>
                <p class="item-text">${item.texto}</p>
                <div class="custom-checkbox-btn ${isChecked ? 'checked' : ''}" id="chk_${item.key}">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Card do Responsável Técnico / Empreiteira -->
      <div class="responsavel-info-card" style="display: flex; align-items: center;">
        <div class="resp-avatar-badge" style="margin-right: 12px; display: flex; align-items: center;">
          ${Icons.perfilObras(42)}
        </div>
        <div class="resp-text-group" style="flex: 1;">
          <span class="resp-card-title">Responsável Técnico</span>
          <strong class="resp-nome">Nome: ${responsavelNome}</strong>
          <span class="resp-matricula" style="display: inline-flex; align-items: center; gap: 4px;">
            ${Icons.iconeCrea(14)} Registro/Doc: ${responsavelDoc}
          </span>
        </div>
        <div class="resp-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      <!-- Botão Amarelo de Continuação (Leva à Validação com Câmera & IA) -->
      <div class="verificacao-action-footer">
        <button class="btn-primary-bb-yellow" id="btnFinalizarChecklist" ${podeAvancar ? '' : 'disabled'}>
          Avançar para Câmera & IA →
        </button>
      </div>
    </div>
  `;
}

export function bindChecklistVerificacaoEvents() {
  const respostas = state.currentVistoria.respostas = state.currentVistoria.respostas || {};
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

  const btnVoltar = document.getElementById('btnVoltarChecklistDinamico');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('checklist-dinamico');
    });
  }

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

  const btnMarcarTodos = document.getElementById('btnMarcarTodosVerificacao');
  if (btnMarcarTodos) {
    btnMarcarTodos.addEventListener('click', () => {
      keys.forEach(k => { respostas[k] = true; });
      checkRows.forEach(row => {
        const chkBtn = row.querySelector('.custom-checkbox-btn');
        if (chkBtn) chkBtn.classList.add('checked');
      });
      atualizarEstadoVerificacao();
    });
  }

  const btnLimpar = document.getElementById('btnLimparVerificacao');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      keys.forEach(k => { respostas[k] = false; });
      checkRows.forEach(row => {
        const chkBtn = row.querySelector('.custom-checkbox-btn');
        if (chkBtn) chkBtn.classList.remove('checked');
      });
      atualizarEstadoVerificacao();
    });
  }

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
