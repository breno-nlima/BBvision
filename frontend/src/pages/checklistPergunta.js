/**
 * BVision - Tela de Checklist da Obra (Passo a Passo)
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.19 (3).jpeg
 * Conforme Requisitos E3, HU04 do Documento Oficial TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderChecklistPergunta() {
  const vistoria = state.currentVistoria;
  const respostaAtual = vistoria.respostas.fachadaLegivel || 'Sim';

  return `
    <div class="page-container fade-in" id="checklistPerguntaPage">
      <!-- Topo Amarelo Ouro BB com Identificação da Instituição e Agência -->
      <header class="pergunta-header-yellow">
        <div class="pergunta-nav-row">
          <button class="btn-back-bb" id="btnVoltarProtegida" title="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002D62" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span class="bb-brand-name">BB</span>
          </button>
        </div>

        <div class="agencia-info-block">
          <div class="bvision-badge-row">
            ${Icons.logoBVisionBadge(26)}
          </div>
          <div class="agencia-meta-text">
            <strong>Agência: 1234 — Centro</strong>
            <span>Av. Paulista, 1000 — São Paulo/SP</span>
            <span>Data: ${vistoria.dataFoto} | Hora: ${vistoria.horaFoto}</span>
          </div>
        </div>
      </header>

      <!-- Conteúdo da Pergunta com Card Flutuante -->
      <div class="pergunta-content-body">
        <h2 class="pergunta-secao-title">Checklist da Obra</h2>

        <div class="pergunta-card-container">
          <div class="codigo-chip-badge">
            ${vistoria.codigoUnico}
          </div>

          <div class="pergunta-destaque-box">
            <h3 class="pergunta-enunciado">
              1. Fachada da agência está legível?
            </h3>
            
            <div class="opcoes-resposta-group">
              <label class="radio-pill-option ${respostaAtual === 'Sim' ? 'selected' : ''}">
                <input type="radio" name="fachadaResp" value="Sim" ${respostaAtual === 'Sim' ? 'checked' : ''} />
                <span class="radio-custom-circle"></span>
                <span class="radio-label-text">Sim (Perfeitamente visível)</span>
              </label>

              <label class="radio-pill-option ${respostaAtual === 'Parcial' ? 'selected' : ''}">
                <input type="radio" name="fachadaResp" value="Parcial" ${respostaAtual === 'Parcial' ? 'checked' : ''} />
                <span class="radio-custom-circle"></span>
                <span class="radio-label-text">Parcial (Obstrução ou reforma)</span>
              </label>

              <label class="radio-pill-option ${respostaAtual === 'Não' ? 'selected' : ''}">
                <input type="radio" name="fachadaResp" value="Não" ${respostaAtual === 'Não' ? 'checked' : ''} />
                <span class="radio-custom-circle"></span>
                <span class="radio-label-text">Não (Inadequada ou ilegível)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão Inferior Amarelo de Avanço -->
      <div class="pergunta-action-footer">
        <button class="btn-primary-bb-yellow" id="btnProximaPergunta">
          Próxima Pergunta
        </button>
      </div>
    </div>
  `;
}

export function bindChecklistPerguntaEvents() {
  const btnVoltar = document.getElementById('btnVoltarProtegida');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('imagem-protegida');
    });
  }

  // Interação dos radios
  const radioInputs = document.querySelectorAll('input[name="fachadaResp"]');
  radioInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      document.querySelectorAll('.radio-pill-option').forEach(l => l.classList.remove('selected'));
      e.target.closest('.radio-pill-option').classList.add('selected');
      state.currentVistoria.respostas.fachadaLegivel = e.target.value;
    });
  });

  const btnProxima = document.getElementById('btnProximaPergunta');
  if (btnProxima) {
    btnProxima.addEventListener('click', () => {
      // Avança para o Checklist Dinâmico com IA
      state.navigate('checklist-dinamico');
    });
  }
}
