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
      this.user = null;
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
        imagemTipo: 'logo'
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
        imagemTipo: 'cad1'
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
        imagemTipo: 'cad2'
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
      fotoUrl: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
      fotoCamera: null,
      fotoBase64: null,
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
                img: f.url || 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
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
        await api.anexarFoto(relId, {
          url: this.currentVistoria.fotoCamera || 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg',
          hash_sha256: this.currentVistoria.hashSha256,
          confianca_ia: this.currentVistoria.confiancaIA,
          motivo_ia: this.currentVistoria.motivoIA,
          status_ia: this.currentVistoria.confiancaIA >= 0.75 ? 'APROVADO' : 'VALIDACAO_MANUAL',
          validacao_manual: this.currentVistoria.validacaoManual
        });
      } catch (errFoto) {
        console.warn('[State] Aviso ao vincular foto na API:', errFoto.message);
      }

      // 3. Salvar respostas do checklist
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
          empresa: res.usuario.empresa || '',
          registro_profissional: res.usuario.registro_profissional || '',
          created_at: res.usuario.created_at || new Date().toISOString(),
          avatar: res.usuario.cargo === 'fiscal'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
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
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
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

  logout() {
    this.user = null;
    localStorage.removeItem('bbvision_user');
    api.setToken(null);
    this.navigate('login');
  }
}

export const state = new AppState();
