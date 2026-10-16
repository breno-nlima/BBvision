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
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderRelatorioBloqueado() {
  const vistoria = state.currentVistoria;
  const pdfUrl = vistoria.pdfUrl || (vistoria.relatorioId ? `/api/relatorios/${vistoria.relatorioId}/pdf` : '/api/relatorios/rel-seed-001/pdf');

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
          Este relatório foi formalmente finalizado<br/>e possui fé pública inviolável
        </p>
      </div>

      <!-- Card Azul Marinho com Identificação e Timestamp Oficial -->
      <div class="bloqueado-protocolo-card">
        <div class="proto-card-top-row">
          <span class="proto-card-label">Código Oficial:</span>
          <button class="proto-dots-btn" id="btnCopiarCodigoBloqueado" title="Copiar Código">
            📋 Copiar
          </button>
        </div>

        <div class="proto-codigo-val" id="lblCodigoBloqueado">
          ${vistoria.codigoUnico}
        </div>

        <div class="proto-meta-data">
          <span><strong>Enviado em:</strong> ${vistoria.dataFoto} às ${vistoria.horaFoto}</span>
          <span><strong>Responsável Técnico:</strong> ${vistoria.responsavel}</span>
          <span style="font-size: 11px; opacity: 0.85; font-family: monospace; word-break: break-all;">
            <strong>SHA-256:</strong> ${vistoria.hashSha256}
          </span>
        </div>
      </div>

      <!-- Card com as Regras de Inviolabilidade Ativas -->
      <div class="bloqueado-status-rules-card">
        <div class="rule-status-row clickable" id="btnAbrirVisualizacao">
          <div class="rule-status-left">
            <span class="rule-icon-box">📄</span>
            <span class="rule-title-text">Visualizar PDF Oficial (Carimbo BB)</span>
          </div>
          <div class="rule-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="rule-status-row locked-state" id="ruleEdicaoBloqueada">
          <div class="rule-status-left">
            <span class="rule-icon-box">🔒</span>
            <span class="rule-title-text">Edição bloqueada (Inviolabilidade)</span>
          </div>
          <div class="rule-arrow">
            <span style="font-size: 11px; color: #94A3B8;">Ativo</span>
          </div>
        </div>

        <div class="rule-status-row locked-state" id="ruleReenvioBloqueado">
          <div class="rule-status-left">
            <span class="rule-icon-box">🛡️</span>
            <span class="rule-title-text">Reenvio vedado (Prevenção de duplicidade)</span>
          </div>
          <div class="rule-arrow">
            <span style="font-size: 11px; color: #94A3B8;">Ativo</span>
          </div>
        </div>
      </div>

      <!-- Botões de Ação Final -->
      <div class="bloqueado-action-footer">
        <button class="btn-secondary-white" id="btnValidarFePublicaDoc" style="margin-bottom: 8px;">
          🛡️ Validar Autenticidade (Fé Pública)
        </button>
        <button class="btn-primary-bb-yellow" id="btnVoltarDashboard">
          Voltar para Minhas Obras
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

  // Copiar código
  const btnCopiar = document.getElementById('btnCopiarCodigoBloqueado');
  if (btnCopiar) {
    btnCopiar.addEventListener('click', () => {
      navigator.clipboard.writeText(state.currentVistoria.codigoUnico);
      toast.success('Código Copiado', `Código ${state.currentVistoria.codigoUnico} copiado para a área de transferência.`);
    });
  }

  // Visualizar PDF Oficial compilado pelo PDFKit
  const btnVisualizar = document.getElementById('btnAbrirVisualizacao');
  if (btnVisualizar) {
    btnVisualizar.addEventListener('click', () => {
      const relId = state.currentVistoria.relatorioId || 'rel-seed-001';
      const pdfUrl = `/api/relatorios/${relId}/pdf`;
      modal.openPdfViewer({
        title: `Relatório BBVision • ${state.currentVistoria.obraNome}`,
        pdfUrl: pdfUrl,
        codigo: state.currentVistoria.codigoUnico,
        hash: state.currentVistoria.hashSha256
      });
    });
  }

  // Navegar para o Validador de Fé Pública com o código já preenchido
  const btnValidar = document.getElementById('btnValidarFePublicaDoc');
  if (btnValidar) {
    btnValidar.addEventListener('click', () => {
      state.navigate('validador-publico');
    });
  }

  // Feedback sobre regras de inviolabilidade
  document.querySelectorAll('.rule-status-row.locked-state').forEach(row => {
    row.addEventListener('click', () => {
      toast.info('Inviolabilidade Criptográfica Ativa', 'Conforme as normas de engenharia e governança do Banco do Brasil, relatórios finalizados são selados por Hash SHA-256 e código único, impedindo qualquer alteração posterior.');
    });
  });
}
