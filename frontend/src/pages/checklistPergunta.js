/**
 * BBVision - Tela de Checklist da Obra (Passo a Passo)
 * Suporte a alternância de tipos: Múltipla Escolha, Caixa de Seleção, Entrada de Texto
 * Recursos: Barra de progresso interativa, stepper tabs, chips rápidos de engenharia,
 * integração com Assistente de Parecer com IA e sincronização instantânea de estado.
 */

import { Icons } from '../assets/icons.js';
import { state, PERGUNTAS_PADRAO_BB } from '../services/state.js';
import { api } from '../services/api.js';
import { toast } from '../components/toast.js';
import { escapeHtml, copyToClipboard } from '../utils/formatters.js';

const ORIENTACAO_TEXTO_PADRAO =
  'Neste campo, preencher com informações sobre a qualidade do serviço (alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra).';

function opcaoExigeJustificativa(opcaoObj, valorStr = '') {
  if (opcaoObj) {
    if (opcaoObj.classeTag === 'tag-atencao' || opcaoObj.classeTag === 'tag-erro') return true;
    const tagLower = (opcaoObj.tag || '').toLowerCase();
    if (
      tagLower.includes('ressalva') ||
      tagLower.includes('crítico') ||
      tagLower.includes('critico') ||
      tagLower.includes('atenção') ||
      tagLower.includes('não conforme')
    ) {
      return true;
    }
  }
  const v = String(valorStr || '').toLowerCase();
  return (
    v.includes('parcial') ||
    v.includes('não') ||
    v.includes('inacessível') ||
    v.includes('ressalva') ||
    v.includes('crítico')
  );
}

function inferirCategoriaPergunta(titulo = '') {
  const t = String(titulo).toLowerCase();
  if (t.includes('fachada') || t.includes('totem') || t.includes('identificação')) return 'fachada';
  if (t.includes('alvenaria') || t.includes('estrutur') || t.includes('acabamento') || t.includes('fissura')) return 'alvenaria';
  if (t.includes('elétric') || t.includes('eletric') || t.includes('quadro') || t.includes('ilumina')) return 'eletrica';
  if (t.includes('hidráulic') || t.includes('hidraulic') || t.includes('tubula')) return 'hidraulica';
  if (t.includes('acessibilidade') || t.includes('rampa') || t.includes('tátil') || t.includes('nbr 9050')) return 'acessibilidade';
  if (t.includes('segurança') || t.includes('epi') || t.includes('epc') || t.includes('tapume')) return 'seguranca';
  return 'geral';
}

function perguntaEstaRespondida(pergunta, idx, respostas) {
  if (!pergunta) return false;
  const chave = pergunta.chaveResposta || pergunta.id || `pergunta_${idx}`;
  const justMap = respostas.justificativas || {};

  if (pergunta.tipo === 'multipla_escolha') {
    const val = respostas[chave] || '';
    if (!val) return false;
    const opObj = (pergunta.opcoes || []).find(o => o.valor === val);
    const reqJust = opcaoExigeJustificativa(opObj, val);
    return !reqJust || (justMap[chave] || '').trim().length > 0;
  }
  if (pergunta.tipo === 'caixa') {
    return Array.isArray(respostas[chave]) && respostas[chave].length > 0;
  }
  if (pergunta.tipo === 'texto') {
    return String(respostas[chave] || '').trim().length > 0;
  }
  return true;
}

export function getPerguntasChecklistAtual() {
  const custom =
    state.currentVistoria?.perguntasChecklist ||
    state.selectedObra?.perguntasChecklist ||
    state.selectedObra?.checklist_perguntas;
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  if (Array.isArray(state.checklistTemplate) && state.checklistTemplate.length > 0) {
    return state.checklistTemplate;
  }
  return PERGUNTAS_PADRAO_BB;
}

export function renderChecklistPergunta() {
  const vistoria = state.currentVistoria;
  const respostas = (vistoria.respostas = vistoria.respostas || {});
  respostas.justificativas = respostas.justificativas || {};
  const listaPerguntas = getPerguntasChecklistAtual();
  const totalPerguntas = listaPerguntas.length;

  if (
    typeof state.checklistQuestionIndex !== 'number' ||
    state.checklistQuestionIndex < 0 ||
    state.checklistQuestionIndex >= totalPerguntas
  ) {
    state.checklistQuestionIndex = 0;
  }

  const currentIndex = state.checklistQuestionIndex;
  const currentQ = listaPerguntas[currentIndex] || listaPerguntas[0];
  const chave = currentQ.chaveResposta || currentQ.id || `pergunta_${currentIndex}`;

  if (respostas[chave] === undefined) {
    respostas[chave] = currentQ.tipo === 'caixa' ? [] : '';
  }

  const progressoPorcentagem = Math.round(((currentIndex + 1) / totalPerguntas) * 100);
  const podeAvancar = perguntaEstaRespondida(currentQ, currentIndex, respostas);

  let questionBodyHtml = '';

  if (currentQ.tipo === 'multipla_escolha') {
    const opcoes = currentQ.opcoes || [
      { valor: 'Sim', label: 'Sim (Conforme)', detalhe: 'Atende aos critérios técnicos do BB', tag: 'Conforme', classeTag: 'tag-conforme' },
      { valor: 'Parcial', label: 'Parcial (Com Ressalvas)', detalhe: 'Atende parcialmente com necessidade de ajuste', tag: 'Atenção', classeTag: 'tag-atencao' },
      { valor: 'Não', label: 'Não (Não Conforme)', detalhe: 'Não atende aos critérios normativos', tag: 'Não Conforme', classeTag: 'tag-erro' },
    ];
    const valorAtual = respostas[chave] || '';
    const opcaoSelecionadaObj = opcoes.find(o => o.valor === valorAtual);
    const precisaJustificar = valorAtual ? opcaoExigeJustificativa(opcaoSelecionadaObj, valorAtual) : false;
    const textoJustificativa = respostas.justificativas[chave] || '';

    questionBodyHtml = `
      <div class="opcoes-resposta-group">
        ${opcoes
          .map(op => {
            const isSelected = valorAtual === op.valor;
            const reqJust = opcaoExigeJustificativa(op, op.valor);
            return `
            <label class="radio-pill-option ${isSelected ? 'selected' : ''}" data-val="${escapeHtml(op.valor)}" data-needs-just="${reqJust ? '1' : '0'}">
              <div class="radio-left-cluster">
                <input type="radio" name="${escapeHtml(currentQ.id || chave)}" value="${escapeHtml(op.valor)}" ${isSelected ? 'checked' : ''} />
                <span class="radio-custom-circle"></span>
                <div class="radio-text-wrap">
                  <span class="radio-label-title">${escapeHtml(op.label)}</span>
                  <span class="radio-label-sub">${escapeHtml(op.detalhe || '')}</span>
                </div>
              </div>
              <span class="option-badge-pill ${escapeHtml(op.classeTag || 'tag-conforme')}">${escapeHtml(op.tag || 'Status')}</span>
            </label>
          `;
          })
          .join('')}
      </div>

      <div class="justificativa-qualitativa-box ${precisaJustificar ? '' : 'hidden'}" id="boxJustificativaQualitativa">
        <label class="justificativa-qualitativa-label" for="txtJustificativaPergunta">
          Justificativa técnica obrigatória (Descreva o motivo da ressalva ou condição crítica):
        </label>
        <textarea
          id="txtJustificativaPergunta"
          class="pergunta-textarea justificativa-textarea"
          rows="3"
          maxlength="350"
          placeholder="Descreva aqui os detalhes da ressalva, pendência ou anomalia identificada para registro no relatório..."
        >${escapeHtml(textoJustificativa)}</textarea>
      </div>
    `;
  } else if (currentQ.tipo === 'caixa') {
    const opcoes = currentQ.opcoes || [
      { valor: 'Isolamento e tapumes conformes', label: 'Isolamento perimetral e tapumes', detalhe: 'Área isolada' },
      { valor: 'EPIs e sinalização ativos', label: 'Sinalização e EPIs em uso', detalhe: 'Equipe protegida' },
    ];
    const selecionados = Array.isArray(respostas[chave]) ? respostas[chave] : [];

    questionBodyHtml = `
      <div class="checkbox-toolbar">
        <div class="toolbar-buttons-cluster">
          <button type="button" class="btn-quick-check" id="btnMarcarTodosEpc">Marcar Todos</button>
          <button type="button" class="btn-quick-check" id="btnLimparEpc">Limpar</button>
        </div>
        <span class="badge-selection-count" id="badgeEpcCount">
          ${selecionados.length} de ${opcoes.length} marcados
        </span>
      </div>

      <div class="checkbox-options-group">
        ${opcoes
          .map(op => {
            const isChecked = selecionados.includes(op.valor);
            return `
            <div class="checkbox-card-option ${isChecked ? 'checked' : ''}" data-val="${escapeHtml(op.valor)}">
              <div class="custom-chk-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="checkbox-text-wrap">
                <strong class="chk-label-title">${escapeHtml(op.label)}</strong>
                <span class="chk-label-detail">${escapeHtml(op.detalhe || '')}</span>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  } else if (currentQ.tipo === 'texto') {
    const textoAtual = respostas[chave] || '';
    const charLen = textoAtual.length;
    const placeholderTexto = currentQ.placeholder || ORIENTACAO_TEXTO_PADRAO;
    const chipsRapidos = currentQ.chipsRapidos || [
      'Alvenaria aprumada e nivelada',
      'Ausência de trincas estruturais',
      'Emboço e acabamentos homogêneos',
      'Instalações embutidas conforme projeto',
    ];

    questionBodyHtml = `
      <div class="pergunta-textarea-wrap">
        <textarea 
          class="pergunta-textarea" 
          id="txtRelatoChecklist" 
          maxlength="500" 
          rows="4" 
          data-default-placeholder="${escapeHtml(placeholderTexto)}"
          placeholder="${escapeHtml(placeholderTexto)}"
        >${escapeHtml(textoAtual)}</textarea>

        <div class="textarea-meta-bar">
          <span class="char-counter" id="lblCharCounter">${charLen} / 500 caracteres</span>
          <button type="button" class="btn-clear-txt" id="btnClearRelatoTxt">Limpar texto</button>
        </div>

        <div class="ia-saved-feedback-banner hidden" id="iaSavedFeedbackBanner">
          <span><strong>Parecer gerado pela IA e inserido no campo de texto acima.</strong> Revise ou edite antes de avançar.</span>
        </div>

        <div class="quick-chips-section">
          <div class="quick-chips-title">
            Sugestões rápidas de engenharia (toque para adicionar):
          </div>
          <div class="quick-chips-cloud">
            ${chipsRapidos
              .map(
                chip => `
              <button type="button" class="quick-chip-btn" data-chip="${escapeHtml(chip)}">
                + ${escapeHtml(chip)}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <div class="ia-generate-block">
          <button type="button" class="btn-ia-gemini-checklist" id="btnIaGerarRelato">
            ${Icons.aiSparkle(16)}
            <span>Assistente de Parecer com IA (Preenche o campo acima)</span>
          </button>
          <span class="ia-disclaimer-pill">
            O parecer gerado é inserido na caixa de texto acima para sua revisão (Human-in-the-loop)
          </span>
        </div>
      </div>
    `;
  }

  const codigoLabel = vistoria.codigoUnico ? escapeHtml(vistoria.codigoUnico) : 'Protocolo gerado ao finalizar';

  return `
    <div class="page-container fade-in" id="checklistPerguntaPage">
      <header class="pergunta-header-yellow">
        <div class="pergunta-nav-row">
          <button class="btn-back-bb" id="btnVoltarPerguntaHeader" title="Voltar">
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
            <strong>${escapeHtml(vistoria.obraNome || 'Obra Selecionada')}</strong>
            <span>${escapeHtml(vistoria.endereco || vistoria.localizacaoFoto || 'Localização da unidade')}</span>
            <span>Data: ${escapeHtml(vistoria.dataFoto)} | Hora: ${escapeHtml(vistoria.horaFoto)}</span>
          </div>
        </div>
      </header>

      <div class="pergunta-content-body">
        <h2 class="pergunta-secao-title">Checklist da Obra</h2>

        <div class="pergunta-stepper-wrap">
          <div class="pergunta-progress-row">
            <span class="progress-label-main">
              Pergunta ${currentIndex + 1} de ${totalPerguntas}
            </span>
            <span class="progress-pct-badge">
              ${progressoPorcentagem}% Concluído
            </span>
          </div>

          <div class="pergunta-bar-track">
            <div class="pergunta-bar-fill" style="width: ${progressoPorcentagem}%;"></div>
          </div>

          <div class="pergunta-step-tabs">
            ${listaPerguntas
              .map((q, idx) => {
                const isActive = idx === currentIndex;
                const isDone = perguntaEstaRespondida(q, idx, respostas) && idx !== currentIndex;
                return `
                <button type="button" class="step-tab-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" data-step="${idx}">
                  <span>${isDone ? '✓ ' : ''}Q${Number(q.numero || idx + 1)}</span>
                </button>
              `;
              })
              .join('')}
          </div>
        </div>

        <div class="pergunta-card-container">
          <div class="pergunta-card-top-row">
            <div class="codigo-chip-badge" id="btnCopiarCodigoChip" title="${vistoria.codigoUnico ? 'Toque para copiar código' : 'Código gerado na assinatura final'}">
              <span>${codigoLabel}</span>
            </div>

            <div class="pergunta-type-pill">
              <span>${escapeHtml(currentQ.tipoLabel || 'Pergunta Técnica')}</span>
            </div>
          </div>

          <div class="pergunta-destaque-box">
            <h3 class="pergunta-enunciado">
              ${escapeHtml(currentQ.titulo)}
            </h3>
            <p class="pergunta-subtitulo">
              ${escapeHtml(currentQ.subtitulo || '')}
            </p>
            
            ${questionBodyHtml}
          </div>
        </div>
      </div>

      <div class="pergunta-action-footer">
        ${
          currentIndex > 0
            ? `
          <div class="pergunta-action-footer-dual">
            <button class="btn-secondary-bb-outline" id="btnPerguntaAnterior">
              ← Anterior
            </button>
            <button class="btn-primary-bb-yellow" id="btnProximaPergunta" ${podeAvancar ? '' : 'disabled'}>
              ${currentIndex === totalPerguntas - 1 ? 'Avançar para Checklist Complementar →' : 'Próxima Pergunta →'}
            </button>
          </div>
        `
            : `
          <button class="btn-primary-bb-yellow" id="btnProximaPergunta" ${podeAvancar ? '' : 'disabled'}>
            ${totalPerguntas === 1 ? 'Avançar para Checklist Complementar →' : 'Próxima Pergunta →'}
          </button>
        `
        }
      </div>
    </div>
  `;
}

export function bindChecklistPerguntaEvents() {
  const listaPerguntas = getPerguntasChecklistAtual();
  const totalPerguntas = listaPerguntas.length;
  const currentIndex = state.checklistQuestionIndex || 0;
  const currentQ = listaPerguntas[currentIndex] || listaPerguntas[0];
  const chave = currentQ.chaveResposta || currentQ.id || `pergunta_${currentIndex}`;
  const respostas = (state.currentVistoria.respostas = state.currentVistoria.respostas || {});
  respostas.justificativas = respostas.justificativas || {};

  const btnProxima = document.getElementById('btnProximaPergunta');

  function atualizarEstadoBotaoAvancar() {
    if (!btnProxima) return;
    btnProxima.disabled = !perguntaEstaRespondida(currentQ, currentIndex, respostas);
  }

  document.getElementById('btnVoltarPerguntaHeader')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      state.checklistQuestionIndex = currentIndex - 1;
      state.notify();
    } else {
      state.navigate('tipo-local');
    }
  });

  document.getElementById('btnPerguntaAnterior')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      state.checklistQuestionIndex = currentIndex - 1;
      state.notify();
    }
  });

  document.querySelectorAll('.step-tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const stepIdx = parseInt(pill.getAttribute('data-step'), 10);
      if (isNaN(stepIdx) || stepIdx === currentIndex) return;

      if (stepIdx > currentIndex) {
        // Verifica se todas as perguntas anteriores ao destino estão respondidas
        for (let i = currentIndex; i < stepIdx; i++) {
          if (!perguntaEstaRespondida(listaPerguntas[i], i, respostas)) {
            toast.warning('Resposta Obrigatória', `Responda a pergunta Q${i + 1} antes de avançar.`);
            return;
          }
        }
      }
      state.checklistQuestionIndex = stepIdx;
      state.notify();
    });
  });

  document.getElementById('btnCopiarCodigoChip')?.addEventListener('click', async () => {
    const cod = state.currentVistoria.codigoUnico;
    if (!cod) {
      toast.info('Protocolo Pendente', 'O código único criptográfico será emitido na etapa de assinatura digital.');
      return;
    }
    const ok = await copyToClipboard(cod);
    if (ok) {
      toast.info('Código Copiado', `Protocolo ${cod} copiado.`);
    }
  });

  if (currentQ.tipo === 'multipla_escolha') {
    const radioOptions = document.querySelectorAll('.radio-pill-option');
    const boxJust = document.getElementById('boxJustificativaQualitativa');
    const txtJust = document.getElementById('txtJustificativaPergunta');

    radioOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        const needsJust = opt.getAttribute('data-needs-just') === '1';

        radioOptions.forEach(o => {
          o.classList.remove('selected');
          const input = o.querySelector('input');
          if (input) input.checked = false;
        });
        opt.classList.add('selected');
        const input = opt.querySelector('input');
        if (input) input.checked = true;

        respostas[chave] = val;

        if (boxJust) {
          if (needsJust) {
            boxJust.classList.remove('hidden');
            if (txtJust) setTimeout(() => txtJust.focus(), 50);
          } else {
            boxJust.classList.add('hidden');
            respostas.justificativas[chave] = '';
            if (txtJust) txtJust.value = '';
          }
        }
        atualizarEstadoBotaoAvancar();
      });
    });

    if (txtJust) {
      txtJust.addEventListener('input', e => {
        respostas.justificativas[chave] = e.target.value;
        atualizarEstadoBotaoAvancar();
      });
    }
  }

  if (currentQ.tipo === 'caixa') {
    const chkOptions = document.querySelectorAll('.checkbox-card-option');
    const badgeCount = document.getElementById('badgeEpcCount');
    const opcoes = currentQ.opcoes || [];

    function atualizarContador() {
      const marcados = respostas[chave] || [];
      if (badgeCount) {
        badgeCount.innerText = `${marcados.length} de ${opcoes.length} marcados`;
      }
      atualizarEstadoBotaoAvancar();
    }

    chkOptions.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.getAttribute('data-val');
        let arr = Array.isArray(respostas[chave]) ? [...respostas[chave]] : [];

        if (card.classList.contains('checked')) {
          card.classList.remove('checked');
          arr = arr.filter(item => item !== val);
        } else {
          card.classList.add('checked');
          if (!arr.includes(val)) arr.push(val);
        }

        respostas[chave] = arr;
        atualizarContador();
      });
    });

    document.getElementById('btnMarcarTodosEpc')?.addEventListener('click', () => {
      respostas[chave] = opcoes.map(o => o.valor);
      chkOptions.forEach(c => c.classList.add('checked'));
      atualizarContador();
      toast.info('Itens Marcados', 'Todos os itens foram marcados como ativos.');
    });

    document.getElementById('btnLimparEpc')?.addEventListener('click', () => {
      respostas[chave] = [];
      chkOptions.forEach(c => c.classList.remove('checked'));
      atualizarContador();
    });
  }

  if (currentQ.tipo === 'texto') {
    const txtArea = document.getElementById('txtRelatoChecklist');
    const lblChar = document.getElementById('lblCharCounter');
    const btnClearTxt = document.getElementById('btnClearRelatoTxt');
    const chipBtns = document.querySelectorAll('.quick-chip-btn');
    const btnIaGerar = document.getElementById('btnIaGerarRelato');
    const iaFeedbackBanner = document.getElementById('iaSavedFeedbackBanner');

    if (txtArea) {
      txtArea.addEventListener('focus', () => {
        txtArea.setAttribute('placeholder', '');
      });

      txtArea.addEventListener('blur', () => {
        if (!txtArea.value.trim()) {
          txtArea.setAttribute('placeholder', txtArea.getAttribute('data-default-placeholder') || ORIENTACAO_TEXTO_PADRAO);
        }
      });

      txtArea.addEventListener('input', e => {
        respostas[chave] = e.target.value;
        if (lblChar) {
          lblChar.innerText = `${e.target.value.length} / 500 caracteres`;
        }
        atualizarEstadoBotaoAvancar();
      });
    }

    if (btnClearTxt && txtArea) {
      btnClearTxt.addEventListener('click', () => {
        txtArea.value = '';
        respostas[chave] = '';
        if (lblChar) lblChar.innerText = '0 / 500 caracteres';
        if (iaFeedbackBanner) iaFeedbackBanner.classList.add('hidden');
        atualizarEstadoBotaoAvancar();
        txtArea.focus();
      });
    }

    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chipVal = btn.getAttribute('data-chip');
        if (!txtArea || !chipVal) return;
        let currentTxt = txtArea.value.trim();
        if (currentTxt) {
          if (!currentTxt.includes(chipVal)) {
            currentTxt = `${currentTxt}. ${chipVal}`;
          }
        } else {
          currentTxt = chipVal;
        }
        txtArea.value = currentTxt.slice(0, 500);
        respostas[chave] = txtArea.value;
        if (lblChar) lblChar.innerText = `${txtArea.value.length} / 500 caracteres`;
        atualizarEstadoBotaoAvancar();
        toast.info('Termo Adicionado', 'Sugestão técnica inserida no campo de texto.');
      });
    });

    if (btnIaGerar && txtArea) {
      btnIaGerar.addEventListener('click', async () => {
        const originalHtml = btnIaGerar.innerHTML;
        btnIaGerar.disabled = true;
        btnIaGerar.innerHTML = `
          <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          </svg>
          <span>Gerando Parecer Técnico com IA...</span>
        `;

        const categoria = inferirCategoriaPergunta(currentQ.titulo);
        const contexto = {
          pergunta: currentQ.titulo,
          obra: state.currentVistoria.obraNome,
          tipoLocal: state.currentVistoria.tipoLocal,
          textoAtual: txtArea.value.trim(),
        };

        try {
          const res = await api.sugerirObservacao(categoria, null, contexto);
          const textoGerado =
            res && res.sugestao
              ? res.sugestao
              : 'Serviço executado conforme especificações técnicas da medição física, sem anomalias aparentes.';
          txtArea.value = textoGerado.slice(0, 500);
          respostas[chave] = txtArea.value;
          toast.success('Parecer Inserido', 'Revise ou edite o texto sugerido pela IA antes de avançar.');
        } catch (err) {
          console.warn('[ChecklistPergunta] Fallback local de sugestão:', err.message);
          const fallbackTxt =
            'Serviço inspecionado in-loco em conformidade com as especificações técnicas do projeto, sem anomalias estruturais aparentes.';
          txtArea.value = fallbackTxt;
          respostas[chave] = fallbackTxt;
          toast.warning('Sugestão Offline', 'Sem conexão com a IA no momento. Sugestão técnica padrão inserida para sua revisão.');
        } finally {
          btnIaGerar.disabled = false;
          btnIaGerar.innerHTML = originalHtml;
          if (lblChar) lblChar.innerText = `${txtArea.value.length} / 500 caracteres`;
          if (iaFeedbackBanner) iaFeedbackBanner.classList.remove('hidden');
          txtArea.classList.add('textarea-ia-highlight');
          txtArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => txtArea.classList.remove('textarea-ia-highlight'), 2200);
          atualizarEstadoBotaoAvancar();
        }
      });
    }
  }

  if (btnProxima) {
    btnProxima.addEventListener('click', () => {
      if (btnProxima.disabled) {
        toast.warning('Preenchimento Obrigatório', 'Responda a questão antes de avançar para a próxima etapa.');
        return;
      }
      if (currentIndex < totalPerguntas - 1) {
        state.checklistQuestionIndex = currentIndex + 1;
        state.notify();
      } else {
        state.checklistQuestionIndex = 0;
        state.navigate('checklist-dinamico');
      }
    });
  }
}
