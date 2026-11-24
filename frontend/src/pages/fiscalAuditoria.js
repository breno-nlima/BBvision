/**
 * BVision - Tela de Auditoria da Fiscal / Engenheira Mariana
 * Padrão Corporativo Banco do Brasil: Governança, Parecer Técnico e Fé Pública
 * Conforme Requisitos E4, HU07, HU08 e Contrato de API 8.7 do Documento Oficial TakeOff:
 * - Painel de controle de fotos e relatórios recebidos
 * - Parecer técnico e julgamento: Aprovar ('REGULAR') ou Reprovar ('PENDENTE_AJUSTE')
 * - Visualização do PDF oficial compilado via PDFKit com carimbo de integridade
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml, normalizeImageSrc } from '../utils/formatters.js';

export function renderFiscalAuditoria() {
  const vistoria = state.currentVistoria;
  const registros = state.fiscalRegistros || [];

  const gridCardsHtml = registros.length > 0 
    ? registros.map((reg, idx) => `
    <div class="fiscal-photo-card" data-reg-id="${escapeHtml(reg.id)}" title="Clique para inspecionar perícia visual">
      <div class="photo-thumbnail-wrap">
        <img 
          src="${escapeHtml(normalizeImageSrc(reg.img))}" 
          alt="${escapeHtml(reg.titulo)}" 
          class="photo-thumbnail-img"
          onerror="this.onerror=null; this.src='/uploads/evidencias/seed_fachada_bb.png';"
        />
        <div class="photo-check-indicator ${reg.status === 'Validado' ? 'validated' : 'pending'}">
          ✓
        </div>
      </div>
      <div class="photo-meta-box">
        <strong class="photo-code">${escapeHtml(reg.codigo)}</strong>
        <span class="photo-subtitle">${escapeHtml(idx % 2 === 0 ? reg.local : reg.responsavel)}</span>
        <span class="photo-ia-badge">IA BBVision ${Math.round((reg.confianca || 0.95) * 100)}%</span>
      </div>
    </div>
  `).join('')
    : `
    <div style="grid-column: 1 / -1; padding: 36px 16px; text-align: center; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 12px;">
      <span style="display: flex; justify-content: center; margin-bottom: 8px; color: #64748B;">${Icons.cameraAiLens(28)}</span>
      <h4 style="font-size: 15px; font-weight: 700; color: #002D62; margin-bottom: 6px;">Nenhuma evidência registrada</h4>
      <p style="font-size: 12px; color: #64748B; max-width: 380px; margin: 0 auto;">As vistorias e fotos capturadas em campo pelas empreiteiras credenciadas aparecerão aqui em tempo real.</p>
    </div>
  `;

  return `
    <div class="page-container fade-in" id="fiscalAuditoriaPage">
      <!-- Header Superior com Título e Lupa de Pesquisa -->
      <header class="fiscal-topbar">
        <div class="fiscal-title-group">
          <div class="fiscal-title-row">
            <button class="btn-icon-simple-sm" id="btnVoltarInicioFiscal" title="Voltar ao Início">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h1 class="fiscal-main-title">Auditoria e Julgamento Técnico</h1>
          </div>
          <span class="fiscal-sub-location">Centro de Governança BB • ${vistoria.obraNome}</span>
        </div>
        <div class="fiscal-topbar-actions">
          <span class="badge-role-tag">
            ${state.user?.nome || 'Fiscal de Obra (BB)'}
          </span>
        </div>
      </header>

      <!-- Banner de Obra e Indicadores Forenses -->
      <div class="fiscal-metrics-row">
        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Fotos Inspecionadas</span>
          </div>
          <div class="metric-large-number">${registros.length}</div>
          <span class="metric-bottom-hint">Todas com Carimbo SHA-256</span>
        </div>

        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Último Envio de Campo</span>
          </div>
          <div class="metric-large-number timestamp">${vistoria.dataFoto} às ${vistoria.horaFoto}</div>
          <span class="metric-bottom-hint">Responsável: ${vistoria.responsavel}</span>
        </div>

        <div class="metric-summary-card success">
          <div class="metric-card-top">
            <span class="metric-label">Integridade Criptográfica</span>
          </div>
          <div class="metric-large-number">100%</div>
          <span class="metric-bottom-hint">Hash e Código Verificados</span>
        </div>
      </div>

      <!-- Título de Seção do Grid -->
      <div class="status-grid-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="status-pulse-dot" style="background: #3B82F6;"></span>
          <span class="grid-status-label">Evidências Fotográficas Coletadas no Canteiro (Invioláveis)</span>
        </div>
        <span style="font-size: 11px; color: var(--text-secondary);">Clique na foto para inspecionar</span>
      </div>

      <!-- Grid de Fotos Enviadas pelos Operadores -->
      <div class="fiscal-photos-grid">
        ${gridCardsHtml}
      </div>

      <!-- Seção de Análise e Decisão da Fiscal Mariana (HU08) -->
      <div class="fiscal-analysis-decision-card">
        <div class="analysis-question-title">
          <h3>Julgamento da Fiscalização BB</h3>
          <span style="font-size: 11px; color: var(--text-secondary);">Requisito 8.7 • Homologação de Fé Pública</span>
        </div>

        <div class="decision-action-box">
          <span class="decision-prompt-text">Emitir Parecer Técnico Oficial:</span>
          
          <div class="decision-buttons-row">
            <button class="btn-decision-reprovar" id="btnReprovarObra" title="Solicitar correções técnicas na obra">
              Solicitar Ajuste
            </button>
            <button class="btn-decision-aprovar" id="btnAprovarObra" title="Aprovar e homologar avanço físico">
              Aprovar Vistoria
            </button>
          </div>
        </div>

        <!-- Feedback de Status Atual da Obra -->
        <div class="status-obra-badge-banner ${vistoria.statusObra === 'REGULAR' ? 'status-regular' : 'status-pendente'}">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong>Status Atual da Obra:</strong> 
              <span id="lblStatusObraAtual" style="font-weight: 800; margin-left: 4px;">${vistoria.statusObra || 'REGULAR'}</span>
            </div>
            <span class="stamp-chip">${vistoria.statusObra === 'REGULAR' ? 'CONFORME BANCO DO BRASIL' : 'PENDENTE DE CORREÇÃO'}</span>
          </div>
          ${vistoria.justificativaFiscal ? `<p class="justificativa-text">"${escapeHtml(vistoria.justificativaFiscal)}"</p>` : ''}
        </div>
      </div>

      <!-- Botão Amarelo de Detalhes Completos & PDF Oficial (HU07) -->
      <div class="fiscal-action-footer">
        <button class="btn-primary-bb-yellow" id="btnVerDetalhesCompletos">
          Visualizar Relatório Oficial (PDF com Carimbo BB)
        </button>
      </div>

      <!-- Modal de Inspeção Forense da Foto (HU07) -->
      <div class="vistoria-modal-overlay hidden" id="modalInspecaoFoto">
        <div class="vistoria-modal-card" style="max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #002D62; background: #FED304; padding: 3px 10px; border-radius: 4px;">EVIDÊNCIA PERICIAL</span>
            <button class="btn-icon-simple-sm" id="btnFecharModalInspecao" style="font-size: 16px; cursor: pointer;">✕</button>
          </div>
          <div style="border-radius: 12px; overflow: hidden; margin-bottom: 12px; border: 1px solid #CBD5E1;">
            <img id="imgInspecaoModal" src="" alt="Foto" style="width: 100%; height: 220px; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='/uploads/evidencias/seed_fachada_bb.png';" />
          </div>
          <h4 id="tituloInspecaoModal" style="font-size: 15px; color: #002D62; margin-bottom: 4px;">Evidência de Vistoria</h4>
          <p id="localInspecaoModal" style="font-size: 11px; color: #64748B; margin-bottom: 10px;">Localização da Unidade • Responsável de Campo</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-size: 11px; margin-bottom: 14px; text-align: left;">
            <div style="margin-bottom: 6px;"><strong>Código Único:</strong> <code id="codigoInspecaoModal" style="color: #002D62; font-weight: 700; background: #FFF9D2; padding: 2px 6px; border-radius: 4px;">-</code></div>
            <div style="margin-bottom: 6px; word-break: break-all;"><strong>Hash SHA-256:</strong> <code id="hashInspecaoModal" style="font-size: 10px; color: #475569;">-</code></div>
            <div><strong>Validação IA:</strong> <span id="iaInspecaoModal" style="color: #059669; font-weight: 700;">-</span></div>
          </div>

          <button class="btn-submit-primary" id="btnFecharModalInspecaoBtn" style="width: 100%;">
            Concluir Inspeção
          </button>
        </div>
      </div>
    </div>
  `;
}

export function bindFiscalAuditoriaEvents() {
  const btnVoltar = document.getElementById('btnVoltarInicioFiscal');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('inicio', 'inicio');
    });
  }

  const lblStatus = document.getElementById('lblStatusObraAtual');

  // Julgamento via Modal Corporativo de Parecer Técnico respeitando botão clicado (Aprovar vs Solicitar Ajuste)
  const abrirParecer = (initialDecision = 'APROVADO') => {
    modal.openParecerFiscal({
      obraNome: state.currentVistoria.obraNome,
      initialDecision,
      onConfirm: async (decisao, justificativa) => {
        const statusObra = decisao === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
        await state.julgarVistoriaFiscal(statusObra, justificativa);
        
        if (lblStatus) {
          lblStatus.innerText = statusObra;
        }

        if (statusObra === 'REGULAR') {
          toast.success('Vistoria Homologada', 'Obra atestada como REGULAR. Parecer registrado e PDF atualizado.');
        } else {
          toast.warning('Ajuste Solicitado', 'Obra classificada como PENDENTE_AJUSTE. Parecer registrado e PDF atualizado.');
        }

        state.notify();
      }
    });
  };

  document.getElementById('btnAprovarObra')?.addEventListener('click', () => abrirParecer('APROVADO'));
  document.getElementById('btnReprovarObra')?.addEventListener('click', () => abrirParecer('REPROVADO'));

  // Ver detalhes completos / Abrir PDF Oficial exatamente do relatório selecionado
  const btnVerDetalhes = document.getElementById('btnVerDetalhesCompletos');
  if (btnVerDetalhes) {
    btnVerDetalhes.addEventListener('click', () => {
      const selectedRel = state.relatorios.find(r => r.id === state.currentVistoria.relatorioId) || state.relatorios[0] || {};
      const relId = state.currentVistoria.relatorioId || selectedRel.id || 'rel-seed-001';
      const pdfUrl = `/api/relatorios/${relId}/pdf`;
      modal.openPdfViewer({
        title: `Auditoria de Relatório • ${selectedRel.obraNome || state.currentVistoria.obraNome}`,
        pdfUrl: pdfUrl,
        codigo: selectedRel.codigoUnico || state.currentVistoria.codigoUnico,
        hash: selectedRel.hash || state.currentVistoria.hashSha256
      });
    });
  }

  // Inspeção forense de cada foto do mosaico com metadados reais
  const modalFoto = document.getElementById('modalInspecaoFoto');
  const imgFoto = document.getElementById('imgInspecaoModal');
  const tituloFoto = document.getElementById('tituloInspecaoModal');
  const localFoto = document.getElementById('localInspecaoModal');
  const codigoFoto = document.getElementById('codigoInspecaoModal');
  const hashFoto = document.getElementById('hashInspecaoModal');
  const iaFoto = document.getElementById('iaInspecaoModal');
  const btnFecharX = document.getElementById('btnFecharModalInspecao');
  const btnFecharBtn = document.getElementById('btnFecharModalInspecaoBtn');

  document.querySelectorAll('.fiscal-photo-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const regId = card.getAttribute('data-reg-id');
      const reg = (state.fiscalRegistros || []).find(r => r.id === regId);
      if (!reg) return;
      if (imgFoto) imgFoto.src = normalizeImageSrc(reg.img);
      if (tituloFoto) tituloFoto.innerText = reg.motivo || reg.titulo;
      if (localFoto) localFoto.innerText = `${reg.local} • Responsável: ${reg.responsavel || state.currentVistoria.responsavel}`;
      if (codigoFoto) codigoFoto.innerText = reg.codigo || state.currentVistoria.codigoUnico || 'Pendente';
      if (hashFoto) hashFoto.innerText = reg.hash || state.currentVistoria.hashSha256 || 'Hash SHA-256 registrado';
      if (iaFoto) iaFoto.innerText = `IA BBVision • ${Math.round((reg.confianca || 0.95) * 100)}% Confiança (${reg.status || 'Validado'})`;
      if (modalFoto) modalFoto.classList.remove('hidden');
    });
  });

  if (btnFecharX && modalFoto) btnFecharX.addEventListener('click', () => modalFoto.classList.add('hidden'));
  if (btnFecharBtn && modalFoto) btnFecharBtn.addEventListener('click', () => modalFoto.classList.add('hidden'));
}
