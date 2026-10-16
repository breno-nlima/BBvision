/**
 * BVision - Tela de Checklist de Verificação (Etapa 2 de 3)
 * Fiel aos prints de referência: WhatsApp Image 2026-10-08 at 11.43.17 (1).jpeg e 11.43.19.jpeg
 * Conforme Requisitos E3, E4 e HU04 do Documento Oficial TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderChecklistVerificacao() {
  const vistoria = state.currentVistoria;
  const user = state.user || { nome: 'Responsável Técnico', email: 'responsavel@empresa.com.br' };
  const responsavelNome = state.user?.nome || vistoria.responsavel || 'Responsável Técnico';
  const responsavelDoc = state.user?.registro_profissional || vistoria.matricula || 'CREA/CAU Cadastrado';

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
          <span class="etapa-indicator-text">etapa 2 de 3</span>
        </div>

        <div class="progress-bar-track">
          <div class="progress-bar-fill-yellow" style="width: 66%;"></div>
        </div>
      </header>

      <!-- Card do Código Único e Destino do E-mail -->
      <div class="verificacao-codigo-card">
        <span class="card-mini-label">Codigo Único</span>
        <div class="codigo-pill-highlight">
          ${vistoria.codigoUnico}
        </div>
        <p class="codigo-email-notice">
          Codigo enviado para: ${user.email || 'responsavel@empresa.com.br'}
        </p>
      </div>

      <!-- Lista de Itens de Verificação Conforme o Gabarito Oficial -->
      <div class="verificacao-checklist-card">
        <div class="checklist-items-list">
          <!-- Item 1 -->
          <div class="check-item-row" data-check="check1">
            <div class="item-number-circle">1</div>
            <p class="item-text">A estrutura está conforme o projeto?</p>
            <div class="custom-checkbox-btn checked" id="chkItem1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <!-- Item 2 -->
          <div class="check-item-row" data-check="check2">
            <div class="item-number-circle">2</div>
            <p class="item-text">Não há danos ou irregularidades visíveis?</p>
            <div class="custom-checkbox-btn checked" id="chkItem2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <!-- Item 3 -->
          <div class="check-item-row" data-check="check3">
            <div class="item-number-circle">3</div>
            <p class="item-text">A sinalização de segurança está correta?</p>
            <div class="custom-checkbox-btn checked" id="chkItem3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <!-- Item 4 -->
          <div class="check-item-row" data-check="check4">
            <div class="item-number-circle">4</div>
            <p class="item-text">A etapa da obra foi atualizada corretamente?</p>
            <div class="custom-checkbox-btn checked" id="chkItem4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <!-- Item 5 -->
          <div class="check-item-row" data-check="check5">
            <div class="item-number-circle">5</div>
            <p class="item-text">A foto registra claramente o ponto fiscalizado?</p>
            <div class="custom-checkbox-btn checked" id="chkItem5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Card do Responsável Técnico / Empreiteira -->
      <div class="responsavel-info-card">
        <div class="resp-text-group">
          <span class="resp-card-title">Responsável</span>
          <strong class="resp-nome">Nome: ${responsavelNome}</strong>
          <span class="resp-matricula">Registro/Doc: ${responsavelDoc}</span>
        </div>
        <div class="resp-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      <!-- Botão Amarelo de Finalização (Leva à Assinatura) -->
      <div class="verificacao-action-footer">
        <button class="btn-primary-bb-yellow" id="btnFinalizarChecklist">
          FINALIZAR
        </button>
      </div>
    </div>
  `;
}

export function bindChecklistVerificacaoEvents() {
  const btnVoltar = document.getElementById('btnVoltarChecklistDinamico');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('checklist-dinamico');
    });
  }

  // Checkboxes interativos
  const checkButtons = document.querySelectorAll('.custom-checkbox-btn');
  checkButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('checked');
    });
  });

  const btnFinalizar = document.getElementById('btnFinalizarChecklist');
  if (btnFinalizar) {
    btnFinalizar.addEventListener('click', () => {
      // Avança para a tela de Assinatura do Responsável
      state.navigate('assinatura-responsavel');
    });
  }
}
