/**
 * BVision State Management Service
 * Gerencia o estado reativo da aplicação (Navegação, Usuário, Obras e Vistorias)
 */

class AppState {
  constructor() {
    this.user = {
      id: 'usr-001',
      nome: 'Rodrigo',
      email: 'rodrigo@empreiteira.com',
      cargo: 'empreiteira', // ou 'fiscal'
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    this.currentPage = 'inicio'; // 'login' | 'inicio' | 'obras' | 'relatorios' | 'perfil' | 'vistoria'
    this.activeNav = 'inicio';   // 'inicio' | 'obras' | 'relatorios' | 'perfil'
    this.selectedObra = null;
    this.searchQuery = '';

    // Obras em conformidade com as telas fornecidas
    this.obras = [
      {
        id: 'obr-001',
        nome: 'Obra Centro',
        subtitulo: 'Futura unidade',
        tipo: 'Residência vistoria',
        responsavel: 'Rodrigo Silva',
        endereco: 'Av. Rio Branco, 120 - Centro',
        status: 'Concluído',
        destaque: true,
        imagemTipo: 'logo' // Usa o logo amarelo BVision como no mockup
      },
      {
        id: 'obr-002',
        nome: 'Obra Zona Sul',
        subtitulo: 'Residência',
        tipo: 'Residência vistoria',
        responsavel: 'Rodrigo Silva',
        endereco: 'Rua Domingos Ferreira, 450 - Zona Sul',
        status: 'Concluído',
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
        status: 'Em andamento',
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
        status: 'Em andamento',
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

    this.listeners = [];
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
    this.selectedObra = this.obras.find(o => o.id === obraId) || null;
    this.notify();
  }

  login(email, senha) {
    if (email.includes('fiscal') || email.includes('mariana')) {
      this.user = {
        id: 'usr-002',
        nome: 'Mariana',
        email: email,
        cargo: 'fiscal',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      };
    } else {
      this.user = {
        id: 'usr-001',
        nome: 'Rodrigo',
        email: email || 'rodrigo@empreiteira.com',
        cargo: 'empreiteira',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
    }
    this.navigate('inicio', 'inicio');
  }

  logout() {
    this.user = null;
    this.navigate('login');
  }
}

export const state = new AppState();
