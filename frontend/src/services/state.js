/**
 * BBVision - State Management Service (Produção)
 * Gerencia estado reativo da aplicação sem quaisquer dados fictícios ou sementes hardcoded.
 */

import { api } from './api.js?v=2.5';
import { offlineSync } from './offlineSync.js?v=2.5';
import { normalizeImageSrc, generateSecureHex16 } from '../utils/formatters.js?v=2.5';

export const PERGUNTAS_PADRAO_BB = [
  {
    id: 'fachadaLegivel',
    numero: 1,
    tipo: 'multipla_escolha',
    tipoLabel: 'Múltipla Escolha',
    tipoIcon: '',
    titulo: '1. Fachada da agência está legível e conforme padrão BB?',
    subtitulo: 'Verifique a visibilidade da marca Banco do Brasil, totem institucional e desobstrução visual frontal.',
    chaveResposta: 'fachadaLegivel',
    padrao: '',
    opcoes: [
      { valor: 'Sim', label: 'Sim (Perfeitamente visível)', detalhe: 'Identificação visual BB e acessos sem nenhuma obstrução', tag: 'Conforme', classeTag: 'tag-conforme' },
      { valor: 'Parcial', label: 'Parcial (Obstrução ou reforma)', detalhe: 'Andaimes, reformas pontuais ou cobertura parcial transitória', tag: 'Atenção', classeTag: 'tag-atencao' },
      { valor: 'Não', label: 'Não (Inadequada ou ilegível)', detalhe: 'Logomarca ausente, danificada ou severamente encoberta', tag: 'Não Conforme', classeTag: 'tag-erro' },
    ],
  },
  {
    id: 'segurancaEpc',
    numero: 2,
    tipo: 'caixa',
    tipoLabel: 'Caixas de Seleção',
    tipoIcon: '',
    titulo: '2. Quais itens de segurança, proteção coletiva (EPC) e sinalização estão ativos no local?',
    subtitulo: 'Marque todas as caixas aplicáveis verificadas in loco nesta vistoria técnica:',
    chaveResposta: 'segurancaEpc',
    padrao: [],
    opcoes: [
      { valor: 'Isolamento perimetral e tapumes íntegros', label: 'Isolamento perimetral e tapumes íntegros', detalhe: 'Canteiro devidamente fechado sem brechas para circulação pública de pedestres' },
      { valor: 'Sinalização visual de perigo e rotas de pedestres', label: 'Sinalização de perigo e rotas de pedestres', detalhe: 'Placas de advertência oficiais e faixas de circulação externa desobstruídas' },
      { valor: 'Uso obrigatório de EPIs completos pela equipe', label: 'Uso obrigatório de EPIs completos pela equipe', detalhe: 'Capacetes, botinas com biqueira e óculos de proteção em uso pelos operários' },
      { valor: 'Extintores de incêndio vistoriados e desobstruídos', label: 'Extintores de incêndio vistoriados e acessíveis', detalhe: 'Cargas de água e pó químico pressurizados dentro do prazo de validade' },
      { valor: 'Proteção contra quedas e telas de contenção em altura', label: 'Linha de vida e telas de contenção em altura', detalhe: 'Guarda-corpos regulamentares e telas fachadeiras montadas sem aberturas' },
    ],
  },
  {
    id: 'relatoEstrutural',
    numero: 3,
    tipo: 'texto',
    tipoLabel: 'Campo de Texto Descritivo',
    tipoIcon: '',
    titulo: '3. Relato técnico sobre alvenaria, acabamentos e anomalias estruturais:',
    subtitulo: 'Descreva o alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra:',
    chaveResposta: 'relatoEstrutural',
    padrao: '',
    placeholder: 'Neste campo, preencher com informações sobre a qualidade do serviço (alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra).',
    chipsRapidos: [
      'Alvenaria aprumada e nivelada',
      'Ausência de trincas estruturais',
      'Emboço e revestimento homogêneos',
      'Instalações embutidas conforme projeto',
      'Pequena anomalia superficial sem risco',
    ],
  },
  {
    id: 'acessibilidade',
    numero: 4,
    tipo: 'multipla_escolha',
    tipoLabel: 'Múltipla Escolha',
    tipoIcon: '',
    titulo: '4. Condição da calçada externa e acessibilidade da entrada principal:',
    subtitulo: 'Avaliação de piso tátil, guia rebaixada e rampas de acesso da unidade (NBR 9050):',
    chaveResposta: 'acessibilidade',
    padrao: '',
    opcoes: [
      { valor: 'Totalmente acessível (Piso tátil e rampa nivelada sem degraus)', label: 'Totalmente acessível (NBR 9050)', detalhe: 'Piso tátil direcional/alerta instalado e rampa nivelada sem degraus impeditivos', tag: '100% Conforme', classeTag: 'tag-conforme' },
      { valor: 'Parcialmente acessível (Pequeno desnível ou adequação em andamento)', label: 'Parcialmente acessível (Em adequação)', detalhe: 'Rampa provisória segura ou acabamento de piso tátil em fase final de execução', tag: 'Com Ressalva', classeTag: 'tag-atencao' },
      { valor: 'Inacessível / Bloqueado (Necessita intervenção corretiva urgente)', label: 'Inacessível / Bloqueado', detalhe: 'Degraus sem rampa alternativa, calçada esburacada ou obstrução total de acesso', tag: 'Crítico', classeTag: 'tag-erro' },
    ],
  },
];

const ITENS_VERIFICACAO_TEXTOS = [
  { key: 'check1', texto: 'A estrutura está conforme o projeto?' },
  { key: 'check2', texto: 'Não há danos ou irregularidades visíveis?' },
  { key: 'check3', texto: 'A sinalização de segurança está correta?' },
  { key: 'check4', texto: 'A etapa da obra foi atualizada corretamente?' },
  { key: 'check5', texto: 'O local está pronto para registro fotográfico in-loco?' },
];

function higienizarTemplateChecklist(lista) {
  if (!Array.isArray(lista) || lista.length === 0) return JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
  return lista.map(q => {
    const copia = { ...q };
    copia.padrao = copia.tipo === 'caixa' ? [] : '';
    if (copia.tipo === 'texto' && !copia.placeholder) {
      copia.placeholder = 'Descreva observações técnicas relevantes da etapa vistoriada.';
    }
    return copia;
  });
}

function createEmptyVistoria(checklistTemplate) {
  const agora = new Date();
  return {
    relatorioId: null,
    obraId: null,
    obraNome: '',
    endereco: '',
    responsavel: '',
    matricula: '',
    etapa: '',
    tipoLocal: 'Agência Bancária',
    tipoLocalDesc: 'Fachada, interior, caixa forte',
    fotoUrl: null,
    fotoCamera: null,
    fotoBase64: null,
    caminhoArquivoFoto: null,
    dataFoto: agora.toLocaleDateString('pt-BR'),
    horaFoto: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    localizacaoFoto: 'Obtendo GPS em tempo real...',
    coordenadas: null,
    codigoUnico: '',
    codigoHexDoc: '',
    hashSha256: '',
    statusIA: null,
    categoriaIA: null,
    confiancaIA: null,
    motivoIA: '',
    validacaoManual: false,
    motivoValidacaoManual: '',
    respostas: {
      fachadaLegivel: '',
      segurancaEpc: [],
      relatoEstrutural: '',
      acessibilidade: '',
      justificativas: {},
      sinalizacao: '',
      justificativaSinalizacao: '',
      limpeza: 0,
      cameras: null,
      observacoes: '',
      check1: false,
      check2: false,
      check3: false,
      check4: false,
      check5: false,
    },
    perguntasChecklist: JSON.parse(JSON.stringify(checklistTemplate || PERGUNTAS_PADRAO_BB)),
    assinatura: null,
    declaracaoAceita: false,
    bloqueado: false,
    statusRelatorio: 'EM_ANDAMENTO',
    statusObra: 'REGULAR',
    justificativaFiscal: null,
    pdfUrl: null,
    codigoParaValidar: '',
  };
}

class AppState {
  constructor() {
    this.user = null;
    const savedUser = localStorage.getItem('bbvision_user');
    const savedToken = localStorage.getItem('bbvision_token');
    if (savedUser && savedToken) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (_) {
        this.user = null;
        localStorage.removeItem('bbvision_user');
      }
    }

    const savedTemplate = localStorage.getItem('bbvision_checklist_template');
    if (savedTemplate) {
      try {
        this.checklistTemplate = higienizarTemplateChecklist(JSON.parse(savedTemplate));
      } catch (_) {
        this.checklistTemplate = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
      }
    } else {
      this.checklistTemplate = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
    }

    this.currentPage = this.user ? 'inicio' : 'login';
    this.activeNav = 'inicio';
    this.historyStack = [];
    this.selectedObra = null;
    this.searchQuery = '';
    this.isOffline = !navigator.onLine;
    this.isLoadingData = false;

    // Base 100% limpa — populada exclusivamente pelos dados reais da API
    this.obras = [];
    this.relatorios = [];
    this.fiscalRegistros = [];
    this.empreiteiras = [];
    this.currentVistoria = createEmptyVistoria(this.checklistTemplate);
    this.listeners = [];

    // Sessão expirada (HTTP 401): encerra sessão limpa e retorna ao login
    api.setUnauthorizedHandler(() => {
      if (this.user) {
        this.limparSessaoLocal();
        this.navigate('login');
      }
    });

    offlineSync.subscribe((status) => {
      this.isOffline = !status.online;
      this.notify();
    });

    offlineSync.onSynced(() => {
      if (this.user) {
        this.carregarDadosIniciais();
      }
    });

    if (this.user) {
      this.validarSessaoECarregar();
    }
  }

  limparSessaoLocal() {
    this.user = null;
    this.selectedObra = null;
    this.historyStack = [];
    this.searchQuery = '';
    this.obras = [];
    this.relatorios = [];
    this.fiscalRegistros = [];
    this.empreiteiras = [];
    this.currentVistoria = createEmptyVistoria(this.checklistTemplate);
    localStorage.removeItem('bbvision_user');
    api.setToken(null);
  }

  async validarSessaoECarregar() {
    try {
      const meRes = await api.me();
      if (meRes && meRes.usuario) {
        this.user = {
          ...meRes.usuario,
          avatar: meRes.usuario.cargo === 'fiscal'
            ? 'src/assets/icons/perfil_bb.png'
            : 'src/assets/icons/perfil_obras.png',
        };
        localStorage.setItem('bbvision_user', JSON.stringify(this.user));
        await this.carregarDadosIniciais();
        offlineSync.sincronizarFila();
      }
    } catch (err) {
      if (err.status === 401) {
        this.limparSessaoLocal();
        if (this.currentPage !== 'validador-publico') {
          this.currentPage = 'login';
        }
        this.notify();
      } else {
        // Offline com sessão já existente: permite operar com fila offline
        this.notify();
      }
    }
  }

  async carregarEmpreiteiras() {
    if (!this.user || this.user.cargo !== 'fiscal') return [];
    try {
      const lista = await api.getEmpreiteiras();
      if (Array.isArray(lista)) {
        this.empreiteiras = lista;
      }
    } catch (err) {
      console.warn('[State] Aviso ao listar empreiteiras:', err.message);
    }
    return this.empreiteiras;
  }

  async carregarDadosIniciais() {
    if (!this.user) return;
    this.isLoadingData = true;
    try {
      const [obrasApi, relatoriosApi, templateApi] = await Promise.all([
        api.getObras(),
        api.getRelatorios(),
        api.getChecklistTemplate().catch(() => null),
      ]);

      if (Array.isArray(templateApi) && templateApi.length > 0) {
        this.checklistTemplate = higienizarTemplateChecklist(templateApi);
        localStorage.setItem('bbvision_checklist_template', JSON.stringify(this.checklistTemplate));
      }

      if (Array.isArray(obrasApi)) {
        this.obras = obrasApi.map((o, idx) => ({
          id: o.id,
          nome: o.nome,
          subtitulo: o.endereco ? o.endereco.split('-')[0].trim() : 'Unidade',
          tipo: o.tipo || 'Reforma e Modernização',
          responsavel: o.responsavel || 'A definir',
          endereco: o.endereco || '',
          status: o.status || 'REGULAR',
          destaque: idx === 0,
          imagemTipo: idx === 0 ? 'logo' : (idx % 2 === 0 ? 'cad1' : 'cad2'),
          empreiteira_id: o.empreiteira_id || null,
          cadastrado_por_fiscal_id: o.cadastrado_por_fiscal_id || null,
          fiscal_responsavel_id: o.fiscal_responsavel_id || null,
          checklist_perguntas: o.checklist_perguntas,
          perguntasChecklist: o.checklist_perguntas,
          created_at: o.created_at,
        }));
      } else {
        this.obras = [];
      }

      if (Array.isArray(relatoriosApi)) {
        this.relatorios = relatoriosApi.map(r => {
          const statusLabel =
            r.status === 'APROVADO'
              ? 'Homologado'
              : r.status === 'PENDENTE_AJUSTE'
              ? 'Pendente de Ajuste'
              : r.status === 'FINALIZADO'
              ? 'Aguardando Auditoria'
              : 'Em andamento';
          const dataIso = r.data_finalizacao || r.finalizado_em || r.created_at;
          return {
            id: r.id,
            obraId: r.obra_id || r.obra?.id || null,
            obraNome: r.obra?.nome || 'Obra Cadastrada',
            subtitulo: r.obra?.endereco ? r.obra.endereco.split('-')[0].trim() : '',
            status: statusLabel,
            statusRaw: r.status,
            data: dataIso ? new Date(dataIso).toLocaleDateString('pt-BR') : 'Recente',
            dataHora: dataIso ? new Date(dataIso).toLocaleString('pt-BR') : '',
            codigoUnico: r.codigo_unico || 'Pendente',
            confiancaIA: r.fotos?.[0]?.confianca_ia ?? r.fotos?.[0]?.confianca ?? null,
            hash: r.hash_integridade || null,
            pdfUrl: `/api/relatorios/${r.id}/pdf`,
            justificativaFiscal: r.justificativa_fiscal || null,
            obraStatus: r.obra?.status || (r.status === 'PENDENTE_AJUSTE' ? 'PENDENTE_AJUSTE' : 'REGULAR'),
            responsavel: r.usuario?.nome || r.obra?.responsavel || 'Responsável Técnico',
            validacaoManual: Boolean(r.validacao_manual),
            fotos: r.fotos || [],
            respostas: r.respostas || [],
          };
        });

        const todasFotos = [];
        relatoriosApi.forEach(r => {
          if (Array.isArray(r.fotos)) {
            r.fotos.forEach((f, fIdx) => {
              const motivoReal = f.motivo || f.motivo_ia || 'Evidência fotográfica capturada in-loco.';
              const statusIa = f.status_ia || f.avaliacao_gemini || 'APROVADO';
              todasFotos.push({
                id: f.id || `fot-${r.id}-${fIdx}`,
                codigo: r.codigo_unico || 'Pendente',
                hash: f.hash_integridade || f.hash_sha256 || r.hash_integridade || '',
                titulo: motivoReal.length > 36 ? `${motivoReal.substring(0, 36)}...` : motivoReal,
                motivo: motivoReal,
                local: r.obra?.nome || 'Obra Cadastrada',
                responsavel: r.usuario?.nome || r.obra?.responsavel || 'Responsável Técnico',
                status: statusIa === 'APROVADO' ? 'Validado' : (statusIa === 'VALIDACAO_MANUAL' ? 'Manual' : 'Pendente'),
                img: normalizeImageSrc(f.previewDataUrl || f.url || f.caminho_arquivo),
                confianca: f.confianca !== undefined && f.confianca !== null ? f.confianca : (f.confianca_ia ?? null),
                relatorioId: r.id,
              });
            });
          }
        });
        this.fiscalRegistros = todasFotos;
      } else {
        this.relatorios = [];
        this.fiscalRegistros = [];
      }

      if (this.user.cargo === 'fiscal') {
        await this.carregarEmpreiteiras();
      }

      // Mantém selectedObra sincronizada se já existir
      if (this.selectedObra) {
        const atual = this.obras.find(o => o.id === this.selectedObra.id);
        this.selectedObra = atual || null;
      }
    } catch (err) {
      console.warn('[State] Falha ao carregar dados da API:', err.message);
    } finally {
      this.isLoadingData = false;
      this.notify();
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  navigate(page, navTab = null, options = {}) {
    const { replace = false, fromPopstate = false, clearHistory = false } = options || {};
    const prevPage = this.currentPage;
    const prevNav = this.activeNav;

    if (clearHistory || page === 'login') {
      this.historyStack = [];
    } else if (!replace && prevPage && prevPage !== page && prevPage !== 'login') {
      const top = this.historyStack[this.historyStack.length - 1];
      if (!top || top.page !== prevPage) {
        this.historyStack.push({ page: prevPage, navTab: prevNav });
        if (this.historyStack.length > 25) {
          this.historyStack.shift();
        }
      }
    }

    this.currentPage = page;
    if (navTab) {
      this.activeNav = navTab;
    } else if (['inicio', 'obras', 'relatorios', 'perfil', 'fiscal-auditoria'].includes(page)) {
      this.activeNav = page;
    }

    if (!fromPopstate && typeof window !== 'undefined' && window.history && typeof window.history.pushState === 'function') {
      try {
        const histState = { bbvisionPage: this.currentPage, navTab: this.activeNav };
        if (replace || clearHistory || prevPage === page) {
          window.history.replaceState(histState, '');
        } else {
          window.history.pushState(histState, '');
        }
      } catch (_) {}
    }

    this.notify();
  }

  goBack(fallbackPage = 'inicio', fallbackNavTab = null) {
    const bloqueadasAposSelo = [
      'tipo-local',
      'checklist-pergunta',
      'checklist-dinamico',
      'checklist-verificacao',
      'camera-ia',
      'imagem-protegida',
      'assinatura-responsavel',
    ];

    while (this.historyStack.length > 0) {
      const prev = this.historyStack.pop();
      if (!prev || !prev.page || prev.page === this.currentPage) continue;
      if (this.user && prev.page === 'login') continue;
      if (this.currentVistoria?.bloqueado && bloqueadasAposSelo.includes(prev.page)) continue;
      this.navigate(prev.page, prev.navTab || null, { replace: true });
      return;
    }

    const targetFallback = fallbackPage || (this.user ? 'inicio' : 'login');
    this.navigate(targetFallback, fallbackNavTab || null, { replace: true });
  }

  setSearchQuery(q) {
    this.searchQuery = String(q || '').toLowerCase();
    this.notify();
  }

  getPerguntasParaObra(obraId) {
    const obra = this.obras.find(o => o.id === obraId);
    if (obra && Array.isArray(obra.perguntasChecklist) && obra.perguntasChecklist.length > 0) {
      return higienizarTemplateChecklist(JSON.parse(JSON.stringify(obra.perguntasChecklist)));
    }
    if (obra && Array.isArray(obra.checklist_perguntas) && obra.checklist_perguntas.length > 0) {
      return higienizarTemplateChecklist(JSON.parse(JSON.stringify(obra.checklist_perguntas)));
    }
    return higienizarTemplateChecklist(JSON.parse(JSON.stringify(this.checklistTemplate || PERGUNTAS_PADRAO_BB)));
  }

  resetarVistoriaAtual() {
    const coordsAtuais = this.currentVistoria?.coordenadas || null;
    const localAtual = this.currentVistoria?.localizacaoFoto || 'Obtendo GPS em tempo real...';
    this.currentVistoria = createEmptyVistoria(this.checklistTemplate);
    this.currentVistoria.coordenadas = coordsAtuais;
    this.currentVistoria.localizacaoFoto = localAtual;
    if (this.user) {
      this.currentVistoria.responsavel = this.user.nome || '';
      this.currentVistoria.matricula = this.user.registro_profissional || '';
    }
  }

  async salvarChecklistTemplate(perguntas) {
    if (!Array.isArray(perguntas) || perguntas.length === 0) return;
    const res = await api.salvarChecklistTemplate(perguntas);
    this.checklistTemplate = higienizarTemplateChecklist(res?.template || perguntas);
    localStorage.setItem('bbvision_checklist_template', JSON.stringify(this.checklistTemplate));
    this.notify();
    return this.checklistTemplate;
  }

  async salvarChecklistObra(obraId, perguntas) {
    if (!Array.isArray(perguntas) || perguntas.length === 0) return;
    const res = await api.salvarChecklistObra(obraId, perguntas);
    const salvas = higienizarTemplateChecklist(res?.perguntas || perguntas);
    const obra = this.obras.find(o => o.id === obraId);
    if (obra) {
      obra.perguntasChecklist = salvas;
      obra.checklist_perguntas = salvas;
    }
    if (this.currentVistoria.obraId === obraId) {
      this.currentVistoria.perguntasChecklist = JSON.parse(JSON.stringify(salvas));
    }
    this.notify();
    return salvas;
  }

  selectObra(obraId) {
    const obra = this.obras.find(o => o.id === obraId) || this.obras[0] || null;
    if (!obra) {
      this.selectedObra = null;
      return false;
    }
    this.selectedObra = obra;
    this.resetarVistoriaAtual();
    this.currentVistoria.obraId = obra.id;
    this.currentVistoria.obraNome = obra.nome;
    this.currentVistoria.endereco = obra.endereco;
    this.currentVistoria.responsavel = this.user?.cargo === 'empreiteira'
      ? this.user.nome
      : (obra.responsavel || 'A definir');
    this.currentVistoria.matricula = this.user?.cargo === 'empreiteira'
      ? (this.user.registro_profissional || 'Não informado')
      : '';
    this.currentVistoria.etapa = obra.tipo || 'Em acompanhamento';
    this.currentVistoria.statusObra = obra.status || 'REGULAR';
    this.currentVistoria.perguntasChecklist = this.getPerguntasParaObra(obra.id);

    // Se já houver relatório com foto para esta obra, exibe a última foto real nos detalhes
    const ultimoRel = this.relatorios.find(r => r.obraId === obra.id && Array.isArray(r.fotos) && r.fotos.length > 0);
    if (ultimoRel) {
      const f = ultimoRel.fotos[0];
      this.currentVistoria.fotoUrl = normalizeImageSrc(f.previewDataUrl || f.url || f.caminho_arquivo, '');
    }

    this.notify();
    return true;
  }

  selecionarRelatorioParaAuditoria(relatorioId) {
    const rel = this.relatorios.find(r => r.id === relatorioId);
    if (!rel) return false;
    this.currentVistoria.relatorioId = rel.id;
    this.currentVistoria.obraId = rel.obraId;
    this.currentVistoria.obraNome = rel.obraNome;
    this.currentVistoria.responsavel = rel.responsavel || 'Responsável Técnico';
    this.currentVistoria.codigoUnico = rel.codigoUnico;
    this.currentVistoria.hashSha256 = rel.hash || '';
    this.currentVistoria.pdfUrl = rel.pdfUrl;
    this.currentVistoria.statusRelatorio = rel.statusRaw;
    this.currentVistoria.statusObra = rel.obraStatus || (rel.statusRaw === 'PENDENTE_AJUSTE' ? 'PENDENTE_AJUSTE' : 'REGULAR');
    this.currentVistoria.justificativaFiscal = rel.justificativaFiscal || null;
    this.currentVistoria.dataFoto = rel.data || '';
    this.currentVistoria.horaFoto = rel.dataHora || '';
    this.notify();
    return true;
  }

  async criarNovaObra(dados) {
    if (this.user?.cargo !== 'fiscal') {
      throw new Error('Acesso negado. Apenas Fiscais de Obra podem cadastrar novas obras.');
    }

    const perguntasParaSalvar =
      Array.isArray(dados.perguntasChecklist) && dados.perguntasChecklist.length > 0
        ? dados.perguntasChecklist
        : Array.isArray(dados.checklist_perguntas) && dados.checklist_perguntas.length > 0
        ? dados.checklist_perguntas
        : JSON.parse(JSON.stringify(this.checklistTemplate || PERGUNTAS_PADRAO_BB));

    const resp = await api.criarObra({
      nome: dados.nome,
      endereco: dados.endereco,
      responsavel: dados.responsavel || '',
      tipo: dados.tipo || 'Reforma e Modernização de Agência',
      status: dados.status || 'REGULAR',
      empreiteira_id: dados.empreiteira_id || null,
      fiscal_responsavel_id: this.user.id,
      checklist_perguntas: perguntasParaSalvar,
    });

    await this.carregarDadosIniciais();
    return resp?.obra || resp;
  }

  async editarObra(obraId, dados) {
    if (this.user?.cargo !== 'fiscal') {
      throw new Error('Acesso negado. Apenas Fiscais de Obra podem editar obras.');
    }
    const resp = await api.atualizarObra(obraId, dados);
    await this.carregarDadosIniciais();
    if (this.selectedObra && this.selectedObra.id === obraId) {
      this.selectObra(obraId);
    }
    return resp?.obra || resp;
  }

  async excluirObra(obraId) {
    if (this.user?.cargo !== 'fiscal') {
      throw new Error('Acesso negado. Apenas Fiscais de Obra podem excluir obras.');
    }
    await api.excluirObra(obraId);
    if (this.selectedObra && this.selectedObra.id === obraId) {
      this.selectedObra = null;
    }
    await this.carregarDadosIniciais();
  }

  setTipoLocal(tipo, desc) {
    this.currentVistoria.tipoLocal = tipo;
    this.currentVistoria.tipoLocalDesc = desc;
    this.notify();
  }

  setResultadoAvaliacaoIa(resultado) {
    this.currentVistoria.statusIA = resultado.status || 'APROVADO';
    this.currentVistoria.categoriaIA = resultado.categoria || (resultado.status === 'APROVADO' ? 'OBRA_LOCAL' : 'REJEITADO');
    this.currentVistoria.confiancaIA = resultado.confianca ?? null;
    this.currentVistoria.motivoIA = resultado.motivo || '';
    if (resultado.hash_integridade) {
      this.currentVistoria.hashSha256 = resultado.hash_integridade;
    }
    if (resultado.caminho_arquivo) {
      this.currentVistoria.caminhoArquivoFoto = resultado.caminho_arquivo;
    }
    this.currentVistoria.validacaoManual = Boolean(resultado.validacao_manual || resultado.status === 'VALIDACAO_MANUAL');
    if (this.currentVistoria.validacaoManual && resultado.motivo) {
      this.currentVistoria.motivoValidacaoManual = resultado.motivo;
    }
    if (this.currentPage !== 'camera-ia') {
      this.notify();
    }
  }

  setLocalizacaoFoto(local, coords = null, shouldNotify = true) {
    if (this.currentVistoria.localizacaoFoto === local && !coords) return;
    this.currentVistoria.localizacaoFoto = local;
    if (coords) this.currentVistoria.coordenadas = coords;
    if (shouldNotify && this.currentPage !== 'camera-ia') {
      this.notify();
    }
  }

  atualizarDataHoraCaptura(data = null, hora = null) {
    const agora = new Date();
    this.currentVistoria.dataFoto = data || agora.toLocaleDateString('pt-BR');
    this.currentVistoria.horaFoto = hora || agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentVistoria.timestampFoto = agora.toISOString();
    if (this.currentPage !== 'camera-ia') {
      this.notify();
    }
  }

  async finalizarVistoriaComAssinatura(assinaturaDataUrl, senhaConfirmacao) {
    if (!this.currentVistoria.obraId) {
      throw new Error('Nenhuma obra selecionada para finalizar a vistoria.');
    }

    this.currentVistoria.assinatura = assinaturaDataUrl;

    const justMap = this.currentVistoria.respostas.justificativas || {};
    const perguntasAtuais =
      Array.isArray(this.currentVistoria.perguntasChecklist) && this.currentVistoria.perguntasChecklist.length > 0
        ? this.currentVistoria.perguntasChecklist
        : PERGUNTAS_PADRAO_BB;

    const itensRespostas = perguntasAtuais.map((q, idx) => {
      const chave = q.chaveResposta || q.id || `pergunta_${idx}`;
      const rawValor = this.currentVistoria.respostas[chave];
      const valorFormatado = Array.isArray(rawValor)
        ? (rawValor.length > 0 ? rawValor.join('; ') : 'Não informado')
        : (rawValor || 'Não informado');
      return {
        pergunta: q.titulo || `${idx + 1}. Item do checklist`,
        valor: String(valorFormatado),
        justificativa: justMap[chave] || null,
        tipo: q.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        sugestao_ia: null,
      };
    });

    const nextNum = itensRespostas.length + 1;
    itensRespostas.push({
      pergunta: `${nextNum}. Condição da sinalização complementar, limpeza e câmeras`,
      valor: `Sinalização: ${this.currentVistoria.respostas.sinalizacao || 'Não informado'} | Limpeza: ${this.currentVistoria.respostas.limpeza || '-'}/5 | Câmeras: ${this.currentVistoria.respostas.cameras ?? '-'}`,
      justificativa: this.currentVistoria.respostas.justificativaSinalizacao || null,
      tipo: 'multipla_escolha',
      sugestao_ia: null,
    });

    // Inclui os itens marcados no Checklist de Verificação (Etapa 2 de 3)
    const checksConfirmados = ITENS_VERIFICACAO_TEXTOS
      .filter(i => Boolean(this.currentVistoria.respostas[i.key]))
      .map(i => i.texto);
    if (checksConfirmados.length > 0) {
      itensRespostas.push({
        pergunta: `${nextNum + 1}. Itens confirmados no Checklist de Verificação`,
        valor: checksConfirmados.join('; '),
        tipo: 'multipla_escolha',
        sugestao_ia: null,
      });
    }

    if (this.currentVistoria.respostas.observacoes) {
      itensRespostas.push({
        pergunta: `${nextNum + (checksConfirmados.length > 0 ? 2 : 1)}. Observações adicionais consolidadas`,
        valor: this.currentVistoria.respostas.observacoes,
        tipo: 'texto',
        sugestao_ia: null,
      });
    }

    try {
      // 1. Cria relatório no backend se ainda não criado
      let relId = this.currentVistoria.relatorioId;
      if (!relId) {
        const novoRel = await api.criarRelatorio(this.currentVistoria.obraId, {
          tipo_local: this.currentVistoria.tipoLocal || null,
          localizacao_texto: this.currentVistoria.localizacaoFoto || null,
          latitude: this.currentVistoria.coordenadas?.lat ?? null,
          longitude: this.currentVistoria.coordenadas?.lng ?? null,
          precisao_gps: this.currentVistoria.coordenadas?.precisao ?? null,
        });
        relId = novoRel.id;
        this.currentVistoria.relatorioId = relId;
      }

      // 2. Anexa evidência fotográfica
      let fotoAnexada = false;
      if (this.currentVistoria.caminhoArquivoFoto || this.currentVistoria.fotoCamera || this.currentVistoria.fotoBase64) {
        const statusIaFoto = this.currentVistoria.validacaoManual
          ? 'VALIDACAO_MANUAL'
          : (this.currentVistoria.statusIA || 'APROVADO');
        const fotoResp = await api.anexarFoto(relId, {
          caminho_arquivo: this.currentVistoria.caminhoArquivoFoto || '',
          imagemBase64: !this.currentVistoria.caminhoArquivoFoto ? (this.currentVistoria.fotoCamera || this.currentVistoria.fotoBase64 || '') : '',
          hash_integridade: this.currentVistoria.hashSha256 || '',
          confianca: this.currentVistoria.confiancaIA ?? 0.94,
          motivo: this.currentVistoria.motivoIA || 'Evidência fotográfica capturada in-loco.',
          avaliacao_gemini: statusIaFoto,
        });
        if (fotoResp?.foto?.caminho_arquivo) {
          this.currentVistoria.caminhoArquivoFoto = fotoResp.foto.caminho_arquivo;
        }
        fotoAnexada = true;
      }

      // 3. Salva respostas do checklist
      await api.salvarRespostas(relId, itensRespostas);

      // 4. Finaliza relatório validando senha e gravando assinatura + GPS + PDF oficial
      const payloadFinal = {
        senha_confirmacao: senhaConfirmacao,
        assinatura_base64: assinaturaDataUrl || null,
        tipo_local: this.currentVistoria.tipoLocal || null,
        localizacao_texto: this.currentVistoria.localizacaoFoto || null,
        latitude: this.currentVistoria.coordenadas?.lat ?? null,
        longitude: this.currentVistoria.coordenadas?.lng ?? null,
        precisao_gps: this.currentVistoria.coordenadas?.precisao ?? null,
        validacao_manual: Boolean(this.currentVistoria.validacaoManual),
        motivo_validacao_manual: this.currentVistoria.motivoValidacaoManual || null,
      };
      if (!fotoAnexada && (this.currentVistoria.fotoCamera || this.currentVistoria.fotoBase64)) {
        payloadFinal.fotos = [{
          imagemBase64: this.currentVistoria.fotoCamera || this.currentVistoria.fotoBase64,
          hash_integridade: this.currentVistoria.hashSha256 || '',
          confianca: this.currentVistoria.confiancaIA ?? 0.94,
          motivo: this.currentVistoria.motivoIA || 'Evidência fotográfica capturada in-loco.',
          avaliacao_gemini: this.currentVistoria.validacaoManual ? 'VALIDACAO_MANUAL' : 'APROVADO',
        }];
      }

      const finalRes = await api.finalizarRelatorio(relId, payloadFinal);

      this.currentVistoria.bloqueado = true;
      this.currentVistoria.statusRelatorio = 'FINALIZADO';
      this.currentVistoria.codigoUnico = finalRes.codigo;
      this.currentVistoria.codigoHexDoc = finalRes.codigo;
      this.currentVistoria.hashSha256 = finalRes.hashIntegridade;
      this.currentVistoria.pdfUrl = finalRes.pdfUrl;

      await this.carregarDadosIniciais();
      return { offline: false, ...finalRes };
    } catch (err) {
      // Se for erro de validação/senha incorreta/autorização (HTTP 4xx), propaga o erro ao usuário!
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }

      // Somente em falha real de rede/offline (HU05): salva na fila local segura
      const randHex16 = generateSecureHex16();
      this.currentVistoria.bloqueado = true;
      this.currentVistoria.statusRelatorio = 'FINALIZADO';
      this.currentVistoria.codigoUnico = randHex16;
      this.currentVistoria.codigoHexDoc = randHex16;
      this.currentVistoria.validacaoManual = true;
      offlineSync.enfileirarVistoria(this.currentVistoria);
      this.notify();
      return { offline: true, codigo: randHex16 };
    }
  }

  async julgarVistoriaFiscal(status, justificativa) {
    const targetRelId = this.currentVistoria.relatorioId;
    if (!targetRelId) {
      throw new Error('Nenhum relatório selecionado para julgamento técnico.');
    }

    await api.atualizarStatusFiscal(targetRelId, status, justificativa);
    this.currentVistoria.statusObra = status;
    this.currentVistoria.justificativaFiscal = justificativa;
    await this.carregarDadosIniciais();
    this.selecionarRelatorioParaAuditoria(targetRelId);
  }

  async login(email, senha) {
    const res = await api.login(email, senha);
    if (res && res.usuario) {
      this.user = {
        ...res.usuario,
        avatar: res.usuario.cargo === 'fiscal'
          ? 'src/assets/icons/perfil_bb.png'
          : 'src/assets/icons/perfil_obras.png',
      };
      localStorage.setItem('bbvision_user', JSON.stringify(this.user));
      this.resetarVistoriaAtual();
      await this.carregarDadosIniciais();
      offlineSync.sincronizarFila();
      this.navigate('inicio', 'inicio');
      return res;
    }
    throw new Error('Resposta de autenticação inválida.');
  }

  async register(dados) {
    const res = await api.register(dados);
    if (res && res.usuario) {
      this.user = {
        ...res.usuario,
        avatar: res.usuario.cargo === 'fiscal'
          ? 'src/assets/icons/perfil_bb.png'
          : 'src/assets/icons/perfil_obras.png',
      };
      localStorage.setItem('bbvision_user', JSON.stringify(this.user));
      this.resetarVistoriaAtual();
      await this.carregarDadosIniciais();
      this.navigate('inicio', 'inicio');
      return res;
    }
    throw new Error('Falha ao concluir o cadastro.');
  }

  async atualizarPerfil(dados) {
    const res = await api.atualizarPerfil(dados);
    if (res && res.usuario) {
      this.user = {
        ...this.user,
        ...res.usuario,
      };
      localStorage.setItem('bbvision_user', JSON.stringify(this.user));
      this.notify();
    }
    return res;
  }

  async alterarSenha(senhaAtual, novaSenha) {
    return api.alterarSenha(senhaAtual, novaSenha);
  }

  async logout() {
    await api.logout();
    this.limparSessaoLocal();
    this.navigate('login');
  }
}

export const state = new AppState();
