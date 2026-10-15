/**
 * BVision State Management Service
 * Gerencia o estado reativo da aplicação (Navegação, Usuário, Obras e Vistorias)
 * Conforme Requisitos Oficiais de Entrega TakeOff / Banco do Brasil
 */

import { api } from './api.js';
import { offlineSync } from './offlineSync.js';

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
      this.user = {
        id: '11111111-1111-4111-8111-111111111111',
        nome: 'Rodrigo',
        email: 'rodrigo@empreiteira.com',
        cargo: 'empreiteira', // 'empreiteira' ou 'fiscal'
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
    }

    this.currentPage = 'inicio';
    this.activeNav = 'inicio';
    this.selectedObra = null;
    this.searchQuery = '';
    this.isOffline = !navigator.onLine;

    // Obras em conformidade com as telas fornecidas e backend
    this.obras = [
      {
        id: 'obr-001',
        nome: 'Obra Centro',
        subtitulo: 'Futura unidade',
        tipo: 'Residência vistoria',
        responsavel: 'Rodrigo Silva',
        endereco: 'Av. Rio Branco, 120 - Centro',
        status: 'REGULAR',
        destaque: true,
        imagemTipo: 'logo'
      },
      {
        id: 'obr-002',
        nome: 'Obra Zona Sul',
        subtitulo: 'Residência',
        tipo: 'Residência vistoria',
        responsavel: 'Rodrigo Silva',
        endereco: 'Rua Domingos Ferreira, 450 - Zona Sul',
        status: 'REGULAR',
        destaque: false,
        imagemTipo: 'cad1'
      },
      {
        id: 'obr-003',
        nome: 'Residência Alpha',
        subtitulo: 'Construção nova',
        tipo: 'Residência vistoria',
        responsavel: 'Rodrigo Silva',
        endereco: 'Alameda dos Jacarandás, 88',
        status: 'EM_ANDAMENTO',
        destaque: false,
        imagemTipo: 'cad2'
      },
      {
        id: 'obr-004',
        nome: 'Obra Zona Sul',
        subtitulo: 'Residência vistoria',
        tipo: 'Residência vistoria',
        responsavel: 'Rodrigo Silva',
        endereco: 'Rua Barata Ribeiro, 300',
        status: 'EM_ANDAMENTO',
        destaque: false,
        imagemTipo: 'cad2'
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
      fotoUrl: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
      fotoCamera: 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg',
      fotoBase64: null,
      dataFoto: '10/10/2025',
      horaFoto: '14:30',
      localizacaoFoto: 'Av. Paulista, 1000',
      codigoUnico: '8F4A2C19E70B34DF',
      codigoHexDoc: '8F4A2C19E70B34DF',
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      confiancaIA: 0.95,
      motivoIA: 'Imagem nítida e bem enquadrada',
      validacaoManual: false,
      respostas: {
        fachadaLegivel: 'Sim',
        sinalizacao: 'Sim',
        limpeza: 5,
        cameras: 4,
        observacoes: 'Alvenaria nivelada com juntas regulares. Fachada frontal dentro do padrão visual do Banco do Brasil.',
        check1: true,
        check2: true,
        check3: true,
        check4: false,
        check5: false
      },
      assinatura: null,
      declaracaoAceita: true,
      bloqueado: false,
      statusRelatorio: 'EM_ANDAMENTO',
      statusObra: 'REGULAR',
      justificativaFiscal: null,
      pdfUrl: null
    };

    // Registros de fotos para o Painel da Fiscal Mariana
    this.fiscalRegistros = [
      {
        id: 'reg-01',
        codigo: '8F4A2C19E70B34DF',
        titulo: 'Fachada Principal',
        local: 'Av. Paulista, 1000',
        responsavel: 'Rodrigo Silva',
        status: 'Validado',
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg'
      },
      {
        id: 'reg-02',
        codigo: '8F4A2C19E70B34DF',
        titulo: 'Alvenaria & Pilares',
        local: 'Av. Paulista, 1000',
        responsavel: 'Rodrigo Silva',
        status: 'Validado',
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg'
      },
      {
        id: 'reg-03',
        codigo: '8F4A2C19E70B34DF',
        titulo: 'Área Externa',
        local: 'Av. Paulista, 1000',
        responsavel: 'Rodrigo Silva',
        status: 'Pendente',
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg'
      },
      {
        id: 'reg-04',
        codigo: '8F4A2C19E70B34DF',
        titulo: 'Acesso e Entrada',
        local: 'Av. Paulista, 1000',
        responsavel: 'Rodrigo Silva',
        status: 'Validado',
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg'
      },
      {
        id: 'reg-05',
        codigo: '8F4A2C19E70B34DF',
        titulo: 'Estrutura Lateral',
        local: 'Av. Paulista, 1000',
        responsavel: 'Rodrigo Silva',
        status: 'Validado',
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg'
      },
      {
        id: 'reg-06',
        codigo: '8F4A2C19E70B34DF',
        titulo: 'Ponto Fiscalizado',
        local: 'Av. Paulista, 1000',
        responsavel: 'Rodrigo Silva',
        status: 'Pendente',
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg'
      }
    ];

    this.listeners = [];

    // Ouve alterações no status de conectividade (HU05)
    offlineSync.subscribe((status) => {
      this.isOffline = !status.online;
      this.notify();
    });

    // Carrega dados iniciais da API se online
    this.carregarDadosIniciais();
  }

  async carregarDadosIniciais() {
    try {
      const obrasApi = await api.getObras();
      if (Array.isArray(obrasApi) && obrasApi.length > 0) {
        this.obras = obrasApi.map((o, idx) => ({
          id: o.id,
          nome: o.nome,
          subtitulo: o.endereco ? o.endereco.split('-')[0].trim() : 'Unidade BB',
          tipo: 'Residência vistoria',
          responsavel: o.responsavel || 'Rodrigo Silva',
          endereco: o.endereco || 'Endereço da obra',
          status: o.status || 'REGULAR',
          destaque: idx === 0,
          imagemTipo: idx === 0 ? 'logo' : (idx % 2 === 0 ? 'cad1' : 'cad2')
        }));
        this.notify();
      }
    } catch (err) {
      console.log('[State] Operando com dados locais padrão:', err.message);
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

  selectObra(obraId) {
    this.selectedObra = this.obras.find(o => o.id === obraId) || this.obras[0];
    this.currentVistoria.obraId = this.selectedObra.id;
    this.currentVistoria.obraNome = this.selectedObra.nome;
    this.currentVistoria.endereco = this.selectedObra.endereco;
    this.currentVistoria.responsavel = this.selectedObra.responsavel;
    this.notify();
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
    this.currentVistoria.validacaoManual = resultado.validacao_manual || resultado.status === 'VALIDACAO_MANUAL';
    this.notify();
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

      // 2. Salvar respostas do checklist
      await api.salvarRespostas(relId, [
        {
          pergunta: 'Fachada da agência está legível?',
          valor: this.currentVistoria.respostas.fachadaLegivel || 'Sim',
          tipo: 'multipla_escolha',
          sugestao_ia: 'Fachada nivelada com gabarito de referência.'
        },
        {
          pergunta: 'Condição da sinalização',
          valor: this.currentVistoria.respostas.sinalizacao || 'Sim',
          tipo: 'multipla_escolha',
          sugestao_ia: 'Sinalização completa e visível.'
        },
        {
          pergunta: 'Observações adicionais',
          valor: this.currentVistoria.respostas.observacoes || '',
          tipo: 'texto',
          sugestao_ia: this.currentVistoria.respostas.observacoes
        }
      ]);

      // 3. Finalizar e gerar PDF oficial com carimbo
      const finalRes = await api.finalizarRelatorio(relId);
      if (finalRes && finalRes.codigo) {
        this.currentVistoria.codigoUnico = finalRes.codigo;
        this.currentVistoria.codigoHexDoc = finalRes.codigo;
        this.currentVistoria.hashSha256 = finalRes.hashIntegridade;
        this.currentVistoria.pdfUrl = finalRes.pdfUrl;
      }
    } catch (err) {
      console.warn('[State] Erro ao finalizar na API, aplicando persistência offline (HU05):', err.message);
      // Enfileira offline conforme HU05
      offlineSync.enfileirarVistoria(this.currentVistoria);
    }

    // Adiciona ao histórico do estado
    this.relatorios.unshift({
      id: this.currentVistoria.relatorioId || `rel-${Date.now()}`,
      obraNome: this.currentVistoria.obraNome,
      subtitulo: 'Vistoria In-Loco',
      status: 'Concluído',
      data: 'Hoje',
      codigoUnico: this.currentVistoria.codigoUnico,
      confiancaIA: this.currentVistoria.confiancaIA,
      hash: this.currentVistoria.hashSha256
    });

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
          avatar: res.usuario.cargo === 'fiscal'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
      }
    } catch (err) {
      console.warn('[State] Fallback de login em modo offline/resiliente:', err.message);
      if (email.includes('fiscal') || email.includes('mariana')) {
        this.user = {
          id: '22222222-2222-4222-8222-222222222222',
          nome: 'Mariana Vasconcelos',
          email: email,
          cargo: 'fiscal',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        };
      } else {
        this.user = {
          id: '11111111-1111-4111-8111-111111111111',
          nome: 'Rodrigo Silva',
          email: email || 'rodrigo@empreiteira.com',
          cargo: 'empreiteira',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
      }
    }

    // Persiste usuário ativo no localStorage
    if (this.user) {
      localStorage.setItem('bbvision_user', JSON.stringify(this.user));
    }

    // Ambas as personas iniciam em seus respectivos dashboards profissionais
    this.navigate('inicio', 'inicio');
  }

  logout() {
    this.user = null;
    localStorage.removeItem('bbvision_user');
    api.setToken(null);
    this.navigate('login');
  }
}

export const state = new AppState();
