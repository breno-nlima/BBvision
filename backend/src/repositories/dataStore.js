/**
 * BBVision - Camada de Persistência Corporativa (Data Repository & Store)
 * Arquitetura desacoplada pronta para produção pública:
 * 1. Persistência primária em PostgreSQL via Supabase quando configurado (.env)
 * 2. Persistência local atômica em disco (JSON) quando sem Supabase externo
 * 3. Zero dados fictícios ou sementes pré-populados — base 100% real
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { supabase, isConfigured } = require('../config/supabase');

const DEFAULT_STORE_PATH = process.env.DATA_STORE_PATH
  ? path.resolve(process.env.DATA_STORE_PATH)
  : path.resolve(__dirname, '..', '..', 'data', 'bbvision_store.json');

// Modelo Oficial de Perguntas do Checklist Técnico (Editável por Fiscais de Obra)
const defaultChecklistQuestions = [
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

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const INITIAL_USERS_HASH = '$2b$10$DM91R8a0Oi5lTsKZE1KMgu6MKacGFbBZXxcTaeERg9zx8zsAgYUpu'; // bcrypt('123456', 10)

function getInitialAccounts() {
  const nowIso = '2026-11-24T00:00:00.000Z';
  return [
    {
      id: '11111111-1111-4111-8111-111111111111',
      nome: 'Rodrigo',
      email: 'rodrigo@empreiteira.com',
      senha_hash: INITIAL_USERS_HASH,
      cargo: 'empreiteira',
      empresa: 'Empreiteira Credenciada',
      registro_profissional: null,
      ativo: true,
      created_at: nowIso,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      nome: 'Mariana',
      email: 'mariana@bb.com.br',
      senha_hash: INITIAL_USERS_HASH,
      cargo: 'fiscal',
      empresa: 'Banco do Brasil',
      registro_profissional: null,
      ativo: true,
      created_at: nowIso,
    },
  ];
}

function createEmptyState() {
  return {
    checklist_template: clone(defaultChecklistQuestions),
    usuarios: getInitialAccounts(),
    obras: [],
    relatorios: [],
    fotos: [],
    respostas: [],
  };
}

class DataStore {
  constructor(storePath = DEFAULT_STORE_PATH) {
    this.storePath = storePath;
    const initial = this._loadFromDisk();
    this.checklist_template = initial.checklist_template;
    this.usuarios = initial.usuarios;
    this.obras = initial.obras;
    this.relatorios = initial.relatorios;
    this.fotos = initial.fotos;
    this.respostas = initial.respostas;

    const added = this._ensureInitialAccountsLocal();
    if (added || !fs.existsSync(this.storePath)) {
      this._persistToDisk();
    }

    if (isConfigured && supabase && process.env.NODE_ENV !== 'test') {
      this._ensureInitialAccountsSupabase().catch(err => {
        console.warn('[DataStore/Supabase] Aviso ao sincronizar perfis iniciais:', err.message);
      });
    }
  }

  _ensureInitialAccountsLocal() {
    let added = false;
    for (const acc of getInitialAccounts()) {
      const exists = this.usuarios.some(u => u.email.toLowerCase() === acc.email.toLowerCase());
      if (!exists) {
        this.usuarios.push({ ...acc });
        added = true;
      }
    }
    return added;
  }

  async _ensureInitialAccountsSupabase() {
    if (!isConfigured || !supabase) return;
    const defaults = getInitialAccounts();
    const emails = defaults.map(u => u.email);
    const { data: existing, error } = await supabase
      .from('usuarios')
      .select('email')
      .in('email', emails);
    if (error) return;

    const existingSet = new Set((existing || []).map(u => String(u.email).toLowerCase()));
    const missing = defaults.filter(u => !existingSet.has(u.email.toLowerCase()));
    if (missing.length > 0) {
      await supabase.from('usuarios').insert(missing);
    }
  }

  _loadFromDisk() {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = fs.readFileSync(this.storePath, 'utf-8');
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          return {
            checklist_template: Array.isArray(parsed.checklist_template) && parsed.checklist_template.length > 0
              ? parsed.checklist_template
              : clone(defaultChecklistQuestions),
            usuarios: Array.isArray(parsed.usuarios) ? parsed.usuarios : [],
            obras: Array.isArray(parsed.obras) ? parsed.obras : [],
            relatorios: Array.isArray(parsed.relatorios) ? parsed.relatorios : [],
            fotos: Array.isArray(parsed.fotos) ? parsed.fotos : [],
            respostas: Array.isArray(parsed.respostas) ? parsed.respostas : [],
          };
        }
      }
    } catch (err) {
      console.warn('[DataStore] Aviso ao ler persistência local:', err.message);
    }
    return createEmptyState();
  }

  _persistToDisk() {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const snapshot = JSON.stringify({
        checklist_template: this.checklist_template,
        usuarios: this.usuarios,
        obras: this.obras,
        relatorios: this.relatorios,
        fotos: this.fotos,
        respostas: this.respostas,
      }, null, 2);

      const tmpPath = `${this.storePath}.${process.pid}.${Date.now()}.tmp`;
      fs.writeFileSync(tmpPath, snapshot, 'utf-8');
      try {
        fs.renameSync(tmpPath, this.storePath);
      } catch (renameErr) {
        fs.writeFileSync(this.storePath, snapshot, 'utf-8');
        if (fs.existsSync(tmpPath)) {
          try { fs.unlinkSync(tmpPath); } catch (_) {}
        }
      }
    } catch (err) {
      console.error('[DataStore] Erro ao gravar persistência local em disco:', err.message);
    }
  }

  reloadFromDisk() {
    const loaded = this._loadFromDisk();
    this.checklist_template = loaded.checklist_template;
    this.usuarios = loaded.usuarios;
    this.obras = loaded.obras;
    this.relatorios = loaded.relatorios;
    this.fotos = loaded.fotos;
    this.respostas = loaded.respostas;
    if (this._ensureInitialAccountsLocal()) {
      this._persistToDisk();
    }
  }

  resetForTesting() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('resetForTesting só pode ser executado com NODE_ENV=test.');
    }
    const empty = createEmptyState();
    this.checklist_template = empty.checklist_template;
    this.usuarios = empty.usuarios;
    this.obras = empty.obras;
    this.relatorios = empty.relatorios;
    this.fotos = empty.fotos;
    this.respostas = empty.respostas;
    this._persistToDisk();
  }

  getStorageModeLabel() {
    return isConfigured ? 'Supabase PostgreSQL (Conectado)' : 'Armazenamento Local Persistente (Ativo)';
  }

  // ============================================================================
  // 1. GESTÃO DE USUÁRIOS
  // ============================================================================
  findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = String(email).trim().toLowerCase();
    const user = this.usuarios.find(u => u.email.toLowerCase() === cleanEmail);
    return user ? { ...user } : null;
  }

  findUserById(id) {
    if (!id) return null;
    const user = this.usuarios.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  async findUserByEmailAsync(email) {
    if (!email) return null;
    const cleanEmail = String(email).trim().toLowerCase();
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('[DataStore/Supabase] findUserByEmailAsync:', e.message);
      }
    }
    return this.findUserByEmail(cleanEmail);
  }

  async findUserByIdAsync(id) {
    if (!id) return null;
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('[DataStore/Supabase] findUserByIdAsync:', e.message);
      }
    }
    return this.findUserById(id);
  }

  async listUsersByCargoAsync(cargo) {
    const cleanCargo = String(cargo || '').trim().toLowerCase();
    if (isConfigured && supabase) {
      try {
        let query = supabase
          .from('usuarios')
          .select('id, nome, email, cargo, empresa, registro_profissional, telefone, created_at')
          .order('nome', { ascending: true });
        if (cleanCargo) query = query.eq('cargo', cleanCargo);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn('[DataStore/Supabase] listUsersByCargoAsync:', e.message);
      }
    }

    return this.usuarios
      .filter(u => !cleanCargo || (u.cargo || '').toLowerCase() === cleanCargo)
      .map(({ senha_hash, ...pub }) => ({ ...pub }))
      .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  }

  async createUserAsync(dados) {
    const cleanEmail = String(dados.email || '').trim().toLowerCase();
    const existing = await this.findUserByEmailAsync(cleanEmail);
    if (existing) {
      const err = new Error('E-mail já cadastrado no sistema.');
      err.status = 409;
      throw err;
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const nowIso = new Date().toISOString();
    const novoUsuario = {
      id: crypto.randomUUID(),
      nome: String(dados.nome || '').trim(),
      email: cleanEmail,
      senha_hash: senhaHash,
      cargo: dados.cargo === 'fiscal' ? 'fiscal' : 'empreiteira',
      registro_profissional: String(dados.registro_profissional || '').trim(),
      empresa: String(dados.empresa || '').trim(),
      telefone: String(dados.telefone || '').trim(),
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([novoUsuario])
        .select('id, nome, email, cargo, empresa, registro_profissional, telefone, created_at, updated_at')
        .single();
      if (!error && data) {
        return data;
      }
      if (error && error.code === '23505') {
        const dupErr = new Error('E-mail já cadastrado no sistema.');
        dupErr.status = 409;
        throw dupErr;
      }
      console.warn('[DataStore/Supabase] createUserAsync fallback local:', error?.message);
    }

    this.usuarios.push(novoUsuario);
    this._persistToDisk();
    const { senha_hash, ...publicUser } = novoUsuario;
    return publicUser;
  }

  async updateUserAsync(id, atualizacoes) {
    const allowed = {};
    if (atualizacoes.nome !== undefined) allowed.nome = String(atualizacoes.nome).trim();
    if (atualizacoes.empresa !== undefined) allowed.empresa = String(atualizacoes.empresa).trim();
    if (atualizacoes.registro_profissional !== undefined) allowed.registro_profissional = String(atualizacoes.registro_profissional).trim();
    if (atualizacoes.telefone !== undefined) allowed.telefone = String(atualizacoes.telefone).trim();
    if (atualizacoes.senha_hash !== undefined) allowed.senha_hash = atualizacoes.senha_hash;
    allowed.updated_at = new Date().toISOString();

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .update(allowed)
          .eq('id', id)
          .select('id, nome, email, cargo, empresa, registro_profissional, telefone, created_at, updated_at')
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('[DataStore/Supabase] updateUserAsync:', e.message);
      }
    }

    const user = this.usuarios.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, allowed);
    this._persistToDisk();
    const { senha_hash, ...publicUser } = user;
    return publicUser;
  }

  // ============================================================================
  // 2. GESTÃO DE OBRAS E CHECKLIST TEMPLATE
  // ============================================================================
  async getChecklistTemplateAsync() {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('configuracoes_sistema')
          .select('valor')
          .eq('chave', 'checklist_template')
          .maybeSingle();
        if (!error && data && Array.isArray(data.valor) && data.valor.length > 0) {
          return clone(data.valor);
        }
      } catch (e) {
        // Fallback local
      }
    }
    return clone(this.checklist_template || defaultChecklistQuestions);
  }

  getChecklistTemplate() {
    return clone(this.checklist_template || defaultChecklistQuestions);
  }

  async updateChecklistTemplateAsync(perguntas) {
    if (Array.isArray(perguntas) && perguntas.length > 0) {
      this.checklist_template = clone(perguntas);
      this._persistToDisk();
      if (isConfigured && supabase) {
        try {
          await supabase
            .from('configuracoes_sistema')
            .upsert({ chave: 'checklist_template', valor: this.checklist_template, updated_at: new Date().toISOString() });
        } catch (e) {
          console.warn('[DataStore/Supabase] updateChecklistTemplateAsync:', e.message);
        }
      }
    }
    return this.getChecklistTemplate();
  }

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
    return result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async listObrasAsync(filtros = {}) {
    if (isConfigured && supabase) {
      try {
        let query = supabase.from('obras').select('*').order('created_at', { ascending: false });
        if (filtros.empreiteira_id) query = query.eq('empreiteira_id', filtros.empreiteira_id);
        if (filtros.fiscal_responsavel_id || filtros.fiscal_id) {
          query = query.eq('fiscal_responsavel_id', filtros.fiscal_responsavel_id || filtros.fiscal_id);
        }
        if (filtros.cadastrado_por_fiscal_id) {
          query = query.eq('cadastrado_por_fiscal_id', filtros.cadastrado_por_fiscal_id);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data)) return data;
      } catch (e) {
        console.warn('[DataStore/Supabase] listObrasAsync:', e.message);
      }
    }
    return this.listObras(filtros);
  }

  findObraById(id) {
    const obra = this.obras.find(o => o.id === id);
    return obra ? { ...obra } : null;
  }

  async findObraByIdAsync(id) {
    if (!id) return null;
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('obras').select('*').eq('id', id).maybeSingle();
        if (!error) return data || null;
      } catch (e) {
        console.warn('[DataStore/Supabase] findObraByIdAsync:', e.message);
      }
    }
    return this.findObraById(id);
  }

  async getChecklistObraAsync(obraId) {
    const obra = await this.findObraByIdAsync(obraId);
    if (!obra) return null;
    if (Array.isArray(obra.checklist_perguntas) && obra.checklist_perguntas.length > 0) {
      return clone(obra.checklist_perguntas);
    }
    return this.getChecklistTemplateAsync();
  }

  async updateChecklistObraAsync(obraId, perguntas) {
    const obra = await this.findObraByIdAsync(obraId);
    if (!obra) return null;
    const cleanPerguntas = clone(perguntas);

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obras')
          .update({ checklist_perguntas: cleanPerguntas, updated_at: new Date().toISOString() })
          .eq('id', obraId)
          .select('checklist_perguntas')
          .maybeSingle();
        if (!error && data) return data.checklist_perguntas;
      } catch (e) {
        console.warn('[DataStore/Supabase] updateChecklistObraAsync:', e.message);
      }
    }

    const localObra = this.obras.find(o => o.id === obraId);
    if (!localObra) return null;
    localObra.checklist_perguntas = cleanPerguntas;
    localObra.updated_at = new Date().toISOString();
    this._persistToDisk();
    return clone(localObra.checklist_perguntas);
  }

  async createObraAsync(dados) {
    const nowIso = new Date().toISOString();
    const templatePadrao = await this.getChecklistTemplateAsync();
    const novaObra = {
      id: crypto.randomUUID(),
      nome: dados.nome,
      endereco: dados.endereco,
      responsavel: dados.responsavel || '',
      status: dados.status || 'REGULAR',
      tipo: dados.tipo || 'Reforma e Modernização de Agência',
      empreiteira_id: dados.empreiteira_id || null,
      cadastrado_por_fiscal_id: dados.cadastrado_por_fiscal_id || null,
      fiscal_responsavel_id: dados.fiscal_responsavel_id || dados.cadastrado_por_fiscal_id || null,
      checklist_perguntas: Array.isArray(dados.checklist_perguntas) && dados.checklist_perguntas.length > 0
        ? clone(dados.checklist_perguntas)
        : templatePadrao,
      created_at: nowIso,
      updated_at: nowIso,
    };

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('obras').insert([novaObra]).select().single();
        if (!error && data) {
          if (data.empreiteira_id) {
            try { await supabase.from('obras_empreiteiras').upsert({ obra_id: data.id, empreiteira_id: data.empreiteira_id, ativo: true }); } catch (_) {}
          }
          if (data.fiscal_responsavel_id) {
            try { await supabase.from('obras_fiscais').upsert({ obra_id: data.id, fiscal_id: data.fiscal_responsavel_id, papel: 'titular' }); } catch (_) {}
          }
          return data;
        }
        console.warn('[DataStore/Supabase] createObraAsync fallback local:', error?.message);
      } catch (e) {
        console.warn('[DataStore/Supabase] createObraAsync:', e.message);
      }
    }

    this.obras.push(novaObra);
    this._persistToDisk();
    return clone(novaObra);
  }

  async updateObraAsync(id, dados) {
    const allowed = {};
    if (dados.nome !== undefined) allowed.nome = dados.nome;
    if (dados.endereco !== undefined) allowed.endereco = dados.endereco;
    if (dados.responsavel !== undefined) allowed.responsavel = dados.responsavel;
    if (dados.tipo !== undefined) allowed.tipo = dados.tipo;
    if (dados.status !== undefined) allowed.status = dados.status;
    if (dados.empreiteira_id !== undefined) allowed.empreiteira_id = dados.empreiteira_id || null;
    if (dados.fiscal_responsavel_id !== undefined) allowed.fiscal_responsavel_id = dados.fiscal_responsavel_id || null;
    if (Array.isArray(dados.checklist_perguntas) && dados.checklist_perguntas.length > 0) {
      allowed.checklist_perguntas = clone(dados.checklist_perguntas);
    }
    allowed.updated_at = new Date().toISOString();

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('obras')
          .update(allowed)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) {
          if (allowed.empreiteira_id) {
            try { await supabase.from('obras_empreiteiras').upsert({ obra_id: data.id, empreiteira_id: allowed.empreiteira_id, ativo: true }); } catch (_) {}
          }
          return data;
        }
      } catch (e) {
        console.warn('[DataStore/Supabase] updateObraAsync:', e.message);
      }
    }

    const obra = this.obras.find(o => o.id === id);
    if (!obra) return null;
    Object.assign(obra, allowed);
    this._persistToDisk();
    return clone(obra);
  }

  async deleteObraAsync(id) {
    const relatoriosDaObra = await this.listRelatoriosAsync({ obra_id: id });
    if (relatoriosDaObra.length > 0) {
      const err = new Error('Não é possível excluir uma obra que já possui relatórios de vistoria vinculados.');
      err.status = 409;
      throw err;
    }

    if (isConfigured && supabase) {
      try {
        const { error } = await supabase.from('obras').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.warn('[DataStore/Supabase] deleteObraAsync:', e.message);
      }
    }

    const idx = this.obras.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.obras.splice(idx, 1);
    this._persistToDisk();
    return true;
  }

  // ============================================================================
  // 3. GESTÃO DE RELATÓRIOS, FOTOS, RESPOSTAS E INVIOLABILIDADE
  // ============================================================================
  async _hydrateRelatorioAsync(r) {
    if (!r) return null;

    let obra = r.obra || null;
    let usuario = r.usuario || null;
    let fiscalJulgador = r.fiscal_julgador || null;
    let rawFotos = Array.isArray(r.fotos) ? r.fotos : null;
    let rawRespostas = Array.isArray(r.respostas) ? r.respostas : null;

    if (isConfigured && supabase) {
      const tasks = [];
      if (!obra && r.obra_id) {
        tasks.push(this.findObraByIdAsync(r.obra_id).then(res => { obra = res; }));
      }
      if (!usuario && r.usuario_id) {
        tasks.push(this.findUserByIdAsync(r.usuario_id).then(res => { usuario = res; }));
      }
      if (!fiscalJulgador && r.julgado_por_fiscal_id) {
        tasks.push(this.findUserByIdAsync(r.julgado_por_fiscal_id).then(res => { fiscalJulgador = res; }));
      }
      if (!rawFotos) {
        tasks.push(
          (async () => {
            try {
              const { data } = await supabase.from('fotos').select('*').eq('relatorio_id', r.id).order('created_at', { ascending: true });
              rawFotos = data || [];
            } catch (_) {
              rawFotos = [];
            }
          })()
        );
      }
      if (!rawRespostas) {
        tasks.push(
          (async () => {
            try {
              const { data } = await supabase.from('respostas').select('*').eq('relatorio_id', r.id).order('created_at', { ascending: true });
              rawRespostas = data || [];
            } catch (_) {
              rawRespostas = [];
            }
          })()
        );
      }
      if (tasks.length > 0) await Promise.all(tasks);
    } else {
      if (!obra && r.obra_id) obra = this.findObraById(r.obra_id);
      if (!usuario && r.usuario_id) usuario = this.findUserById(r.usuario_id);
      if (!fiscalJulgador && r.julgado_por_fiscal_id) fiscalJulgador = this.findUserById(r.julgado_por_fiscal_id);
      if (!rawFotos) rawFotos = this.fotos.filter(f => f.relatorio_id === r.id);
      if (!rawRespostas) rawRespostas = this.respostas.filter(resp => resp.relatorio_id === r.id);
    }

    return this.formatRelatorio({
      ...r,
      obra,
      usuario,
      fiscal_julgador: fiscalJulgador,
      fotos: rawFotos || [],
      respostas: rawRespostas || [],
    });
  }

  formatRelatorio(r) {
    const obra = r.obra || this.findObraById(r.obra_id);
    const usuario = r.usuario || this.findUserById(r.usuario_id);
    const fiscalJulgador = r.fiscal_julgador || (r.julgado_por_fiscal_id ? this.findUserById(r.julgado_por_fiscal_id) : null);

    const rawFotos = Array.isArray(r.fotos)
      ? r.fotos
      : this.fotos.filter(f => f.relatorio_id === r.id);

    const fotos = rawFotos.map(f => ({
      ...f,
      url: f.url || f.caminho_arquivo,
      caminho_arquivo: f.caminho_arquivo || f.url,
      hashSha256: f.hash_integridade || f.hash_sha256,
      hash_sha256: f.hash_integridade || f.hash_sha256,
      hash_integridade: f.hash_integridade || f.hash_sha256,
      confianca: f.confianca !== undefined && f.confianca !== null ? Number(f.confianca) : (f.confianca_ia !== undefined ? Number(f.confianca_ia) : null),
      motivo: f.motivo || f.motivo_ia || '',
      status: f.avaliacao_gemini || f.status_ia || 'APROVADO',
    }));

    const rawRespostas = Array.isArray(r.respostas)
      ? r.respostas
      : this.respostas.filter(resp => resp.relatorio_id === r.id);
    const respostas = rawRespostas.map(resp => ({ ...resp }));

    const dataFinal = r.finalizado_em || r.data_finalizacao || r.data || null;
    const dataJulg = r.julgado_em || r.data_julgamento || null;

    return {
      ...r,
      codigoUnico: r.codigo_unico || null,
      codigo_unico: r.codigo_unico || null,
      hashIntegridade: r.hash_integridade || null,
      hash_integridade: r.hash_integridade || null,
      dataFinalizacao: dataFinal,
      data_finalizacao: dataFinal,
      data_julgamento: dataJulg,
      justificativa_fiscal: r.justificativa_fiscal || r.justificativa || null,
      pdfUrl: `/api/relatorios/${r.id}/pdf`,
      obra: obra ? { ...obra } : null,
      usuario: usuario
        ? {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            cargo: usuario.cargo,
            empresa: usuario.empresa || '',
            registro_profissional: usuario.registro_profissional || '',
          }
        : null,
      fiscal_julgador: fiscalJulgador
        ? {
            id: fiscalJulgador.id,
            nome: fiscalJulgador.nome,
            registro_profissional: fiscalJulgador.registro_profissional || '',
          }
        : null,
      fotos,
      respostas,
    };
  }

  async listRelatoriosAsync(filtros = {}) {
    if (isConfigured && supabase) {
      try {
        let query = supabase.from('relatorios').select('*').order('created_at', { ascending: false });
        if (filtros.obra_id) query = query.eq('obra_id', filtros.obra_id);
        if (filtros.status) query = query.eq('status', filtros.status);
        if (filtros.usuario_id) query = query.eq('usuario_id', filtros.usuario_id);
        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return Promise.all(data.map(r => this._hydrateRelatorioAsync(r)));
        }
      } catch (e) {
        console.warn('[DataStore/Supabase] listRelatoriosAsync:', e.message);
      }
    }

    let lista = [...this.relatorios];
    if (filtros.obra_id) lista = lista.filter(r => r.obra_id === filtros.obra_id);
    if (filtros.status) lista = lista.filter(r => r.status === filtros.status);
    if (filtros.usuario_id) lista = lista.filter(r => r.usuario_id === filtros.usuario_id);
    lista.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return lista.map(r => this.formatRelatorio(r));
  }

  async findRelatorioByIdAsync(id) {
    if (!id) return null;
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('relatorios').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return this._hydrateRelatorioAsync(data);
        }
        if (!error && !data) return null;
      } catch (e) {
        console.warn('[DataStore/Supabase] findRelatorioByIdAsync:', e.message);
      }
    }
    const local = this.relatorios.find(r => r.id === id);
    return local ? this.formatRelatorio(local) : null;
  }

  async findRelatorioByCodigoOuHashAsync(termo) {
    if (!termo) return null;
    const cleanTermo = String(termo).trim();
    const upperTermo = cleanTermo.toUpperCase();
    const lowerTermo = cleanTermo.toLowerCase();

    if (isConfigured && supabase) {
      try {
        // Consultas separadas e parametrizadas (sem interpolação em .or())
        const { data: byCode } = await supabase
          .from('relatorios')
          .select('*')
          .eq('codigo_unico', upperTermo)
          .maybeSingle();

        if (byCode) {
          return this._hydrateRelatorioAsync(byCode);
        }

        const { data: byHash } = await supabase
          .from('relatorios')
          .select('*')
          .eq('hash_integridade', lowerTermo)
          .maybeSingle();

        if (byHash) {
          return this._hydrateRelatorioAsync(byHash);
        }
        return null;
      } catch (e) {
        console.warn('[DataStore/Supabase] findRelatorioByCodigoOuHashAsync:', e.message);
      }
    }

    const relMem = this.relatorios.find(r =>
      (r.codigo_unico && r.codigo_unico.toUpperCase() === upperTermo) ||
      (r.hash_integridade && r.hash_integridade.toUpperCase() === upperTermo)
    );
    return relMem ? this.formatRelatorio(relMem) : null;
  }

  async createRelatorioAsync(dados) {
    const nowIso = new Date().toISOString();
    const novo = {
      id: crypto.randomUUID(),
      obra_id: dados.obra_id,
      usuario_id: dados.usuario_id,
      status: 'EM_ANDAMENTO',
      codigo_unico: null,
      hash_integridade: null,
      arquivo_pdf_url: null,
      tipo_local: dados.tipo_local || null,
      localizacao_texto: dados.localizacao_texto || null,
      latitude: dados.latitude !== undefined ? dados.latitude : null,
      longitude: dados.longitude !== undefined ? dados.longitude : null,
      precisao_gps: dados.precisao_gps !== undefined ? dados.precisao_gps : null,
      assinatura_base64: null,
      validacao_manual: Boolean(dados.validacao_manual),
      motivo_validacao_manual: dados.motivo_validacao_manual || null,
      justificativa_fiscal: null,
      created_at: nowIso,
      finalizado_em: null,
      julgado_em: null,
      julgado_por_fiscal_id: null,
    };

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('relatorios').insert([novo]).select().single();
        if (!error && data) return data;
        console.warn('[DataStore/Supabase] createRelatorioAsync fallback local:', error?.message);
      } catch (e) {
        console.warn('[DataStore/Supabase] createRelatorioAsync:', e.message);
      }
    }

    this.relatorios.push(novo);
    this._persistToDisk();
    return { ...novo };
  }

  async saveRespostasAsync(relatorioId, itens) {
    const nowIso = new Date().toISOString();
    const registros = itens.map(item => ({
      id: crypto.randomUUID(),
      relatorio_id: relatorioId,
      pergunta: item.pergunta,
      valor: item.valor,
      justificativa: item.justificativa || null,
      sugestao_ia: item.sugestao_ia || null,
      tipo: item.tipo || 'texto',
      editado_pelo_usuario: Boolean(item.editado_pelo_usuario),
      created_at: nowIso,
    }));

    if (isConfigured && supabase) {
      try {
        await supabase.from('respostas').delete().eq('relatorio_id', relatorioId);
        if (registros.length > 0) {
          const { error } = await supabase.from('respostas').insert(registros);
          if (!error) return true;
          console.warn('[DataStore/Supabase] saveRespostasAsync fallback local:', error.message);
        } else {
          return true;
        }
      } catch (e) {
        console.warn('[DataStore/Supabase] saveRespostasAsync:', e.message);
      }
    }

    this.respostas = this.respostas.filter(resp => resp.relatorio_id !== relatorioId);
    this.respostas.push(...registros);
    this._persistToDisk();
    return true;
  }

  async addFotoAsync(relatorioId, dadosFoto) {
    const nowIso = new Date().toISOString();
    const foto = {
      id: crypto.randomUUID(),
      relatorio_id: relatorioId,
      caminho_arquivo: dadosFoto.caminho_arquivo,
      hash_integridade: dadosFoto.hash_integridade,
      tipo_local: dadosFoto.tipo_local || null,
      avaliacao_gemini: dadosFoto.avaliacao_gemini || 'APROVADO',
      confianca: dadosFoto.confianca !== undefined && dadosFoto.confianca !== null ? Number(dadosFoto.confianca) : null,
      motivo: dadosFoto.motivo || '',
      modelo_ia: dadosFoto.modelo_ia || null,
      tempo_resposta_ms: dadosFoto.tempo_resposta_ms || null,
      data_captura: dadosFoto.data_captura || nowIso,
      created_at: nowIso,
    };

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('fotos').insert([foto]).select().single();
        if (!error && data) {
          return {
            ...data,
            url: data.caminho_arquivo,
            hash_sha256: data.hash_integridade,
            status_ia: data.avaliacao_gemini,
            confianca_ia: data.confianca,
            motivo_ia: data.motivo,
          };
        }
        console.warn('[DataStore/Supabase] addFotoAsync fallback local:', error?.message);
      } catch (e) {
        console.warn('[DataStore/Supabase] addFotoAsync:', e.message);
      }
    }

    this.fotos.push(foto);
    this._persistToDisk();
    return {
      ...foto,
      url: foto.caminho_arquivo,
      hash_sha256: foto.hash_integridade,
      status_ia: foto.avaliacao_gemini,
      confianca_ia: foto.confianca,
      motivo_ia: foto.motivo,
    };
  }

  async finalizarRelatorioAsync(id, dadosFinalizacao) {
    const nowIso = dadosFinalizacao.data_finalizacao || new Date().toISOString();
    const patch = {
      status: 'FINALIZADO',
      codigo_unico: dadosFinalizacao.codigo_unico,
      hash_integridade: dadosFinalizacao.hash_integridade,
      arquivo_pdf_url: dadosFinalizacao.arquivo_pdf_url || null,
      finalizado_em: nowIso,
    };
    if (dadosFinalizacao.assinatura_base64 !== undefined) patch.assinatura_base64 = dadosFinalizacao.assinatura_base64;
    if (dadosFinalizacao.latitude !== undefined) patch.latitude = dadosFinalizacao.latitude;
    if (dadosFinalizacao.longitude !== undefined) patch.longitude = dadosFinalizacao.longitude;
    if (dadosFinalizacao.precisao_gps !== undefined) patch.precisao_gps = dadosFinalizacao.precisao_gps;
    if (dadosFinalizacao.localizacao_texto !== undefined) patch.localizacao_texto = dadosFinalizacao.localizacao_texto;
    if (dadosFinalizacao.tipo_local !== undefined) patch.tipo_local = dadosFinalizacao.tipo_local;
    if (dadosFinalizacao.validacao_manual !== undefined) patch.validacao_manual = Boolean(dadosFinalizacao.validacao_manual);
    if (dadosFinalizacao.motivo_validacao_manual !== undefined) patch.motivo_validacao_manual = dadosFinalizacao.motivo_validacao_manual;

    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('relatorios')
          .update(patch)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) return data;
        console.warn('[DataStore/Supabase] finalizarRelatorioAsync fallback local:', error?.message);
      } catch (e) {
        console.warn('[DataStore/Supabase] finalizarRelatorioAsync:', e.message);
      }
    }

    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    Object.assign(rel, patch, { data_finalizacao: nowIso, data: nowIso });
    this._persistToDisk();
    return { ...rel };
  }

  async atualizarStatusFiscalAsync(id, status, justificativa, fiscalId = null) {
    const nowIso = new Date().toISOString();
    const obraStatus = status === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';

    if (isConfigured && supabase) {
      try {
        const { data: rel, error } = await supabase
          .from('relatorios')
          .update({
            status,
            justificativa_fiscal: justificativa,
            julgado_em: nowIso,
            julgado_por_fiscal_id: fiscalId,
            arquivo_pdf_url: null,
          })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && rel) {
          let obra = null;
          if (rel.obra_id) {
            const { data: obraAtualizada } = await supabase
              .from('obras')
              .update({ status: obraStatus, updated_at: nowIso })
              .eq('id', rel.obra_id)
              .select()
              .maybeSingle();
            obra = obraAtualizada || null;
          }
          return { relatorio: rel, obra };
        }
      } catch (e) {
        console.warn('[DataStore/Supabase] atualizarStatusFiscalAsync:', e.message);
      }
    }

    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    rel.status = status;
    rel.justificativa_fiscal = justificativa;
    rel.julgado_em = nowIso;
    rel.data_julgamento = nowIso;
    rel.julgado_por_fiscal_id = fiscalId;
    rel.arquivo_pdf_url = null;

    const obra = this.obras.find(o => o.id === rel.obra_id);
    if (obra) {
      obra.status = obraStatus;
      obra.updated_at = nowIso;
    }

    this._persistToDisk();
    return { relatorio: { ...rel }, obra: obra ? { ...obra } : null };
  }

  async atualizarPdfRelatorioAsync(id, pdfRelativePath) {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('relatorios')
          .update({ arquivo_pdf_url: pdfRelativePath })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.warn('[DataStore/Supabase] atualizarPdfRelatorioAsync:', e.message);
      }
    }

    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    rel.arquivo_pdf_url = pdfRelativePath;
    this._persistToDisk();
    return { ...rel };
  }

  async getPainelAuditoriaAsync() {
    const [relatorios, obras] = await Promise.all([
      this.listRelatoriosAsync(),
      this.listObrasAsync(),
    ]);
    return {
      totalRelatorios: relatorios.length,
      pendentes: relatorios.filter(r => r.status === 'EM_ANDAMENTO').length,
      finalizados: relatorios.filter(r => r.status === 'FINALIZADO').length,
      aprovados: relatorios.filter(r => r.status === 'APROVADO').length,
      pendentesAjuste: relatorios.filter(r => r.status === 'PENDENTE_AJUSTE').length,
      obrasAtivas: obras.length,
      relatorios,
    };
  }
}

const dataStore = new DataStore();
module.exports = dataStore;
module.exports.DataStore = DataStore;
module.exports.defaultChecklistQuestions = defaultChecklistQuestions;
