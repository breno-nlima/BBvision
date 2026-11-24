/**
 * BBVision - Cliente de Comunicação com a API Backend
 * Conecta o Frontend Vanilla JavaScript com os endpoints oficiais do Node.js
 */

function resolveApiBaseUrl() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:3000';

  const custom = localStorage.getItem('bbvision_api_url');
  if (custom) return custom.replace(/\/$/, '');

  const { protocol, hostname, port } = window.location;

  // Se estiver aberto diretamente do sistema de arquivos (file://) ou via Live Server local
  if (protocol === 'file:') {
    return 'http://127.0.0.1:3000';
  }
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '5500' || port === '5501' || port === '5173')) {
    return 'http://127.0.0.1:3000';
  }

  // Em produção (HTTPS/HTTP na porta padrão ou mesma origem servida pelo Express), usa URL relativa
  return '';
}

const API_BASE_URL = resolveApiBaseUrl();
export { API_BASE_URL };

class BBVisionApiClient {
  constructor() {
    this.token = localStorage.getItem('bbvision_token') || null;
    this.onUnauthorized = null;
  }

  setUnauthorizedHandler(fn) {
    this.onUnauthorized = fn;
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

  async request(endpoint, options = {}, { skipAuthRedirect = false } = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, options);

      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => '');
        try {
          data = JSON.parse(text);
        } catch {
          data = { erro: text && text.length < 160 ? text : `Erro no servidor (HTTP ${response.status})` };
        }
      }

      if (!response.ok) {
        const msg = (data && (data.erro || data.mensagem || data.message)) || `Erro HTTP ${response.status}`;
        const err = new Error(msg);
        err.status = response.status;

        if (response.status === 401 && !skipAuthRedirect && typeof this.onUnauthorized === 'function') {
          this.onUnauthorized(msg);
        }

        throw err;
      }
      return data;
    } catch (err) {
      if (!err.status) {
        err.isNetworkError = true;
      }
      console.warn(`[API Fetch Warning] ${endpoint}:`, err.message);
      throw err;
    }
  }

  // ----------------------------------------------------------------------------
  // AUTENTICAÇÃO E PERFIL
  // ----------------------------------------------------------------------------
  async login(email, senha) {
    const data = await this.request(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      },
      { skipAuthRedirect: true }
    );
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(dados) {
    const data = await this.request(
      '/api/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      },
      { skipAuthRedirect: true }
    );
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async me() {
    return this.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: this.getHeaders(),
      },
      { skipAuthRedirect: true }
    );
  }

  async atualizarPerfil(dados) {
    return this.request('/api/auth/me', {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(dados),
    });
  }

  async alterarSenha(senhaAtual, novaSenha) {
    return this.request(
      '/api/auth/senha',
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ senhaAtual, novaSenha }),
      },
      { skipAuthRedirect: true }
    );
  }

  async getEmpreiteiras() {
    return this.request('/api/auth/empreiteiras', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async logout() {
    try {
      await this.request(
        '/api/auth/logout',
        {
          method: 'POST',
          headers: this.getHeaders(),
        },
        { skipAuthRedirect: true }
      );
    } catch (_) {
      // Ignora falha de rede no logout para garantir limpeza local
    } finally {
      this.setToken(null);
    }
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
    return this.request(`/api/obras/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async criarObra(dados) {
    return this.request('/api/obras', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(dados),
    });
  }

  async atualizarObra(id, dados) {
    return this.request(`/api/obras/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(dados),
    });
  }

  async excluirObra(id) {
    return this.request(`/api/obras/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
  }

  async getChecklistTemplate() {
    return this.request('/api/obras/checklist-template', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async salvarChecklistTemplate(perguntas) {
    return this.request('/api/obras/checklist-template', {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ perguntas }),
    });
  }

  async getChecklistObra(obraId) {
    return this.request(`/api/obras/${encodeURIComponent(obraId)}/checklist`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async salvarChecklistObra(obraId, perguntas) {
    return this.request(`/api/obras/${encodeURIComponent(obraId)}/checklist`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ perguntas }),
    });
  }

  // ----------------------------------------------------------------------------
  // FOTOS E IA
  // ----------------------------------------------------------------------------
  async avaliarFoto(formDataOrBase64, telemetriaVisual = null) {
    if (formDataOrBase64 instanceof FormData) {
      if (telemetriaVisual) {
        formDataOrBase64.append('telemetriaVisual', JSON.stringify(telemetriaVisual));
      }
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
      body: JSON.stringify({
        imagemBase64: formDataOrBase64,
        telemetriaVisual,
      }),
    });
  }

  async sugerirObservacao(categoria, imagemBase64 = null, contextoRespostas = null) {
    return this.request('/api/fotos/sugerir-observacao', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ categoria, imagemBase64, contextoRespostas }),
    });
  }

  // ----------------------------------------------------------------------------
  // RELATÓRIOS
  // ----------------------------------------------------------------------------
  async criarRelatorio(obra_id, extras = {}) {
    return this.request('/api/relatorios', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ obra_id, ...extras }),
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

  async getPainelAuditoria() {
    return this.request('/api/relatorios/painel/resumo', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async getRelatorio(id) {
    return this.request(`/api/relatorios/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  async salvarRespostas(relatorioId, respostas) {
    return this.request(`/api/relatorios/${encodeURIComponent(relatorioId)}/respostas`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(respostas),
    });
  }

  async anexarFoto(relatorioId, fotoData) {
    return this.request(`/api/relatorios/${encodeURIComponent(relatorioId)}/fotos`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(fotoData),
    });
  }

  async finalizarRelatorio(relatorioId, dadosExtras = {}) {
    // skipAuthRedirect: true porque senha_confirmacao incorreta retorna 401 sem invalidar o JWT
    return this.request(
      `/api/relatorios/${encodeURIComponent(relatorioId)}/finalizar`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(dadosExtras || {}),
      },
      { skipAuthRedirect: true }
    );
  }

  async atualizarStatusFiscal(relatorioId, status, justificativa) {
    return this.request(`/api/relatorios/${encodeURIComponent(relatorioId)}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, justificativa }),
    });
  }

  async validarDocumento(codigoOuHash) {
    const termo = encodeURIComponent((codigoOuHash || '').trim());
    return this.request(
      `/api/validador/${termo}`,
      { method: 'GET' },
      { skipAuthRedirect: true }
    );
  }

  getPdfUrl(relatorioId) {
    return `${API_BASE_URL}/api/relatorios/${encodeURIComponent(relatorioId)}/pdf`;
  }
}

export const api = new BBVisionApiClient();
