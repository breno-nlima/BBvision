/**
 * BBVision - Tela de Checklist Complementar com Sugestões de IA
 * Princípio Human-in-the-loop com aviso "Revise antes de enviar" e editabilidade total.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { api } from '../services/api.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';
import { getPerguntasChecklistAtual } from './checklistPergunta.js';

const PLACEHOLDER_OBS_DINAMICO =
  'Preencha com observações complementares da vistoria ou clique em "Gerar Resumo das Respostas com IA" acima...';

export function renderChecklistDinamico() {
  const vistoria = state.currentVistoria;
  const respostas = (vistoria.respostas = vistoria.respostas || {});

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

  const cameraOptions = [0, 1, 2, 3, 4, 5, 6, 8];

  return `
    <div class="page-container fade-in" id="checklistDinamicoPage">
      <header class="checklist-blue-topbar">
        <div class="topbar-left-brand">
          <button class="btn-back-white-icon" id="btnVoltarPerguntaAnterior" title="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="bvision-white-title">
            <span class="bb-eye-badge">${Icons.logoBVision(24)}</span>
            <span class="brand-name-white">BBVision</span>
            <span class="page-title-white">Checklist Complementar</span>
          </div>
        </div>
        <button class="btn-dots-white" id="btnChecklistOpcoes" title="Ajuda">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </header>

      <div class="checklist-sheet-container">
        <div class="field-card-box">
          <div class="field-card-header">
            <label class="field-title">Condição da sinalização <span style="color:#DC2626;">*</span></label>
          </div>
          <div class="pill-segmented-control">
            <button type="button" class="seg-btn ${sinalizacaoVal === 'Sim' ? 'active' : ''}" data-val="Sim">Sim</button>
            <button type="button" class="seg-btn ${sinalizacaoVal === 'Não' ? 'active' : ''}" data-val="Não">Não</button>
            <button type="button" class="seg-btn ${sinalizacaoVal === 'Parcial' ? 'active' : ''}" data-val="Parcial">Parcial</button>
          </div>

          <div class="justificativa-qualitativa-box ${precisaJustSinalizacao ? '' : 'hidden'}" id="boxJustificativaSinalizacao" style="margin-top: 10px;">
            <label class="justificativa-qualitativa-label" for="txtJustificativaSinalizacao">
              Justificativa obrigatória (Sinalização Parcial ou Não Conforme):
            </label>
            <textarea
              id="txtJustificativaSinalizacao"
              class="pergunta-textarea justificativa-textarea"
              rows="2"
              maxlength="250"
              placeholder="Descreva qual placa ou sinalização está ausente ou parcial..."
            >${escapeHtml(justSinalizacaoTxt)}</textarea>
          </div>
        </div>

        <div class="fields-dual-row">
          <div class="field-card-box half-card">
            <div class="field-card-header">
              <label class="field-title">Avaliação da</label>
            </div>
            <div class="badge-step-item">
              <span class="step-num-circle" id="lblNotaLimpezaNum">${limpezaVal > 0 ? limpezaVal : '-'}</span>
              <span class="step-label">da limpeza</span>
            </div>
          </div>

          <div class="field-card-box half-card">
            <div class="field-card-header">
              <label class="field-title">limpeza (1 a 5) <span style="color:#DC2626;">*</span></label>
            </div>
            <div class="stars-rating-container" id="starsContainer">
              ${[1, 2, 3, 4, 5]
                .map(n => `<span class="star-gold ${limpezaVal >= n ? 'active' : ''}" data-star="${n}">★</span>`)
                .join('')}
            </div>
          </div>
        </div>

        <div class="field-card-box">
          <div class="field-card-header">
            <label class="field-title">Quantidade de câmeras instaladas no local <span style="color:#DC2626;">*</span></label>
          </div>
          <div class="number-picker-bar">
            <div class="picker-check-badge">${camerasVal !== null && camerasVal !== undefined ? '✓' : '?'}</div>
            ${cameraOptions
              .map(
                num => `
              <button type="button" class="num-chip ${camerasVal === num ? 'selected' : ''}" data-num="${num}">${num}</button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="field-card-box">
          <div class="field-card-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <label class="field-title">Observações adicionais</label>
            <button type="button" class="btn-ia-suggest-action" id="btnGerarSugestaoIa" title="Preenche automaticamente o campo abaixo com um resumo técnico das respostas" style="display:inline-flex; align-items:center; gap:6px;">
              ${Icons.aiSparkle(15)} Gerar Resumo das Respostas com IA
            </button>
          </div>
          <div class="ai-assistant-banner" style="flex-direction: column; align-items: flex-start; gap: 2px;">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
              <span class="ai-robot-icon">Assistente de Parecer IA BBVision</span>
              <span class="ai-warning-human">Revise antes de enviar</span>
            </div>
            <span style="font-size: 11px; color: #475569;">
              Consolida as respostas preenchidas acima em um parecer técnico editável.
            </span>
          </div>
          <div class="ia-saved-feedback-banner hidden" id="iaDinamicoFeedbackBanner" style="margin-bottom: 8px;">
            <span><strong>Resumo gerado pela IA e inserido no campo abaixo.</strong> Revise antes de prosseguir.</span>
          </div>
          <textarea
            class="field-textarea"
            id="txtObservacoesChecklist"
            rows="3"
            maxlength="800"
            data-default-placeholder="${escapeHtml(PLACEHOLDER_OBS_DINAMICO)}"
            placeholder="${escapeHtml(PLACEHOLDER_OBS_DINAMICO)}"
          >${escapeHtml(obsTxt)}</textarea>
        </div>

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
  const respostas = (state.currentVistoria.respostas = state.currentVistoria.respostas || {});
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

  document.getElementById('btnVoltarPerguntaAnterior')?.addEventListener('click', () => {
    const perguntas = getPerguntasChecklistAtual();
    state.checklistQuestionIndex = Math.max(0, perguntas.length - 1);
    state.navigate('checklist-pergunta');
  });

  document.getElementById('btnChecklistOpcoes')?.addEventListener('click', () => {
    toast.info(
      'Checklist Complementar',
      'Preencha sinalização, nota de limpeza e quantidade de câmeras. O assistente de IA consolida um parecer editável.'
    );
  });

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
          if (txtJustSin) txtJustSin.value = '';
        }
      }
      atualizarBotaoSalvar();
    });
  });

  if (txtJustSin) {
    txtJustSin.addEventListener('input', e => {
      respostas.justificativaSinalizacao = e.target.value;
      atualizarBotaoSalvar();
    });
  }

  const stars = document.querySelectorAll('.star-gold');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-star'), 10);
      respostas.limpeza = val;
      if (lblNotaLimpezaNum) lblNotaLimpezaNum.innerText = String(val);
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-star'), 10);
        s.classList.toggle('active', sVal <= val);
      });
      atualizarBotaoSalvar();
    });
  });

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
    txtObs.addEventListener('input', e => {
      respostas.observacoes = e.target.value;
    });
  }

  const btnGerarIa = document.getElementById('btnGerarSugestaoIa');
  if (btnGerarIa && txtObs) {
    btnGerarIa.addEventListener('click', async () => {
      const originalHtml = btnGerarIa.innerHTML;
      btnGerarIa.innerText = 'Gerando resumo...';
      btnGerarIa.disabled = true;

      const perguntas = getPerguntasChecklistAtual();
      const contextoRespostas = {
        obra: state.currentVistoria.obraNome,
        tipoLocal: state.currentVistoria.tipoLocal,
        sinalizacao: respostas.sinalizacao || 'Não informada',
        justificativaSinalizacao: respostas.justificativaSinalizacao || null,
        limpeza: respostas.limpeza ? `${respostas.limpeza}/5` : 'Não avaliada',
        cameras: respostas.cameras !== null && respostas.cameras !== undefined ? respostas.cameras : 'Não informado',
        itensChecklist: perguntas.map((q, idx) => {
          const k = q.chaveResposta || q.id || `pergunta_${idx}`;
          const val = respostas[k];
          return {
            pergunta: q.titulo,
            resposta: Array.isArray(val) ? val.join('; ') : val || 'Não informado',
            justificativa: respostas.justificativas?.[k] || null,
          };
        }),
      };

      const sinStr = respostas.sinalizacao ? `Sinalização ${respostas.sinalizacao.toLowerCase()}` : 'Sinalização verificada';
      const limpStr = respostas.limpeza ? `limpeza avaliada em ${respostas.limpeza}/5` : 'limpeza inspecionada';
      const camStr =
        respostas.cameras !== null && respostas.cameras !== undefined
          ? `${respostas.cameras} câmera(s) de monitoramento registradas`
          : 'monitoramento verificado';

      try {
        const res = await api.sugerirObservacao('geral', null, contextoRespostas);
        const sugestaoIa = res && res.sugestao ? res.sugestao.trim() : '';
        const textoFinal =
          sugestaoIa && sugestaoIa.length > 35
            ? sugestaoIa
            : `${sinStr}, ${limpStr} e ${camStr}. ${sugestaoIa || 'Serviço inspecionado conforme especificações técnicas.'}`.trim();
        txtObs.value = textoFinal.slice(0, 800);
        respostas.observacoes = txtObs.value;
        toast.success('Resumo Gerado', 'A IA consolidou suas respostas no campo de Observações. Revise antes de avançar.');
      } catch (err) {
        const resumoFallback = `${sinStr}, ${limpStr} e ${camStr}. Instalações e acabamentos inspecionados in-loco conforme padrão técnico de engenharia.`;
        txtObs.value = resumoFallback;
        respostas.observacoes = resumoFallback;
        toast.warning('Resumo Offline', 'Sem conexão com a IA no momento. Resumo técnico consolidado localmente para revisão.');
      } finally {
        btnGerarIa.innerHTML = originalHtml;
        btnGerarIa.disabled = false;
        if (iaBanner) iaBanner.classList.remove('hidden');
        txtObs.classList.add('textarea-ia-highlight');
        setTimeout(() => txtObs.classList.remove('textarea-ia-highlight'), 2200);
      }
    });
  }

  if (btnSalvar) {
    btnSalvar.addEventListener('click', () => {
      if (btnSalvar.disabled) {
        toast.warning(
          'Campos Obrigatórios',
          'Selecione a condição da sinalização, a nota de limpeza e a quantidade de câmeras antes de avançar.'
        );
        return;
      }
      state.navigate('checklist-verificacao');
    });
  }
}
