/**
 * BBVision - Cliente de Comunicação com a API Backend
 * Conecta o Frontend Vanilla JavaScript com os endpoints oficiais do Node.js
 * Suporte a Fila Local Offline (HU05)
 */

const API_BASE_URL = window.location.port === '3000' ? '' : 'http://127.0.0.1:3000';

class BBVisionApiClient {
  constructor() {
    this.token = localStorage.getItem('bbvision_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bbvision_token', token);
    } else {
      localStorage.removeItem('bbvision_token');
    }
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.erro || `Erro HTTP ${response.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`[API Fetch Warning] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // ----------------------------------------------------------------------------
  // AUTENTICAÇÃO
  // ----------------------------------------------------------------------------
  async login(email, senha) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async me() {
    return this.request('/api/auth/me', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // ----------------------------------------------------------------------------
  // OBRAS
  // ----------------------------------------------------------------------------
  async getObras() {
    return this.request('/api/obras', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getObra(id) {
    return this.request(`/api/obras/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  // ----------------------------------------------------------------------------
  // FOTOS E IA GEMINI
  // ----------------------------------------------------------------------------
  async avaliarFoto(formDataOrBase64) {
    if (formDataOrBase64 instanceof FormData) {
      const headers = {};
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
      return this.request('/api/fotos/avaliar', {
        method: 'POST',
        headers,
        body: formDataOrBase64,
      });
    }

    return this.request('/api/fotos/avaliar', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ imagemBase64: formDataOrBase64 }),
    });
  }

  async sugerirObservacao(categoria, imagemBase64 = null) {
    return this.request('/api/fotos/sugerir-observacao', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ categoria, imagemBase64 }),
    });
  }

  // ----------------------------------------------------------------------------
  // RELATÓRIOS
  // ----------------------------------------------------------------------------
  async criarRelatorio(obra_id) {
    return this.request('/api/relatorios', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ obra_id }),
    });
  }

  async getRelatorios(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/relatorios?${query}` : '/api/relatorios';
    return this.request(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getRelatorio(id) {
    return this.request(`/api/relatorios/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async salvarRespostas(relatorioId, respostas) {
    return this.request(`/api/relatorios/${relatorioId}/respostas`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(respostas),
    });
  }

  async anexarFoto(relatorioId, fotoData) {
    return this.request(`/api/relatorios/${relatorioId}/fotos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(fotoData),
    });
  }

  async finalizarRelatorio(relatorioId) {
    return this.request(`/api/relatorios/${relatorioId}/finalizar`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
    });
  }

  async atualizarStatusFiscal(relatorioId, status, justificativa) {
    return this.request(`/api/relatorios/${relatorioId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, justificativa }),
    });
  }

  getPdfUrl(relatorioId) {
    return `${API_BASE_URL}/api/relatorios/${relatorioId}/pdf`;
  }
}

export const api = new BBVisionApiClient();
