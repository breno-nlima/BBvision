/**
 * BBVision - Serviço de Fila Local e Sincronização Offline (HU05)
 * Conforme Seção 3.2 (HU05) e Casos de Borda Seção 5.1 do Documento de Entrega TakeOff:
 * "Ambiente offline (sem sinal de internet): Fotos e respostas são armazenadas na fila
 * local segura do dispositivo e sincronizadas automaticamente ao restabelecer a conexão."
 */

import { API_BASE_URL } from './api.js';

const QUEUE_STORAGE_KEY = 'bbvision_offline_queue';

class OfflineSyncService {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.listeners = [];
    if (typeof window !== 'undefined') {
      this.initNetworkListeners();
    }
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyStatus(true);
      this.sincronizarFila();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatus(false);
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyStatus(status) {
    this.listeners.forEach(fn => fn({ online: status, filaTamanho: this.obterFila().length }));
  }

  obterFila() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[OfflineSync] Erro ao ler fila local:', e);
      return [];
    }
  }

  salvarFila(fila) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(fila));
      }
      this.notifyStatus(this.isOnline);
    } catch (e) {
      console.error('[OfflineSync] Erro ao salvar fila local:', e);
    }
  }

  /**
   * Enfileira uma vistoria para sincronização posterior
   */
  enfileirarVistoria(item) {
    const fila = this.obterFila();
    const registro = {
      idTemporario: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      tipo: 'VISTORIA_FINALIZADA',
      dados: item,
    };
    fila.push(registro);
    this.salvarFila(fila);
    console.log(`[OfflineSync] Vistoria salva na fila offline. Total pendente: ${fila.length}`);
    return registro;
  }

  /**
   * Processa itens pendentes quando a conexão for restabelecida
   */
  async sincronizarFila() {
    const fila = this.obterFila();
    if (fila.length === 0) return;

    console.log(`[OfflineSync] Conexão restabelecida. Sincronizando ${fila.length} itens pendentes...`);

    const filaRestante = [];
    for (const item of fila) {
      try {
        const dados = item.dados || {};
        const respObj = dados.respostas || {};
        const justMap = respObj.justificativas || {};
        const perguntas = Array.isArray(dados.perguntasChecklist) ? dados.perguntasChecklist : [];
        const respostasLista = perguntas.length > 0
          ? perguntas.map((q, idx) => {
              const chave = q.chaveResposta || q.id || `pergunta_${idx}`;
              const rawVal = respObj[chave];
              const valorStr = Array.isArray(rawVal) ? rawVal.join('; ') : String(rawVal || 'Não informado');
              return {
                pergunta: q.titulo || `Item ${idx + 1}`,
                valor: valorStr,
                justificativa: justMap[chave] || null,
                tipo: q.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
              };
            })
          : [
              { pergunta: '1. Fachada da agência', valor: respObj.fachadaLegivel || 'Conforme', justificativa: justMap.fachadaLegivel || null },
              { pergunta: '2. Segurança e EPC', valor: Array.isArray(respObj.segurancaEpc) ? respObj.segurancaEpc.join('; ') : (respObj.segurancaEpc || 'Verificado') },
              { pergunta: '3. Relato estrutural', valor: respObj.relatoEstrutural || respObj.observacoes || 'Registro sincronizado da fila offline.' },
              { pergunta: '4. Acessibilidade', valor: respObj.acessibilidade || 'Conforme', justificativa: justMap.acessibilidade || null },
            ];

        const payload = {
          obra_id: dados.obraId || dados.obra_id || 'obr-001',
          codigo_unico: dados.codigoUnico || null,
          timestamp: item.timestamp,
          respostas: respostasLista,
          fotos: (dados.fotoCamera || dados.fotoUrl) ? [{
            imagemBase64: dados.fotoCamera || null,
            caminho_arquivo: dados.fotoUrl && !dados.fotoCamera ? dados.fotoUrl : null,
            avaliacao_gemini: 'VALIDACAO_MANUAL',
            confianca: 0.75,
            motivo: 'Registro capturado em modo offline (sincronizado automaticamente).'
          }] : [],
        };

        // Envia para o endpoint oficial de sincronização offline com autenticação
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('bbvision_token') : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/relatorios/sincronizar-offline`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log(`[OfflineSync] Item ${item.idTemporario} sincronizado com sucesso.`);
        } else {
          filaRestante.push(item);
        }
      } catch (err) {
        console.warn(`[OfflineSync] Falha ao sincronizar item ${item.idTemporario}, mantendo na fila:`, err.message);
        filaRestante.push(item);
      }
    }

    this.salvarFila(filaRestante);
  }
}

export const offlineSync = new OfflineSyncService();
