/**
 * BBVision - Tela de Validador Público de Autenticidade e Fé Pública
 * Permite a qualquer pessoa ou auditor externo atestar a autenticidade
 * criptográfica de um relatório através do Código Único ou Hash SHA-256.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { api } from '../services/api.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml, copyToClipboard } from '../utils/formatters.js';

let resultadoConsulta = null;
let termoConsultadoAtual = '';
let carregandoConsulta = false;
let erroConsulta = null;

export function renderValidadorPublico() {
  // Exibe atalhos apenas para o usuário autenticado consultar seus próprios relatórios emitidos
  const relatoriosDisponiveis = state.user
    ? (state.relatorios || []).filter(r => r.codigoUnico && r.codigoUnico !== 'Pendente')
    : [];

  return `
    <div class="page-container fade-in" id="validadorPublicoPage">
      <header class="app-header">
        <div class="header-brand">
          <button class="back-btn-pill" id="btnVoltarValidador">
            ${Icons.chevronDown(18)}
            <span>${state.user ? 'Voltar ao Sistema' : 'Ir para Login'}</span>
          </button>
        </div>
        <div class="header-actions">
          <span class="badge-tag-gov">FÉ PÚBLICA • BBVISION</span>
        </div>
      </header>

      <section class="validador-hero-card">
        <div class="validador-hero-icon">
          ${Icons.shieldYellow(26, '#FED304')}
        </div>
        <div class="validador-hero-text">
          <h1>Validador de Integridade e Fé Pública</h1>
          <p>Verificação criptográfica SHA-256 e atestado oficial das vistorias do Banco do Brasil</p>
        </div>
      </section>

      <section class="fe-publica-explainer-card">
        <h2 class="fe-explainer-title">
          Como funciona a Validação por Fé Pública?
        </h2>
        <div class="fe-steps-grid">
          <div class="fe-step-box">
            <span class="fe-step-num">1</span>
            <div>
              <strong>Geração do Código Único</strong>
              <p>Ao concluir um relatório, o BBVision gera um <strong>Código Único de 16 caracteres</strong> e um lacre matemático (Hash SHA-256) impressos no PDF oficial.</p>
            </div>
          </div>
          <div class="fe-step-box">
            <span class="fe-step-num">2</span>
            <div>
              <strong>Consulta Direta</strong>
              <p>Informe o Código Único ou o Hash SHA-256 no campo abaixo para verificar a autenticidade na base oficial do sistema.</p>
            </div>
          </div>
          <div class="fe-step-box">
            <span class="fe-step-num">3</span>
            <div>
              <strong>Certidão Anti-Fraude</strong>
              <p>O sistema confirma que o relatório é autêntico e que a foto, a data/hora, o GPS e as respostas não foram adulterados após a assinatura.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="validador-form-card">
        <form id="formValidadorPublico" toolname="validate_report_authenticity" tooldescription="Valida a autenticidade e integridade criptográfica SHA-256 (Fé Pública) de um relatório de vistoria BBVision usando Código Único de 16 caracteres ou Hash SHA-256.">
          <label class="validador-label" for="inputTermoValidacao">
            Digite o Código Único Oficial (16 caracteres hex) ou o Hash SHA-256 (64 caracteres):
          </label>

          <div class="validador-input-wrapper">
            <input
              type="text"
              id="inputTermoValidacao"
              name="codigoOuHash"
              class="validador-input"
              placeholder="Informe o Código Único ou o Hash SHA-256 do documento..."
              value="${escapeHtml(termoConsultadoAtual)}"
              autocomplete="off"
              spellcheck="false"
            />
            <button type="button" class="btn-limpar-termo" id="btnLimparTermo" title="Limpar">✕</button>
          </div>

          ${
            relatoriosDisponiveis.length > 0
              ? `
            <div class="quick-test-codes-wrap" style="margin: 10px 0 12px;">
              <span style="display: block; font-size: 11.5px; font-weight: 600; color: #475569; margin-bottom: 6px;">
                Seus relatórios emitidos recentemente (clique para consultar):
              </span>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${relatoriosDisponiveis
                  .slice(0, 4)
                  .map(
                    r => `
                  <button type="button" class="quick-code-pill-btn" data-codigo="${escapeHtml(r.codigoUnico)}">
                    <strong>${escapeHtml(r.codigoUnico)}</strong> (${escapeHtml(r.obraNome)})
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <button type="submit" class="btn-action-primary" id="btnConsultarIntegridade">
            ${carregandoConsulta ? '<span class="loading-spinner"></span> Validando...' : 'Consultar Fé Pública e Integridade'}
          </button>
        </form>
      </section>

      <section class="validador-resultado-area" id="validadorResultadoArea">
        ${renderResultadoConteudo()}
      </section>

      <section class="api-governance-footer-card">
        <div class="api-gov-header">
          <span class="api-gov-tag">INFRAESTRUTURA & CRIPTOGRAFIA</span>
          <h2>Garantias Técnicas de Integridade</h2>
        </div>
        <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 6px;">
          Cada documento emitido pelo BBVision possui carimbo temporal irreversível e assinatura digital vinculada à credencial do responsável técnico e fiscalização de engenharia.
        </p>
      </section>
    </div>
  `;
}

function renderResultadoConteudo() {
  if (carregandoConsulta) {
    return `
      <div class="resultado-loading-box">
        <div class="spinner-circle"></div>
        <p>Consultando base oficial de assinaturas invioláveis...</p>
      </div>
    `;
  }

  if (erroConsulta) {
    return `
      <div class="resultado-box invalido fade-in">
        <div class="resultado-header-status">
          <span class="status-icon-bad" style="display:inline-flex; align-items:center;">${Icons.errorCross(28)}</span>
          <div>
            <h3>DOCUMENTO NÃO LOCALIZADO OU INVÁLIDO</h3>
            <p>O identificador consultado não corresponde a nenhum relatório autêntico registrado.</p>
          </div>
        </div>
        <div class="resultado-detalhes">
          <p><strong>Identificador pesquisado:</strong> <code>${escapeHtml(termoConsultadoAtual)}</code></p>
          <p class="alerta-fraude">Atenção: Verifique se o código foi digitado corretamente. Documentos com hash divergente podem ter sofrido adulteração.</p>
        </div>
      </div>
    `;
  }

  if (!resultadoConsulta) {
    return `
      <div class="resultado-empty-hint">
        <p>Insira o código de 16 caracteres ou o hash SHA-256 de 64 caracteres do relatório para certificar a autenticidade.</p>
      </div>
    `;
  }

  const rel = resultadoConsulta.relatorio || resultadoConsulta;
  const obra = rel.obra || {};
  const foto = rel.fotos?.[0] || {};
  const statusDisplay =
    rel.status === 'APROVADO'
      ? 'REGULAR / HOMOLOGADO'
      : rel.status === 'PENDENTE_AJUSTE'
      ? 'PENDENTE DE AJUSTE'
      : rel.status || 'FINALIZADO';

  const confRaw = foto.confianca_ia !== undefined && foto.confianca_ia !== null ? foto.confianca_ia : foto.confianca;
  const auditoriaIaTexto = rel.validacao_manual
    ? 'Validação Manual Assistida (Auditoria Humana)'
    : confRaw !== undefined && confRaw !== null
    ? `IA BBVision • Confiança ${Math.round(Number(confRaw) * 100)}% (Aprovado)`
    : 'Evidência registrada e selada';

  return `
    <div class="resultado-box valido fade-in">
      <div class="resultado-header-status">
        <div class="status-seal-valid">
          ${Icons.shieldYellow(24, '#059669')}
        </div>
        <div>
          <span class="badge-selo-oficial">BANCO DO BRASIL S.A. • FÉ PÚBLICA</span>
          <h3 class="status-title-valid">DOCUMENTO AUTÊNTICO E INVIOLÁVEL</h3>
          <p class="status-sub-valid">Certidão Criptográfica Emitida pelo Sistema BBVision</p>
        </div>
      </div>

      <div class="resultado-grid-info">
        <div class="rgi-item">
          <span class="rgi-label">CÓDIGO ÚNICO (HEX):</span>
          <span class="rgi-value highlight-code">${escapeHtml(rel.codigo_unico || rel.codigoUnico)}</span>
        </div>

        <div class="rgi-item full-width">
          <span class="rgi-label">HASH CRIPTOGRÁFICO SHA-256:</span>
          <span class="rgi-value hash-code">${escapeHtml(rel.hash_integridade || rel.hashIntegridade || '')}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">UNIDADE / OBRA:</span>
          <span class="rgi-value">${escapeHtml(obra.nome || 'Unidade Registrada')}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">SITUAÇÃO DA FISCALIZAÇÃO:</span>
          <span class="rgi-value status-obra-${escapeHtml((rel.status || 'REGULAR').toLowerCase())}">${escapeHtml(statusDisplay)}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">ENDEREÇO:</span>
          <span class="rgi-value">${escapeHtml(obra.endereco || 'Não informado')}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">AUDITORIA DA EVIDÊNCIA:</span>
          <span class="rgi-value">${escapeHtml(auditoriaIaTexto)}</span>
        </div>

        ${
          rel.justificativa_fiscal
            ? `
          <div class="rgi-item full-width">
            <span class="rgi-label">PARECER DO FISCAL:</span>
            <span class="rgi-value parecer-text">"${escapeHtml(rel.justificativa_fiscal)}"</span>
          </div>
        `
            : ''
        }
      </div>

      <div class="resultado-acoes-footer">
        <button class="btn-download-pdf-valid" id="btnAbrirPdfValidador">
          Visualizar PDF Oficial com Carimbo Criptográfico
        </button>
        <button class="btn-download-pdf-valid" id="btnCopiarLinkValidador" style="background: rgba(254, 211, 4, 0.15); color: #003882; border: 1px solid rgba(0, 56, 130, 0.3);">
          Copiar Link de Validação Pública
        </button>
        <button class="btn-download-pdf-valid" id="btnImprimirCertidao" style="background: #F8FAFC; color: #475569; border: 1px solid #CBD5E1;">
          Imprimir Certidão de Fé Pública
        </button>
      </div>
    </div>
  `;
}

export function bindValidadorPublicoEvents() {
  if (state.currentVistoria && state.currentVistoria.codigoParaValidar) {
    const codigoAuto = state.currentVistoria.codigoParaValidar;
    state.currentVistoria.codigoParaValidar = '';
    termoConsultadoAtual = codigoAuto;
    setTimeout(() => {
      executarConsulta(codigoAuto);
    }, 50);
  }

  document.getElementById('btnVoltarValidador')?.addEventListener('click', () => {
    if (!state.user) {
      resultadoConsulta = null;
      erroConsulta = null;
      termoConsultadoAtual = '';
      state.navigate('login');
    } else {
      state.navigate('inicio', 'inicio');
    }
  });

  const inputTermo = document.getElementById('inputTermoValidacao');
  document.getElementById('btnLimparTermo')?.addEventListener('click', () => {
    if (inputTermo) inputTermo.value = '';
    termoConsultadoAtual = '';
    resultadoConsulta = null;
    erroConsulta = null;
    state.notify();
  });

  document.querySelectorAll('.quick-code-pill-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const cod = chip.getAttribute('data-codigo');
      if (!cod) return;
      if (inputTermo) inputTermo.value = cod;
      termoConsultadoAtual = cod;
      executarConsulta(cod);
    });
  });

  const formValidador = document.getElementById('formValidadorPublico');
  if (formValidador && inputTermo) {
    formValidador.addEventListener('submit', e => {
      e.preventDefault();
      const termo = inputTermo.value.trim();
      if (!termo) {
        toast.warning('Campo Obrigatório', 'Informe o Código Único ou o Hash SHA-256 do documento.');
        return;
      }
      termoConsultadoAtual = termo;
      executarConsulta(termo);
    });
  }

  const btnPdf = document.getElementById('btnAbrirPdfValidador');
  if (btnPdf && resultadoConsulta) {
    btnPdf.addEventListener('click', () => {
      const rel = resultadoConsulta.relatorio || resultadoConsulta;
      modal.openPdfViewer({
        title: `Validação de Documento • ${rel.obra?.nome || 'BBVision'}`,
        pdfUrl: `/api/relatorios/${encodeURIComponent(rel.id)}/pdf`,
        codigo: rel.codigo_unico,
        hash: rel.hash_integridade,
      });
    });
  }

  const btnCopiarLink = document.getElementById('btnCopiarLinkValidador');
  if (btnCopiarLink && resultadoConsulta) {
    btnCopiarLink.addEventListener('click', async () => {
      const rel = resultadoConsulta.relatorio || resultadoConsulta;
      const cod = rel.codigo_unico || rel.codigoUnico;
      const url = `${window.location.origin}/?codigo=${encodeURIComponent(cod)}`;
      const ok = await copyToClipboard(url);
      if (ok) {
        toast.success('Link Copiado', 'Link direto de fé pública copiado para a área de transferência.');
      } else {
        toast.info('Link para Compartilhar', url);
      }
    });
  }

  const btnImprimir = document.getElementById('btnImprimirCertidao');
  if (btnImprimir && resultadoConsulta) {
    btnImprimir.addEventListener('click', () => {
      window.print();
    });
  }
}

async function executarConsulta(termo) {
  carregandoConsulta = true;
  erroConsulta = null;
  resultadoConsulta = null;
  state.notify();

  try {
    const data = await api.validarDocumento(termo);
    if (data && data.autentico) {
      resultadoConsulta = data;
      erroConsulta = null;
      toast.success('Documento Autêntico', 'Certidão de fé pública atestada com sucesso.');
    } else {
      erroConsulta = data?.mensagem || 'Código não encontrado.';
      resultadoConsulta = null;
      toast.error('Não Localizado', 'O identificador não consta na base oficial.');
    }
  } catch (err) {
    console.warn('[Validador] Erro na consulta:', err.message);

    // Somente usa cache local em caso de falha REAL de rede/offline (nunca em 404/400 do servidor!)
    if ((err.isNetworkError || !navigator.onLine) && state.user) {
      const relLocal = (state.relatorios || []).find(
        r =>
          (r.codigoUnico && r.codigoUnico.toUpperCase() === termo.toUpperCase()) ||
          (r.hash && r.hash.toUpperCase() === termo.toUpperCase())
      );

      if (relLocal) {
        resultadoConsulta = {
          autentico: true,
          relatorio: {
            id: relLocal.id,
            codigo_unico: relLocal.codigoUnico,
            hash_integridade: relLocal.hash,
            status: relLocal.statusRaw || 'FINALIZADO',
            validacao_manual: relLocal.validacaoManual,
            justificativa_fiscal: relLocal.justificativaFiscal,
            obra: { nome: relLocal.obraNome, endereco: relLocal.subtitulo },
            fotos: relLocal.fotos || [],
          },
        };
        erroConsulta = null;
        toast.success('Documento Autêntico (Offline)', 'Registro confirmado em cache local do dispositivo.');
        return;
      }
    }

    erroConsulta = err.message || 'Identificador não encontrado nos registros oficiais.';
    resultadoConsulta = null;
    toast.error('Não Autêntico', 'Código ou hash não localizado.');
  } finally {
    carregandoConsulta = false;
    state.notify();
  }
}
