/**
 * BBVision - Modal Corporativo & Visualizador de PDF Oficial
 * Permite exibição de documentos com Fé Pública e diálogos de parecer técnico
 */

class BBVisionModal {
  constructor() {
    this.activeModal = null;
  }

  /**
   * Abre um visualizador de PDF oficial de alta fidelidade
   */
  openPdfViewer({ title = 'Relatório Oficial de Fiscalização', pdfUrl, codigo = '', hash = '' }) {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbPdfModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-pdf-dialog">
        <header class="bb-modal-header">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon">🛡️</span>
            <div>
              <h3 class="bb-modal-title">${title}</h3>
              <span class="bb-modal-subtitle">Documento Criptografado • Fé Pública Banco do Brasil</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnClosePdfModal" title="Fechar">✕</button>
        </header>

        <div class="bb-modal-meta-bar">
          <div class="bb-meta-item">
            <span class="label">Código Único:</span>
            <strong class="code-val">${codigo || 'Não informado'}</strong>
          </div>
          <div class="bb-meta-item">
            <span class="label">Integridade SHA-256:</span>
            <span class="hash-val" title="${hash}">${hash ? hash.substring(0, 24) + '...' : 'Pendente'}</span>
          </div>
          <div class="bb-meta-actions">
            <a href="${pdfUrl}" target="_blank" download="BBVision_${codigo || 'Relatorio'}.pdf" class="btn-modal-action btn-download" title="Baixar PDF Oficial">
              📥 Baixar PDF
            </a>
            <a href="${pdfUrl}" target="_blank" class="btn-modal-action btn-open-external" title="Abrir em Nova Aba">
              ↗ Abrir Aba
            </a>
          </div>
        </div>

        <div class="bb-modal-pdf-container">
          <iframe src="${pdfUrl}#toolbar=1" class="bb-pdf-iframe" title="Visualizador de PDF BBVision"></iframe>
        </div>

        <footer class="bb-modal-footer">
          <span class="bb-security-seal">🔒 Documento inviolável com carimbo temporal ICP-Brasil / Banco do Brasil S.A.</span>
          <button class="btn-modal-close" id="btnDismissPdfModal">Fechar Visualizador</button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const closeHandler = () => this.close();
    overlay.querySelector('#btnClosePdfModal').addEventListener('click', closeHandler);
    overlay.querySelector('#btnDismissPdfModal').addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
  }

  /**
   * Abre o modal de Parecer Técnico para Fiscal Mariana
   */
  openParecerFiscal({ obraNome, onConfirm }) {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbParecerModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-parecer-dialog">
        <header class="bb-modal-header warning">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon">⚖️</span>
            <div>
              <h3 class="bb-modal-title">Emitir Parecer Técnico de Auditoria</h3>
              <span class="bb-modal-subtitle">${obraNome} — Fiscalização BB</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseParecerModal">✕</button>
        </header>

        <div class="bb-parecer-content">
          <p class="parecer-desc">
            Selecione a decisão de homologação da vistoria. Caso aponte inconsistências, 
            a obra entrará em status <strong>PENDENTE_AJUSTE</strong> e a empreiteira será notificada.
          </p>

          <div class="parecer-type-select">
            <label class="parecer-option selected" id="optAprovar">
              <input type="radio" name="decisaoFiscal" value="APROVADO" checked />
              <div class="opt-body">
                <strong>✓ Aprovar Vistoria (Obra REGULAR)</strong>
                <span>Todos os itens do checklist e fotos atendem aos requisitos do Banco do Brasil.</span>
              </div>
            </label>

            <label class="parecer-option" id="optReprovar">
              <input type="radio" name="decisaoFiscal" value="REPROVADO" />
              <div class="opt-body">
                <strong>⚠️ Solicitar Ajuste Técnico (PENDENTE_AJUSTE)</strong>
                <span>Identificadas inconformidades nos registros fotográficos ou checklist de campo.</span>
              </div>
            </label>
          </div>

          <div class="parecer-justificativa-group">
            <label for="txtJustificativaFiscal">Justificativa e Parecer Técnico do Fiscal de Obra:</label>
            <textarea id="txtJustificativaFiscal" rows="4" placeholder="Descreva os apontamentos técnicos ou notas de homologação..."></textarea>
          </div>
        </div>

        <footer class="bb-modal-footer">
          <button class="btn-modal-cancel" id="btnCancelarParecer">Cancelar</button>
          <button class="btn-modal-confirm" id="btnConfirmarParecer">Registrar Decisão Oficial</button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const optAprovar = overlay.querySelector('#optAprovar');
    const optReprovar = overlay.querySelector('#optReprovar');
    const txtJustificativa = overlay.querySelector('#txtJustificativaFiscal');

    optAprovar.addEventListener('click', () => {
      optAprovar.classList.add('selected');
      optReprovar.classList.remove('selected');
      if (!txtJustificativa.value || txtJustificativa.value.includes('Identificada inconformidade')) {
        txtJustificativa.value = 'Vistoria aprovada. Fachada e estruturas em total conformidade com os manuais de arquitetura do Banco do Brasil.';
      }
    });

    optReprovar.addEventListener('click', () => {
      optReprovar.classList.add('selected');
      optAprovar.classList.remove('selected');
      txtJustificativa.value = 'Identificada inconformidade na sinalização externa e acabamento de prumo. Necessário refazer a captura com luz natural uniforme.';
    });

    txtJustificativa.value = 'Vistoria aprovada. Fachada e estruturas em total conformidade com os manuais de arquitetura do Banco do Brasil.';

    const closeHandler = () => this.close();
    overlay.querySelector('#btnCloseParecerModal').addEventListener('click', closeHandler);
    overlay.querySelector('#btnCancelarParecer').addEventListener('click', closeHandler);

    overlay.querySelector('#btnConfirmarParecer').addEventListener('click', () => {
      const selectedDecision = overlay.querySelector('input[name="decisaoFiscal"]:checked').value;
      const justificativa = txtJustificativa.value.trim();
      this.close();
      if (typeof onConfirm === 'function') {
        onConfirm(selectedDecision, justificativa);
      }
    });
  }

  close() {
    if (this.activeModal && this.activeModal.parentNode) {
      this.activeModal.parentNode.removeChild(this.activeModal);
    }
    this.activeModal = null;
  }
}

export const modal = new BBVisionModal();
