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
import { toast } from '../components/toast.js';

const PLACEHOLDER_OBS_DINAMICO = 'Neste campo, preencher com observações complementares da vistoria ou clicar em "Gerar Resumo das Respostas com IA" acima...';

export function renderChecklistDinamico() {
  const vistoria = state.currentVistoria;
  const respostas = vistoria.respostas;

  const sinalizacaoVal = respostas.sinalizacao || '';
  const precisaJustSinalizacao = sinalizacaoVal === 'Não' || sinalizacaoVal === 'Parcial';
  const justSinalizacaoTxt = respostas.justificativaSinalizacao || '';
  const limpezaVal = Number(respostas.limpeza || 0);
  const camerasVal = respostas.cameras;
  const obsTxt = respostas.observacoes || '';

  const podeSalvar =
    Boolean(sinalizacaoVal) &&
    (!precisaJustSinalizacao || justSinalizacaoTxt.trim().length > 0) &&
    limpezaVal >= 1 &&
    camerasVal !== null &&
    camerasVal !== undefined;

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
            <span class="page-title-white">Checklist Complementar</span>
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
            <label class="field-title">Condição da sinalização <span style="color:#DC2626;">*</span></label>
            <span class="field-chevron">▼</span>
          </div>
          <div class="pill-segmented-control">
            <button type="button" class="seg-btn ${sinalizacaoVal === 'Sim' ? 'active' : ''}" data-val="Sim">Sim</button>
            <button type="button" class="seg-btn ${sinalizacaoVal === 'Não' ? 'active' : ''}" data-val="Não">Não</button>
            <button type="button" class="seg-btn ${sinalizacaoVal === 'Parcial' ? 'active' : ''}" data-val="Parcial">Parcial</button>
          </div>

          <!-- Justificativa qualitativa quando selecionado Não ou Parcial -->
          <div class="justificativa-qualitativa-box ${precisaJustSinalizacao ? '' : 'hidden'}" id="boxJustificativaSinalizacao" style="margin-top: 10px;">
            <label class="justificativa-qualitativa-label" for="txtJustificativaSinalizacao">
              ⚠️ Justificativa obrigatória (Sinalização Parcial ou Não Conforme):
            </label>
            <textarea
              id="txtJustificativaSinalizacao"
              class="pergunta-textarea justificativa-textarea"
              rows="2"
              maxlength="250"
              placeholder="Descreva qual placa ou sinalização está ausente ou parcial..."
            >${justSinalizacaoTxt}</textarea>
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
              <span class="step-num-circle" id="lblNotaLimpezaNum">${limpezaVal > 0 ? limpezaVal : '-'}</span>
              <span class="step-label">da limpeza</span>
            </div>
          </div>

          <div class="field-card-box half-card">
            <div class="field-card-header">
              <label class="field-title">limpeza (1 a 5) <span style="color:#DC2626;">*</span></label>
              <span class="field-chevron">▼</span>
            </div>
            <div class="stars-rating-container" id="starsContainer">
              <span class="star-gold ${limpezaVal >= 1 ? 'active' : ''}" data-star="1">★</span>
              <span class="star-gold ${limpezaVal >= 2 ? 'active' : ''}" data-star="2">★</span>
              <span class="star-gold ${limpezaVal >= 3 ? 'active' : ''}" data-star="3">★</span>
              <span class="star-gold ${limpezaVal >= 4 ? 'active' : ''}" data-star="4">★</span>
              <span class="star-gold ${limpezaVal >= 5 ? 'active' : ''}" data-star="5">★</span>
            </div>
          </div>
        </div>

        <!-- Item 3: Quantidade de Câmeras -->
        <div class="field-card-box">
          <div class="field-card-header">
            <label class="field-title">Quantidade de câmeras instaladas no local <span style="color:#DC2626;">*</span></label>
            <span class="field-chevron">▼</span>
          </div>
          <div class="number-picker-bar">
            <div class="picker-check-badge">${camerasVal !== null && camerasVal !== undefined ? '✓' : '?'}</div>
            <button type="button" class="num-chip ${camerasVal === 1 ? 'selected' : ''}" data-num="1">1</button>
            <button type="button" class="num-chip ${camerasVal === 2 ? 'selected' : ''}" data-num="2">2</button>
            <button type="button" class="num-chip ${camerasVal === 3 ? 'selected' : ''}" data-num="3">3</button>
            <button type="button" class="num-chip ${camerasVal === 4 ? 'selected' : ''}" data-num="4">4</button>
            <button type="button" class="num-chip ${camerasVal === 5 ? 'selected' : ''}" data-num="5">5</button>
            <button type="button" class="num-chip ${camerasVal === 6 ? 'selected' : ''}" data-num="6">6</button>
            <button type="button" class="num-chip ${camerasVal === 8 ? 'selected' : ''}" data-num="8">8</button>
          </div>
        </div>

        <!-- Item 4: Observações Adicionais com Assistente IA BBVision -->
        <div class="field-card-box">
          <div class="field-card-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <label class="field-title">Observações adicionais</label>
            <button type="button" class="btn-ia-suggest-action" id="btnGerarSugestaoIa" title="Preenche automaticamente o campo abaixo com um resumo técnico das respostas">
              ✨ Gerar Resumo das Respostas com IA
            </button>
          </div>
          <div class="ai-assistant-banner" style="flex-direction: column; align-items: flex-start; gap: 2px;">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
              <span class="ai-robot-icon">✨ Assistente de Parecer IA BBVision</span>
              <span class="ai-warning-human">Revise antes de enviar</span>
            </div>
            <span style="font-size: 11px; color: #475569;">
              Função do botão: consolida suas respostas marcadas acima em um texto técnico pronto no campo abaixo.
            </span>
          </div>
          <div class="ia-saved-feedback-banner hidden" id="iaDinamicoFeedbackBanner" style="margin-bottom: 8px;">
            <span>✅ <strong>Resumo gerado pela IA e inserido no campo abaixo!</strong></span>
          </div>
          <textarea
            class="field-textarea"
            id="txtObservacoesChecklist"
            rows="3"
            data-default-placeholder="${PLACEHOLDER_OBS_DINAMICO}"
            placeholder="${PLACEHOLDER_OBS_DINAMICO}"
          >${obsTxt}</textarea>
        </div>

        <!-- Botão Amarelo de Salvamento -->
        <div class="checklist-action-footer">
          <button class="btn-primary-bb-yellow" id="btnSalvarRespostas" ${podeSalvar ? '' : 'disabled'}>
            Salvar Respostas e Avançar →
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindChecklistDinamicoEvents() {
  const respostas = state.currentVistoria.respostas;
  const btnSalvar = document.getElementById('btnSalvarRespostas');
  const boxJustSin = document.getElementById('boxJustificativaSinalizacao');
  const txtJustSin = document.getElementById('txtJustificativaSinalizacao');
  const lblNotaLimpezaNum = document.getElementById('lblNotaLimpezaNum');

  function atualizarBotaoSalvar() {
    if (!btnSalvar) return;
    const sin = respostas.sinalizacao || '';
    const reqJust = sin === 'Não' || sin === 'Parcial';
    const justOk = !reqJust || (respostas.justificativaSinalizacao || '').trim().length > 0;
    const limpOk = Number(respostas.limpeza || 0) >= 1;
    const camOk = respostas.cameras !== null && respostas.cameras !== undefined;
    btnSalvar.disabled = !(Boolean(sin) && justOk && limpOk && camOk);
  }

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
      const val = btn.getAttribute('data-val');
      respostas.sinalizacao = val;

      if (boxJustSin) {
        if (val === 'Não' || val === 'Parcial') {
          boxJustSin.classList.remove('hidden');
          if (txtJustSin) setTimeout(() => txtJustSin.focus(), 50);
        } else {
          boxJustSin.classList.add('hidden');
          respostas.justificativaSinalizacao = '';
        }
      }
      atualizarBotaoSalvar();
    });
  });

  if (txtJustSin) {
    txtJustSin.addEventListener('input', (e) => {
      respostas.justificativaSinalizacao = e.target.value;
      atualizarBotaoSalvar();
    });
  }

  // Estrelas
  const stars = document.querySelectorAll('.star-gold');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-star'), 10);
      respostas.limpeza = val;
      if (lblNotaLimpezaNum) lblNotaLimpezaNum.innerText = String(val);
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-star'), 10);
        if (sVal <= val) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
      atualizarBotaoSalvar();
    });
  });

  // Câmeras picker
  const numChips = document.querySelectorAll('.num-chip');
  numChips.forEach(chip => {
    chip.addEventListener('click', () => {
      numChips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      respostas.cameras = parseInt(chip.getAttribute('data-num'), 10);
      const badge = document.querySelector('.picker-check-badge');
      if (badge) badge.innerText = '✓';
      atualizarBotaoSalvar();
    });
  });

  // Observações
  const txtObs = document.getElementById('txtObservacoesChecklist');
  const iaBanner = document.getElementById('iaDinamicoFeedbackBanner');
  if (txtObs) {
    txtObs.addEventListener('focus', () => {
      txtObs.setAttribute('placeholder', '');
    });
    txtObs.addEventListener('blur', () => {
      if (!txtObs.value.trim()) {
        txtObs.setAttribute('placeholder', txtObs.getAttribute('data-default-placeholder') || PLACEHOLDER_OBS_DINAMICO);
      }
    });
    txtObs.addEventListener('input', (e) => {
      respostas.observacoes = e.target.value;
    });
  }

  // Gerar Resumo das Respostas com IA BBVision (Item 11.1)
  const btnGerarIa = document.getElementById('btnGerarSugestaoIa');
  if (btnGerarIa && txtObs) {
    btnGerarIa.addEventListener('click', async () => {
      btnGerarIa.innerText = '⏳ Gerando resumo...';
      btnGerarIa.disabled = true;

      const sinStr = respostas.sinalizacao ? `Sinalização ${respostas.sinalizacao.toLowerCase()}` : 'Sinalização verificada';
      const limpStr = respostas.limpeza ? `limpeza avaliada em ${respostas.limpeza}/5 estrelas` : 'limpeza inspecionada';
      const camStr = respostas.cameras ? `${respostas.cameras} câmera(s) de monitoramento ativas` : 'monitoramento verificado';
      const fachadaStr = respostas.fachadaLegivel ? `Fachada: ${respostas.fachadaLegivel}.` : '';

      try {
        const res = await api.sugerirObservacao('geral');
        const baseIa = (res && res.sugestao) ? res.sugestao : 'Serviço executado conforme especificações técnicas da medição física.';
        const resumoConsolidado = `${ sinStr }, ${ limpStr } e ${ camStr }. ${ fachadaStr } ${ baseIa }`.replace(/\s+/g, ' ').trim();
        txtObs.value = resumoConsolidado;
        respostas.observacoes = resumoConsolidado;
      } catch (err) {
        const resumoFallback = `${ sinStr }, ${ limpStr } e ${ camStr }. ${ fachadaStr } Instalações e acabamentos inspecionados in-loco conforme padrão técnico do Banco do Brasil.`.replace(/\s+/g, ' ').trim();
        txtObs.value = resumoFallback;
        respostas.observacoes = resumoFallback;
      } finally {
        btnGerarIa.innerText = '✨ Gerar Resumo das Respostas com IA';
        btnGerarIa.disabled = false;
        if (iaBanner) iaBanner.classList.remove('hidden');
        txtObs.classList.add('textarea-ia-highlight');
        setTimeout(() => txtObs.classList.remove('textarea-ia-highlight'), 2200);
        toast.success('Resumo Gerado no Campo Abaixo', 'A IA consolidou suas respostas no campo de Observações adicionais.');
      }
    });
  }

  // Avançar para a tela de Verificação Resumo
  if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
      if (btnSalvar.disabled) {
        toast.warning('Campos Obrigatórios', 'Selecione a condição da sinalização, a nota de limpeza e a quantidade de câmeras antes de avançar.');
        return;
      }
      state.navigate('checklist-verificacao');
    });
  }
}
