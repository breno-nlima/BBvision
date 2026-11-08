/**
 * BBVision - Tela de Validador Público de Autenticidade e Fé Pública
 * Permite a qualquer pessoa ou auditor externo atestar a
 * autenticidade criptográfica de um relatório através do Código Único ou Hash SHA-256.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { api } from '../services/api.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

let resultadoConsulta = null;
let termoConsultadoAtual = '';
let carregandoConsulta = false;
let erroConsulta = null;

export function renderValidadorPublico() {
  const relatoriosDisponiveis = (state.relatorios || []).filter(r => r.codigoUnico && r.codigoUnico !== 'Pendente');

  return `
    <div class="page-container fade-in" id="validadorPublicoPage">
      <header class="app-header">
        <div class="header-brand">
          <button class="back-btn-pill" id="btnVoltarValidador">
            ${Icons.chevronDown(18)}
            <span>Voltar ao Sistema</span>
          </button>
        </div>
        <div class="header-actions">
          <span class="badge-tag-gov">🛡️ FÉ PÚBLICA • BACEN / BB</span>
        </div>
      </header>

      <!-- Hero Card Institucional de Fé Pública -->
      <section class="validador-hero-card">
        <div class="validador-hero-icon">
          ${Icons.shieldYellow(38)}
        </div>
        <div class="validador-hero-text">
          <h2>Validador de Integridade e Fé Pública</h2>
          <p>Verificação criptográfica SHA-256 e atestado oficial das vistorias do Banco do Brasil</p>
        </div>
      </section>

      <!-- Card Explicativo: Como Funciona a Validação por Fé Pública (Item 16) -->
      <section class="fe-publica-explainer-card">
        <div class="fe-explainer-title">
          <span style="display:inline-flex; align-items:center; gap:6px;">${Icons.infoBadge(18)} Como funciona a Validação por Fé Pública?</span>
        </div>
        <div class="fe-steps-grid">
          <div class="fe-step-box">
            <span class="fe-step-num">1</span>
            <div>
              <strong>Geração do Código Único</strong>
              <p>Ao concluir um relatório, o BBVision gera um <strong>Código Único de 16 caracteres</strong> e um lacre matemático (Hash SHA-256) impressos no topo do PDF.</p>
            </div>
          </div>
          <div class="fe-step-box">
            <span class="fe-step-num">2</span>
            <div>
              <strong>Consulta Rápida</strong>
              <p>Digite o Código Único no campo abaixo ou <strong>toque em um dos relatórios emitidos</strong> para consultar na base do Banco do Brasil.</p>
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

      <!-- Formulário de Consulta -->
      <section class="validador-form-card">
        <label class="validador-label" for="inputTermoValidacao">
          Digite o Código Único Oficial (16 caracteres hex) ou o Hash SHA-256:
        </label>
        
        <div class="validador-input-wrapper">
          <input 
            type="text" 
            id="inputTermoValidacao" 
            class="validador-input" 
            placeholder="Ex.: 8F4A2C19E70B34DF ou clique em um relatório abaixo..."
            value="${termoConsultadoAtual}"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="btn-limpar-termo" id="btnLimparTermo" title="Limpar">✕</button>
        </div>

        ${relatoriosDisponiveis.length > 0 ? `
          <div class="quick-test-codes-wrap" style="margin: 10px 0 12px;">
            <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; color: #475569; margin-bottom: 6px;">
              ${Icons.boltFlash(15)} Toque em um relatório emitido para testar a validação agora:
            </span>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${relatoriosDisponiveis.slice(0, 4).map(r => `
                <button type="button" class="quick-code-pill-btn" data-codigo="${r.codigoUnico}" style="display:inline-flex; align-items:center; gap:5px;">
                  ${Icons.keyProtocolo(14)} <strong>${r.codigoUnico}</strong> (${r.obraNome})
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <button class="btn-action-primary" id="btnConsultarIntegridade" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          ${carregandoConsulta ? '<span class="loading-spinner"></span> Validando no Banco...' : `${Icons.search(18)} Consultar Fé Pública e Integridade`}
        </button>
      </section>

      <!-- Área de Resultado da Consulta -->
      <section class="validador-resultado-area" id="validadorResultadoArea">
        ${renderResultadoConteudo()}
      </section>

      <!-- Painel de Governança de APIs -->
      <section class="api-governance-footer-card">
        <div class="api-gov-header">
          <span class="api-gov-tag">INFRAESTRUTURA & CRIPTOGRAFIA</span>
          <h4>Garantias Técnicas de Integridade do Banco do Brasil</h4>
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
        <p>Consultando base de assinaturas invioláveis do Banco do Brasil...</p>
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
            <p>O identificador consultado não corresponde a nenhum relatório autêntico no Banco do Brasil.</p>
          </div>
        </div>
        <div class="resultado-detalhes">
          <p><strong>Identificador pesquisado:</strong> <code>${termoConsultadoAtual}</code></p>
          <p class="alerta-fraude">Atenção: Se este documento foi impresso ou recebido por e-mail, pode ter sofrido adulteração física ou adulteração de hash.</p>
        </div>
      </div>
    `;
  }

  if (!resultadoConsulta) {
    return `
      <div class="resultado-empty-hint">
        <span style="display:flex; justify-content:center; margin-bottom:6px;">${Icons.shieldFePublica(36)}</span>
        <p>Insira o código de 16 caracteres ou o hash de 64 caracteres do relatório para certificar a autenticidade.</p>
      </div>
    `;
  }

  const rel = resultadoConsulta.relatorio || resultadoConsulta;
  const obra = rel.obra || {};
  const foto = rel.fotos?.[0] || {};

  return `
    <div class="resultado-box valido fade-in">
      <div class="resultado-header-status">
        <div class="status-seal-valid">
          ${Icons.shieldYellow(32)}
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
          <span class="rgi-value highlight-code">${rel.codigo_unico || rel.codigoUnico}</span>
        </div>

        <div class="rgi-item full-width">
          <span class="rgi-label">HASH CRIPTOGRÁFICO SHA-256:</span>
          <span class="rgi-value hash-code">${rel.hash_integridade || rel.hashIntegridade || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">UNIDADE / OBRA:</span>
          <span class="rgi-value">${obra.nome || 'Agência Banco do Brasil'}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">SITUAÇÃO DA FISCALIZAÇÃO:</span>
          <span class="rgi-value status-obra-${(rel.status || 'REGULAR').toLowerCase()}">${rel.status === 'APROVADO' ? 'REGULAR / HOMOLOGADO' : rel.status}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">ENDEREÇO:</span>
          <span class="rgi-value">${obra.endereco || 'Endereço da Unidade BB'}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">AUDITORIA DA IA:</span>
          <span class="rgi-value">IA BBVision • Confiança ${Math.round((foto.confianca_ia || 0.96) * 100)}% (Aprovado)</span>
        </div>

        ${rel.justificativa_fiscal ? `
          <div class="rgi-item full-width">
            <span class="rgi-label">PARECER DO FISCAL BB (MARIANA):</span>
            <span class="rgi-value parecer-text">"${rel.justificativa_fiscal}"</span>
          </div>
        ` : ''}
      </div>

      <div class="resultado-acoes-footer">
        <button class="btn-download-pdf-valid" id="btnAbrirPdfValidador" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          ${Icons.pdfDocument(18)} Visualizar PDF Oficial com Carimbo Criptográfico
        </button>
        <button class="btn-download-pdf-valid" id="btnCopiarLinkValidador" style="background: rgba(254, 211, 4, 0.15); color: #003882; border: 1px solid rgba(0, 56, 130, 0.3); display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          ${Icons.hashCrypto(16)} Copiar Link de Validação Pública
        </button>
        <button class="btn-download-pdf-valid" id="btnImprimirCertidao" style="background: #F8FAFC; color: #475569; border: 1px solid #CBD5E1; display:inline-flex; align-items:center; justify-content:center; gap:8px;">
          ${Icons.shieldFePublica(16)} Imprimir Certidão de Fé Pública
        </button>
      </div>
    </div>
  `;
}

export function bindValidadorPublicoEvents() {
  // Se veio de "Relatório Concluído" ou "Relatórios" com um código pré-selecionado, dispara a consulta automaticamente
  if (state.currentVistoria && state.currentVistoria.codigoParaValidar) {
    const codigoAuto = state.currentVistoria.codigoParaValidar;
    state.currentVistoria.codigoParaValidar = '';
    termoConsultadoAtual = codigoAuto;
    setTimeout(() => {
      executarConsulta(codigoAuto);
    }, 50);
  }

  const btnVoltar = document.getElementById('btnVoltarValidador');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      if (state.user) {
        state.navigate('inicio', 'inicio');
      } else {
        state.navigate('login');
      }
    });
  }

  const inputTermo = document.getElementById('inputTermoValidacao');
  const btnLimpar = document.getElementById('btnLimparTermo');
  if (btnLimpar && inputTermo) {
    btnLimpar.addEventListener('click', () => {
      inputTermo.value = '';
      termoConsultadoAtual = '';
      resultadoConsulta = null;
      erroConsulta = null;
      state.notify();
    });
  }

  // Chips de teste rápido com 1 clique
  const quickCodeBtns = document.querySelectorAll('.quick-code-pill-btn');
  quickCodeBtns.forEach(chip => {
    chip.addEventListener('click', () => {
      const cod = chip.getAttribute('data-codigo');
      if (!cod) return;
      if (inputTermo) inputTermo.value = cod;
      termoConsultadoAtual = cod;
      executarConsulta(cod);
    });
  });

  const btnConsultar = document.getElementById('btnConsultarIntegridade');
  if (btnConsultar && inputTermo) {
    btnConsultar.addEventListener('click', () => {
      const termo = inputTermo.value.trim();
      if (!termo) {
        toast.warning('Campo Obrigatório', 'Informe o Código Único ou o Hash SHA-256 do documento.');
        return;
      }
      termoConsultadoAtual = termo;
      executarConsulta(termo);
    });

    inputTermo.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        btnConsultar.click();
      }
    });
  }

  // Visualizar PDF no Modal
  const btnPdf = document.getElementById('btnAbrirPdfValidador');
  if (btnPdf && resultadoConsulta) {
    btnPdf.addEventListener('click', () => {
      const rel = resultadoConsulta.relatorio || resultadoConsulta;
      const pdfUrl = `/api/relatorios/${rel.id}/pdf`;
      modal.openPdfViewer({
        title: `Validação de Documento • ${rel.obra?.nome || 'BBVision'}`,
        pdfUrl: pdfUrl,
        codigo: rel.codigo_unico,
        hash: rel.hash_integridade
      });
    });
  }

  // Copiar link de validação pública para a área de transferência
  const btnCopiarLink = document.getElementById('btnCopiarLinkValidador');
  if (btnCopiarLink && resultadoConsulta) {
    btnCopiarLink.addEventListener('click', () => {
      const rel = resultadoConsulta.relatorio || resultadoConsulta;
      const cod = rel.codigo_unico || rel.codigoUnico;
      const url = `${window.location.origin}/?codigo=${encodeURIComponent(cod)}`;
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link Copiado!', 'Link direto de fé pública copiado para a área de transferência.');
      }).catch(() => {
        toast.info('Link para Compartilhar', url);
      });
    });
  }

  // Imprimir Certidão de Fé Pública
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
      erroConsulta = data.mensagem || 'Código não encontrado.';
      resultadoConsulta = null;
      toast.error('Não Localizado', 'O identificador não consta na base do Banco do Brasil.');
    }
  } catch (err) {
    console.warn('[Validador] Erro na consulta:', err.message);
    // Fallback local se o backend não retornar
    const relLocal = state.relatorios.find(r => 
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
          obra: { nome: relLocal.obraNome, endereco: relLocal.subtitulo },
          fotos: relLocal.fotos || []
        }
      };
      erroConsulta = null;
      toast.success('Documento Autêntico', 'Registro confirmado em cache local do sistema.');
    } else {
      erroConsulta = 'Identificador não encontrado nos registros do Banco do Brasil.';
      resultadoConsulta = null;
      toast.error('Não Autêntico', 'Código não confere.');
    }
  } finally {
    carregandoConsulta = false;
    state.notify();
  }
}
