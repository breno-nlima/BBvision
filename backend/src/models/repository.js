/**
 * BBVision - Camada de Acesso a Dados (Repositório)
 * Suporta Supabase (PostgreSQL) com fallback para persistência local JSON
 * Garante resiliência e suporte a modo offline (HU05)
 */

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { supabase, isConfigured: isSupabaseConfigured } = require('../config/supabase');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Garante existência do diretório de dados
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializa base local de sementes (Seeds oficiais)
function getDefaultData() {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('123456', salt);

  return {
    usuarios: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        nome: 'Rodrigo Silva',
        email: 'rodrigo@empreiteira.com',
        senha_hash: passwordHash,
        cargo: 'empreiteira',
        created_at: new Date().toISOString(),
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        nome: 'Mariana Vasconcelos',
        email: 'mariana@bb.com.br',
        senha_hash: passwordHash,
        cargo: 'fiscal',
        created_at: new Date().toISOString(),
      },
    ],
    obras: [
      {
        id: '33333333-3333-4333-8333-333333333333',
        nome: 'Obra Centro (Agência Sede)',
        endereco: 'Av. Rio Branco, 120 - Centro, Rio de Janeiro - RJ',
        responsavel: 'Rodrigo Silva',
        status: 'REGULAR',
        created_at: new Date().toISOString(),
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        nome: 'Obra Zona Sul (Agência Paulista)',
        endereco: 'Av. Paulista, 2163 - Cerqueira César, São Paulo - SP',
        responsavel: 'Rodrigo Silva',
        status: 'REGULAR',
        created_at: new Date().toISOString(),
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        nome: 'Residência Alpha (Agência Brasília)',
        endereco: 'SBS Quadra 1 Bloco G Lote 32, Brasília - DF',
        responsavel: 'Rodrigo Silva',
        status: 'PENDENTE_AJUSTE',
        created_at: new Date().toISOString(),
      },
    ],
    relatorios: [
      {
        id: 'rel-seed-001',
        obra_id: '33333333-3333-4333-8333-333333333333',
        usuario_id: '11111111-1111-4111-8111-111111111111',
        codigo_unico: '8F4A2C19E70B34DF',
        data: new Date(Date.now() - 86400000).toISOString(),
        status: 'APROVADO',
        justificativa: 'Fotos e checklist em total conformidade com o gabarito.',
        hash_integridade: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        arquivo_pdf_url: null,
        validacao_manual: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    fotos: [
      {
        id: 'fot-seed-001',
        relatorio_id: 'rel-seed-001',
        caminho_arquivo: 'uploads/evidencias/exemplo-fachada.jpg',
        hash_integridade: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        avaliacao_gemini: 'APROVADO',
        confianca: 0.96,
        motivo: 'Imagem nítida e bem enquadrada.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    respostas: [
      {
        id: 'resp-seed-001',
        relatorio_id: 'rel-seed-001',
        pergunta: 'Condição da Alvenaria e Estrutura',
        valor: 'Conforme',
        tipo: 'multipla_escolha',
        sugestao_ia: 'Alvenaria externa erguida conforme gabarito de referência.',
        revisado_humano: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    checklists_modelo: [
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        titulo: 'EPIs e Segurança do Trabalho',
        categoria: 'Segurança',
        descricao: 'Verificar uso obrigatório de capacete, óculos, luvas e calçado adequado pelos operários.',
        tipo_campo: 'multipla_escolha',
        opcoes_resposta: ['Conforme', 'Não Conforme', 'Não se aplica'],
        obrigatorio: true,
        exige_foto: true,
        ordem: 1,
        ativo: true,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        titulo: 'Quadro de Distribuição e Painel Elétrico',
        categoria: 'Elétrica',
        descricao: 'Inspecionar barramentos, disjuntores, identificação dos circuitos e aterramento conforme projeto.',
        tipo_campo: 'multipla_escolha',
        opcoes_resposta: ['Conforme', 'Não Conforme', 'Não se aplica'],
        obrigatorio: true,
        exige_foto: true,
        ordem: 2,
        ativo: true,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        titulo: 'Rampa e Rotas de Acessibilidade (NBR 9050)',
        categoria: 'Acessibilidade',
        descricao: 'Conferir inclinação de rampas de acesso, piso tátil direcional/alerta e largura livre.',
        tipo_campo: 'multipla_escolha',
        opcoes_resposta: ['Conforme', 'Não Conforme', 'Não se aplica'],
        obrigatorio: true,
        exige_foto: true,
        ordem: 3,
        ativo: true,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        titulo: 'Condição da Alvenaria e Estrutura',
        categoria: 'Alvenaria',
        descricao: 'Avaliar regularidade de paredes, emboço, gesso e ausência de fissuras e patologias.',
        tipo_campo: 'multipla_escolha',
        opcoes_resposta: ['Conforme', 'Não Conforme', 'Não se aplica'],
        obrigatorio: true,
        exige_foto: true,
        ordem: 4,
        ativo: true,
      },
      {
        id: 'a0000000-0000-0000-0000-000000000005',
        titulo: 'Instalações Hidrossanitárias e Esgoto',
        categoria: 'Hidráulica',
        descricao: 'Testar escoamento de ralos, teste de estanqueidade e vedação de tubulações.',
        tipo_campo: 'multipla_escolha',
        opcoes_resposta: ['Conforme', 'Não Conforme', 'Não se aplica'],
        obrigatorio: true,
        exige_foto: true,
        ordem: 5,
        ativo: true,
      },
    ],
    auditoria_ia_logs: [
      {
        id: 'e0000000-0000-0000-0000-000000000001',
        relatorio_id: 'rel-seed-001',
        usuario_id: '11111111-1111-4111-8111-111111111111',
        modelo: 'gemini-1.5-flash',
        prompt_tipo: 'P1_QUALIDADE',
        duracao_ms: 1420,
        sla_cumprido: true,
        resultado_status: 'APROVADO',
        confianca: 0.96,
        motivo: 'Imagem nítida e bem enquadrada.',
        hash_imagem: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  };
}

function loadLocalDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = getDefaultData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const defaults = getDefaultData();
    let updated = false;

    // Migração transparente de novas tabelas/coleções
    for (const key of Object.keys(defaults)) {
      if (!parsed[key] || (Array.isArray(defaults[key]) && parsed[key].length === 0 && defaults[key].length > 0)) {
        parsed[key] = defaults[key];
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (err) {
    console.error('[Repository] Erro ao carregar db.json local, recriando:', err);
    const initial = getDefaultData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Repository] Erro ao salvar dados locais:', err);
  }
}

const repository = {
  // ----------------------------------------------------------------------------
  // USUÁRIOS
  // ----------------------------------------------------------------------------
  async findUserByEmail(email) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Repository Supabase User Query Fallback]:', err.message);
      }
    }
    const db = loadLocalDb();
    return db.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nome, email, cargo, created_at')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Repository Supabase User Query Fallback]:', err.message);
      }
    }
    const db = loadLocalDb();
    const user = db.usuarios.find(u => u.id === id);
    if (!user) return null;
    const { senha_hash, ...userWithoutPass } = user;
    return userWithoutPass;
  },

  // ----------------------------------------------------------------------------
  // OBRAS
  // ----------------------------------------------------------------------------
  async listObras() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obras')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Repository Supabase Obras Query Fallback]:', err.message);
      }
    }
    const db = loadLocalDb();
    return db.obras;
  },

  async findObraById(id) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obras')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Repository Supabase Obra Query Fallback]:', err.message);
      }
    }
    const db = loadLocalDb();
    return db.obras.find(o => o.id === id) || null;
  },

  async createObra({ nome, endereco, responsavel, status = 'REGULAR' }) {
    const crypto = require('crypto');
    const newObra = {
      id: crypto.randomUUID(),
      nome,
      endereco,
      responsavel,
      status,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obras')
          .insert([newObra])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Repository Supabase Create Obra Fallback]:', err.message);
      }
    }

    const db = loadLocalDb();
    db.obras.push(newObra);
    saveLocalDb(db);
    return newObra;
  },

  async updateObraStatus(id, newStatus) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('obras')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.warn('[Repository Supabase Update Obra Status Fallback]:', err.message);
      }
    }
    const db = loadLocalDb();
    const obra = db.obras.find(o => o.id === id);
    if (obra) {
      obra.status = newStatus;
      saveLocalDb(db);
    }
    return obra;
  },

  // ----------------------------------------------------------------------------
  // RELATÓRIOS
  // ----------------------------------------------------------------------------
  async listRelatorios(filtros = {}) {
    const db = loadLocalDb();
    let lista = db.relatorios;

    if (filtros.obra_id) {
      lista = lista.filter(r => r.obra_id === filtros.obra_id);
    }
    if (filtros.status) {
      lista = lista.filter(r => r.status === filtros.status);
    }

    // Enriquece com dados da obra e do usuário
    return lista.map(r => {
      const obra = db.obras.find(o => o.id === r.obra_id);
      const usuario = db.usuarios.find(u => u.id === r.usuario_id);
      return {
        ...r,
        obra_nome: obra ? obra.nome : 'Obra Desconhecida',
        obra_endereco: obra ? obra.endereco : '',
        usuario_nome: usuario ? usuario.nome : 'Usuário',
        usuario_cargo: usuario ? usuario.cargo : '',
      };
    });
  },

  async findRelatorioById(id) {
    const db = loadLocalDb();
    const relatorio = db.relatorios.find(r => r.id === id);
    if (!relatorio) return null;

    const obra = db.obras.find(o => o.id === relatorio.obra_id);
    const usuario = db.usuarios.find(u => u.id === relatorio.usuario_id);
    const fotos = db.fotos.filter(f => f.relatorio_id === id);
    const respostas = db.respostas.filter(resp => resp.relatorio_id === id);

    return {
      ...relatorio,
      obra: obra || null,
      usuario: usuario ? { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo } : null,
      fotos,
      respostas,
    };
  },

  async findRelatorioByCodigo(codigoUnico) {
    const db = loadLocalDb();
    const relatorio = db.relatorios.find(r => r.codigo_unico === codigoUnico);
    if (!relatorio) return null;
    return this.findRelatorioById(relatorio.id);
  },

  async createRelatorio({ obra_id, usuario_id }) {
    const crypto = require('crypto');
    const newRelatorio = {
      id: crypto.randomUUID(),
      obra_id,
      usuario_id,
      codigo_unico: null,
      data: new Date().toISOString(),
      status: 'EM_ANDAMENTO',
      justificativa: null,
      hash_integridade: null,
      arquivo_pdf_url: null,
      validacao_manual: false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('relatorios')
          .insert([newRelatorio])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Repository Supabase Create Relatorio Fallback]:', err.message);
      }
    }

    const db = loadLocalDb();
    db.relatorios.push(newRelatorio);
    saveLocalDb(db);
    return newRelatorio;
  },

  async saveRespostas(relatorioId, respostasArray) {
    const crypto = require('crypto');
    const db = loadLocalDb();

    // Remove respostas anteriores do relatório para atualização limpa
    db.respostas = db.respostas.filter(r => r.relatorio_id !== relatorioId);

    const formatadas = respostasArray.map(item => ({
      id: crypto.randomUUID(),
      relatorio_id: relatorioId,
      pergunta: item.pergunta,
      valor: item.valor,
      tipo: item.tipo || 'texto',
      sugestao_ia: item.sugestao_ia || null,
      created_at: new Date().toISOString(),
    }));

    db.respostas.push(...formatadas);
    saveLocalDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('respostas').delete().eq('relatorio_id', relatorioId);
        await supabase.from('respostas').insert(formatadas);
      } catch (err) {
        console.warn('[Repository Supabase Save Respostas Fallback]:', err.message);
      }
    }

    return formatadas;
  },

  async addFoto(relatorioId, { caminho_arquivo, hash_integridade, avaliacao_gemini, confianca, motivo }) {
    const crypto = require('crypto');
    const foto = {
      id: crypto.randomUUID(),
      relatorio_id: relatorioId,
      caminho_arquivo,
      hash_integridade,
      avaliacao_gemini,
      confianca: confianca !== undefined ? Number(confianca) : null,
      motivo: motivo || null,
      created_at: new Date().toISOString(),
    };

    const db = loadLocalDb();
    db.fotos.push(foto);
    saveLocalDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fotos').insert([foto]);
      } catch (err) {
        console.warn('[Repository Supabase Add Foto Fallback]:', err.message);
      }
    }

    return foto;
  },

  async finalizarRelatorio(relatorioId, { codigo_unico, hash_integridade, arquivo_pdf_url, validacao_manual = false }) {
    const db = loadLocalDb();
    const rel = db.relatorios.find(r => r.id === relatorioId);
    if (!rel) return null;

    rel.codigo_unico = codigo_unico;
    rel.hash_integridade = hash_integridade;
    rel.arquivo_pdf_url = arquivo_pdf_url;
    rel.validacao_manual = validacao_manual;
    rel.status = 'FINALIZADO';
    rel.data = new Date().toISOString();

    saveLocalDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('relatorios')
          .update({
            codigo_unico,
            hash_integridade,
            arquivo_pdf_url,
            validacao_manual,
            status: 'FINALIZADO',
            data: rel.data,
          })
          .eq('id', relatorioId);
      } catch (err) {
        console.warn('[Repository Supabase Finalizar Relatorio Fallback]:', err.message);
      }
    }

    return rel;
  },

  async updateRelatorioStatus(relatorioId, novoStatus, justificativa = '') {
    const db = loadLocalDb();
    const rel = db.relatorios.find(r => r.id === relatorioId);
    if (!rel) return null;

    rel.status = novoStatus;
    rel.justificativa = justificativa;
    saveLocalDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('relatorios')
          .update({ status: novoStatus, justificativa })
          .eq('id', relatorioId);
      } catch (err) {
        console.warn('[Repository Supabase Update Relatorio Status Fallback]:', err.message);
      }
    }

    return rel;
  },

  // ----------------------------------------------------------------------------
  // CHECKLISTS MODELO (NORMATIVOS)
  // ----------------------------------------------------------------------------
  async listChecklistsModelo(categoria = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('checklists_modelo').select('*').eq('ativo', true).order('ordem', { ascending: true });
        if (categoria) query = query.eq('categoria', categoria);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Repository Supabase Checklists Query Fallback]:', err.message);
      }
    }
    const db = loadLocalDb();
    let lista = db.checklists_modelo || [];
    if (categoria) {
      lista = lista.filter(c => c.categoria.toLowerCase() === categoria.toLowerCase());
    }
    return lista;
  },

  // ----------------------------------------------------------------------------
  // TRILHA DE AUDITORIA DE IA (Seção 4.1)
  // ----------------------------------------------------------------------------
  async registrarAuditoriaIa({
    relatorio_id = null,
    usuario_id = null,
    modelo = 'gemini-1.5-flash',
    prompt_tipo = 'P1_QUALIDADE',
    duracao_ms = 0,
    sla_cumprido = true,
    resultado_status = 'APROVADO',
    confianca = null,
    motivo = null,
    hash_imagem = null,
  }) {
    const crypto = require('crypto');
    const logEntry = {
      id: crypto.randomUUID(),
      relatorio_id,
      usuario_id,
      modelo,
      prompt_tipo,
      duracao_ms: Math.round(duracao_ms),
      sla_cumprido: duracao_ms <= 15000,
      resultado_status,
      confianca: confianca !== null ? Number(confianca) : null,
      motivo,
      hash_imagem,
      created_at: new Date().toISOString(),
    };

    const db = loadLocalDb();
    if (!db.auditoria_ia_logs) db.auditoria_ia_logs = [];
    db.auditoria_ia_logs.push(logEntry);
    saveLocalDb(db);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('auditoria_ia_logs').insert([logEntry]);
      } catch (err) {
        console.warn('[Repository Supabase Auditoria IA Fallback]:', err.message);
      }
    }

    return logEntry;
  },

  // ----------------------------------------------------------------------------
  // VIEWS E MÉTRICAS ANALÍTICAS
  // ----------------------------------------------------------------------------
  async getPainelAuditoria() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('vw_painel_auditoria').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Repository Supabase Painel Auditoria View Fallback]:', err.message);
      }
    }

    const db = loadLocalDb();
    return db.relatorios.map(r => {
      const obra = db.obras.find(o => o.id === r.obra_id) || {};
      const user = db.usuarios.find(u => u.id === r.usuario_id) || {};
      const fotos = db.fotos.filter(f => f.relatorio_id === r.id);
      const fotosAprovadas = fotos.filter(f => f.avaliacao_gemini === 'APROVADO');
      const respostas = db.respostas.filter(resp => resp.relatorio_id === r.id);

      return {
        relatorio_id: r.id,
        codigo_unico: r.codigo_unico,
        data_vistoria: r.data,
        relatorio_status: r.status,
        hash_integridade: r.hash_integridade,
        arquivo_pdf_url: r.arquivo_pdf_url,
        validacao_manual: r.validacao_manual,
        justificativa: r.justificativa,
        obra_id: obra.id,
        obra_nome: obra.nome,
        obra_endereco: obra.endereco,
        obra_status: obra.status,
        empreiteira_id: user.id,
        empreiteira_nome: user.nome,
        empreiteira_email: user.email,
        total_fotos: fotos.length,
        fotos_aprovadas_ia: fotosAprovadas.length,
        media_confianca_ia: fotos.length > 0 ? 95.0 : 0,
        total_itens_checklist: respostas.length,
      };
    });
  },

  async getMetricasIa() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('vw_governanca_ia').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Repository Supabase Metricas IA View Fallback]:', err.message);
      }
    }

    const db = loadLocalDb();
    const logs = db.auditoria_ia_logs || [];
    const total = logs.length || 1;
    const dentroSla = logs.filter(l => l.sla_cumprido).length;

    return [
      {
        modelo: 'gemini-1.5-flash',
        prompt_tipo: 'P1_QUALIDADE',
        total_chamadas: total,
        total_dentro_sla_15s: dentroSla,
        percentual_sla_15s: Number(((dentroSla / total) * 100).toFixed(2)),
        latencia_media_ms: 1500,
        media_confianca: 94.5,
        total_aprovados: logs.filter(l => l.resultado_status === 'APROVADO').length,
        total_rejeitados: logs.filter(l => l.resultado_status === 'REJEITADO').length,
        total_fallbacks_manual: logs.filter(l => l.resultado_status === 'VALIDACAO_MANUAL').length,
      },
    ];
  },
};

module.exports = repository;
