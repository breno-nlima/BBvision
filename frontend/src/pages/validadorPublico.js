/**
 * BBVision - Tela de Validador Público de Autenticidade e Fé Pública
 * Permite a qualquer persona (Rodrigo, Mariana ou Auditor Externo) atestar a
 * autenticidade criptográfica de um relatório através do Código Único ou Hash SHA-256.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader } from '../components/header.js';

let resultadoConsulta = null;
let termoConsultadoAtual = '';
let carregandoConsulta = false;
let erroConsulta = null;

export function renderValidadorPublico() {
  return `
    <div class="page-container fade-in" id="validadorPublicoPage">
      <header class="app-header">
        <div class="header-brand">
          <button class="back-btn-pill" id="btnVoltarValidador">
            ${Icons.chevronDown(18)}
            <span>Voltar</span>
          </button>
        </div>
        <div class="header-actions">
          <span class="badge-tag-gov">BACEN / FÉ PÚBLICA</span>
        </div>
      </header>

      <!-- Hero Card Institucional de Fé Pública -->
      <section class="validador-hero-card">
        <div class="validador-hero-icon">
          ${Icons.shieldYellow(38)}
        </div>
        <div class="validador-hero-text">
          <h2>Validador de Integridade</h2>
          <p>Verificação criptográfica SHA-256 e fé pública das vistorias do Banco do Brasil</p>
        </div>
      </section>

      <!-- Formulário de Consulta -->
      <section class="validador-form-card">
        <label class="validador-label" for="inputTermoValidacao">
          Digite o Código Único (16 hex) ou o Hash SHA-256:
        </label>
        
        <div class="validador-input-wrapper">
          <input 
            type="text" 
            id="inputTermoValidacao" 
            class="validador-input" 
            placeholder="Ex: 47C726A7BD6C2D4D ou 8F4A..."
            value="${termoConsultadoAtual}"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="btn-limpar-termo" id="btnLimparTermo" title="Limpar">✕</button>
        </div>

        <div class="validador-presets">
          <span class="preset-label">Exemplos rápidos:</span>
          <button class="chip-preset" data-code="47C726A7BD6C2D4D">Obra Centro (Vistoria #1)</button>
          <button class="chip-preset" data-code="8F4A2C19E70B34DF">Obra Zona Sul (Vistoria #2)</button>
        </div>

        <button class="btn-action-primary" id="btnConsultarIntegridade">
          ${carregandoConsulta ? '<span class="loading-spinner"></span> Validando com Banco...' : '🔍 Consultar Autenticidade'}
        </button>
      </section>

      <!-- Área de Resultado da Consulta -->
      <section class="validador-resultado-area" id="validadorResultadoArea">
        ${renderResultadoConteudo()}
      </section>

      <!-- Painel de Governança de APIs -->
      <section class="api-governance-footer-card">
        <div class="api-gov-header">
          <span class="api-gov-tag">API MANAGEMENT & BACKEND</span>
          <h4>Recursos para Desenvolvedores e Auditores</h4>
        </div>
        <div class="api-gov-links">
          <a href="/api/docs" target="_blank" class="api-gov-link-btn">
            📄 Swagger OpenAPI 3.0
          </a>
          <a href="/api/metricas" target="_blank" class="api-gov-link-btn">
            📊 Telemetria & SLAs
          </a>
          <a href="/api/auditoria/logs" target="_blank" class="api-gov-link-btn">
            🔒 Trilha de Auditoria
          </a>
        </div>
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
          <span class="status-icon-bad">❌</span>
          <div>
            <h3>REGISTRO NÃO LOCALIZADO OU ADULTERADO</h3>
            <p>O identificador consultado não corresponde a nenhum relatório autêntico.</p>
          </div>
        </div>
        <div class="resultado-detalhes">
          <p><strong>Identificador pesquisado:</strong> <code>${termoConsultadoAtual}</code></p>
          <p class="alerta-fraude">Atenção: Se este documento foi impresso ou recebido por e-mail, pode ter sofrido adulteração física ou digital.</p>
        </div>
      </div>
    `;
  }

  if (!resultadoConsulta) {
    return `
      <div class="resultado-empty-hint">
        <span>🛡️</span>
        <p>Insira o código do cabeçalho ou rodapé do PDF emitido para certificar a autenticidade.</p>
      </div>
    `;
  }

  const cert = resultadoConsulta.certidao || {};
  const rel = resultadoConsulta.relatorio || {};

  return `
    <div class="resultado-box valido fade-in">
      <div class="resultado-header-status">
        <div class="status-seal-valid">
          ${Icons.shieldYellow(32)}
        </div>
        <div>
          <span class="badge-selo-oficial">BANCO DO BRASIL • FÉ PÚBLICA</span>
          <h3 class="status-title-valid">DOCUMENTO AUTÊNTICO E INVIOLÁVEL</h3>
          <p class="status-sub-valid">Certidão Criptográfica Emitida pelo Sistema BBVision</p>
        </div>
      </div>

      <div class="resultado-grid-info">
        <div class="rgi-item">
          <span class="rgi-label">CÓDIGO ÚNICO (HEX):</span>
          <span class="rgi-value highlight-code">${cert.codigoUnico || rel.codigo_unico}</span>
        </div>

        <div class="rgi-item full-width">
          <span class="rgi-label">HASH CRIPTOGRÁFICO SHA-256:</span>
          <span class="rgi-value hash-code">${cert.hashIntegridadeRelatorio || rel.hash_integridade}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">OBRA:</span>
          <span class="rgi-value">${cert.obra?.nome || 'Agência Banco do Brasil'}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">STATUS DA OBRA:</span>
          <span class="rgi-value status-obra-${(cert.obra?.statusAtual || 'REGULAR').toLowerCase()}">${cert.obra?.statusAtual || 'REGULAR'}</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">RESPONSÁVEL TÉCNICO:</span>
          <span class="rgi-value">${cert.responsavelTecnico?.nome || 'Eng. Rodrigo Silva'} (${cert.responsavelTecnico?.cargo || 'Empreiteira'})</span>
        </div>

        <div class="rgi-item">
          <span class="rgi-label">AVALIAÇÃO DA IA:</span>
          <span class="rgi-value">Gemini 1.5 Flash • SLA &le; 15s • ${cert.avaliacaoIa?.confianca || '98%'}</span>
        </div>

        <div class="rgi-item full-width">
          <span class="rgi-label">PARECER DO FISCAL BB:</span>
          <span class="rgi-value parecer-text">${cert.parecerFiscal || 'Em conformidade com as exigências técnicas.'}</span>
        </div>
      </div>

      <div class="resultado-acoes-footer">
        <a href="${cert.pdfDownloadUrl || `/api/relatorios/${rel.id}/pdf`}" target="_blank" class="btn-download-pdf-valid">
          📄 Baixar PDF Oficial com Carimbo Criptográfico
        </a>
      </div>
    </div>
  `;
}

export function bindValidadorPublicoEvents() {
  const btnVoltar = document.getElementById('btnVoltarValidador');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      const prev = state.user?.cargo === 'fiscal' ? 'inicio' : 'inicio';
      state.navigate(prev, prev);
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

  // Chips com códigos de exemplo
  document.querySelectorAll('.chip-preset').forEach(chip => {
    chip.addEventListener('click', () => {
      const code = chip.getAttribute('data-code');
      if (inputTermo) {
        inputTermo.value = code;
        termoConsultadoAtual = code;
        executarConsulta(code);
      }
    });
  });

  const btnConsultar = document.getElementById('btnConsultarIntegridade');
  if (btnConsultar && inputTermo) {
    btnConsultar.addEventListener('click', () => {
      const termo = inputTermo.value.trim();
      if (!termo) {
        alert('Por favor, informe o Código Único ou o Hash SHA-256 do documento.');
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
}

async function executarConsulta(termo) {
  carregandoConsulta = true;
  erroConsulta = null;
  resultadoConsulta = null;
  state.notify();

  try {
    const res = await fetch(`/api/validador/${encodeURIComponent(termo)}`);
    const data = await res.json();

    if (!res.ok || data.status === 404 || !data.valido) {
      erroConsulta = data.mensagem || 'Código não encontrado.';
      resultadoConsulta = null;
    } else {
      resultadoConsulta = data;
      erroConsulta = null;
    }
  } catch (err) {
    erroConsulta = 'Erro de comunicação ao validar integridade com o servidor.';
    resultadoConsulta = null;
  } finally {
    carregandoConsulta = false;
    state.notify();
  }
}
