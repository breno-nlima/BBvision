/**
 * BVision - Tela de Auditoria da Fiscal / Engenheira Mariana
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.201.jpeg
 * Conforme Requisitos E4, HU07, HU08 e Contrato de API 8.7 do Documento Oficial TakeOff:
 * - Painel de controle de fotos e relatórios recebidos
 * - Parecer técnico e julgamento: Aprovar ('REGULAR') ou Reprovar ('PENDENTE_AJUSTE')
 * - Visualização do PDF oficial gerado pelo PDFKit com carimbo de integridade
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';

export function renderFiscalAuditoria() {
  const vistoria = state.currentVistoria;
  const registros = state.fiscalRegistros || [];

  const gridCardsHtml = registros.map((reg, idx) => `
    <div class="fiscal-photo-card" data-reg-id="${reg.id}">
      <div class="photo-thumbnail-wrap">
        <img 
          src="${reg.img}" 
          alt="${reg.titulo}" 
          class="photo-thumbnail-img"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=400&auto=format&fit=crop&q=80';"
        />
        <div class="photo-check-indicator ${reg.status === 'Validado' ? 'validated' : 'pending'}">
          ✓
        </div>
      </div>
      <div class="photo-meta-box">
        <strong class="photo-code">${reg.codigo}</strong>
        <span class="photo-subtitle">${idx % 2 === 0 ? reg.local : reg.responsavel}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-container fade-in" id="fiscalAuditoriaPage">
      <!-- Header Superior com Título e Lupa de Pesquisa -->
      <header class="fiscal-topbar">
        <div class="fiscal-title-group">
          <div class="fiscal-title-row">
            <button class="btn-icon-simple-sm" id="btnVoltarInicioFiscal" title="Voltar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h1 class="fiscal-main-title">Análise de Registros da Obra</h1>
          </div>
          <span class="fiscal-sub-location">Centro de Controle — ${vistoria.obraNome}</span>
        </div>
        <button class="btn-icon-simple" id="btnBuscarFiscal" title="Pesquisar">
          ${Icons.search(22)}
        </button>
      </header>

      <!-- Cards de Métricas em Duas Colunas -->
      <div class="fiscal-metrics-row">
        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Total de fotos enviadas:</span>
            <span class="metric-chevron">∨</span>
          </div>
          <div class="metric-large-number">12</div>
          <span class="metric-bottom-hint">Total de fotos enviadas: 12</span>
        </div>

        <div class="metric-summary-card">
          <div class="metric-card-top">
            <span class="metric-label">Último registro:</span>
            <span class="metric-chevron">∨</span>
          </div>
          <div class="metric-large-number timestamp">${vistoria.dataFoto} às ${vistoria.horaFoto}</div>
          <span class="metric-bottom-hint">Status: Aguardando análise</span>
        </div>
      </div>

      <!-- Título de Seção do Grid -->
      <div class="status-grid-header">
        <span class="grid-status-label">Status: Aguardando análise</span>
      </div>

      <!-- Grid de 6 Fotos Enviadas pelos Operadores -->
      <div class="fiscal-photos-grid">
        ${gridCardsHtml}
      </div>

      <!-- Seção de Análise e Decisão da Fiscal Mariana (HU08) -->
      <div class="fiscal-analysis-decision-card">
        <div class="analysis-question-title">
          <h3>Analysis</h3>
        </div>

        <div class="decision-action-box">
          <span class="decision-prompt-text">Aprovado?</span>
          
          <div class="decision-buttons-row">
            <button class="btn-decision-reprovar" id="btnReprovarObra">
              Reprovar
            </button>
            <button class="btn-decision-aprovar" id="btnAprovarObra">
              Aprovar
            </button>
          </div>
        </div>

        <!-- Feedback de Status Atual da Obra -->
        <div class="status-obra-badge-banner ${vistoria.statusObra === 'REGULAR' ? 'status-regular' : 'status-pendente'}">
          <strong>Status da Obra:</strong> 
          <span id="lblStatusObraAtual">${vistoria.statusObra || 'REGULAR'}</span>
          ${vistoria.justificativaFiscal ? `<p class="justificativa-text">"${vistoria.justificativaFiscal}"</p>` : ''}
        </div>
      </div>

      <!-- Botão Amarelo de Detalhes Completos & PDF Oficial (HU07) -->
      <div class="fiscal-action-footer">
        <button class="btn-primary-bb-yellow" id="btnVerDetalhesCompletos">
          Ver detalhes completos (PDF Oficial)
        </button>
      </div>

      <!-- Modal de Justificativa do Fiscal (PATCH /api/relatorios/:id/status) -->
      <div class="vistoria-modal-overlay hidden" id="modalJustificativaFiscal">
        <div class="vistoria-modal-card">
          <h3 id="modalJustificativaTitulo">Parecer Técnico da Fiscal Mariana</h3>
          <p id="modalJustificativaSub">Insira a fundamentação técnica para a decisão judicial/administrativa.</p>
          
          <textarea 
            class="cl-textarea" 
            id="txtJustificativaFiscal" 
            rows="3" 
            placeholder="Ex: Medição física em conformidade com o cronograma financeiro do Banco do Brasil..."
          ></textarea>

          <div style="display: flex; gap: 10px; margin-top: 14px;">
            <button class="btn-secondary-white" id="btnCancelarModalJustificativa" style="flex: 1;">
              Cancelar
            </button>
            <button class="btn-submit-primary" id="btnConfirmarDecisaoFiscal" style="flex: 1;">
              Confirmar Decisão
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Inspeção Forense da Foto (HU07) -->
      <div class="vistoria-modal-overlay hidden" id="modalInspecaoFoto">
        <div class="vistoria-modal-card" style="max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #002D62; background: #FED304; padding: 2px 8px; border-radius: 4px;">EVIDÊNCIA PERICIAL</span>
            <button class="btn-icon-simple-sm" id="btnFecharModalInspecao" style="font-size: 16px; cursor: pointer;">✕</button>
          </div>
          <div style="border-radius: 12px; overflow: hidden; margin-bottom: 12px; border: 1px solid #CBD5E1;">
            <img id="imgInspecaoModal" src="" alt="Foto" style="width: 100%; height: 180px; object-fit: cover; display: block;" onerror="this.src='prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg';" />
          </div>
          <h4 id="tituloInspecaoModal" style="font-size: 15px; color: #002D62; margin-bottom: 4px;">Fachada Principal</h4>
          <p id="localInspecaoModal" style="font-size: 11px; color: #64748B; margin-bottom: 10px;">Av. Paulista, 1000 • Rodrigo Silva</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; font-size: 11px; margin-bottom: 14px; text-align: left;">
            <div style="margin-bottom: 5px;"><strong>Código Único:</strong> <code id="codigoInspecaoModal" style="color: #002D62; font-weight: 700;">8F4A2C19E70B34DF</code></div>
            <div style="margin-bottom: 5px; word-break: break-all;"><strong>Hash SHA-256:</strong> <code style="font-size: 9.5px; color: #475569;">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code></div>
            <div><strong>Validação IA:</strong> <span style="color: #059669; font-weight: 700;">Gemini 1.5 Flash • 95% Confiança (Aprovado)</span></div>
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

  const modal = document.getElementById('modalJustificativaFiscal');
  const txtJustificativa = document.getElementById('txtJustificativaFiscal');
  const tituloModal = document.getElementById('modalJustificativaTitulo');
  const btnCancelar = document.getElementById('btnCancelarModalJustificativa');
  const btnConfirmar = document.getElementById('btnConfirmarDecisaoFiscal');
  const lblStatus = document.getElementById('lblStatusObraAtual');

  let decisaoPendente = null;

  // Reprovar -> Obra fica 'PENDENTE_AJUSTE'
  const btnReprovar = document.getElementById('btnReprovarObra');
  if (btnReprovar) {
    btnReprovar.addEventListener('click', () => {
      decisaoPendente = 'PENDENTE_AJUSTE';
      if (tituloModal) tituloModal.innerText = 'Reprovar Vistoria (Pendente de Ajuste)';
      if (txtJustificativa) txtJustificativa.value = 'Inconsistência visual no enquadramento. Solicitada nova medição de alvenaria.';
      if (modal) modal.classList.remove('hidden');
    });
  }

  // Aprovar -> Obra fica 'REGULAR'
  const btnAprovar = document.getElementById('btnAprovarObra');
  if (btnAprovar) {
    btnAprovar.addEventListener('click', () => {
      decisaoPendente = 'REGULAR';
      if (tituloModal) tituloModal.innerText = 'Aprovar Vistoria (Obra Regular)';
      if (txtJustificativa) txtJustificativa.value = 'Avanço físico validado conforme gabarito. Fotos com integridade SHA-256 atestadas.';
      if (modal) modal.classList.remove('hidden');
    });
  }

  if (btnCancelar && modal) {
    btnCancelar.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  if (btnConfirmar && modal) {
    btnConfirmar.addEventListener('click', async () => {
      const justificativa = txtJustificativa ? txtJustificativa.value : '';
      await state.julgarVistoriaFiscal(decisaoPendente, justificativa);
      if (lblStatus) lblStatus.innerText = decisaoPendente;
      modal.classList.add('hidden');
      alert(`Decisão registrada com sucesso!\nStatus da Obra: ${decisaoPendente}\nParecer salvo na trilha de auditoria do Banco do Brasil.`);
    });
  }

  // Ver detalhes completos / Abrir PDF Oficial (HU07)
  const btnVerDetalhes = document.getElementById('btnVerDetalhesCompletos');
  if (btnVerDetalhes) {
    btnVerDetalhes.addEventListener('click', () => {
      const relId = state.currentVistoria.relatorioId;
      if (relId) {
        window.open(`/api/relatorios/${relId}/pdf`, '_blank');
      } else {
        window.open('/api/relatorios', '_blank');
      }
    });
  }

  // Inspeção forense de cada foto do mosaico
  const modalFoto = document.getElementById('modalInspecaoFoto');
  const imgFoto = document.getElementById('imgInspecaoModal');
  const tituloFoto = document.getElementById('tituloInspecaoModal');
  const localFoto = document.getElementById('localInspecaoModal');
  const codigoFoto = document.getElementById('codigoInspecaoModal');
  const btnFecharX = document.getElementById('btnFecharModalInspecao');
  const btnFecharBtn = document.getElementById('btnFecharModalInspecaoBtn');

  document.querySelectorAll('.fiscal-photo-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const regId = card.getAttribute('data-reg-id');
      const reg = (state.fiscalRegistros || []).find(r => r.id === regId) || {
        titulo: 'Registro Fotográfico',
        local: state.currentVistoria.endereco,
        codigo: state.currentVistoria.codigoUnico,
        responsavel: state.currentVistoria.responsavel,
        img: 'prints/WhatsApp Image 2026-10-08 at 11.43.18.jpeg'
      };
      if (imgFoto) imgFoto.src = reg.img;
      if (tituloFoto) tituloFoto.innerText = reg.titulo;
      if (localFoto) localFoto.innerText = `${reg.local} • ${reg.responsavel || state.currentVistoria.responsavel}`;
      if (codigoFoto) codigoFoto.innerText = reg.codigo || state.currentVistoria.codigoUnico;
      if (modalFoto) modalFoto.classList.remove('hidden');
    });
  });

  if (btnFecharX && modalFoto) btnFecharX.addEventListener('click', () => modalFoto.classList.add('hidden'));
  if (btnFecharBtn && modalFoto) btnFecharBtn.addEventListener('click', () => modalFoto.classList.add('hidden'));
}
