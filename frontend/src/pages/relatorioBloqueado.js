/**
 * BVision - Tela de Relatório Bloqueado (Garantia de Imutabilidade)
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.20.jpeg
 * Conforme Requisitos E4, 1.3.3, 5.1.4 e 8.6.6 do Documento Oficial TakeOff:
 * - Bloqueio imediato para edições ou reenvios
 * - Exibição do código único oficial de 16 caracteres hex uppercase
 * - Disponibilização do PDF oficial compilado via PDFKit com carimbo de integridade
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderRelatorioBloqueado() {
  const vistoria = state.currentVistoria;
  const pdfUrl = vistoria.pdfUrl || (vistoria.relatorioId ? `/api/relatorios/${vistoria.relatorioId}/pdf` : null);

  return `
    <div class="page-container fade-in" id="relatorioBloqueadoPage">
      <!-- Header Superior com Voltar e Logo BVision -->
      <header class="bloqueado-topbar">
        <button class="btn-icon-simple-sm" id="btnVoltarInicioBloqueado" title="Voltar ao Início">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div class="topbar-logo-center">
          ${Icons.logoBVisionBadge(28)}
        </div>
        <div style="width: 28px;"></div>
      </header>

      <!-- Título da Tela -->
      <div class="bloqueado-header-title">
        <h2>Relatório Bloqueado</h2>
      </div>

      <!-- Ícone 3D da Caixa Lacrada e Notificação de Imutabilidade -->
      <div class="bloqueado-hero-section">
        <div class="box-locked-visual">
          ${Icons.boxLocked3D(90)}
        </div>
        <p class="bloqueado-warning-text">
          Este relatório já foi finalizado<br/>e não pode ser editado
        </p>
      </div>

      <!-- Card Azul Marinho com Identificação e Timestamp Oficial -->
      <div class="bloqueado-protocolo-card">
        <div class="proto-card-top-row">
          <span class="proto-card-label">Codigo:</span>
          <button class="proto-dots-btn" id="btnMenuRelatorio" title="Opções">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFFFFF">
              <circle cx="12" cy="5" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="12" cy="19" r="2"></circle>
            </svg>
          </button>
        </div>

        <div class="proto-codigo-val" id="lblCodigoBloqueado">
          ${vistoria.codigoUnico}
        </div>

        <div class="proto-meta-data">
          <span>Enviado em: ${vistoria.dataFoto} às ${vistoria.horaFoto}</span>
          <span>Por: ${vistoria.responsavel}</span>
          <span style="font-size: 10px; opacity: 0.8; word-break: break-all;">Hash SHA-256: ${vistoria.hashSha256.substring(0, 32)}...</span>
        </div>
      </div>

      <!-- Card com as Regras de Inviolabilidade Ativas -->
      <div class="bloqueado-status-rules-card">
        <div class="rule-status-row clickable" id="btnAbrirVisualizacao">
          <div class="rule-status-left">
            <span class="rule-icon-box">👁️</span>
            <span class="rule-title-text">Visualização permitida (Ver PDF Oficial)</span>
          </div>
          <div class="rule-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="rule-status-row locked-state">
          <div class="rule-status-left">
            <span class="rule-icon-box">✏️</span>
            <span class="rule-title-text">Edição bloqueada</span>
          </div>
          <div class="rule-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="rule-status-row locked-state">
          <div class="rule-status-left">
            <span class="rule-icon-box">🔄</span>
            <span class="rule-title-text">Reenvio bloqueado</span>
          </div>
          <div class="rule-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <!-- Botões de Ação Final -->
      <div class="bloqueado-action-footer">
        <button class="btn-secondary-white" id="btnIrAuditoriaFiscal" style="margin-bottom: 8px;">
          Auditoria da Fiscal Mariana →
        </button>
        <button class="btn-primary-bb-yellow" id="btnVoltarDashboard">
          Voltar ao Início
        </button>
      </div>
    </div>
  `;
}

export function bindRelatorioBloqueadoEvents() {
  const btnVoltar = document.getElementById('btnVoltarInicioBloqueado');
  const btnDash = document.getElementById('btnVoltarDashboard');
  
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('inicio', 'inicio');
    });
  }

  if (btnDash) {
    btnDash.addEventListener('click', () => {
      state.navigate('inicio', 'inicio');
    });
  }

  // Visualizar PDF Oficial compilado pelo PDFKit
  const btnVisualizar = document.getElementById('btnAbrirVisualizacao');
  if (btnVisualizar) {
    btnVisualizar.addEventListener('click', () => {
      const relId = state.currentVistoria.relatorioId;
      if (relId) {
        window.open(`/api/relatorios/${relId}/pdf`, '_blank');
      } else {
        alert(`Relatório Oficial BBVision:\n- Código Único: ${state.currentVistoria.codigoUnico}\n- Hash SHA-256: ${state.currentVistoria.hashSha256}\n- Carimbo de Integridade: Inviolável e Bloqueado`);
      }
    });
  }

  // Atalho direto para demonstrar a aprovação da Fiscal Mariana
  const btnFiscal = document.getElementById('btnIrAuditoriaFiscal');
  if (btnFiscal) {
    btnFiscal.addEventListener('click', async () => {
      await state.login('mariana@bb.com.br', '123456');
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    });
  }

  // Feedback explicativo sobre as regras de imutabilidade
  document.querySelectorAll('.rule-status-row.locked-state').forEach(row => {
    row.addEventListener('click', () => {
      alert('🔒 Inviolabilidade Criptográfica Ativa:\n\nConforme o Documento Oficial TakeOff / Banco do Brasil (Seções 1.3.3 e 8.6), uma vez finalizada e assinado o termo de fé pública, a vistoria é matematicamente congelada por hash SHA-256 e protegida contra quaisquer edições ou reenvios.');
    });
  });
}
