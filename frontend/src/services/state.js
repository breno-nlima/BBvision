/**
 * BVision State Management Service
 * Gerencia o estado reativo da aplicação (Navegação, Usuário, Obras e Vistorias)
 * Conforme Requisitos Oficiais de Entrega TakeOff / Banco do Brasil
 */

import { api } from './api.js';
import { offlineSync } from './offlineSync.js';

// Modelo Oficial BB de Perguntas do Checklist da Obra (Editável por Fiscal de Obras)
export const PERGUNTAS_PADRAO_BB = [
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
      { valor: 'Sim', label: 'Sim (Perfeitamente visível)', detalhe: 'Identificação visual BB e acessos sem nenhuma obstrução', tag: 'Conforme', classeTag: 'tag-conforme' },
      { valor: 'Parcial', label: 'Parcial (Obstrução ou reforma)', detalhe: 'Andaimes, reformas pontuais ou cobertura parcial transitória', tag: 'Atenção', classeTag: 'tag-atencao' },
      { valor: 'Não', label: 'Não (Inadequada ou ilegível)', detalhe: 'Logomarca ausente, danificada ou severamente encoberta', tag: 'Não Conforme', classeTag: 'tag-erro' }
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
      { valor: 'Isolamento perimetral e tapumes íntegros', label: 'Isolamento perimetral e tapumes íntegros', detalhe: 'Canteiro devidamente fechado sem brechas para circulação pública de pedestres' },
      { valor: 'Sinalização visual de perigo e rotas de pedestres', label: 'Sinalização de perigo e rotas de pedestres', detalhe: 'Placas de advertência oficiais do BB e faixas de circulação externa desobstruídas' },
      { valor: 'Uso obrigatório de EPIs completos pela equipe', label: 'Uso obrigatório de EPIs completos pela equipe', detalhe: 'Capacetes, botinas com biqueira e óculos de proteção em uso pelos operários' },
      { valor: 'Extintores de incêndio vistoriados e desobstruídos', label: 'Extintores de incêndio vistoriados e acessíveis', detalhe: 'Cargas de água e pó químico pressurizados dentro do prazo de validade' },
      { valor: 'Proteção contra quedas e telas de contenção em altura', label: 'Linha de vida e telas de contenção em altura', detalhe: 'Guarda-corpos regulamentares e telas fachadeiras montadas sem aberturas' }
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
    placeholder: 'Neste campo, preencher com informações sobre a qualidade do serviço. Ex.: o alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra:',
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
      { valor: 'Totalmente acessível (Piso tátil e rampa nivelada sem degraus)', label: 'Totalmente acessível (NBR 9050)', detalhe: 'Piso tátil direcional/alerta instalado e rampa nivelada sem degraus impeditivos', tag: '100% Conforme', classeTag: 'tag-conforme' },
      { valor: 'Parcialmente acessível (Pequeno desnível ou adequação em andamento)', label: 'Parcialmente acessível (Em adequação)', detalhe: 'Rampa provisória segura ou acabamento de piso tátil em fase final de execução', tag: 'Com Ressalva', classeTag: 'tag-atencao' },
      { valor: 'Inacessível / Bloqueado (Necessita intervenção corretiva urgente)', label: 'Inacessível / Bloqueado', detalhe: 'Degraus sem rampa alternativa, calçada esburacada ou obstrução total de acesso', tag: 'Crítico', classeTag: 'tag-erro' }
    ]
  }
];

function higienizarTemplateChecklist(lista) {
  if (!Array.isArray(lista)) return JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
  return lista.map(q => {
    const copia = { ...q };
    copia.padrao = copia.tipo === 'caixa' ? [] : '';
    if (copia.id === 'relatoEstrutural' || copia.tipo === 'texto') {
      copia.placeholder = 'Neste campo, preencher com informações sobre a qualidade do serviço. Ex.: o alinhamento, prumo, eventuais fissuras ou conformidade de execução da obra:';
    }
    return copia;
  });
}

class AppState {
  constructor() {
    const savedUser = localStorage.getItem('bbvision_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        this.user = null;
      }
    } else {
      this.user = null;
    }

    // Inicialização do modelo padrão de perguntas do checklist (Editável pelo Fiscal de Obras)
    const savedTemplate = localStorage.getItem('bbvision_checklist_template');
    if (savedTemplate) {
      try {
        this.checklistTemplate = higienizarTemplateChecklist(JSON.parse(savedTemplate));
      } catch {
        this.checklistTemplate = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
      }
    } else {
      this.checklistTemplate = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
    }

    this.currentPage = this.user ? 'inicio' : 'login';
    this.activeNav = 'inicio';
    this.selectedObra = null;
    this.searchQuery = '';
    this.isOffline = !navigator.onLine;

    // Obras em conformidade com o Banco do Brasil e backend
    this.obras = [
      {
        id: 'obr-001',
        nome: 'Obra Centro (Agência Sede)',
        subtitulo: 'Reforma e Modernização',
        tipo: 'Reforma e Modernização de Agência',
        responsavel: 'Engenharia de Campo',
        endereco: 'Av. Rio Branco, 120 - Centro',
        status: 'REGULAR',
        destaque: true,
        imagemTipo: 'logo',
        empreiteira_id: '11111111-1111-4111-8111-111111111111',
        cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222',
        fiscal_responsavel_id: '22222222-2222-4222-8222-222222222222'
      },
      {
        id: 'obr-002',
        nome: 'Obra Zona Sul (Agência Paulista)',
        subtitulo: 'Adequação de Acessibilidade',
        tipo: 'Adequação de Acessibilidade',
        responsavel: 'Engenharia de Campo',
        endereco: 'Av. Paulista, 2163 - Cerqueira César',
        status: 'REGULAR',
        destaque: false,
        imagemTipo: 'cad1',
        empreiteira_id: '11111111-1111-4111-8111-111111111111',
        cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222',
        fiscal_responsavel_id: '22222222-2222-4222-8222-222222222222'
      },
      {
        id: 'obr-003',
        nome: 'Agência Asa Sul (Edificação Nova)',
        subtitulo: 'Construção Nova',
        tipo: 'Construção de Nova Agência',
        responsavel: 'Engenharia de Campo',
        endereco: 'SBS Quadra 1 Bloco G Lote 32',
        status: 'EM_ANDAMENTO',
        destaque: false,
        imagemTipo: 'cad2',
        empreiteira_id: '11111111-1111-4111-8111-111111111111',
        cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222',
        fiscal_responsavel_id: '44444444-4444-4444-8444-444444444444'
      },
      {
        id: 'obr-004',
        nome: 'Obra Copacabana (Fachada e Interior)',
        subtitulo: 'Manutenção Predial',
        tipo: 'Manutenção Predial e Fachada',
        responsavel: 'Engenharia de Campo',
        endereco: 'Rua Barata Ribeiro, 300',
        status: 'EM_ANDAMENTO',
        destaque: false,
        imagemTipo: 'cad2',
        empreiteira_id: '33333333-3333-4333-8333-333333333333',
        cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222',
        fiscal_responsavel_id: '22222222-2222-4222-8222-222222222222'
      }
    ];

    // Histórico de análises / relatórios recentes
    this.relatorios = [
      {
        id: 'rel-001',
        obraNome: 'Obra Centro',
        subtitulo: 'Futura unidade',
        status: 'Concluído',
        data: '02/10/2026',
        codigoUnico: '8F4A2C19E70B34DF',
        confiancaIA: 0.96,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'rel-002',
        obraNome: 'Obra Zona Sul',
        subtitulo: 'Residência',
        status: 'Concluído',
        data: '01/10/2026',
        codigoUnico: '91BC34EFA87210DC',
        confiancaIA: 0.92,
        hash: 'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14'
      },
      {
        id: 'rel-003',
        obraNome: 'Residência Alpha',
        subtitulo: 'Construção nova',
        status: 'Em andamento',
        data: 'Hoje',
        codigoUnico: 'Pendente',
        confiancaIA: null,
        hash: null
      }
    ];

    const agoraInicial = new Date();
    const dataInicial = agoraInicial.toLocaleDateString('pt-BR');
    const horaInicial = agoraInicial.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Estado da Vistoria Ativa (Conforme Fluxo dos Mockups e Documento)
    this.currentVistoria = {
      relatorioId: null,
      obraId: 'obr-001',
      obraNome: 'Obra Centro',
      endereco: 'Av. Paulista, 1000 — São Paulo/SP',
      responsavel: 'Rodrigo Silva',
      matricula: '0012345',
      etapa: 'Estrutura em execução',
      tipoLocal: 'Agência Bancária',
      tipoLocalDesc: 'Fachada, interior, caixa forte',
      fotoUrl: null,
      fotoCamera: null,
      fotoBase64: null,
      caminhoArquivoFoto: null,
      dataFoto: dataInicial,
      horaFoto: horaInicial,
      localizacaoFoto: 'Obtendo GPS em tempo real...',
      coordenadas: null,
      codigoUnico: '8F4A2C19E70B34DF',
      codigoHexDoc: '8F4A2C19E70B34DF',
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      confiancaIA: 0.95,
      motivoIA: 'Imagem nítida e bem enquadrada',
      validacaoManual: false,
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
        check5: false
      },
      perguntasChecklist: JSON.parse(JSON.stringify(this.checklistTemplate)),
      assinatura: null,
      declaracaoAceita: false,
      bloqueado: false,
      statusRelatorio: 'EM_ANDAMENTO',
      statusObra: 'REGULAR',
      justificativaFiscal: null,
      pdfUrl: null,
      codigoParaValidar: ''
    };

    // Registros reais de vistorias sincronizados com o backend ou capturados em campo
    this.fiscalRegistros = [];

    this.listeners = [];

    // Ouve alterações no status de conectividade (HU05)
    offlineSync.subscribe((status) => {
      this.isOffline = !status.online;
      this.notify();
    });

    // Carrega dados iniciais da API se online
    this.carregarDadosIniciais();

    // Inicia geolocalização em tempo real global
    this.iniciarGeolocalizacaoGlobal();
  }

  async carregarDadosIniciais() {
    try {
      // 1. Carrega Obras
      const obrasApi = await api.getObras();
      if (Array.isArray(obrasApi) && obrasApi.length > 0) {
        this.obras = obrasApi.map((o, idx) => ({
          id: o.id,
          nome: o.nome,
          subtitulo: o.endereco ? o.endereco.split('-')[0].trim() : 'Unidade BB',
          tipo: o.tipo || 'Agência Bancária',
          responsavel: o.responsavel || 'Rodrigo Silva',
          endereco: o.endereco || 'Endereço da obra',
          status: o.status || 'REGULAR',
          destaque: idx === 0,
          imagemTipo: idx === 0 ? 'logo' : (idx % 2 === 0 ? 'cad1' : 'cad2')
        }));
      }

      // 2. Carrega Relatórios do Backend
      const relatoriosApi = await api.getRelatorios();
      if (Array.isArray(relatoriosApi) && relatoriosApi.length > 0) {
        this.relatorios = relatoriosApi.map(r => ({
          id: r.id,
          obraNome: r.obra?.nome || 'Obra Banco do Brasil',
          subtitulo: r.obra?.endereco ? r.obra.endereco.split('-')[0].trim() : 'Agência BB',
          status: r.status === 'APROVADO' ? 'Homologado' : (r.status === 'FINALIZADO' ? 'Concluído' : 'Em andamento'),
          statusRaw: r.status,
          data: r.data_finalizacao ? new Date(r.data_finalizacao).toLocaleDateString('pt-BR') : 'Hoje',
          codigoUnico: r.codigo_unico || 'Pendente',
          confiancaIA: r.fotos?.[0]?.confianca_ia || 0.95,
          hash: r.hash_integridade || null,
          pdfUrl: r.arquivo_pdf_url || `/api/relatorios/${r.id}/pdf`,
          fotos: r.fotos || [],
          respostas: r.respostas || []
        }));

        // Se houver fotos nos relatórios, sincroniza também os registros da fiscal Mariana
        const todasFotos = [];
        relatoriosApi.forEach(r => {
          if (Array.isArray(r.fotos)) {
            r.fotos.forEach((f, fIdx) => {
              todasFotos.push({
                id: f.id || `fot-${fIdx}`,
                codigo: r.codigo_unico || '8F4A2C19E70B34DF',
                titulo: f.motivo_ia ? f.motivo_ia.substring(0, 30) : `Foto ${fIdx + 1}`,
                local: r.obra?.nome || 'Agência BB',
                responsavel: r.obra?.responsavel || 'Rodrigo Silva',
                status: f.status_ia === 'APROVADO' ? 'Validado' : 'Pendente',
                img: f.url || f.caminho_arquivo || '',
                confianca: f.confianca_ia || 0.95,
                relatorioId: r.id
              });
            });
          }
        });

        if (todasFotos.length > 0) {
          this.fiscalRegistros = todasFotos;
        }
      }

      this.notify();
    } catch (err) {
      console.log('[State] Operando com dados locais e cache offline (HU05):', err.message);
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

  navigate(page, navTab = null) {
    this.currentPage = page;
    if (navTab) {
      this.activeNav = navTab;
    } else if (['inicio', 'obras', 'relatorios', 'perfil'].includes(page)) {
      this.activeNav = page;
    }
    this.notify();
  }

  setSearchQuery(q) {
    this.searchQuery = q.toLowerCase();
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
    this.currentVistoria.relatorioId = null;
    this.currentVistoria.fotoUrl = null;
    this.currentVistoria.fotoCamera = null;
    this.currentVistoria.fotoBase64 = null;
    this.currentVistoria.caminhoArquivoFoto = null;
    this.currentVistoria.validacaoManual = false;
    this.currentVistoria.assinatura = null;
    this.currentVistoria.declaracaoAceita = false;
    this.currentVistoria.bloqueado = false;
    this.currentVistoria.statusRelatorio = 'EM_ANDAMENTO';
    this.currentVistoria.pdfUrl = null;
    this.currentVistoria.respostas = {
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
      check5: false
    };
  }

  async salvarChecklistTemplate(perguntas) {
    if (!Array.isArray(perguntas) || perguntas.length === 0) return;
    this.checklistTemplate = JSON.parse(JSON.stringify(perguntas));
    localStorage.setItem('bbvision_checklist_template', JSON.stringify(this.checklistTemplate));
    try {
      await api.salvarChecklistTemplate(this.checklistTemplate);
    } catch (e) {
      console.warn('[State] Aviso ao sincronizar template com backend:', e.message);
    }
    this.notify();
    return this.checklistTemplate;
  }

  async salvarChecklistObra(obraId, perguntas) {
    if (!Array.isArray(perguntas) || perguntas.length === 0) return;
    const obra = this.obras.find(o => o.id === obraId);
    if (obra) {
      obra.perguntasChecklist = JSON.parse(JSON.stringify(perguntas));
      obra.checklist_perguntas = obra.perguntasChecklist;
    }
    if (this.currentVistoria.obraId === obraId) {
      this.currentVistoria.perguntasChecklist = JSON.parse(JSON.stringify(perguntas));
    }
    try {
      await api.salvarChecklistObra(obraId, perguntas);
    } catch (e) {
      console.warn('[State] Aviso ao sincronizar perguntas da obra com backend:', e.message);
    }
    this.notify();
    return perguntas;
  }

  selectObra(obraId) {
    this.selectedObra = this.obras.find(o => o.id === obraId) || this.obras[0];
    this.resetarVistoriaAtual();
    this.currentVistoria.obraId = this.selectedObra.id;
    this.currentVistoria.obraNome = this.selectedObra.nome;
    this.currentVistoria.endereco = this.selectedObra.endereco;
    this.currentVistoria.responsavel = this.selectedObra.responsavel;
    this.currentVistoria.perguntasChecklist = this.getPerguntasParaObra(this.selectedObra.id);
    this.notify();
  }

  async criarNovaObra(dados) {
    if (this.user?.cargo !== 'fiscal') {
      throw new Error('Acesso negado. Apenas Fiscais de Obra do Banco do Brasil podem cadastrar novas obras.');
    }

    const perguntasParaSalvar = Array.isArray(dados.perguntasChecklist) && dados.perguntasChecklist.length > 0
      ? dados.perguntasChecklist
      : (Array.isArray(dados.checklist_perguntas) && dados.checklist_perguntas.length > 0
        ? dados.checklist_perguntas
        : JSON.parse(JSON.stringify(this.checklistTemplate || PERGUNTAS_PADRAO_BB)));

    try {
      const resp = await api.criarObra({
        nome: dados.nome,
        endereco: dados.endereco,
        responsavel: dados.responsavel || 'Rodrigo Silva',
        tipo: dados.tipo || 'Reforma e Modernização de Agência',
        status: dados.status || 'REGULAR',
        empreiteira_id: dados.empreiteira_id || '11111111-1111-4111-8111-111111111111',
        fiscal_responsavel_id: this.user.id,
        checklist_perguntas: perguntasParaSalvar
      });

      const novaObraCadastrada = resp?.obra || resp;

      const novaObraLocal = {
        id: novaObraCadastrada.id || `obr-${Date.now()}`,
        nome: novaObraCadastrada.nome || dados.nome,
        subtitulo: dados.endereco ? dados.endereco.split('-')[0].trim() : 'Unidade BB',
        tipo: novaObraCadastrada.tipo || dados.tipo || 'Agência Bancária',
        responsavel: novaObraCadastrada.responsavel || dados.responsavel || 'Rodrigo Silva',
        endereco: novaObraCadastrada.endereco || dados.endereco,
        status: novaObraCadastrada.status || dados.status || 'REGULAR',
        destaque: false,
        imagemTipo: 'cad1',
        empreiteira_id: dados.empreiteira_id || '11111111-1111-4111-8111-111111111111',
        cadastrado_por_fiscal_id: this.user.id,
        fiscal_responsavel_id: this.user.id,
        perguntasChecklist: perguntasParaSalvar,
        checklist_perguntas: perguntasParaSalvar
      };

      this.obras.unshift(novaObraLocal);
      this.notify();
      return novaObraLocal;
    } catch (err) {
      const isNetwork = err.message === 'Load failed' || err.message.includes('fetch') || this.isOffline;
      if (isNetwork) {
        const novaObraLocal = {
          id: `obr-offline-${Date.now()}`,
          nome: dados.nome,
          subtitulo: dados.endereco ? dados.endereco.split('-')[0].trim() : 'Unidade BB',
          tipo: dados.tipo || 'Agência Bancária',
          responsavel: dados.responsavel || 'Rodrigo Silva',
          endereco: dados.endereco,
          status: dados.status || 'REGULAR',
          destaque: false,
          imagemTipo: 'cad1',
          empreiteira_id: dados.empreiteira_id || '11111111-1111-4111-8111-111111111111',
          cadastrado_por_fiscal_id: this.user.id,
          fiscal_responsavel_id: this.user.id,
          perguntasChecklist: perguntasParaSalvar,
          checklist_perguntas: perguntasParaSalvar
        };
        this.obras.unshift(novaObraLocal);
        this.notify();
        return novaObraLocal;
      }
      throw err;
    }
  }

  setTipoLocal(tipo, desc) {
    this.currentVistoria.tipoLocal = tipo;
    this.currentVistoria.tipoLocalDesc = desc;
    this.notify();
  }

  setResultadoAvaliacaoIa(resultado) {
    this.currentVistoria.confiancaIA = resultado.confianca || 0.95;
    this.currentVistoria.motivoIA = resultado.motivo || 'Imagem nítida e bem enquadrada';
    this.currentVistoria.hashSha256 = resultado.hash_integridade || this.currentVistoria.hashSha256;
    if (resultado.caminho_arquivo) {
      this.currentVistoria.caminhoArquivoFoto = resultado.caminho_arquivo;
    }
    this.currentVistoria.validacaoManual = resultado.validacao_manual || resultado.status === 'VALIDACAO_MANUAL';
    this.notify();
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

  iniciarGeolocalizacaoGlobal() {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const precisao = pos.coords.accuracy;
          await this.atualizarLocalizacaoComCoords(lat, lng, precisao);
        },
        (err) => {
          console.warn('[GPS Global] Erro ao obter GPS inicial:', err.message);
          if (!this.currentVistoria.coordenadas) {
            this.currentVistoria.localizacaoFoto = this.currentVistoria.endereco 
              ? `${this.currentVistoria.endereco} (GPS pendente)` 
              : 'GPS pendente de permissão';
            if (this.currentPage !== 'camera-ia') {
              this.notify();
            }
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }

  async atualizarLocalizacaoComCoords(lat, lng, precisao) {
    this.currentVistoria.coordenadas = { lat, lng, precisao };
    const coordsStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    let localFormatado = `GPS: ${coordsStr} (±${Math.round(precisao)}m)`;

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3500)
      });
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const rua = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
        const num = addr.house_number ? `, ${addr.house_number}` : '';
        const bairro = addr.suburb || addr.neighbourhood || '';
        const cidade = addr.city || addr.town || addr.village || addr.municipality || '';
        const uf = addr.state_code || addr.state || '';

        let end = rua ? `${rua}${num}` : '';
        if (bairro && end) end += ` - ${bairro}`;
        if (cidade) end += `, ${cidade}`;
        if (uf) end += `/${uf}`;

        if (end) {
          localFormatado = `${end} (${coordsStr})`;
        }
      }
    } catch (e) {
      // Mantém formato GPS padrão
    }

    this.currentVistoria.localizacaoFoto = localFormatado;
    if (this.currentPage !== 'camera-ia') {
      this.notify();
    }
  }

  async finalizarVistoriaComAssinatura(assinaturaDataUrl) {
    this.currentVistoria.assinatura = assinaturaDataUrl;
    this.currentVistoria.bloqueado = true;
    this.currentVistoria.statusRelatorio = 'FINALIZADO';

    // Gera código único oficial no padrão de 16 caracteres hex uppercase
    const randHex16 = (
      Math.random().toString(16).substring(2, 10) +
      Math.random().toString(16).substring(2, 10)
    ).toUpperCase();

    this.currentVistoria.codigoHexDoc = randHex16;
    this.currentVistoria.codigoUnico = randHex16;

    // Tenta persistir no backend via API oficial (Seção 8.6)
    try {
      // 1. Criar relatório se não tiver id
      let relId = this.currentVistoria.relatorioId;
      if (!relId) {
        const novoRel = await api.criarRelatorio(this.currentVistoria.obraId || '11111111-2222-3333-4444-555555555555');
        relId = novoRel.id;
        this.currentVistoria.relatorioId = relId;
      }

      // 2. Anexar foto registrada
      try {
        const fotoResp = await api.anexarFoto(relId, {
          caminho_arquivo: this.currentVistoria.caminhoArquivoFoto || '',
          imagemBase64: this.currentVistoria.fotoCamera || this.currentVistoria.fotoBase64 || '',
          url: this.currentVistoria.caminhoArquivoFoto || this.currentVistoria.fotoCamera || this.currentVistoria.fotoBase64 || '',
          hash_integridade: this.currentVistoria.hashSha256,
          hash_sha256: this.currentVistoria.hashSha256,
          confianca: this.currentVistoria.confiancaIA,
          confianca_ia: this.currentVistoria.confiancaIA,
          motivo: this.currentVistoria.motivoIA,
          motivo_ia: this.currentVistoria.motivoIA,
          avaliacao_gemini: this.currentVistoria.confiancaIA >= 0.75 ? 'APROVADO' : 'VALIDACAO_MANUAL',
          status_ia: this.currentVistoria.confiancaIA >= 0.75 ? 'APROVADO' : 'VALIDACAO_MANUAL',
          validacao_manual: this.currentVistoria.validacaoManual
        });
        if (fotoResp?.foto?.caminho_arquivo) {
          this.currentVistoria.caminhoArquivoFoto = fotoResp.foto.caminho_arquivo;
        }
      } catch (errFoto) {
        console.warn('[State] Aviso ao vincular foto na API:', errFoto.message);
      }

      // 3. Salvar respostas do checklist (Passo a passo com 4 perguntas + dinâmico)
      const justMap = this.currentVistoria.respostas.justificativas || {};
      const epcFormatado = Array.isArray(this.currentVistoria.respostas.segurancaEpc) && this.currentVistoria.respostas.segurancaEpc.length > 0
        ? this.currentVistoria.respostas.segurancaEpc.join('; ')
        : (this.currentVistoria.respostas.segurancaEpc || 'Isolamento e EPIs verificados');

      await api.salvarRespostas(relId, [
        {
          pergunta: '1. Fachada da agência está legível e conforme padrão BB?',
          valor: this.currentVistoria.respostas.fachadaLegivel || 'Sim',
          justificativa: justMap.fachadaLegivel || null,
          tipo: 'multipla_escolha',
          sugestao_ia: 'Fachada frontal avaliada segundo padrão visual oficial do Banco do Brasil.'
        },
        {
          pergunta: '2. Itens de segurança, proteção coletiva (EPC) e sinalização',
          valor: epcFormatado,
          justificativa: justMap.segurancaEpc || null,
          tipo: 'caixa_selecao',
          sugestao_ia: 'Itens de proteção coletiva e sinalização verificados in loco.'
        },
        {
          pergunta: '3. Relato técnico sobre alvenaria, acabamentos e anomalias',
          valor: this.currentVistoria.respostas.relatoEstrutural || this.currentVistoria.respostas.observacoes || 'Alvenaria e vigas em conformidade executiva.',
          tipo: 'texto',
          sugestao_ia: null
        },
        {
          pergunta: '4. Calçada externa e acessibilidade da entrada principal (NBR 9050)',
          valor: this.currentVistoria.respostas.acessibilidade || 'Totalmente acessível (NBR 9050)',
          justificativa: justMap.acessibilidade || null,
          tipo: 'multipla_escolha',
          sugestao_ia: 'Condição de acessibilidade avaliada conforme diretrizes NBR 9050.'
        },
        {
          pergunta: '5. Condição da sinalização complementar, limpeza e câmeras',
          valor: `Sinalização: ${this.currentVistoria.respostas.sinalizacao || 'Sim'} | Limpeza: ${this.currentVistoria.respostas.limpeza || 5}/5 | Câmeras: ${this.currentVistoria.respostas.cameras ?? 4}`,
          justificativa: this.currentVistoria.respostas.justificativaSinalizacao || null,
          tipo: 'multipla_escolha',
          sugestao_ia: null
        },
        ...(this.currentVistoria.respostas.observacoes ? [{
          pergunta: '6. Observações adicionais consolidadas',
          valor: this.currentVistoria.respostas.observacoes,
          tipo: 'texto',
          sugestao_ia: null
        }] : [])
      ]);

      // 4. Finalizar e gerar PDF oficial com carimbo via PDFKit
      const finalRes = await api.finalizarRelatorio(relId);
      if (finalRes && finalRes.codigo) {
        this.currentVistoria.codigoUnico = finalRes.codigo;
        this.currentVistoria.codigoHexDoc = finalRes.codigo;
        this.currentVistoria.hashSha256 = finalRes.hashIntegridade;
        this.currentVistoria.pdfUrl = finalRes.pdfUrl;
      }

      // Re-sincroniza lista completa
      await this.carregarDadosIniciais();
    } catch (err) {
      console.warn('[State] Erro ao finalizar na API, aplicando persistência offline (HU05):', err.message);
      offlineSync.enfileirarVistoria(this.currentVistoria);
    }

    // Garante que o relatório recém-criado conste no topo da lista com a foto capturada anexada
    const novoRelId = this.currentVistoria.relatorioId || `rel-${Date.now()}`;
    const fotoUrlFinal = this.currentVistoria.fotoCamera || this.currentVistoria.caminhoArquivoFoto || this.currentVistoria.fotoBase64 || 'uploads/evidencias/seed_fachada_bb.png';
    const fotoObjLocal = {
      id: `fot-${Date.now()}`,
      url: fotoUrlFinal,
      caminho_arquivo: this.currentVistoria.caminhoArquivoFoto || fotoUrlFinal,
      hash_sha256: this.currentVistoria.hashSha256,
      hash_integridade: this.currentVistoria.hashSha256,
      confianca_ia: this.currentVistoria.confiancaIA,
      confianca: this.currentVistoria.confiancaIA,
      motivo_ia: this.currentVistoria.motivoIA,
      motivo: this.currentVistoria.motivoIA,
      status_ia: 'APROVADO'
    };

    const existingIdx = this.relatorios.findIndex(r => r.id === novoRelId || r.codigoUnico === this.currentVistoria.codigoUnico);
    if (existingIdx >= 0) {
      if (!Array.isArray(this.relatorios[existingIdx].fotos) || this.relatorios[existingIdx].fotos.length === 0) {
        this.relatorios[existingIdx].fotos = [fotoObjLocal];
      } else if (this.currentVistoria.fotoCamera) {
        this.relatorios[existingIdx].fotos[0].previewDataUrl = this.currentVistoria.fotoCamera;
      }
    } else {
      this.relatorios.unshift({
        id: novoRelId,
        obraNome: this.currentVistoria.obraNome,
        subtitulo: 'Vistoria In-Loco',
        status: 'Concluído',
        data: 'Hoje',
        codigoUnico: this.currentVistoria.codigoUnico,
        confiancaIA: this.currentVistoria.confiancaIA,
        hash: this.currentVistoria.hashSha256,
        pdfUrl: this.currentVistoria.pdfUrl || `/api/relatorios/${novoRelId}/pdf`,
        fotos: [fotoObjLocal]
      });
    }

    this.notify();
  }

  async julgarVistoriaFiscal(status, justificativa) {
    // Requisito 8.7 do Documento Oficial:
    // status: 'REGULAR' (se aprovado) ou 'PENDENTE_AJUSTE' (se reprovado)
    this.currentVistoria.statusObra = status;
    this.currentVistoria.justificativaFiscal = justificativa;

    // Atualiza também a lista de obras
    const obra = this.obras.find(o => o.id === this.currentVistoria.obraId);
    if (obra) {
      obra.status = status;
    }

    // Comunica com a API backend
    try {
      const targetRelId = this.currentVistoria.relatorioId || this.relatorios[0]?.id || 'rel-seed-001';
      if (targetRelId) {
        await api.atualizarStatusFiscal(targetRelId, status, justificativa);
      }
    } catch (err) {
      console.warn('[State] Parecer do fiscal registrado localmente:', err.message);
    }

    this.notify();
  }

  async login(email, senha) {
    try {
      const res = await api.login(email, senha);
      if (res && res.usuario) {
        this.user = {
          id: res.usuario.id,
          nome: res.usuario.nome,
          email: res.usuario.email,
          cargo: res.usuario.cargo,
          empresa: res.usuario.empresa || '',
          registro_profissional: res.usuario.registro_profissional || '',
          created_at: res.usuario.created_at || new Date().toISOString(),
          avatar: res.usuario.cargo === 'fiscal'
            ? 'src/assets/icons/perfil_bb.png'
            : 'src/assets/icons/perfil_obras.png'
        };
        localStorage.setItem('bbvision_user', JSON.stringify(this.user));
        this.currentVistoria.responsavel = this.user.nome;
        await this.carregarDadosIniciais();
        this.navigate('inicio', 'inicio');
        return res;
      }
    } catch (err) {
      console.warn('[State] Erro ao autenticar:', err.message);

      // Resiliência de Campo e Modo Offline (HU05 / TakeOff Entrega Oficial)
      // Se a rede estiver indisponível no canteiro de obras (Load failed, Failed to fetch, etc.)
      const isNetworkIssue = 
        err.message === 'Load failed' || 
        err.message.includes('fetch') || 
        err.message.includes('NetworkError') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('HTTP 404') ||
        err.message.includes('HTTP 50') ||
        err.message.includes('Unexpected token') ||
        this.isOffline;

      if (isNetworkIssue) {
        const normEmail = (email || '').toLowerCase().trim();
        const senhaCorreta = '123456';

        if (senha === senhaCorreta) {
          let offlineUser = null;
          if (normEmail === 'rodrigo@empreiteira.com' || normEmail === 'empreiteira@bbvision.com') {
            offlineUser = {
              id: '11111111-1111-4111-8111-111111111111',
              nome: 'Rodrigo Silva (Empreiteira)',
              email: normEmail,
              cargo: 'empreiteira',
              empresa: 'Silva Engenharia & Reformas',
              registro_profissional: 'CREA-SP 987654/D',
              created_at: new Date().toISOString(),
              avatar: 'src/assets/icons/perfil_obras.png'
            };
          } else if (normEmail === 'mariana@bb.com.br' || normEmail === 'fiscal@bbvision.com') {
            offlineUser = {
              id: '22222222-2222-4222-8222-222222222222',
              nome: 'Mariana Vasconcelos (Fiscalização BB)',
              email: normEmail,
              cargo: 'fiscal',
              empresa: 'Banco do Brasil S.A. - DIESE',
              registro_profissional: 'CREA-DF 123456/D - Matrícula BB 459812-X',
              created_at: new Date().toISOString(),
              avatar: 'src/assets/icons/perfil_bb.png'
            };
          }

          if (offlineUser) {
            this.user = offlineUser;
            this.isOffline = true;
            localStorage.setItem('bbvision_user', JSON.stringify(this.user));
            this.currentVistoria.responsavel = this.user.nome;
            this.navigate('inicio', 'inicio');
            return {
              mensagem: 'Autenticado em modo offline de contingência (HU05)',
              usuario: offlineUser,
              offline: true,
            };
          }
        }
      }

      // Se já houver sessão em cache no navegador
      if (this.isOffline) {
        const cached = localStorage.getItem('bbvision_user');
        if (cached) {
          this.user = JSON.parse(cached);
          this.navigate('inicio', 'inicio');
          return;
        }
      }
      throw err;
    }
  }

  async register(dados) {
    try {
      const res = await api.register(dados);
      if (res && res.usuario) {
        this.user = {
          id: res.usuario.id,
          nome: res.usuario.nome,
          email: res.usuario.email,
          cargo: res.usuario.cargo,
          empresa: res.usuario.empresa || '',
          registro_profissional: res.usuario.registro_profissional || '',
          created_at: res.usuario.created_at || new Date().toISOString(),
          avatar: res.usuario.cargo === 'fiscal'
            ? 'src/assets/icons/perfil_bb.png'
            : 'src/assets/icons/perfil_obras.png'
        };
        localStorage.setItem('bbvision_user', JSON.stringify(this.user));
        this.currentVistoria.responsavel = this.user.nome;
        await this.carregarDadosIniciais();
        this.navigate('inicio', 'inicio');
        return res;
      }
    } catch (err) {
      console.warn('[State] Erro ao cadastrar usuário:', err.message);
      throw err;
    }
  }

  async logout() {
    this.user = null;
    localStorage.removeItem('bbvision_user');
    await api.logout();
    this.navigate('login');
  }
}

export const state = new AppState();
