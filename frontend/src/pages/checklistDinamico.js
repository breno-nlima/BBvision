/**
 * BVision - Tela de Checklist Dinâmico com Sugestões de IA
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.19 (2).jpeg
 * Conforme Requisitos E3, HU04, P3 e Regras de Governança da IA do Documento Oficial TakeOff:
 * - Sugestão técnica gerada pelo Google Gemini 1.5 Flash (Prompt P3)
 * - Princípio Human-in-the-loop com aviso mandatória "Revise antes de enviar"
 * - Editabilidade total pelo operador de campo
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { api } from '../services/api.js';

export function renderChecklistDinamico() {
  const vistoria = state.currentVistoria;
  const respostas = vistoria.respostas;

  return `
    <div class="page-container fade-in" id="checklistDinamicoPage">
      <!-- Header Superior Azul Marinho BB com Logo e Título -->
      <header class="checklist-blue-topbar">
        <div class="topbar-left-brand">
          <button class="btn-back-white-icon" id="btnVoltarPerguntaAnterior" title="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="bvision-white-title">
            <span class="bb-eye-badge">${Icons.logoBVision(24)}</span>
            <span class="brand-name-white">BVision</span>
            <span class="page-title-white">Checklist</span>
          </div>
        </div>
        <button class="btn-dots-white" id="btnChecklistOpcoes" title="Opções">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </header>

      <!-- Corpo do Checklist em Cartão Arredondado Branco -->
      <div class="checklist-sheet-container">
        <!-- Item 1: Condição da sinalização (Sim / Não / Parcial) -->
        <div class="field-card-box">
          <div class="field-card-header">
            <label class="field-title">Condição da sinalização</label>
            <span class="field-chevron">▼</span>
          </div>
          <div class="pill-segmented-control">
            <button class="seg-btn ${respostas.sinalizacao === 'Sim' ? 'active' : ''}" data-val="Sim">Sim</button>
            <button class="seg-btn ${respostas.sinalizacao === 'Não' ? 'active' : ''}" data-val="Não">Não</button>
            <button class="seg-btn ${respostas.sinalizacao === 'Parcial' ? 'active' : ''}" data-val="Parcial">Parcial</button>
          </div>
        </div>

        <!-- Linha Dupla: Avaliação da Limpeza e Estrelas -->
        <div class="fields-dual-row">
          <div class="field-card-box half-card">
            <div class="field-card-header">
              <label class="field-title">Avaliação da</label>
              <span class="field-chevron">▼</span>
            </div>
            <div class="badge-step-item">
              <span class="step-num-circle">1</span>
              <span class="step-label">da limpeza</span>
            </div>
          </div>

          <div class="field-card-box half-card">
            <div class="field-card-header">
              <label class="field-title">limpeza</label>
              <span class="field-chevron">▼</span>
            </div>
            <div class="stars-rating-container" id="starsContainer">
              <span class="star-gold ${respostas.limpeza >= 1 ? 'active' : ''}" data-star="1">★</span>
              <span class="star-gold ${respostas.limpeza >= 2 ? 'active' : ''}" data-star="2">★</span>
              <span class="star-gold ${respostas.limpeza >= 3 ? 'active' : ''}" data-star="3">★</span>
              <span class="star-gold ${respostas.limpeza >= 4 ? 'active' : ''}" data-star="4">★</span>
              <span class="star-gold ${respostas.limpeza >= 5 ? 'active' : ''}" data-star="5">★</span>
            </div>
          </div>
        </div>

        <!-- Item 3: Quantidade de Câmeras -->
        <div class="field-card-box">
          <div class="field-card-header">
            <label class="field-title">Quantidade de câmeras</label>
            <span class="field-chevron">▼</span>
          </div>
          <div class="number-picker-bar">
            <div class="picker-check-badge">✓</div>
            <button class="num-chip ${respostas.cameras === 1 ? 'selected' : ''}" data-num="1">1</button>
            <button class="num-chip ${respostas.cameras === 2 ? 'selected' : ''}" data-num="2">2</button>
            <button class="num-chip ${respostas.cameras === 3 ? 'selected' : ''}" data-num="3">3</button>
            <button class="num-chip ${respostas.cameras === 4 ? 'selected' : ''}" data-num="4">4</button>
            <button class="num-chip ${respostas.cameras === 5 ? 'selected' : ''}" data-num="5">5</button>
            <button class="num-chip ${respostas.cameras === 6 ? 'selected' : ''}" data-num="6">6</button>
            <button class="num-chip ${respostas.cameras === 8 ? 'selected' : ''}" data-num="8">8</button>
          </div>
        </div>

        <!-- Item 4: Observações Adicionais com IA do Gemini (Prompt P3) -->
        <div class="field-card-box">
          <div class="field-card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <label class="field-title">Observações adicionais</label>
            <button class="btn-ia-suggest-action" id="btnGerarSugestaoIa" title="Gerar com Google Gemini (P3)">
              ✨ Gerar com IA
            </button>
          </div>
          <div class="ai-assistant-banner">
            <span class="ai-robot-icon">✨ Sugestão IA (Gemini 1.5 Flash)</span>
            <span class="ai-warning-human">Revise antes de enviar</span>
          </div>
          <textarea class="field-textarea" id="txtObservacoesChecklist" rows="3" placeholder="Digite ou revise as observações técnicas...">${respostas.observacoes}</textarea>
        </div>

        <!-- Botão Amarelo de Salvamento -->
        <div class="checklist-action-footer">
          <button class="btn-primary-bb-yellow" id="btnSalvarRespostas">
            Salvar Respostas
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindChecklistDinamicoEvents() {
  const btnVoltar = document.getElementById('btnVoltarPerguntaAnterior');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.checklistQuestionIndex = 3;
      state.navigate('checklist-pergunta');
    });
  }

  // Segmented control sinalização
  const segBtns = document.querySelectorAll('.seg-btn');
  segBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentVistoria.respostas.sinalizacao = btn.getAttribute('data-val');
    });
  });

  // Estrelas
  const stars = document.querySelectorAll('.star-gold');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-star'), 10);
      state.currentVistoria.respostas.limpeza = val;
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-star'), 10);
        if (sVal <= val) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });
  });

  // Câmeras picker
  const numChips = document.querySelectorAll('.num-chip');
  numChips.forEach(chip => {
    chip.addEventListener('click', () => {
      numChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      state.currentVistoria.respostas.cameras = parseInt(chip.getAttribute('data-num'), 10);
    });
  });

  // Observações
  const txtObs = document.getElementById('txtObservacoesChecklist');
  if (txtObs) {
    txtObs.addEventListener('input', (e) => {
      state.currentVistoria.respostas.observacoes = e.target.value;
    });
  }

  // Gerar sugestão de texto com Google Gemini (Prompt P3)
  const btnGerarIa = document.getElementById('btnGerarSugestaoIa');
  if (btnGerarIa && txtObs) {
    btnGerarIa.addEventListener('click', async () => {
      btnGerarIa.innerText = 'Gerando...';
      btnGerarIa.disabled = true;
      try {
        const res = await api.sugerirObservacao('alvenaria');
        if (res && res.sugestao) {
          txtObs.value = res.sugestao;
          state.currentVistoria.respostas.observacoes = res.sugestao;
        }
      } catch (err) {
        console.warn('[Checklist] Fallback para sugestão heurística:', err.message);
        const fallbackTxt = 'Alvenaria nivelada com juntas regulares. Fachada frontal dentro do padrão visual do Banco do Brasil.';
        txtObs.value = fallbackTxt;
        state.currentVistoria.respostas.observacoes = fallbackTxt;
      } finally {
        btnGerarIa.innerText = '✨ Gerar com IA';
        btnGerarIa.disabled = false;
      }
    });
  }

  // Avançar para a tela de Verificação Resumo (Etapa 2 de 3)
  const btnSalvar = document.getElementById('btnSalvarRespostas');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
      state.navigate('checklist-verificacao');
    });
  }
}
