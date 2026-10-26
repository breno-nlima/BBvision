/**
 * BBVision - Camada de Dados Desacoplada (Data Repository & Store)
 * Proê suporte híbrido:
 * 1. Operação padrão em memória de alta performance para desenvolvimento e testes
 * 2. Suporte e sincronização transparente com Supabase (PostgreSQL) quando as tabelas estiverem ativas
 * Em estrita conformidade com a arquitetura TakeOff (Banco desacoplado no backend)
 */

const bcrypt = require('bcryptjs');
const { supabase, isConfigured } = require('./config/supabase');

const salt = bcrypt.genSaltSync(10);
const defaultPasswordHash = bcrypt.hashSync('123456', salt);

const mockData = {
  usuarios: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      nome: 'Rodrigo Silva (Empreiteira)',
      email: 'rodrigo@empreiteira.com',
      senha_hash: defaultPasswordHash,
      cargo: 'empreiteira',
      empresa: 'Silva Engenharia & Reformas',
      registro_profissional: 'CREA-SP 987654/D',
      telefone: '(11) 98888-1111',
      created_at: new Date('2026-10-01T08:00:00.000Z').toISOString(),
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      nome: 'Mariana Vasconcelos (Fiscalização BB)',
      email: 'mariana@bb.com.br',
      senha_hash: defaultPasswordHash,
      cargo: 'fiscal',
      empresa: 'Banco do Brasil S.A. - DIESE',
      registro_profissional: 'CREA-DF 123456/D - Matrícula BB 459812-X',
      telefone: '(61) 97777-2222',
      created_at: new Date('2026-10-01T08:00:00.000Z').toISOString(),
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      nome: 'Engenheiro de Campo (Empreiteira)',
      email: 'empreiteira@bbvision.com',
      senha_hash: defaultPasswordHash,
      cargo: 'empreiteira',
      empresa: 'Empreiteira Modelo de Obras',
      registro_profissional: 'CREA-SP 554433/D',
      telefone: '(11) 96666-3333',
      created_at: new Date('2026-10-01T08:00:00.000Z').toISOString(),
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      nome: 'Auditor de Fiscalização (BB)',
      email: 'fiscal@bbvision.com',
      senha_hash: defaultPasswordHash,
      cargo: 'fiscal',
      empresa: 'Banco do Brasil S.A. - Fiscalização de Obras',
      registro_profissional: 'CREA-DF 112233/D - Matrícula BB F1234567',
      telefone: '(61) 95555-4444',
      created_at: new Date('2026-10-01T08:00:00.000Z').toISOString(),
    },
  ],

  obras: [
    {
      id: 'obr-001',
      nome: 'Obra Centro (Agência Sede)',
      endereco: 'Av. Rio Branco, 120 - Centro, Rio de Janeiro - RJ',
      responsavel: 'Rodrigo Silva',
      status: 'REGULAR',
      tipo: 'Reforma e Modernização de Agência',
      empreiteira_id: '11111111-1111-4111-8111-111111111111', // Rodrigo (1 Empreiteira -> N Obras)
      cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal cadastra N Obras)
      fiscal_responsavel_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal fiscaliza N Obras)
      created_at: new Date('2026-10-01T09:00:00.000Z').toISOString(),
    },
    {
      id: 'obr-002',
      nome: 'Obra Zona Sul (Agência Paulista)',
      endereco: 'Av. Paulista, 2163 - Cerqueira César, São Paulo - SP',
      responsavel: 'Rodrigo Silva',
      status: 'REGULAR',
      tipo: 'Adequação de Acessibilidade',
      empreiteira_id: '11111111-1111-4111-8111-111111111111', // Rodrigo (1 Empreiteira -> N Obras)
      cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal cadastra N Obras)
      fiscal_responsavel_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal fiscaliza N Obras)
      created_at: new Date('2026-10-02T09:00:00.000Z').toISOString(),
    },
    {
      id: 'obr-003',
      nome: 'Agência Asa Sul (Edificação Nova)',
      endereco: 'SBS Quadra 1 Bloco G Lote 32, Brasília - DF',
      responsavel: 'Rodrigo Silva',
      status: 'EM_ANDAMENTO',
      tipo: 'Construção de Nova Agência',
      empreiteira_id: '11111111-1111-4111-8111-111111111111', // Rodrigo (1 Empreiteira -> N Obras)
      cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal cadastra N Obras)
      fiscal_responsavel_id: '44444444-4444-4444-8444-444444444444', // Auditor BB (1 Fiscal fiscaliza N Obras)
      created_at: new Date('2026-10-03T09:00:00.000Z').toISOString(),
    },
    {
      id: 'obr-004',
      nome: 'Obra Copacabana (Fachada e Interior)',
      endereco: 'Rua Barata Ribeiro, 300 - Rio de Janeiro - RJ',
      responsavel: 'Engenheiro de Campo',
      status: 'EM_ANDAMENTO',
      tipo: 'Manutenção Predial e Fachada',
      empreiteira_id: '33333333-3333-4333-8333-333333333333', // Outra Empreiteira
      cadastrado_por_fiscal_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal cadastra N Obras)
      fiscal_responsavel_id: '22222222-2222-4222-8222-222222222222', // Mariana (1 Fiscal fiscaliza N Obras)
      created_at: new Date('2026-10-04T09:00:00.000Z').toISOString(),
    },
  ],

  relatorios: [
    {
      id: 'rel-seed-001',
      obra_id: 'obr-001',
      usuario_id: '11111111-1111-4111-8111-111111111111',
      status: 'FINALIZADO',
      codigo_unico: '8F4A2C19E70B34DF',
      hash_integridade: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      arquivo_pdf_url: null,
      created_at: '2026-10-10T14:30:00.000Z',
      data: '2026-10-10T14:45:00.000Z',
      data_finalizacao: '2026-10-10T14:45:00.000Z',
      justificativa_fiscal: null,
    },
    {
      id: 'rel-seed-002',
      obra_id: 'obr-002',
      usuario_id: '11111111-1111-4111-8111-111111111111',
      status: 'APROVADO',
      codigo_unico: '91BC34EFA87210DC',
      hash_integridade: 'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14',
      arquivo_pdf_url: null,
      created_at: '2026-10-01T10:00:00.000Z',
      data: '2026-10-01T10:20:00.000Z',
      data_finalizacao: '2026-10-01T10:20:00.000Z',
      justificativa_fiscal: 'Obra em estrita conformidade com o padrão visual e arquitetônico do Banco do Brasil.',
      data_julgamento: '2026-10-01T14:00:00.000Z',
    },
  ],

  fotos: [
    {
      id: 'fot-seed-001',
      relatorio_id: 'rel-seed-001',
      url: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
      caminho_arquivo: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
      hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      hash_integridade: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      confianca_ia: 0.96,
      confianca: 0.96,
      motivo_ia: 'Fachada frontal alinhada e iluminação uniforme de acordo com o gabarito.',
      motivo: 'Fachada frontal alinhada e iluminação uniforme de acordo com o gabarito.',
      status_ia: 'APROVADO',
      avaliacao_gemini: 'APROVADO',
      validacao_manual: false,
      created_at: '2026-10-10T14:32:00.000Z',
    },
    {
      id: 'fot-seed-002',
      relatorio_id: 'rel-seed-001',
      url: 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg',
      caminho_arquivo: 'prints/WhatsApp Image 2026-10-08 at 11.43.17.jpeg',
      hash_sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      hash_integridade: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      confianca_ia: 0.94,
      confianca: 0.94,
      motivo_ia: 'Alvenaria com juntas niveladas e prumo adequado.',
      motivo: 'Alvenaria com juntas niveladas e prumo adequado.',
      status_ia: 'APROVADO',
      avaliacao_gemini: 'APROVADO',
      validacao_manual: false,
      created_at: '2026-10-10T14:35:00.000Z',
    },
    {
      id: 'fot-seed-003',
      relatorio_id: 'rel-seed-002',
      url: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
      caminho_arquivo: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg',
      hash_sha256: 'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14',
      hash_integridade: 'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14',
      confianca_ia: 0.92,
      confianca: 0.92,
      motivo_ia: 'Acesso e sinalização em conformidade com o padrão BB.',
      motivo: 'Acesso e sinalização em conformidade com o padrão BB.',
      status_ia: 'APROVADO',
      avaliacao_gemini: 'APROVADO',
      validacao_manual: false,
      created_at: '2026-10-01T10:05:00.000Z',
    },
  ],

  respostas: [
    {
      id: 'resp-seed-001',
      relatorio_id: 'rel-seed-001',
      pergunta: 'Fachada da agência está legível?',
      valor: 'Sim',
      sugestao_ia: 'Fachada nivelada com gabarito de referência.',
      tipo: 'multipla_escolha',
      created_at: '2026-10-10T14:38:00.000Z',
    },
    {
      id: 'resp-seed-002',
      relatorio_id: 'rel-seed-001',
      pergunta: 'Condição da sinalização institucional',
      valor: 'Sim',
      sugestao_ia: 'Sinalização completa e visível sem obstruções.',
      tipo: 'multipla_escolha',
      created_at: '2026-10-10T14:39:00.000Z',
    },
    {
      id: 'resp-seed-003',
      relatorio_id: 'rel-seed-001',
      pergunta: 'Observações de engenharia e campo',
      valor: 'Alvenaria e acabamentos estruturais em conformidade com o cronograma físico.',
      sugestao_ia: 'Alvenaria nivelada com juntas regulares.',
      tipo: 'texto',
      created_at: '2026-10-10T14:40:00.000Z',
    },
  ],

  // ----------------------------------------------------------------------------
  // GESTÃO DE USUÁRIOS
  // ----------------------------------------------------------------------------
  findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = String(email).trim().toLowerCase();
    const user = this.usuarios.find(u => u.email.toLowerCase() === cleanEmail);
    return user ? { ...user } : null;
  },

  findUserById(id) {
    if (!id) return null;
    const user = this.usuarios.find(u => u.id === id);
    return user ? { ...user } : null;
  },

  async findUserByEmailAsync(email) {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('usuarios').select('*').eq('email', email.trim().toLowerCase()).maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        // Fallback para mock
      }
    }
    return this.findUserByEmail(email);
  },

  async findUserByIdAsync(id) {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        // Fallback para mock
      }
    }
    return this.findUserById(id);
  },

  async createUserAsync(dados) {
    const existing = await this.findUserByEmailAsync(dados.email);
    if (existing) {
      const err = new Error('E-mail já cadastrado no sistema.');
      err.status = 409;
      throw err;
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(dados.senha, saltRounds);

    const novoUsuario = {
      id: `usr-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      nome: dados.nome.trim(),
      email: dados.email.toLowerCase().trim(),
      senha_hash: senhaHash,
      cargo: dados.cargo === 'fiscal' ? 'fiscal' : 'empreiteira',
      registro_profissional: (dados.registro_profissional || '').trim(),
      empresa: (dados.empresa || (dados.cargo === 'fiscal' ? 'Banco do Brasil S.A.' : 'Empreiteira Contratada')).trim(),
      telefone: (dados.telefone || '').trim(),
      created_at: new Date().toISOString(),
    };

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('usuarios').insert([novoUsuario]).select().single();
        if (!error && data) {
          const { senha_hash, ...publicUser } = data;
          return publicUser;
        }
      } catch (e) {
        // Segue com armazenamento em mock
      }
    }

    this.usuarios.push(novoUsuario);
    const { senha_hash, ...publicUser } = novoUsuario;
    return publicUser;
  },

  createUser(dados) {
    const existing = this.findUserByEmail(dados.email);
    if (existing) {
      const err = new Error('E-mail já cadastrado no sistema.');
      err.status = 409;
      throw err;
    }

    const salt = bcrypt.genSaltSync(10);
    const senhaHash = bcrypt.hashSync(dados.senha, salt);

    const novoUsuario = {
      id: `usr-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      nome: dados.nome.trim(),
      email: dados.email.toLowerCase().trim(),
      senha_hash: senhaHash,
      cargo: dados.cargo === 'fiscal' ? 'fiscal' : 'empreiteira',
      registro_profissional: (dados.registro_profissional || '').trim(),
      empresa: (dados.empresa || (dados.cargo === 'fiscal' ? 'Banco do Brasil S.A.' : 'Empreiteira Contratada')).trim(),
      telefone: (dados.telefone || '').trim(),
      created_at: new Date().toISOString(),
    };

    this.usuarios.push(novoUsuario);
    const { senha_hash, ...publicUser } = novoUsuario;
    return publicUser;
  },

  // ----------------------------------------------------------------------------
  // GESTÃO DE OBRAS (Suporte a N Obras por Empreiteira e N Obras por Fiscal)
  // ----------------------------------------------------------------------------
  listObras(filtros = {}) {
    let result = this.obras.map(o => ({ ...o }));

    if (filtros.empreiteira_id) {
      result = result.filter(o => o.empreiteira_id === filtros.empreiteira_id);
    }
    if (filtros.fiscal_responsavel_id || filtros.fiscal_id) {
      const fId = filtros.fiscal_responsavel_id || filtros.fiscal_id;
      result = result.filter(o => o.fiscal_responsavel_id === fId);
    }
    if (filtros.cadastrado_por_fiscal_id) {
      result = result.filter(o => o.cadastrado_por_fiscal_id === filtros.cadastrado_por_fiscal_id);
    }

    return result;
  },

  async listObrasAsync(filtros = {}) {
    if (isConfigured && supabase) {
      try {
        let query = supabase.from('obras').select('*').order('created_at', { ascending: false });

        if (filtros.empreiteira_id) {
          query = query.eq('empreiteira_id', filtros.empreiteira_id);
        }
        if (filtros.fiscal_responsavel_id || filtros.fiscal_id) {
          query = query.eq('fiscal_responsavel_id', filtros.fiscal_responsavel_id || filtros.fiscal_id);
        }
        if (filtros.cadastrado_por_fiscal_id) {
          query = query.eq('cadastrado_por_fiscal_id', filtros.cadastrado_por_fiscal_id);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        // Fallback
      }
    }
    return this.listObras(filtros);
  },

  findObraById(id) {
    const obra = this.obras.find(o => o.id === id);
    return obra ? { ...obra } : null;
  },

  async findObraByIdAsync(id) {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('obras').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }
    return this.findObraById(id);
  },

  async createObraAsync(dados) {
    const novaObra = {
      id: `obr-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: dados.status || 'REGULAR',
      tipo: dados.tipo || 'Reforma e Modernização de Agência',
      empreiteira_id: dados.empreiteira_id || '11111111-1111-4111-8111-111111111111',
      cadastrado_por_fiscal_id: dados.cadastrado_por_fiscal_id || '22222222-2222-4222-8222-222222222222',
      fiscal_responsavel_id: dados.fiscal_responsavel_id || dados.cadastrado_por_fiscal_id || '22222222-2222-4222-8222-222222222222',
      ...dados,
    };

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('obras').insert([novaObra]).select().single();
        if (!error && data) return data;
      } catch (e) {
        // Fallback
      }
    }

    this.obras.push(novaObra);
    return { ...novaObra };
  },

  createObra(dados) {
    const novaObra = {
      id: `obr-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: dados.status || 'REGULAR',
      tipo: dados.tipo || 'Reforma e Modernização de Agência',
      empreiteira_id: dados.empreiteira_id || '11111111-1111-4111-8111-111111111111',
      cadastrado_por_fiscal_id: dados.cadastrado_por_fiscal_id || '22222222-2222-4222-8222-222222222222',
      fiscal_responsavel_id: dados.fiscal_responsavel_id || dados.cadastrado_por_fiscal_id || '22222222-2222-4222-8222-222222222222',
      ...dados,
    };
    this.obras.push(novaObra);
    return { ...novaObra };
  },

  // ----------------------------------------------------------------------------
  // GESTÃO DE RELATÓRIOS E INVIOLABILIDADE
  // ----------------------------------------------------------------------------
  listRelatorios(filtros = {}) {
    let lista = [...this.relatorios];
    if (filtros.obra_id) {
      lista = lista.filter(r => r.obra_id === filtros.obra_id);
    }
    if (filtros.status) {
      lista = lista.filter(r => r.status === filtros.status);
    }
    return lista.map(r => this.formatRelatorio(r));
  },

  findRelatorioById(id) {
    const relatorio = this.relatorios.find(r => r.id === id);
    if (!relatorio) return null;
    return this.formatRelatorio(relatorio);
  },

  createRelatorio(dados) {
    const nowIso = new Date().toISOString();
    const novo = {
      id: `rel-${Date.now()}`,
      status: 'EM_ANDAMENTO',
      codigo_unico: null,
      hash_integridade: null,
      arquivo_pdf_url: null,
      created_at: nowIso,
      data: nowIso,
      data_finalizacao: null,
      ...dados,
    };
    this.relatorios.push(novo);
    return { ...novo };
  },

  saveRespostas(relatorioId, itens) {
    this.respostas = this.respostas.filter(resp => resp.relatorio_id !== relatorioId);
    itens.forEach((item, idx) => {
      this.respostas.push({
        id: `resp-${relatorioId}-${idx + 1}`,
        relatorio_id: relatorioId,
        pergunta: item.pergunta,
        valor: item.valor,
        sugestao_ia: item.sugestao_ia || null,
        tipo: item.tipo || 'texto',
        created_at: new Date().toISOString(),
      });
    });
    return true;
  },

  addFoto(relatorioId, dadosFoto) {
    const foto = {
      id: `fot-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      relatorio_id: relatorioId,
      created_at: new Date().toISOString(),
      ...dadosFoto,
    };
    this.fotos.push(foto);
    return { ...foto };
  },

  finalizarRelatorio(id, dadosFinalizacao) {
    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    const nowIso = new Date().toISOString();
    rel.status = 'FINALIZADO';
    rel.codigo_unico = dadosFinalizacao.codigo_unico;
    rel.hash_integridade = dadosFinalizacao.hash_integridade;
    rel.arquivo_pdf_url = dadosFinalizacao.arquivo_pdf_url;
    rel.data_finalizacao = nowIso;
    rel.data = nowIso;
    return { ...rel };
  },

  atualizarStatusFiscal(id, status, justificativa) {
    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    const nowIso = new Date().toISOString();
    rel.status = status;
    rel.justificativa_fiscal = justificativa;
    rel.data_julgamento = nowIso;

    // Atualiza status da obra correspondente
    const obra = this.obras.find(o => o.id === rel.obra_id);
    if (obra) {
      obra.status = status === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
    }
    return { relatorio: { ...rel }, obra: obra ? { ...obra } : null };
  },

  formatRelatorio(r) {
    const obra = this.findObraById(r.obra_id);
    const usuario = this.findUserById(r.usuario_id);
    const fotos = this.fotos
      .filter(f => f.relatorio_id === r.id)
      .map(f => ({
        ...f,
        hashSha256: f.hash_integridade || f.hash_sha256,
        hash_sha256: f.hash_integridade || f.hash_sha256,
        hash_integridade: f.hash_integridade || f.hash_sha256,
        confianca: f.confianca !== undefined ? f.confianca : f.confianca_ia,
        motivo: f.motivo || f.motivo_ia,
        status: f.avaliacao_gemini || f.status_ia || 'APROVADO',
      }));
    const respostas = this.respostas
      .filter(resp => resp.relatorio_id === r.id)
      .map(resp => ({ ...resp }));

    return {
      ...r,
      codigoUnico: r.codigo_unico,
      codigo_unico: r.codigo_unico,
      hashIntegridade: r.hash_integridade,
      hash_integridade: r.hash_integridade,
      dataFinalizacao: r.data_finalizacao || r.data,
      data_finalizacao: r.data_finalizacao || r.data,
      pdfUrl: r.arquivo_pdf_url ? `/${r.arquivo_pdf_url.replace(/^\/+/, '')}` : `/api/relatorios/${r.id}/pdf`,
      obra: obra ? { ...obra } : null,
      usuario: usuario ? { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo } : null,
      fotos,
      respostas,
    };
  },

  getPainelAuditoria() {
    return {
      totalRelatorios: this.relatorios.length,
      pendentes: this.relatorios.filter(r => r.status === 'EM_ANDAMENTO').length,
      finalizados: this.relatorios.filter(r => r.status === 'FINALIZADO').length,
      aprovados: this.relatorios.filter(r => r.status === 'APROVADO').length,
      obrasAtivas: this.obras.length,
      relatorios: this.listRelatorios(),
    };
  },
};

module.exports = mockData;
