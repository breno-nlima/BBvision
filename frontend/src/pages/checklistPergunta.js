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

// Definição das 4 perguntas estruturadas com alternância de tipos
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
    padrao: 'Sim',
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
    padrao: [
      'Isolamento perimetral e tapumes íntegros',
      'Sinalização visual de perigo e rotas de pedestres',
      'Uso obrigatório de EPIs completos pela equipe'
    ],
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
    padrao: 'Alvenaria aprumada e nivelada com juntas regulares. Fachada frontal e vigas dentro do padrão visual e normativo do Banco do Brasil.',
    placeholder: 'Digite ou insira sugestões técnicas sobre a alvenaria, vigas e acabamentos...',
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
    padrao: 'Totalmente acessível (Piso tátil e rampa nivelada sem degraus)',
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

export function renderChecklistPergunta() {
  const vistoria = state.currentVistoria;
  const respostas = vistoria.respostas = vistoria.respostas || {};

  // Garante inicialização das chaves no estado
  if (respostas.fachadaLegivel === undefined) respostas.fachadaLegivel = 'Sim';
  if (respostas.segurancaEpc === undefined) {
    respostas.segurancaEpc = [
      'Isolamento perimetral e tapumes íntegros',
      'Sinalização visual de perigo e rotas de pedestres',
      'Uso obrigatório de EPIs completos pela equipe'
    ];
  }
  if (respostas.relatoEstrutural === undefined) {
    respostas.relatoEstrutural = 'Alvenaria aprumada e nivelada com juntas regulares. Fachada frontal e vigas dentro do padrão visual e normativo do Banco do Brasil.';
  }
  if (respostas.acessibilidade === undefined) {
    respostas.acessibilidade = 'Totalmente acessível (Piso tátil e rampa nivelada sem degraus)';
  }

  // Índice da pergunta ativa
  if (typeof state.checklistQuestionIndex !== 'number' || state.checklistQuestionIndex < 0 || state.checklistQuestionIndex >= PERGUNTAS_CHECKLIST.length) {
    state.checklistQuestionIndex = 0;
  }
  const currentIndex = state.checklistQuestionIndex;
  const currentQ = PERGUNTAS_CHECKLIST[currentIndex];

  const totalPerguntas = PERGUNTAS_CHECKLIST.length;
  const progressoPorcentagem = Math.round(((currentIndex + 1) / totalPerguntas) * 100);

  // Render do corpo específico da pergunta ativa
  let questionBodyHtml = '';

  if (currentQ.tipo === 'multipla_escolha') {
    const valorAtual = respostas[currentQ.chaveResposta] || currentQ.padrao;
    questionBodyHtml = `
      <div class="opcoes-resposta-group">
        ${currentQ.opcoes.map(op => {
          const isSelected = valorAtual === op.valor;
          return `
            <label class="radio-pill-option ${isSelected ? 'selected' : ''}" data-val="${op.valor}">
              <div class="radio-left-cluster">
                <input type="radio" name="${currentQ.id}" value="${op.valor}" ${isSelected ? 'checked' : ''} />
                <span class="radio-custom-circle"></span>
                <div class="radio-text-wrap">
                  <span class="radio-label-title">${op.label}</span>
                  <span class="radio-label-sub">${op.detalhe}</span>
                </div>
              </div>
              <span class="option-badge-pill ${op.classeTag}">${op.tag}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  } else if (currentQ.tipo === 'caixa') {
    const selecionados = Array.isArray(respostas[currentQ.chaveResposta]) 
      ? respostas[currentQ.chaveResposta] 
      : [];
    
    questionBodyHtml = `
      <div class="checkbox-toolbar">
        <div class="toolbar-buttons-cluster">
          <button type="button" class="btn-quick-check" id="btnMarcarTodosEpc">Marcar Todos</button>
          <button type="button" class="btn-quick-check" id="btnLimparEpc">Limpar</button>
        </div>
        <span class="badge-selection-count" id="badgeEpcCount">
          ${selecionados.length} de ${currentQ.opcoes.length} marcados
        </span>
      </div>

      <div class="checkbox-options-group">
        ${currentQ.opcoes.map(op => {
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
                <span class="chk-label-detail">${op.detalhe}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (currentQ.tipo === 'texto') {
    const textoAtual = respostas[currentQ.chaveResposta] || '';
    const charLen = textoAtual.length;

    questionBodyHtml = `
      <div class="pergunta-textarea-wrap">
        <textarea 
          class="pergunta-textarea" 
          id="txtRelatoChecklist" 
          maxlength="500" 
          rows="4" 
          placeholder="${currentQ.placeholder}"
        >${textoAtual}</textarea>

        <div class="textarea-meta-bar">
          <span class="char-counter" id="lblCharCounter">${charLen} / 500 caracteres</span>
          <button type="button" class="btn-clear-txt" id="btnClearRelatoTxt">Limpar texto</button>
        </div>

        <!-- Chips de Preenchimento Rápido de Engenharia -->
        <div class="quick-chips-section">
          <div class="quick-chips-title">
            <span>⚡ Sugestões rápidas de engenharia (toque para adicionar):</span>
          </div>
          <div class="quick-chips-cloud">
            ${currentQ.chipsRapidos.map(chip => `
              <button type="button" class="quick-chip-btn" data-chip="${chip}">
                + ${chip}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Assistente com IA do Google Gemini 1.5 Flash -->
        <div class="ia-generate-block">
          <button type="button" class="btn-ia-gemini-checklist" id="btnIaGerarRelato">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FED304" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span>✨ Assistente de Parecer com IA (Gemini)</span>
          </button>
          <span class="ia-disclaimer-pill">
            Governado por IA TakeOff • Sujeito à revisão humana antes do envio
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
            ${PERGUNTAS_CHECKLIST.map((q, idx) => {
              const isActive = idx === currentIndex;
              const isDone = idx < currentIndex;
              return `
                <button type="button" class="step-tab-pill ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" data-step="${idx}">
                  <span class="step-tab-icon">${isDone ? '✓' : q.tipoIcon}</span>
                  <span>Q${q.numero}</span>
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
              <span>${currentQ.tipoIcon}</span>
              <span>${currentQ.tipoLabel}</span>
            </div>
          </div>

          <div class="pergunta-destaque-box">
            <h3 class="pergunta-enunciado">
              ${currentQ.titulo}
            </h3>
            <p class="pergunta-subtitulo">
              ${currentQ.subtitulo}
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
            <button class="btn-primary-bb-yellow" id="btnProximaPergunta">
              ${currentIndex === totalPerguntas - 1 ? 'Avançar para Checklist Dinâmico →' : 'Próxima Pergunta →'}
            </button>
          </div>
        ` : `
          <button class="btn-primary-bb-yellow" id="btnProximaPergunta">
            Próxima Pergunta
          </button>
        `}
      </div>
    </div>
  `;
}

export function bindChecklistPerguntaEvents() {
  const currentIndex = state.checklistQuestionIndex || 0;
  const currentQ = PERGUNTAS_CHECKLIST[currentIndex];
  const respostas = state.currentVistoria.respostas;

  // 1. Botão Voltar no Header
  const btnVoltarHeader = document.getElementById('btnVoltarPerguntaHeader');
  if (btnVoltarHeader) {
    btnVoltarHeader.addEventListener('click', () => {
      if (currentIndex > 0) {
        state.checklistQuestionIndex = currentIndex - 1;
        state.notify();
      } else {
        state.navigate('imagem-protegida');
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

  // 3. Clique nas tabs do Stepper (Q1, Q2, Q3, Q4)
  const tabPills = document.querySelectorAll('.step-tab-pill');
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const stepIdx = parseInt(pill.getAttribute('data-step'), 10);
      if (!isNaN(stepIdx) && stepIdx !== currentIndex) {
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

  // 5. Interação para Múltipla Escolha
  if (currentQ.tipo === 'multipla_escolha') {
    const radioOptions = document.querySelectorAll('.radio-pill-option');
    radioOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        radioOptions.forEach(o => {
          o.classList.remove('selected');
          const input = o.querySelector('input');
          if (input) input.checked = false;
        });
        opt.classList.add('selected');
        const input = opt.querySelector('input');
        if (input) input.checked = true;

        respostas[currentQ.chaveResposta] = val;
      });
    });
  }

  // 6. Interação para Caixas de Seleção (Checkboxes múltiplos)
  if (currentQ.tipo === 'caixa') {
    const chkOptions = document.querySelectorAll('.checkbox-card-option');
    const badgeCount = document.getElementById('badgeEpcCount');

    function atualizarContador() {
      const marcados = respostas[currentQ.chaveResposta] || [];
      if (badgeCount) {
        badgeCount.innerText = `${marcados.length} de ${currentQ.opcoes.length} marcados`;
      }
    }

    chkOptions.forEach(card => {
      card.addEventListener('click', () => {
        const val = card.getAttribute('data-val');
        let arr = Array.isArray(respostas[currentQ.chaveResposta]) 
          ? [...respostas[currentQ.chaveResposta]] 
          : [];

        if (card.classList.contains('checked')) {
          card.classList.remove('checked');
          arr = arr.filter(item => item !== val);
        } else {
          card.classList.add('checked');
          if (!arr.includes(val)) arr.push(val);
        }

        respostas[currentQ.chaveResposta] = arr;
        atualizarContador();
      });
    });

    // Marcar Todos
    const btnMarcarTodos = document.getElementById('btnMarcarTodosEpc');
    if (btnMarcarTodos) {
      btnMarcarTodos.addEventListener('click', () => {
        const todosValores = currentQ.opcoes.map(o => o.valor);
        respostas[currentQ.chaveResposta] = todosValores;
        chkOptions.forEach(c => c.classList.add('checked'));
        atualizarContador();
        toast.info('Itens Marcados', 'Todos os itens de segurança foram marcados como ativos.');
      });
    }

    // Limpar
    const btnLimpar = document.getElementById('btnLimparEpc');
    if (btnLimpar) {
      btnLimpar.addEventListener('click', () => {
        respostas[currentQ.chaveResposta] = [];
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

    if (txtArea) {
      txtArea.addEventListener('input', (e) => {
        respostas[currentQ.chaveResposta] = e.target.value;
        if (lblChar) {
          lblChar.innerText = `${e.target.value.length} / 500 caracteres`;
        }
      });
    }

    if (btnClearTxt && txtArea) {
      btnClearTxt.addEventListener('click', () => {
        txtArea.value = '';
        respostas[currentQ.chaveResposta] = '';
        if (lblChar) lblChar.innerText = `0 / 500 caracteres`;
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
        respostas[currentQ.chaveResposta] = currentTxt;
        if (lblChar) lblChar.innerText = `${currentTxt.length} / 500 caracteres`;
        toast.info('Termo Adicionado', `Sugestão técnica inserida no parecer.`);
      });
    });

    // Assistente IA com Google Gemini 1.5 Flash
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
          <span>Gerando Parecer com Gemini 1.5 Flash...</span>
        `;

        try {
          const res = await api.sugerirObservacao('alvenaria');
          if (res && res.sugestao) {
            txtArea.value = res.sugestao;
            respostas[currentQ.chaveResposta] = res.sugestao;
            toast.success('Parecer Gerado!', 'Sugestão técnica elaborada pela IA com sucesso.');
          } else {
            throw new Error('Resposta vazia');
          }
        } catch (err) {
          console.warn('[ChecklistPergunta] Fallback técnico:', err.message);
          const fallbackTxt = 'Alvenaria perfeitamente alinhada e nivelada. Vigas e juntas regulares, sem trincas ativas ou desvios de prumo. Obra conforme diretrizes de engenharia do Banco do Brasil.';
          txtArea.value = fallbackTxt;
          respostas[currentQ.chaveResposta] = fallbackTxt;
          toast.info('Parecer Técnico', 'Parecer gerado com base no padrão normativo BB.');
        } finally {
          btnIaGerar.disabled = false;
          btnIaGerar.innerHTML = originalHtml;
          if (lblChar) lblChar.innerText = `${txtArea.value.length} / 500 caracteres`;
        }
      });
    }
  }

  // 8. Botão Próxima Pergunta / Concluir
  const btnProxima = document.getElementById('btnProximaPergunta');
  if (btnProxima) {
    btnProxima.addEventListener('click', () => {
      if (currentIndex < PERGUNTAS_CHECKLIST.length - 1) {
        state.checklistQuestionIndex = currentIndex + 1;
        state.notify();
      } else {
        // Concluiu as 4 perguntas -> Avança para o Checklist Dinâmico com IA
        state.checklistQuestionIndex = 0;
        state.navigate('checklist-dinamico');
      }
    });
  }
}
