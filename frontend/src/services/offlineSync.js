/**
 * BBVision - Serviço de Fila Local e Sincronização Offline (HU05)
 * Armazena vistorias capturadas sem sinal de internet na fila local
 * e sincroniza automaticamente ao restabelecer a conexão.
 */

import { API_BASE_URL } from './api.js?v=2.5';

const QUEUE_STORAGE_KEY = 'bbvision_offline_queue';

const ITENS_VERIFICACAO_MAP = [
  { key: 'check1', texto: 'A estrutura está conforme o projeto?' },
  { key: 'check2', texto: 'Não há danos ou irregularidades visíveis?' },
  { key: 'check3', texto: 'A sinalização de segurança está correta?' },
  { key: 'check4', texto: 'A etapa da obra foi atualizada corretamente?' },
  { key: 'check5', texto: 'O local está pronto para registro fotográfico in-loco?' },
];

class OfflineSyncService {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.listeners = [];
    this.syncListeners = [];
    this.isSyncing = false;
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

  onSynced(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
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

  enfileirarVistoria(item) {
    const fila = this.obterFila();
    const registro = {
      idTemporario: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      tipo: 'VISTORIA_FINALIZADA',
      dados: JSON.parse(JSON.stringify(item)),
    };
    fila.push(registro);
    this.salvarFila(fila);
    return registro;
  }

  async sincronizarFila() {
    if (this.isSyncing) return 0;
    const fila = this.obterFila();
    if (fila.length === 0) return 0;

    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('bbvision_token') : null;
    if (!token) return 0;

    this.isSyncing = true;
    let sincronizados = 0;
    const filaRestante = [];

    try {
      for (const item of fila) {
        try {
          const dados = item.dados || {};
          const obraId = dados.obraId || dados.obra_id;
          if (!obraId) continue;

          const respObj = dados.respostas || {};
          const justMap = respObj.justificativas || {};
          const perguntas = Array.isArray(dados.perguntasChecklist) ? dados.perguntasChecklist : [];

          const respostasLista = perguntas.map((q, idx) => {
            const chave = q.chaveResposta || q.id || `pergunta_${idx}`;
            const rawVal = respObj[chave];
            const valorStr = Array.isArray(rawVal)
              ? (rawVal.length > 0 ? rawVal.join('; ') : 'Não informado')
              : String(rawVal || 'Não informado');
            return {
              pergunta: q.titulo || `Item ${idx + 1}`,
              valor: valorStr,
              justificativa: justMap[chave] || null,
              tipo: q.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
            };
          });

          // Checklist complementar (sinalização, limpeza, câmeras)
          respostasLista.push({
            pergunta: 'Condição da sinalização complementar, limpeza e câmeras',
            valor: `Sinalização: ${respObj.sinalizacao || 'Não informado'} | Limpeza: ${respObj.limpeza || '-'}/5 | Câmeras: ${respObj.cameras ?? '-'}`,
            justificativa: respObj.justificativaSinalizacao || null,
            tipo: 'multipla_escolha',
          });

          // Checklist de verificação (etapa 2 de 3)
          const checksMarcados = ITENS_VERIFICACAO_MAP
            .filter(i => Boolean(respObj[i.key]))
            .map(i => i.texto);
          if (checksMarcados.length > 0) {
            respostasLista.push({
              pergunta: 'Itens confirmados no Checklist de Verificação',
              valor: checksMarcados.join('; '),
              tipo: 'multipla_escolha',
            });
          }

          if (respObj.observacoes) {
            respostasLista.push({
              pergunta: 'Observações adicionais consolidadas',
              valor: respObj.observacoes,
              tipo: 'texto',
            });
          }

          const payload = {
            obra_id: obraId,
            codigo_unico: dados.codigoUnico && /^[0-9A-F]{16}$/i.test(dados.codigoUnico) ? dados.codigoUnico : null,
            timestamp: item.timestamp,
            tipo_local: dados.tipoLocal || null,
            localizacao_texto: dados.localizacaoFoto || null,
            latitude: dados.coordenadas?.lat ?? null,
            longitude: dados.coordenadas?.lng ?? null,
            precisao_gps: dados.coordenadas?.precisao ?? null,
            assinatura_base64: dados.assinatura || null,
            respostas: respostasLista,
            fotos: (dados.fotoCamera || dados.fotoBase64 || dados.caminhoArquivoFoto)
              ? [{
                  imagemBase64: dados.fotoCamera || dados.fotoBase64 || null,
                  caminho_arquivo: dados.caminhoArquivoFoto || null,
                  hash_integridade: dados.hashSha256 || null,
                  avaliacao_gemini: 'VALIDACAO_MANUAL',
                  confianca: dados.confiancaIA || 0.75,
                  motivo: dados.motivoIA || 'Registro capturado em modo offline (sincronizado automaticamente).',
                }]
              : [],
          };

          const response = await fetch(`${API_BASE_URL}/api/relatorios/sincronizar-offline`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            sincronizados++;
          } else if (response.status >= 500 || response.status === 429) {
            filaRestante.push(item);
          }
          // Se 400/403/404 permanente, descarta da fila para não ficar em loop infinito
        } catch (err) {
          console.warn(`[OfflineSync] Falha ao sincronizar item ${item.idTemporario}, mantendo na fila:`, err.message);
          filaRestante.push(item);
        }
      }

      this.salvarFila(filaRestante);

      if (sincronizados > 0) {
        this.syncListeners.forEach(fn => fn({ sincronizados, pendentes: filaRestante.length }));
      }
    } finally {
      this.isSyncing = false;
    }

    return sincronizados;
  }
}

export const offlineSync = new OfflineSyncService();
