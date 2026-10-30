/**
 * BVision - Tela de Checklist da Obra (Passo a Passo com Recursos Avançados)
 * Conforme Requisitos Oficiais TakeOff / Banco do Brasil (E3, HU04)
 * Suporte a alternância de tipos: Múltipla Escolha, Caixa de Seleção, Entrada de Texto
 * Recursos: Barra de progresso interativa, stepper tabs, chips rápidos de engenharia,
 * integração com IA do Google Gemini 1.5 Flash e sincronização instantânea de estado.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { api } from '../services/api.js';
import { toast } from '../components/toast.js';

// Definição padrão das 4 perguntas estruturadas com alternância de tipos
const ORIENTACAO_TEXTO_PADRAO = 'Neste campo, preencher com informações sobre a qualidade do serviço. Ex.: o alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra:';

const PERGUNTAS_CHECKLIST = [
  {
    id: 'fachadaLegivel',
    numero: 1,
    tipo: 'multipla_escolha',
    tipoLabel: 'Múltipla Escolha',
    tipoIcon: '🔘',
    titulo: '1. Fachada da agência está legível e conforme padrão BB?',
    subtitulo: 'Verifique a visibilidade da marca Banco do Brasil, totem institucional e desobstrução visual frontal.',
    chaveResposta: 'fachadaLegivel',
    padrao: '',
    opcoes: [
      {
        valor: 'Sim',
        label: 'Sim (Perfeitamente visível)',
        detalhe: 'Identificação visual BB e acessos sem nenhuma obstrução',
        tag: 'Conforme',
        classeTag: 'tag-conforme'
      },
      {
        valor: 'Parcial',
        label: 'Parcial (Obstrução ou reforma)',
        detalhe: 'Andaimes, reformas pontuais ou cobertura parcial transitória',
        tag: 'Atenção',
        classeTag: 'tag-atencao'
      },
      {
        valor: 'Não',
        label: 'Não (Inadequada ou ilegível)',
        detalhe: 'Logomarca ausente, danificada ou severamente encoberta',
        tag: 'Não Conforme',
        classeTag: 'tag-erro'
      }
    ]
  },
  {
    id: 'segurancaEpc',
    numero: 2,
    tipo: 'caixa',
    tipoLabel: 'Caixas de Seleção',
    tipoIcon: '☑️',
    titulo: '2. Quais itens de segurança, proteção coletiva (EPC) e sinalização estão ativos no local?',
    subtitulo: 'Marque todas as caixas aplicáveis verificadas in loco nesta vistoria técnica:',
    chaveResposta: 'segurancaEpc',
    padrao: [],
    opcoes: [
      {
        valor: 'Isolamento perimetral e tapumes íntegros',
        label: 'Isolamento perimetral e tapumes íntegros',
        detalhe: 'Canteiro devidamente fechado sem brechas para circulação pública de pedestres'
      },
      {
        valor: 'Sinalização visual de perigo e rotas de pedestres',
        label: 'Sinalização de perigo e rotas de pedestres',
        detalhe: 'Placas de advertência oficiais do BB e faixas de circulação externa desobstruídas'
      },
      {
        valor: 'Uso obrigatório de EPIs completos pela equipe',
        label: 'Uso obrigatório de EPIs completos pela equipe',
        detalhe: 'Capacetes, botinas com biqueira e óculos de proteção em uso pelos operários'
      },
      {
        valor: 'Extintores de incêndio vistoriados e desobstruídos',
        label: 'Extintores de incêndio vistoriados e acessíveis',
        detalhe: 'Cargas de água e pó químico pressurizados dentro do prazo de validade'
      },
      {
        valor: 'Proteção contra quedas e telas de contenção em altura',
        label: 'Linha de vida e telas de contenção em altura',
        detalhe: 'Guarda-corpos regulamentares e telas fachadeiras montadas sem aberturas'
      }
    ]
  },
  {
    id: 'relatoEstrutural',
    numero: 3,
    tipo: 'texto',
    tipoLabel: 'Campo de Texto Descritivo',
    tipoIcon: '📝',
    titulo: '3. Relato técnico sobre alvenaria, acabamentos e anomalias estruturais:',
    subtitulo: 'Descreva o alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra:',
    chaveResposta: 'relatoEstrutural',
    padrao: '',
    placeholder: ORIENTACAO_TEXTO_PADRAO,
    chipsRapidos: [
      'Alvenaria aprumada e nivelada',
      'Ausência de trincas estruturais',
      'Emboço e revestimento homogêneos',
      'Instalações embutidas conforme projeto',
      'Pequena anomalia superficial sem risco'
    ]
  },
  {
    id: 'acessibilidade',
    numero: 4,
    tipo: 'multipla_escolha',
    tipoLabel: 'Múltipla Escolha',
    tipoIcon: '🔘',
    titulo: '4. Condição da calçada externa e acessibilidade da entrada principal:',
    subtitulo: 'Avaliação de piso tátil, guia rebaixada e rampas de acesso da agência (NBR 9050):',
    chaveResposta: 'acessibilidade',
    padrao: '',
    opcoes: [
      {
        valor: 'Totalmente acessível (Piso tátil e rampa nivelada sem degraus)',
        label: 'Totalmente acessível (NBR 9050)',
        detalhe: 'Piso tátil direcional/alerta instalado e rampa nivelada sem degraus impeditivos',
        tag: '100% Conforme',
        classeTag: 'tag-conforme'
      },
      {
        valor: 'Parcialmente acessível (Pequeno desnível ou adequação em andamento)',
        label: 'Parcialmente acessível (Em adequação)',
        detalhe: 'Rampa provisória segura ou acabamento de piso tátil em fase final de execução',
        tag: 'Com Ressalva',
        classeTag: 'tag-atencao'
      },
      {
        valor: 'Inacessível / Bloqueado (Necessita intervenção corretiva urgente)',
        label: 'Inacessível / Bloqueado',
        detalhe: 'Degraus sem rampa alternativa, calçada esburacada ou obstrução total de acesso',
        tag: 'Crítico',
        classeTag: 'tag-erro'
      }
    ]
  }
];

function opcaoExigeJustificativa(opcaoObj, valorStr = '') {
  if (opcaoObj) {
    if (opcaoObj.classeTag === 'tag-atencao' || opcaoObj.classeTag === 'tag-erro') return true;
    const tagLower = (opcaoObj.tag || '').toLowerCase();
    if (tagLower.includes('ressalva') || tagLower.includes('crítico') || tagLower.includes('critico') || tagLower.includes('atenção') || tagLower.includes('não conforme')) {
      return true;
    }
  }
  const v = String(valorStr || '').toLowerCase();
  return v.includes('parcial') || v.includes('não') || v.includes('inacessível') || v.includes('ressalva') || v.includes('crítico');
}

export function getPerguntasChecklistAtual() {
  const custom = state.currentVistoria?.perguntasChecklist || 
                 state.selectedObra?.perguntasChecklist || 
                 state.selectedObra?.checklist_perguntas;
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  if (Array.isArray(state.checklistTemplate) && state.checklistTemplate.length > 0) {
    return state.checklistTemplate;
  }
  return PERGUNTAS_CHECKLIST;
}

export function renderChecklistPergunta() {
  const vistoria = state.currentVistoria;
  const respostas = vistoria.respostas = vistoria.respostas || {};
  respostas.justificativas = respostas.justificativas || {};
  const listaPerguntas = getPerguntasChecklistAtual();
  const totalPerguntas = listaPerguntas.length;

  // Garante inicialização em branco (sem pré-preenchimento) conforme solicitação do cliente
  if (respostas.fachadaLegivel === undefined) respostas.fachadaLegivel = '';
  if (respostas.segurancaEpc === undefined) respostas.segurancaEpc = [];
  if (respostas.relatoEstrutural === undefined) respostas.relatoEstrutural = '';
  if (respostas.acessibilidade === undefined) respostas.acessibilidade = '';

  // Índice da pergunta ativa
  if (typeof state.checklistQuestionIndex !== 'number' || state.checklistQuestionIndex < 0 || state.checklistQuestionIndex >= totalPerguntas) {
    state.checklistQuestionIndex = 0;
  }
  const currentIndex = state.checklistQuestionIndex;
  const currentQ = listaPerguntas[currentIndex] || listaPerguntas[0];
  const chave = currentQ.chaveResposta || currentQ.id || `pergunta_${currentIndex}`;

  if (respostas[chave] === undefined) {
    respostas[chave] = currentQ.tipo === 'caixa' ? [] : '';
  }

  const progressoPorcentagem = Math.round(((currentIndex + 1) / totalPerguntas) * 100);

  // Verifica se a pergunta atual está devidamente preenchida para habilitar o botão de avanço
  let podeAvancar = false;

  // Render do corpo específico da pergunta ativa
  let questionBodyHtml = '';

  if (currentQ.tipo === 'multipla_escolha') {
    const opcoes = currentQ.opcoes || [
      { valor: 'Sim', label: 'Sim (Conforme)', detalhe: 'Atende aos critérios técnicos do BB', tag: 'Conforme', classeTag: 'tag-conforme' },
      { valor: 'Parcial', label: 'Parcial (Com Ressalvas)', detalhe: 'Atende parcialmente com necessidade de ajuste', tag: 'Atenção', classeTag: 'tag-atencao' },
      { valor: 'Não', label: 'Não (Não Conforme)', detalhe: 'Não atende aos critérios normativos', tag: 'Não Conforme', classeTag: 'tag-erro' }
    ];
    const valorAtual = respostas[chave] || '';
    const opcaoSelecionadaObj = opcoes.find(o => o.valor === valorAtual);
    const precisaJustificar = valorAtual ? opcaoExigeJustificativa(opcaoSelecionadaObj, valorAtual) : false;
    const textoJustificativa = respostas.justificativas[chave] || '';

    podeAvancar = Boolean(valorAtual) && (!precisaJustificar || textoJustificativa.trim().length > 0);

    questionBodyHtml = `
      <div class="opcoes-resposta-group">
        ${opcoes.map(op => {
          const isSelected = valorAtual === op.valor;
          const reqJust = opcaoExigeJustificativa(op, op.valor);
          return `
            <label class="radio-pill-option ${isSelected ? 'selected' : ''}" data-val="${op.valor}" data-needs-just="${reqJust ? '1' : '0'}">
              <div class="radio-left-cluster">
                <input type="radio" name="${currentQ.id || chave}" value="${op.valor}" ${isSelected ? 'checked' : ''} />
                <span class="radio-custom-circle"></span>
                <div class="radio-text-wrap">
                  <span class="radio-label-title">${op.label}</span>
                  <span class="radio-label-sub">${op.detalhe || ''}</span>
                </div>
              </div>
              <span class="option-badge-pill ${op.classeTag || 'tag-conforme'}">${op.tag || 'Status'}</span>
            </label>
          `;
        }).join('')}
      </div>

      <!-- Campo de Justificativa Qualitativa quando selecionado "Com Ressalva" / "Atenção" ou "Crítico" / "Não Conforme" -->
      <div class="justificativa-qualitativa-box ${precisaJustificar ? '' : 'hidden'}" id="boxJustificativaQualitativa">
        <label class="justificativa-qualitativa-label" for="txtJustificativaPergunta">
          ⚠️ Justificativa técnica obrigatória (Descreva o motivo da ressalva ou condição crítica):
        </label>
        <textarea
          id="txtJustificativaPergunta"
          class="pergunta-textarea justificativa-textarea"
          rows="3"
          maxlength="350"
          placeholder="Descreva aqui os detalhes da ressalva, pendência ou anomalia identificada para registro no relatório..."
        >${textoJustificativa}</textarea>
      </div>
    `;
  } else if (currentQ.tipo === 'caixa') {
    const opcoes = currentQ.opcoes || [
      { valor: 'Isolamento e tapumes conformes', label: 'Isolamento perimetral e tapumes', detalhe: 'Área isolada' },
      { valor: 'EPIs e sinalização ativos', label: 'Sinalização e EPIs em uso', detalhe: 'Equipe protegida' }
    ];
    const selecionados = Array.isArray(respostas[chave]) 
      ? respostas[chave] 
      : [];

    podeAvancar = selecionados.length > 0;
    
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
        ${opcoes.map(op => {
          const isChecked = selecionados.includes(op.valor);
          return `
            <div class="checkbox-card-option ${isChecked ? 'checked' : ''}" data-val="${op.valor}">
              <div class="custom-chk-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="checkbox-text-wrap">
                <strong class="chk-label-title">${op.label}</strong>
                <span class="chk-label-detail">${op.detalhe || ''}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (currentQ.tipo === 'texto') {
    const textoAtual = respostas[chave] || '';
    const charLen = textoAtual.length;
    podeAvancar = textoAtual.trim().length > 0;

    const placeholderTexto = ORIENTACAO_TEXTO_PADRAO;
    const chipsRapidos = currentQ.chipsRapidos || [
      'Alvenaria aprumada e nivelada',
      'Ausência de trincas estruturais',
      'Emboço e acabamentos homogêneos',
      'Instalações embutidas conforme projeto'
    ];

    questionBodyHtml = `
      <div class="pergunta-textarea-wrap">
        <textarea 
          class="pergunta-textarea" 
          id="txtRelatoChecklist" 
          maxlength="500" 
          rows="4" 
          data-default-placeholder="${placeholderTexto}"
          placeholder="${placeholderTexto}"
        >${textoAtual}</textarea>

        <div class="textarea-meta-bar">
          <span class="char-counter" id="lblCharCounter">${charLen} / 500 caracteres</span>
          <button type="button" class="btn-clear-txt" id="btnClearRelatoTxt">Limpar texto</button>
        </div>

        <!-- Banner de confirmação de onde o parecer da IA foi salvo -->
        <div class="ia-saved-feedback-banner hidden" id="iaSavedFeedbackBanner">
          <span>✅ <strong>Parecer gerado pela IA e inserido no campo de texto acima!</strong> Você pode revisar ou editar o texto antes de avançar.</span>
        </div>

        <!-- Chips de Preenchimento Rápido de Engenharia -->
        <div class="quick-chips-section">
          <div class="quick-chips-title">
            <span>⚡ Sugestões rápidas de engenharia (toque para adicionar):</span>
          </div>
          <div class="quick-chips-cloud">
            ${chipsRapidos.map(chip => `
              <button type="button" class="quick-chip-btn" data-chip="${chip}">
                + ${chip}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Assistente de Parecer com IA BBVision -->
        <div class="ia-generate-block">
          <button type="button" class="btn-ia-gemini-checklist" id="btnIaGerarRelato">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FED304" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span>✨ Assistente de Parecer com IA (Preenche o campo acima)</span>
          </button>
          <span class="ia-disclaimer-pill">
            O parecer gerado é inserido diretamente na caixa de texto acima para sua revisão
          </span>
        </div>
      </div>
    `;
  }

  return `
    <div class="page-container fade-in" id="checklistPerguntaPage">
      <!-- Topo Amarelo Ouro BB com Identificação da Instituição e Agência -->
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
            <strong>${vistoria.obraNome || 'Agência BB'}</strong>
            <span>${vistoria.localizacaoFoto || vistoria.endereco || 'Localização em tempo real'}</span>
            <span>Data: ${vistoria.dataFoto} | Hora: ${vistoria.horaFoto}</span>
          </div>
        </div>
      </header>

      <!-- Conteúdo da Pergunta com Card Flutuante e Stepper -->
      <div class="pergunta-content-body">
        <h2 class="pergunta-secao-title">Checklist da Obra</h2>

        <!-- Barra de Progresso e Tabs Interativas de Etapa -->
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
            ${listaPerguntas.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isDone = idx < currentIndex;
              return `
                <button type="button" class="step-tab-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" data-step="${idx}">
                  <span class="step-tab-icon">${isDone ? '✓' : (q.tipoIcon || '🔘')}</span>
                  <span>Q${q.numero || (idx + 1)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Card da Pergunta Atual -->
        <div class="pergunta-card-container">
          <div class="pergunta-card-top-row">
            <div class="codigo-chip-badge" id="btnCopiarCodigoChip" title="Toque para copiar código">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>${vistoria.codigoUnico}</span>
            </div>

            <div class="pergunta-type-pill">
              <span>${currentQ.tipoIcon || '🔘'}</span>
              <span>${currentQ.tipoLabel || 'Pergunta Técnica'}</span>
            </div>
          </div>

          <div class="pergunta-destaque-box">
            <h3 class="pergunta-enunciado">
              ${currentQ.titulo}
            </h3>
            <p class="pergunta-subtitulo">
              ${currentQ.subtitulo || ''}
            </p>
            
            ${questionBodyHtml}
          </div>
        </div>
      </div>

      <!-- Rodapé de Ações: Navegação Anterior / Próxima -->
      <div class="pergunta-action-footer">
        ${currentIndex > 0 ? `
          <div class="pergunta-action-footer-dual">
            <button class="btn-secondary-bb-outline" id="btnPerguntaAnterior">
              ← Anterior
            </button>
            <button class="btn-primary-bb-yellow" id="btnProximaPergunta" ${podeAvancar ? '' : 'disabled'}>
              ${currentIndex === totalPerguntas - 1 ? 'Avançar para Checklist Dinâmico →' : 'Próxima Pergunta →'}
            </button>
          </div>
        ` : `
          <button class="btn-primary-bb-yellow" id="btnProximaPergunta" ${podeAvancar ? '' : 'disabled'}>
            ${totalPerguntas === 1 ? 'Avançar para Checklist Dinâmico →' : 'Próxima Pergunta'}
          </button>
        `}
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
  const respostas = state.currentVistoria.respostas;
  respostas.justificativas = respostas.justificativas || {};

  const btnProxima = document.getElementById('btnProximaPergunta');

  function atualizarEstadoBotaoAvancar() {
    if (!btnProxima) return;
    let valido = false;
    if (currentQ.tipo === 'multipla_escolha') {
      const val = respostas[chave] || '';
      const opcoes = currentQ.opcoes || [];
      const opObj = opcoes.find(o => o.valor === val);
      const reqJust = val ? opcaoExigeJustificativa(opObj, val) : false;
      const justStr = (respostas.justificativas[chave] || '').trim();
      valido = Boolean(val) && (!reqJust || justStr.length > 0);
    } else if (currentQ.tipo === 'caixa') {
      const arr = Array.isArray(respostas[chave]) ? respostas[chave] : [];
      valido = arr.length > 0;
    } else if (currentQ.tipo === 'texto') {
      const txt = (respostas[chave] || '').trim();
      valido = txt.length > 0;
    }
    btnProxima.disabled = !valido;
  }

  // 1. Botão Voltar no Header
  const btnVoltarHeader = document.getElementById('btnVoltarPerguntaHeader');
  if (btnVoltarHeader) {
    btnVoltarHeader.addEventListener('click', () => {
      if (currentIndex > 0) {
        state.checklistQuestionIndex = currentIndex - 1;
        state.notify();
      } else {
        state.navigate('tipo-local');
      }
    });
  }

  // 2. Botão Voltar Anterior no Rodapé
  const btnAnterior = document.getElementById('btnPerguntaAnterior');
  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      if (currentIndex > 0) {
        state.checklistQuestionIndex = currentIndex - 1;
        state.notify();
      }
    });
  }

  // 3. Clique nas tabs do Stepper (Q1, Q2, Q3...)
  const tabPills = document.querySelectorAll('.step-tab-pill');
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const stepIdx = parseInt(pill.getAttribute('data-step'), 10);
      if (!isNaN(stepIdx) && stepIdx !== currentIndex) {
        if (stepIdx > currentIndex && btnProxima && btnProxima.disabled) {
          toast.warning('Resposta Obrigatória', 'Responda a pergunta atual antes de avançar.');
          return;
        }
        state.checklistQuestionIndex = stepIdx;
        state.notify();
      }
    });
  });

  // 4. Copiar Código Único
  const chipCodigo = document.getElementById('btnCopiarCodigoChip');
  if (chipCodigo) {
    chipCodigo.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(state.currentVistoria.codigoUnico);
        toast.info('Código Copiado', `Protocolo ${state.currentVistoria.codigoUnico} copiado.`);
      }
    });
  }

  // 5. Interação para Múltipla Escolha (+ Justificativa para Ressalva / Crítico)
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
          }
        }
        atualizarEstadoBotaoAvancar();
      });
    });

    if (txtJust) {
      txtJust.addEventListener('input', (e) => {
        respostas.justificativas[chave] = e.target.value;
        atualizarEstadoBotaoAvancar();
      });
    }
  }

  // 6. Interação para Caixas de Seleção (Checkboxes múltiplos)
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
        let arr = Array.isArray(respostas[chave]) 
          ? [...respostas[chave]] 
          : [];

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

    // Marcar Todos
    const btnMarcarTodos = document.getElementById('btnMarcarTodosEpc');
    if (btnMarcarTodos) {
      btnMarcarTodos.addEventListener('click', () => {
        const todosValores = opcoes.map(o => o.valor);
        respostas[chave] = todosValores;
        chkOptions.forEach(c => c.classList.add('checked'));
        atualizarContador();
        toast.info('Itens Marcados', 'Todos os itens foram marcados como ativos.');
      });
    }

    // Limpar
    const btnLimpar = document.getElementById('btnLimparEpc');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', () => {
        respostas[chave] = [];
        chkOptions.forEach(c => c.classList.remove('checked'));
        atualizarContador();
      });
    }
  }

  // 7. Interação para Campo de Texto Descritivo
  if (currentQ.tipo === 'texto') {
    const txtArea = document.getElementById('txtRelatoChecklist');
    const lblChar = document.getElementById('lblCharCounter');
    const btnClearTxt = document.getElementById('btnClearRelatoTxt');
    const chipBtns = document.querySelectorAll('.quick-chip-btn');
    const btnIaGerar = document.getElementById('btnIaGerarRelato');
    const iaFeedbackBanner = document.getElementById('iaSavedFeedbackBanner');

    if (txtArea) {
      // Orientação esmaecida de fundo desaparece imediatamente ao clicar no interior do campo (Item 9)
      txtArea.addEventListener('focus', () => {
        txtArea.setAttribute('placeholder', '');
      });

      txtArea.addEventListener('blur', () => {
        if (!txtArea.value.trim()) {
          txtArea.setAttribute('placeholder', txtArea.getAttribute('data-default-placeholder') || ORIENTACAO_TEXTO_PADRAO);
        }
      });

      txtArea.addEventListener('input', (e) => {
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
        if (lblChar) lblChar.innerText = `0 / 500 caracteres`;
        if (iaFeedbackBanner) iaFeedbackBanner.classList.add('hidden');
        atualizarEstadoBotaoAvancar();
        txtArea.focus();
      });
    }

    // Clique nos Chips Rápidos
    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chipVal = btn.getAttribute('data-chip');
        if (!txtArea) return;
        let currentTxt = txtArea.value.trim();
        if (currentTxt) {
          if (!currentTxt.includes(chipVal)) {
            currentTxt = `${currentTxt}. ${chipVal}`;
          }
        } else {
          currentTxt = chipVal;
        }
        txtArea.value = currentTxt;
        respostas[chave] = currentTxt;
        if (lblChar) lblChar.innerText = `${currentTxt.length} / 500 caracteres`;
        atualizarEstadoBotaoAvancar();
        toast.info('Termo Adicionado', 'Sugestão técnica inserida no campo de texto.');
      });
    });

    // Assistente de Parecer com IA BBVision (Item 9.2)
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

        try {
          const res = await api.sugerirObservacao('alvenaria');
          const textoGerado = (res && res.sugestao)
            ? res.sugestao
            : 'Alvenaria externa aprumada e nivelada conforme gabarito de referência, juntas regulares e ausência de fissuras visíveis.';
          txtArea.value = textoGerado;
          respostas[chave] = textoGerado;
          toast.success('Parecer Inserido no Campo!', 'O parecer técnico gerado pela IA foi preenchido automaticamente na caixa de texto acima.');
        } catch (err) {
          console.warn('[ChecklistPergunta] Fallback técnico:', err.message);
          const fallbackTxt = 'Alvenaria perfeitamente alinhada e nivelada. Vigas e juntas regulares, sem trincas ativas ou desvios de prumo. Obra conforme diretrizes de engenharia do Banco do Brasil.';
          txtArea.value = fallbackTxt;
          respostas[chave] = fallbackTxt;
          toast.success('Parecer Inserido no Campo!', 'Parecer técnico inserido automaticamente na caixa de texto acima.');
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

  // 8. Botão Próxima Pergunta / Concluir
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
        // Concluiu as perguntas configuradas pelo fiscal -> Avança para o Checklist Dinâmico com IA
        state.checklistQuestionIndex = 0;
        state.navigate('checklist-dinamico');
      }
    });
  }
}
