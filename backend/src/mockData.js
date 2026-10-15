/**
 * BBVision - Dados em Memória (Mock Básico)
 * Substituto limpo e desacoplado do banco de dados para desenvolvimento básico
 */

const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('123456', salt);

const mockData = {
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
      id: 'obr-001',
      nome: 'Obra Centro (Agência Sede)',
      endereco: 'Av. Rio Branco, 120 - Centro, Rio de Janeiro - RJ',
      responsavel: 'Rodrigo Silva',
      status: 'REGULAR',
      tipo: 'Residência vistoria',
      created_at: new Date().toISOString(),
    },
    {
      id: 'obr-002',
      nome: 'Obra Zona Sul (Agência Paulista)',
      endereco: 'Av. Paulista, 2163 - Cerqueira César, São Paulo - SP',
      responsavel: 'Rodrigo Silva',
      status: 'REGULAR',
      tipo: 'Residência vistoria',
      created_at: new Date().toISOString(),
    },
    {
      id: 'obr-003',
      nome: 'Residência Alpha (Agência Brasília)',
      endereco: 'SBS Quadra 1 Bloco G Lote 32, Brasília - DF',
      responsavel: 'Rodrigo Silva',
      status: 'EM_ANDAMENTO',
      tipo: 'Construção nova',
      created_at: new Date().toISOString(),
    },
    {
      id: 'obr-004',
      nome: 'Obra Copacabana',
      endereco: 'Rua Barata Ribeiro, 300 - Rio de Janeiro - RJ',
      responsavel: 'Rodrigo Silva',
      status: 'EM_ANDAMENTO',
      tipo: 'Reforma',
      created_at: new Date().toISOString(),
    },
  ],

  relatorios: [],
  fotos: [],
  respostas: [],

  // Helpers de Usuário
  findUserByEmail(email) {
    return this.usuarios.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || null;
  },

  findUserById(id) {
    return this.usuarios.find(u => u.id === id) || null;
  },

  // Helpers de Obras
  listObras() {
    return [...this.obras];
  },

  findObraById(id) {
    return this.obras.find(o => o.id === id) || null;
  },

  createObra(dados) {
    const novaObra = {
      id: `obr-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'REGULAR',
      ...dados,
    };
    this.obras.push(novaObra);
    return novaObra;
  },

  // Helpers de Relatórios
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
    const novo = {
      id: `rel-${Date.now()}`,
      status: 'EM_ANDAMENTO',
      codigo_unico: null,
      hash_integridade: null,
      arquivo_pdf_url: null,
      created_at: new Date().toISOString(),
      ...dados,
    };
    this.relatorios.push(novo);
    return novo;
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
    return foto;
  },

  finalizarRelatorio(id, dadosFinalizacao) {
    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    rel.status = 'FINALIZADO';
    rel.codigo_unico = dadosFinalizacao.codigo_unico;
    rel.hash_integridade = dadosFinalizacao.hash_integridade;
    rel.arquivo_pdf_url = dadosFinalizacao.arquivo_pdf_url;
    rel.data_finalizacao = new Date().toISOString();
    return rel;
  },

  atualizarStatusFiscal(id, status, justificativa) {
    const rel = this.relatorios.find(r => r.id === id);
    if (!rel) return null;
    rel.status = status;
    rel.justificativa_fiscal = justificativa;
    rel.data_julgamento = new Date().toISOString();

    // Atualiza status da obra correspondente
    const obra = this.findObraById(rel.obra_id);
    if (obra) {
      obra.status = status === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
    }
    return { relatorio: rel, obra };
  },

  formatRelatorio(r) {
    const obra = this.findObraById(r.obra_id);
    const fotos = this.fotos.filter(f => f.relatorio_id === r.id);
    const respostas = this.respostas.filter(resp => resp.relatorio_id === r.id);
    return {
      ...r,
      obra,
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
