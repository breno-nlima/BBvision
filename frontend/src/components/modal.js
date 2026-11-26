/**
 * BBVision - Modais Corporativos, Visualizador de PDF, Gestão de Obras e Checklist
 */

import { Icons } from '../assets/icons.js?v=2.5';
import { state, PERGUNTAS_PADRAO_BB } from '../services/state.js?v=2.5';
import { toast } from './toast.js?v=2.5';
import { escapeHtml } from '../utils/formatters.js?v=2.5';

class BBVisionModal {
  constructor() {
    this.activeModal = null;
    this.secondaryModal = null;
  }

  /**
   * Diálogo de confirmação corporativo (substitui window.confirm)
   */
  openConfirmDialog({
    title = 'Confirmar Ação',
    message = 'Deseja continuar?',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
    onConfirm,
  }) {
    this.closeSubModal();

    const subOverlay = document.createElement('div');
    subOverlay.className = 'bb-modal-overlay fade-in';
    subOverlay.style.zIndex = '10100';

    subOverlay.innerHTML = `
      <div class="bb-modal-dialog" style="max-width: 440px; width: 92%;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid ${danger ? '#EF4444' : '#FED304'}; padding: 14px 18px;">
          <div class="bb-modal-header-brand">
            <h3 class="bb-modal-title" style="font-size: 15px; color: #FFFFFF;">${escapeHtml(title)}</h3>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseConfirmSub" title="Fechar">✕</button>
        </header>
        <div style="padding: 20px; font-size: 13.5px; color: #334155; line-height: 1.55;">
          ${escapeHtml(message)}
        </div>
        <footer class="bb-modal-footer" style="padding: 12px 18px; justify-content: flex-end; gap: 10px; background: #F8FAFC;">
          <button type="button" class="btn-modal-cancel" id="btnCancelConfirmSub">${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn-modal-confirm" id="btnOkConfirmSub" style="background: ${danger ? '#DC2626' : '#002D62'}; color: #FFFFFF; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            ${escapeHtml(confirmLabel)}
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(subOverlay);
    this.secondaryModal = subOverlay;

    const closeIt = () => this.closeSubModal();
    subOverlay.querySelector('#btnCloseConfirmSub').addEventListener('click', closeIt);
    subOverlay.querySelector('#btnCancelConfirmSub').addEventListener('click', closeIt);
    subOverlay.addEventListener('click', (e) => {
      if (e.target === subOverlay) closeIt();
    });
    subOverlay.querySelector('#btnOkConfirmSub').addEventListener('click', async () => {
      closeIt();
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
    });
  }

  /**
   * Visualizador de PDF oficial
   */
  openPdfViewer({ title = 'Relatório Oficial de Fiscalização', pdfUrl, codigo = '', hash = '' }) {
    this.close();

    const safeTitle = escapeHtml(title);
    const safeCodigo = escapeHtml(codigo || 'Não informado');
    const safeHash = escapeHtml(hash || '');
    const cacheBustedPdfUrl = pdfUrl ? `${pdfUrl}${pdfUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : '';

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbPdfModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-pdf-dialog">
        <header class="bb-modal-header">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="display:inline-flex; align-items:center; color:#FED304;">${Icons.shieldFePublica(22, '#FED304')}</span>
            <div>
              <h3 class="bb-modal-title">${safeTitle}</h3>
              <span class="bb-modal-subtitle">Documento Criptografado • Fé Pública Banco do Brasil</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnClosePdfModal" title="Fechar">✕</button>
        </header>

        <div class="bb-modal-meta-bar">
          <div class="bb-meta-item">
            <span class="label">Código Único:</span>
            <strong class="code-val">${safeCodigo}</strong>
          </div>
          <div class="bb-meta-item">
            <span class="label">Integridade SHA-256:</span>
            <span class="hash-val" title="${safeHash}">${safeHash ? safeHash.substring(0, 24) + '...' : 'Pendente'}</span>
          </div>
          <div class="bb-meta-actions">
            <a href="${escapeHtml(cacheBustedPdfUrl)}" target="_blank" rel="noopener" download="BBVision_${escapeHtml(codigo || 'Relatorio')}.pdf" class="btn-modal-action btn-download" title="Baixar PDF Oficial" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.downloadFile(14)} Baixar PDF
            </a>
            <a href="${escapeHtml(cacheBustedPdfUrl)}" target="_blank" rel="noopener" class="btn-modal-action btn-open-external" title="Abrir em Nova Aba" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.externalOpen(14)} Abrir Aba
            </a>
          </div>
        </div>

        <div class="bb-modal-pdf-container">
          <iframe src="${escapeHtml(cacheBustedPdfUrl)}#toolbar=1" class="bb-pdf-iframe" title="Visualizador de PDF BBVision"></iframe>
        </div>

        <footer class="bb-modal-footer">
          <span class="bb-security-seal">Documento inviolável com carimbo temporal e integridade SHA-256.</span>
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
   * Modal de Parecer Técnico para Fiscal de Obra
   */
  openParecerFiscal({ obraNome, initialDecision = 'APROVADO', onConfirm }) {
    this.close();

    const isReprovarInicial = initialDecision === 'REPROVADO';
    const safeObraNome = escapeHtml(obraNome || 'Obra Cadastrada');

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbParecerModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-parecer-dialog">
        <header class="bb-modal-header warning">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="display:inline-flex; align-items:center; color:#FED304;">${Icons.gavelAuditoria(22, '#FED304')}</span>
            <div>
              <h3 class="bb-modal-title">Emitir Parecer Técnico de Auditoria</h3>
              <span class="bb-modal-subtitle">${safeObraNome} — Fiscalização de Obra</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseParecerModal">✕</button>
        </header>

        <div class="bb-parecer-content">
          <p class="parecer-desc">
            Selecione a decisão de homologação da vistoria. Caso aponte inconsistências, 
            a obra entrará em status <strong>PENDENTE_AJUSTE</strong> para regularização pela empreiteira.
          </p>

          <div class="parecer-type-select">
            <label class="parecer-option ${!isReprovarInicial ? 'selected' : ''}" id="optAprovar">
              <input type="radio" name="decisaoFiscal" value="APROVADO" ${!isReprovarInicial ? 'checked' : ''} />
              <div class="opt-body">
                <strong>Aprovar Vistoria (Obra REGULAR)</strong>
                <span>Todos os itens do checklist e evidências fotográficas atendem aos requisitos técnicos.</span>
              </div>
            </label>

            <label class="parecer-option ${isReprovarInicial ? 'selected' : ''}" id="optReprovar">
              <input type="radio" name="decisaoFiscal" value="REPROVADO" ${isReprovarInicial ? 'checked' : ''} />
              <div class="opt-body">
                <strong>Solicitar Ajuste Técnico (PENDENTE_AJUSTE)</strong>
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
      const r = optAprovar.querySelector('input');
      if (r) r.checked = true;
    });

    optReprovar.addEventListener('click', () => {
      optReprovar.classList.add('selected');
      optAprovar.classList.remove('selected');
      const r = optReprovar.querySelector('input');
      if (r) r.checked = true;
    });

    const closeHandler = () => this.close();
    overlay.querySelector('#btnCloseParecerModal').addEventListener('click', closeHandler);
    overlay.querySelector('#btnCancelarParecer').addEventListener('click', closeHandler);

    overlay.querySelector('#btnConfirmarParecer').addEventListener('click', () => {
      const selectedDecision = overlay.querySelector('input[name="decisaoFiscal"]:checked').value;
      const justificativa = txtJustificativa.value.trim();
      if (selectedDecision === 'REPROVADO' && justificativa.length < 5) {
        toast.warning('Justificativa Obrigatória', 'Descreva os ajustes técnicos necessários antes de reprovar a vistoria.');
        txtJustificativa.focus();
        return;
      }
      this.close();
      if (typeof onConfirm === 'function') {
        onConfirm(selectedDecision, justificativa);
      }
    });
  }

  /**
   * Diálogo de confirmação de encerramento de sessão
   */
  confirmLogout({ user, onConfirm }) {
    this.close();

    const userName = escapeHtml(user?.nome || 'Usuário Autenticado');
    const isFiscal = user?.cargo === 'fiscal';
    const cargoLabel = isFiscal ? 'Fiscalização e Engenharia' : 'Empreiteira de Campo & Vistorias';
    const avatarSvg = isFiscal ? Icons.perfilBb(44) : Icons.perfilObras(44);

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbLogoutModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-logout-dialog" style="max-width: 480px;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #EF4444; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #F87171; display: flex; align-items: center;">
              ${Icons.logOut(22, '#F87171')}
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">Encerrar Sessão do BBVision</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">Desconexão segura de usuário</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseLogoutModal" title="Fechar">✕</button>
        </header>

        <div style="padding: 22px 20px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
            <div style="display:flex; align-items:center; flex-shrink:0;">${avatarSvg}</div>
            <div style="display: flex; flex-direction: column;">
              <strong style="color: #0F172A; font-size: 14px; font-weight: 700;">${userName}</strong>
              <span style="color: #002D62; font-size: 12px; font-weight: 600;">${cargoLabel}</span>
              <span style="color: #64748B; font-size: 11px;">${escapeHtml(user?.email || '')}</span>
            </div>
          </div>

          <p style="color: #334155; font-size: 13.5px; line-height: 1.55; margin: 0;">
            Tem certeza de que deseja sair da sua conta? Para retornar às suas obras, vistorias e relatórios, será necessário autenticar-se novamente.
          </p>

          <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #065F46; line-height: 1.45;">
            <strong>Garantia de Integridade:</strong> Vistorias concluídas e eventuais registros aguardando sincronização offline permanecem preservados.
          </div>
        </div>

        <footer class="bb-modal-footer" style="padding: 14px 20px; justify-content: flex-end; gap: 10px; background: #F8FAFC;">
          <button class="btn-modal-cancel" id="btnCancelLogout" style="padding: 9px 18px; font-size: 13px; font-weight: 600;">
            Permanecer Conectado
          </button>
          <button class="btn-modal-confirm" id="btnConfirmLogoutAction" style="background: #DC2626; color: #FFFFFF; padding: 9px 20px; font-size: 13px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);">
            ${Icons.logOut(15, '#FFFFFF')}
            <span>Sim, Sair da Conta</span>
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const closeHandler = () => this.close();
    overlay.querySelector('#btnCloseLogoutModal').addEventListener('click', closeHandler);
    overlay.querySelector('#btnCancelLogout').addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    overlay.querySelector('#btnConfirmLogoutAction').addEventListener('click', () => {
      this.close();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    });
  }

  closeSubModal() {
    if (this.secondaryModal && this.secondaryModal.parentNode) {
      this.secondaryModal.parentNode.removeChild(this.secondaryModal);
    }
    this.secondaryModal = null;
  }

  /**
   * Modal para criar ou editar uma pergunta técnica do checklist
   */
  openEditarPerguntaModal({ pergunta = null, index = null, onSave }) {
    this.closeSubModal();

    const isEdit = Boolean(pergunta);
    const initialTitulo = pergunta?.titulo || '';
    const initialSubtitulo = pergunta?.subtitulo || '';
    const initialTipo = pergunta?.tipo || 'multipla_escolha';

    let localOpcoes = [];
    if (pergunta && Array.isArray(pergunta.opcoes)) {
      localOpcoes = JSON.parse(JSON.stringify(pergunta.opcoes));
    } else if (initialTipo === 'multipla_escolha') {
      localOpcoes = [
        { valor: 'Sim', label: 'Sim (Conforme)', detalhe: 'Atende integralmente aos requisitos técnicos', tag: 'Conforme', classeTag: 'tag-conforme' },
        { valor: 'Parcial', label: 'Parcial (Ressalva)', detalhe: 'Atendimento parcial com acompanhamento técnico', tag: 'Atenção', classeTag: 'tag-atencao' },
        { valor: 'Não', label: 'Não (Inconforme)', detalhe: 'Não atende aos requisitos mínimos', tag: 'Não Conforme', classeTag: 'tag-erro' },
      ];
    } else if (initialTipo === 'caixa') {
      localOpcoes = [
        { valor: 'Isolamento perimetral e tapumes íntegros', label: 'Isolamento perimetral e tapumes íntegros', detalhe: 'Canteiro fechado sem brechas' },
        { valor: 'Sinalização visual de perigo ativa', label: 'Sinalização visual de perigo ativa', detalhe: 'Placas e avisos de segurança montados' },
        { valor: 'Uso obrigatório de EPIs completos', label: 'Uso obrigatório de EPIs completos', detalhe: 'Equipe utilizando equipamentos obrigatórios' },
      ];
    }

    let localChips = Array.isArray(pergunta?.chipsRapidos)
      ? [...pergunta.chipsRapidos]
      : [
          'Alvenaria aprumada e nivelada',
          'Ausência de trincas estruturais',
          'Instalações embutidas conforme projeto',
        ];

    const subOverlay = document.createElement('div');
    subOverlay.className = 'bb-modal-overlay fade-in';
    subOverlay.id = 'bbEditarPerguntaModalOverlay';
    subOverlay.style.zIndex = '10050';

    subOverlay.innerHTML = `
      <div class="bb-modal-dialog bb-editar-pergunta-dialog" style="max-width: 580px; width: 95%; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
        <header class="bb-modal-header" style="background: #002D62; border-bottom: 3px solid #FED304; padding: 14px 18px;">
          <div class="bb-modal-header-brand">
            <div>
              <h3 class="bb-modal-title" style="font-size: 15px; color: #FFFFFF;">
                ${isEdit ? `Editar Pergunta ${index !== null ? '#' + (index + 1) : ''}` : 'Nova Pergunta Técnica do Checklist'}
              </h3>
              <span class="bb-modal-subtitle" style="color: #CBD5E1;">Configuração de item de vistoria técnica</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseSubModal" title="Fechar">✕</button>
        </header>

        <form id="formEditarPergunta" style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 120px); padding: 18px 20px; gap: 14px;">
          <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
            <label for="txtPerguntaTitulo" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
              Enunciado da Pergunta <span style="color: #DC2626;">*</span>
            </label>
            <input 
              type="text" 
              id="txtPerguntaTitulo" 
              class="form-control-input" 
              placeholder="Digite o enunciado da pergunta de vistoria" 
              value="${escapeHtml(initialTitulo)}"
              required 
              style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
            />
          </div>

          <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
            <label for="txtPerguntaSubtitulo" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
              Orientações Técnicas ao Vistoriador
            </label>
            <textarea 
              id="txtPerguntaSubtitulo" 
              rows="2" 
              placeholder="Descreva critérios de avaliação para orientar o responsável em campo..." 
              style="padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; outline: none; resize: vertical;"
            >${escapeHtml(initialSubtitulo)}</textarea>
          </div>

          <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
            <label for="selPerguntaTipo" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
              Formato de Resposta no Canteiro <span style="color: #DC2626;">*</span>
            </label>
            <select 
              id="selPerguntaTipo" 
              class="form-control-input"
              style="padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; background: #FFFFFF; outline: none;"
            >
              <option value="multipla_escolha" ${initialTipo === 'multipla_escolha' ? 'selected' : ''}>Múltipla Escolha (Opção única com avaliação de conformidade)</option>
              <option value="caixa" ${initialTipo === 'caixa' ? 'selected' : ''}>Caixas de Seleção (Múltiplas opções cumulativas)</option>
              <option value="texto" ${initialTipo === 'texto' ? 'selected' : ''}>Campo de Texto Descritivo (Relato livre com chips sugestivos)</option>
            </select>
          </div>

          <div id="secaoOpcoesPergunta" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;"></div>

          <footer class="bb-modal-footer" style="padding: 12px 0 0 0; background: transparent; border-top: 1px solid #E2E8F0; display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px;">
            <button type="button" class="btn-modal-cancel" id="btnCancelSubModal" style="padding: 8px 16px; font-size: 12.5px; font-weight: 600;">
              Cancelar
            </button>
            <button type="submit" class="btn-modal-confirm" id="btnSalvarPerguntaSubmit" style="background: #002D62; color: #FFFFFF; padding: 8px 20px; font-size: 12.5px; font-weight: 700; border-radius: 6px; cursor: pointer;">
              ${isEdit ? 'Salvar Alterações' : 'Adicionar Pergunta'}
            </button>
          </footer>
        </form>
      </div>
    `;

    document.body.appendChild(subOverlay);
    this.secondaryModal = subOverlay;

    const closeSubHandler = () => this.closeSubModal();
    subOverlay.querySelector('#btnCloseSubModal').addEventListener('click', closeSubHandler);
    subOverlay.querySelector('#btnCancelSubModal').addEventListener('click', closeSubHandler);
    subOverlay.addEventListener('click', (e) => {
      if (e.target === subOverlay) this.closeSubModal();
    });

    const selTipo = subOverlay.querySelector('#selPerguntaTipo');
    const secaoOpcoes = subOverlay.querySelector('#secaoOpcoesPergunta');

    const renderOpcoesSection = () => {
      const currentTipo = selTipo.value;

      if (currentTipo === 'multipla_escolha' || currentTipo === 'caixa') {
        const isMultipla = currentTipo === 'multipla_escolha';
        secaoOpcoes.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <label style="font-size: 12px; font-weight: 700; color: #002D62;">
              Opções de Resposta (${localOpcoes.length})
            </label>
            <span style="font-size: 11px; color: #64748B;">${isMultipla ? 'A empreiteira escolherá 1 opção' : 'A empreiteira poderá marcar várias'}</span>
          </div>

          <div id="listaOpcoesContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; padding-right: 4px;">
            ${localOpcoes.map((op, opIdx) => {
              const label = typeof op === 'string' ? op : (op.label || op.valor || '');
              const tag = typeof op === 'object' ? (op.tag || '') : '';
              return `
                <div style="display: flex; align-items: center; gap: 8px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 6px 10px;">
                  <span style="font-size: 11px; color: #64748B; font-weight: 700;">${opIdx + 1}.</span>
                  <input 
                    type="text" 
                    class="txt-opcao-item" 
                    data-op-idx="${opIdx}" 
                    value="${escapeHtml(label)}" 
                    placeholder="Texto da opção..." 
                    style="flex: 1; border: none; font-size: 12.5px; outline: none; background: transparent;"
                  />
                  ${isMultipla ? `
                    <select class="sel-opcao-tag" data-op-idx="${opIdx}" style="font-size: 11px; padding: 2px 6px; border: 1px solid #CBD5E1; border-radius: 4px; background: #F8FAFC; outline: none;">
                      <option value="Conforme" ${tag === 'Conforme' || tag === '100% Conforme' ? 'selected' : ''}>Conforme</option>
                      <option value="Atenção" ${tag === 'Atenção' || tag === 'Com Ressalva' ? 'selected' : ''}>Atenção</option>
                      <option value="Não Conforme" ${tag === 'Não Conforme' || tag === 'Crítico' ? 'selected' : ''}>Não Conforme</option>
                    </select>
                  ` : ''}
                  <button type="button" class="btn-remove-opcao" data-op-idx="${opIdx}" title="Remover opção" style="background: none; border: none; color: #DC2626; cursor: pointer; font-size: 13px; padding: 2px 4px;">
                    ✕
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <input 
              type="text" 
              id="txtNovaOpcaoInput" 
              placeholder="Digite nova opção..." 
              style="flex: 1; padding: 6px 10px; font-size: 12px; border: 1.5px solid #CBD5E1; border-radius: 6px; outline: none;"
            />
            <button type="button" id="btnAddOpcaoBtn" style="background: #002D62; color: #FFFFFF; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer;">
              + Adicionar
            </button>
          </div>
        `;

        secaoOpcoes.querySelectorAll('.txt-opcao-item').forEach(inp => {
          inp.addEventListener('input', (e) => {
            const idx = parseInt(e.target.getAttribute('data-op-idx'), 10);
            if (typeof localOpcoes[idx] === 'object') {
              localOpcoes[idx].label = e.target.value;
              localOpcoes[idx].valor = e.target.value;
            } else {
              localOpcoes[idx] = e.target.value;
            }
          });
        });

        secaoOpcoes.querySelectorAll('.sel-opcao-tag').forEach(sel => {
          sel.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-op-idx'), 10);
            if (typeof localOpcoes[idx] === 'object') {
              localOpcoes[idx].tag = e.target.value;
              localOpcoes[idx].classeTag =
                e.target.value === 'Conforme'
                  ? 'tag-conforme'
                  : e.target.value === 'Atenção'
                  ? 'tag-atencao'
                  : 'tag-erro';
            }
          });
        });

        secaoOpcoes.querySelectorAll('.btn-remove-opcao').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-op-idx'), 10);
            if (localOpcoes.length <= 2) {
              toast.warning('Mínimo de Opções', 'A pergunta deve conter ao menos duas opções de resposta.');
              return;
            }
            localOpcoes.splice(idx, 1);
            renderOpcoesSection();
          });
        });

        const btnAddOp = secaoOpcoes.querySelector('#btnAddOpcaoBtn');
        const txtNovaOp = secaoOpcoes.querySelector('#txtNovaOpcaoInput');
        const handleAddOpcao = () => {
          const val = txtNovaOp.value.trim();
          if (!val) return;
          localOpcoes.push({
            valor: val,
            label: val,
            detalhe: 'Item de verificação técnica',
            tag: 'Conforme',
            classeTag: 'tag-conforme',
          });
          txtNovaOp.value = '';
          renderOpcoesSection();
        };

        btnAddOp.addEventListener('click', handleAddOpcao);
        txtNovaOp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOpcao();
          }
        });
      } else {
        secaoOpcoes.innerHTML = `
          <label style="font-size: 12px; font-weight: 700; color: #002D62;">
            Sugestões Técnicas Rápidas (Chips para preenchimento ágil)
          </label>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="containerChipsTexto">
            ${localChips.map((chip, cIdx) => `
              <span style="font-size: 11px; padding: 4px 8px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 999px; color: #334155; display: inline-flex; align-items: center; gap: 6px;">
                ${escapeHtml(chip)}
                <button type="button" class="btn-remove-chip" data-chip-idx="${cIdx}" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 0; font-size: 11px;">✕</button>
              </span>
            `).join('')}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <input 
              type="text" 
              id="txtNovoChipInput" 
              placeholder="Digite sugestão técnica..." 
              style="flex: 1; padding: 6px 10px; font-size: 12px; border: 1.5px solid #CBD5E1; border-radius: 6px; outline: none;"
            />
            <button type="button" id="btnAddChipBtn" style="background: #002D62; color: #FFFFFF; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer;">
              + Adicionar Chip
            </button>
          </div>
        `;

        secaoOpcoes.querySelectorAll('.btn-remove-chip').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-chip-idx'), 10);
            localChips.splice(idx, 1);
            renderOpcoesSection();
          });
        });

        const btnAddChip = secaoOpcoes.querySelector('#btnAddChipBtn');
        const txtNovoChip = secaoOpcoes.querySelector('#txtNovoChipInput');
        const handleAddChip = () => {
          const val = txtNovoChip.value.trim();
          if (!val) return;
          localChips.push(val);
          txtNovoChip.value = '';
          renderOpcoesSection();
        };

        btnAddChip.addEventListener('click', handleAddChip);
        txtNovoChip.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddChip();
          }
        });
      }
    };

    selTipo.addEventListener('change', () => {
      const novoTipo = selTipo.value;
      if (novoTipo === 'multipla_escolha' && (!localOpcoes || localOpcoes.length === 0)) {
        localOpcoes = [
          { valor: 'Sim', label: 'Sim (Conforme)', detalhe: 'Atende aos critérios', tag: 'Conforme', classeTag: 'tag-conforme' },
          { valor: 'Parcial', label: 'Parcial (Ressalva)', detalhe: 'Com pendências leves', tag: 'Atenção', classeTag: 'tag-atencao' },
          { valor: 'Não', label: 'Não (Inconforme)', detalhe: 'Não atende', tag: 'Não Conforme', classeTag: 'tag-erro' },
        ];
      } else if (novoTipo === 'caixa' && (!localOpcoes || localOpcoes.length === 0)) {
        localOpcoes = [
          { valor: 'Item 1 verificado', label: 'Item 1 verificado', detalhe: 'Conforme' },
          { valor: 'Item 2 em conformidade', label: 'Item 2 em conformidade', detalhe: 'Conforme' },
        ];
      }
      renderOpcoesSection();
    });

    renderOpcoesSection();

    const form = subOverlay.querySelector('#formEditarPergunta');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const titulo = subOverlay.querySelector('#txtPerguntaTitulo').value.trim();
      const subtitulo = subOverlay.querySelector('#txtPerguntaSubtitulo').value.trim();
      const tipo = selTipo.value;

      if (!titulo) {
        toast.warning('Campo Obrigatório', 'Informe o enunciado da pergunta.');
        return;
      }

      if ((tipo === 'multipla_escolha' || tipo === 'caixa') && localOpcoes.length < 2) {
        toast.warning('Mínimo de Opções', 'Informe ao menos 2 opções de resposta.');
        return;
      }

      const tipoLabel = tipo === 'multipla_escolha' ? 'Múltipla Escolha' : (tipo === 'caixa' ? 'Caixas de Seleção' : 'Campo de Texto Descritivo');
      const chaveResposta = pergunta?.chaveResposta || pergunta?.id || `perg_${Date.now()}`;

      const perguntaEditada = {
        ...(pergunta || {}),
        id: pergunta?.id || `perg_${Date.now()}`,
        numero: index !== null ? index + 1 : (pergunta?.numero || 1),
        tipo,
        tipoLabel,
        tipoIcon: '',
        titulo,
        subtitulo,
        chaveResposta,
        padrao: tipo === 'caixa' ? [] : '',
        opcoes: (tipo === 'multipla_escolha' || tipo === 'caixa') ? localOpcoes : undefined,
        chipsRapidos: tipo === 'texto' ? localChips : undefined,
        placeholder: tipo === 'texto' ? (pergunta?.placeholder || 'Digite observações técnicas relevantes...') : undefined,
      };

      if (typeof onSave === 'function') {
        onSave(perguntaEditada);
      }

      this.closeSubModal();
    });
  }

  /**
   * Modal para cadastro de Nova Obra (Exclusivo para Fiscais)
   * Usa empreiteiras REAIS cadastradas no sistema.
   */
  openNovaObraModal({ fiscalUser, empreiteiras = [], onSave }) {
    this.close();

    const fiscalNome = fiscalUser?.nome || 'Fiscal de Obra';
    const fiscalRegistro = fiscalUser?.registro_profissional ? ` (${fiscalUser.registro_profissional})` : '';
    const listaEmpreiteiras = Array.isArray(empreiteiras) ? empreiteiras : [];

    let perguntasObra = JSON.parse(JSON.stringify(state.checklistTemplate || PERGUNTAS_PADRAO_BB));

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbNovaObraModalOverlay';

    const datalistEmpreiteirasHtml = listaEmpreiteiras
      .map(emp => {
        const labelExtra = [emp.nome, emp.empresa].filter(Boolean).join(' — ');
        return `<option value="${escapeHtml(emp.email)}">${escapeHtml(labelExtra)}</option>`;
      })
      .join('');

    const sugestoesEmpreiteirasHtml = listaEmpreiteiras.length > 0
      ? `<div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px;">
          ${listaEmpreiteiras
            .slice(0, 5)
            .map(
              emp => `<button type="button" class="btn-pick-emp-email" data-email="${escapeHtml(emp.email)}" data-nome="${escapeHtml(emp.nome || '')}" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #002D62; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; cursor: pointer;">${escapeHtml(emp.email)}</button>`
            )
            .join('')}
        </div>`
      : `<span style="font-size: 11px; color: #B45309;">Nenhuma empreiteira cadastrada ainda. Cadastre um perfil de empreiteira para atribuir a obra.</span>`;

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-nova-obra-dialog" style="max-width: 640px; width: 95%;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #FED304; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #FED304; display: flex; align-items: center;">
              ${Icons.iconeCadastro(22, '#FED304')}
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">Cadastrar Nova Obra</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">Credenciamento, Vínculo de Empreiteira e Checklist Técnico</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseNovaObraModal" title="Fechar">✕</button>
        </header>

        <form id="formNovaObra" style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 130px);">
          <div style="padding: 20px 22px; display: flex; flex-direction: column; gap: 16px;">
            <div style="background: #F1F5F9; border-left: 3px solid #002D62; padding: 10px 14px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 12px; gap: 8px; flex-wrap: wrap;">
              <span style="color: #002D62; font-weight: 700;">Fiscal Cadastrador(a):</span>
              <span style="color: #334155; font-weight: 600;">${escapeHtml(fiscalNome)}${escapeHtml(fiscalRegistro)}</span>
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="txtNomeObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Nome da Obra / Unidade <span style="color: #DC2626;">*</span>
              </label>
              <input 
                type="text" 
                id="txtNomeObra" 
                class="form-control-input" 
                placeholder="Informe o nome da agência, prédio ou unidade" 
                required 
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
              />
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="selTipoObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Tipo de Intervenção Técnica <span style="color: #DC2626;">*</span>
              </label>
              <select 
                id="selTipoObra" 
                class="form-control-input"
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: #FFFFFF; outline: none;"
              >
                <option value="Reforma e Modernização de Agência" selected>Reforma e Modernização de Agência</option>
                <option value="Construção de Nova Agência Bancária">Construção de Nova Agência Bancária</option>
                <option value="Adequação de Acessibilidade (NBR 9050)">Adequação de Acessibilidade (NBR 9050)</option>
                <option value="Manutenção Predial e Fachada Corporativa">Manutenção Predial e Fachada Corporativa</option>
                <option value="Instalação de Posto de Atendimento Eletrônico (PAE/ATM)">Instalação de Posto de Atendimento Eletrônico (PAE/ATM)</option>
                <option value="Adequação de Segurança e Tesouraria">Adequação de Segurança e Tesouraria</option>
              </select>
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="txtEnderecoObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Endereço Completo da Unidade <span style="color: #DC2626;">*</span>
              </label>
              <input 
                type="text" 
                id="txtEnderecoObra" 
                class="form-control-input" 
                placeholder="Logradouro, número, bairro, cidade/UF" 
                required 
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
              />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
                <label for="txtEmailEmpreiteira" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                  E-mail da Empreiteira Atribuída <span style="color: #DC2626;">*</span>
                </label>
                <input
                  type="email"
                  id="txtEmailEmpreiteira"
                  list="datalistEmpreiteirasNovaObra"
                  class="form-control-input"
                  placeholder="Ex.: rodrigo@empreiteira.com"
                  required
                  autocomplete="off"
                  style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; background: #FFFFFF; outline: none;"
                />
                <datalist id="datalistEmpreiteirasNovaObra">
                  ${datalistEmpreiteirasHtml}
                </datalist>
                ${sugestoesEmpreiteirasHtml}
              </div>

              <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
                <label for="txtResponsavelObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                  Responsável Técnico de Campo
                </label>
                <input 
                  type="text" 
                  id="txtResponsavelObra" 
                  class="form-control-input" 
                  placeholder="Nome do engenheiro ou responsável" 
                  value="" 
                  style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
                />
              </div>
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="selStatusInicial" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Status Inicial
              </label>
              <select 
                id="selStatusInicial" 
                class="form-control-input"
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: #FFFFFF; outline: none;"
              >
                <option value="REGULAR" selected>REGULAR — Liberada para Vistorias</option>
                <option value="EM_ANDAMENTO">EM_ANDAMENTO — Mobilização Inicial</option>
              </select>
            </div>

            <div class="form-group-field" style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #002D62; font-size: 13.5px;">Perguntas do Checklist Desta Obra</strong>
                    <span id="badgePerguntasNovaObraCount" style="background: #002D62; color: #FED304; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
                      ${perguntasObra.length} perguntas
                    </span>
                  </div>
                  <p style="font-size: 11.5px; color: #64748B; margin: 3px 0 0 0;">
                    Edite, exclua ou adicione perguntas que a empreiteira responderá no canteiro.
                  </p>
                </div>

                <div style="display: flex; align-items: center; gap: 6px;">
                  <button type="button" id="btnRestaurarPerguntasNovaObra" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #475569; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer;">
                    Padrão BB
                  </button>
                  <button type="button" id="btnAddPerguntaNovaObra" style="background: #002D62; color: #FED304; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                    + Nova Pergunta
                  </button>
                </div>
              </div>

              <div id="containerPerguntasNovaObra" style="display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; padding-right: 4px;"></div>
            </div>
          </div>

          <footer class="bb-modal-footer" style="padding: 14px 22px; justify-content: space-between; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
            <button type="button" class="btn-modal-cancel" id="btnCancelNovaObra" style="padding: 9px 18px; font-size: 13px; font-weight: 600;">
              Cancelar
            </button>
            <button type="submit" class="btn-modal-confirm" id="btnSubmitNovaObra" style="background: #002D62; color: #FFFFFF; padding: 9px 24px; font-size: 13px; font-weight: 700; border-radius: 6px;">
              <span>Salvar e Cadastrar Obra</span>
            </button>
          </footer>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const closeHandler = () => this.close();
    overlay.querySelector('#btnCloseNovaObraModal').addEventListener('click', closeHandler);
    overlay.querySelector('#btnCancelNovaObra').addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    const txtEmailEmpreiteira = overlay.querySelector('#txtEmailEmpreiteira');
    const txtResponsavel = overlay.querySelector('#txtResponsavelObra');

    const sincronizarResponsavelPorEmail = () => {
      const emailDigitado = (txtEmailEmpreiteira?.value || '').trim().toLowerCase();
      const match = listaEmpreiteiras.find(e => String(e.email || '').toLowerCase() === emailDigitado);
      if (match && match.nome && !txtResponsavel.value.trim()) {
        txtResponsavel.value = match.nome;
      }
    };

    txtEmailEmpreiteira?.addEventListener('change', sincronizarResponsavelPorEmail);
    txtEmailEmpreiteira?.addEventListener('blur', sincronizarResponsavelPorEmail);

    overlay.querySelectorAll('.btn-pick-emp-email').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email') || '';
        const nomeEmp = btn.getAttribute('data-nome') || '';
        if (txtEmailEmpreiteira) txtEmailEmpreiteira.value = email;
        if (nomeEmp) txtResponsavel.value = nomeEmp;
      });
    });

    const renderPerguntasList = () => {
      const container = overlay.querySelector('#containerPerguntasNovaObra');
      const badgeCount = overlay.querySelector('#badgePerguntasNovaObraCount');
      if (badgeCount) badgeCount.textContent = `${perguntasObra.length} pergunta${perguntasObra.length !== 1 ? 's' : ''}`;
      if (!container) return;

      container.innerHTML = perguntasObra.map((p, idx) => {
        const tipoLabel = p.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : (p.tipo === 'caixa' ? 'Caixas de Seleção' : 'Texto Descritivo');
        return `
          <div class="pergunta-item-card" data-idx="${idx}" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="background: #002D62; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 4px;">#${idx + 1}</span>
                <span style="font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;">${tipoLabel}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button type="button" class="btn-editar-pergunta-obra" data-idx="${idx}" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #002D62; padding: 3px 9px; border-radius: 5px; font-size: 11.5px; font-weight: 600; cursor: pointer;">Editar</button>
                <button type="button" class="btn-remover-pergunta-obra" data-idx="${idx}" style="background: #FEE2E2; border: 1px solid #FECACA; color: #DC2626; padding: 3px 8px; border-radius: 5px; font-size: 11.5px; font-weight: 600; cursor: pointer;">Excluir</button>
              </div>
            </div>
            <div style="font-size: 12.5px; font-weight: 700; color: #0F172A; line-height: 1.3;">${escapeHtml(p.titulo)}</div>
            ${p.subtitulo ? `<div style="font-size: 11.5px; color: #64748B;">${escapeHtml(p.subtitulo)}</div>` : ''}
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-editar-pergunta-obra').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.openEditarPerguntaModal({
            pergunta: perguntasObra[idx],
            index: idx,
            onSave: (perguntaEditada) => {
              perguntasObra[idx] = perguntaEditada;
              renderPerguntasList();
            },
          });
        });
      });

      container.querySelectorAll('.btn-remover-pergunta-obra').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (perguntasObra.length <= 1) {
            toast.warning('Mínimo Obrigatório', 'O checklist da obra deve possuir ao menos 1 pergunta técnica.');
            return;
          }
          this.openConfirmDialog({
            title: 'Remover Pergunta',
            message: `Deseja remover a pergunta #${idx + 1} do checklist desta obra?`,
            confirmLabel: 'Remover',
            danger: true,
            onConfirm: () => {
              perguntasObra.splice(idx, 1);
              perguntasObra.forEach((p, i) => { p.numero = i + 1; });
              renderPerguntasList();
            },
          });
        });
      });
    };

    renderPerguntasList();

    overlay.querySelector('#btnAddPerguntaNovaObra')?.addEventListener('click', () => {
      this.openEditarPerguntaModal({
        pergunta: null,
        index: perguntasObra.length,
        onSave: (novaPergunta) => {
          novaPergunta.numero = perguntasObra.length + 1;
          perguntasObra.push(novaPergunta);
          renderPerguntasList();
        },
      });
    });

    overlay.querySelector('#btnRestaurarPerguntasNovaObra')?.addEventListener('click', () => {
      this.openConfirmDialog({
        title: 'Restaurar Padrão',
        message: 'Deseja restaurar as perguntas para o modelo oficial padrão?',
        confirmLabel: 'Restaurar',
        onConfirm: () => {
          perguntasObra = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
          renderPerguntasList();
          toast.info('Padrão Restaurado', 'As perguntas foram redefinidas para o modelo oficial.');
        },
      });
    });

    const form = overlay.querySelector('#formNovaObra');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = overlay.querySelector('#txtNomeObra').value.trim();
      const endereco = overlay.querySelector('#txtEnderecoObra').value.trim();
      const tipo = overlay.querySelector('#selTipoObra').value;
      const responsavel = txtResponsavel.value.trim();
      const empreiteira_email = (txtEmailEmpreiteira?.value || '').trim().toLowerCase();
      const empMatch = listaEmpreiteiras.find(emp => String(emp.email || '').toLowerCase() === empreiteira_email);
      const empreiteira_id = empMatch ? empMatch.id : null;
      const status = overlay.querySelector('#selStatusInicial').value;

      if (!nome || !endereco) {
        toast.warning('Campos Obrigatórios', 'Preencha o nome e o endereço completo da obra.');
        return;
      }

      if (!empreiteira_email) {
        toast.warning('Empreiteira Obrigatória', 'Informe o e-mail do perfil da empreiteira responsável por esta obra.');
        txtEmailEmpreiteira?.focus();
        return;
      }

      if (!perguntasObra || perguntasObra.length === 0) {
        toast.warning('Checklist Vazio', 'Defina ao menos 1 pergunta para o checklist técnico desta obra.');
        return;
      }

      const btnSubmit = overlay.querySelector('#btnSubmitNovaObra');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>Cadastrando...</span>`;

      try {
        if (typeof onSave === 'function') {
          await onSave({
            nome,
            endereco,
            tipo,
            responsavel,
            empreiteira_id,
            empreiteira_email,
            status,
            perguntasChecklist: perguntasObra,
            checklist_perguntas: perguntasObra,
          });
        }
        this.close();
      } catch (err) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Salvar e Cadastrar Obra</span>`;
        toast.error('Erro ao Cadastrar Obra', err.message || 'Falha ao salvar a obra.');
      }
    });
  }

  /**
   * Modal para Editar Obra Existente e Vincular/Alterar Empreiteira (Exclusivo Fiscal)
   */
  openEditarObraModal({ obra, empreiteiras = [], onSave }) {
    this.close();
    if (!obra) return;

    const listaEmpreiteiras = Array.isArray(empreiteiras) ? empreiteiras : [];
    const empAtual = listaEmpreiteiras.find(emp => emp.id === obra.empreiteira_id);
    const emailAtualEmpreiteira = obra.empreiteira_email || empAtual?.email || '';

    const datalistEditarEmpreiteirasHtml = listaEmpreiteiras
      .map(emp => {
        const labelExtra = [emp.nome, emp.empresa].filter(Boolean).join(' — ');
        return `<option value="${escapeHtml(emp.email)}">${escapeHtml(labelExtra)}</option>`;
      })
      .join('');

    const sugestoesEditarEmpHtml = listaEmpreiteiras.length > 0
      ? `<div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px;">
          ${listaEmpreiteiras
            .slice(0, 5)
            .map(
              emp => `<button type="button" class="btn-pick-edit-emp-email" data-email="${escapeHtml(emp.email)}" data-nome="${escapeHtml(emp.nome || '')}" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #002D62; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; cursor: pointer;">${escapeHtml(emp.email)}</button>`
            )
            .join('')}
        </div>`
      : '';

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbEditarObraModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog" style="max-width: 560px; width: 95%;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #FED304; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #FED304; display: flex; align-items: center;">
              ${Icons.penAssinatura(20, '#FED304')}
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">Editar Dados da Obra</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">Atualização cadastral e vínculo de empreiteira</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseEditarObra" title="Fechar">✕</button>
        </header>

        <form id="formEditarObra" style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 120px);">
          <div style="padding: 20px 22px; display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
              <label for="editNomeObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">Nome da Obra / Unidade *</label>
              <input type="text" id="editNomeObra" value="${escapeHtml(obra.nome || '')}" required style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
              <label for="editEnderecoObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">Endereço Completo *</label>
              <input type="text" id="editEnderecoObra" value="${escapeHtml(obra.endereco || '')}" required style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
              <label for="editTipoObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">Tipo de Intervenção</label>
              <input type="text" id="editTipoObra" value="${escapeHtml(obra.tipo || '')}" style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
                <label for="editEmailEmpreiteira" style="font-size: 12.5px; font-weight: 700; color: #002D62;">E-mail da Empreiteira Vinculada <span style="color: #DC2626;">*</span></label>
                <input
                  type="email"
                  id="editEmailEmpreiteira"
                  list="datalistEmpreiteirasEditarObra"
                  value="${escapeHtml(emailAtualEmpreiteira)}"
                  placeholder="Ex.: rodrigo@empreiteira.com"
                  required
                  autocomplete="off"
                  style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; background: #FFFFFF;"
                />
                <datalist id="datalistEmpreiteirasEditarObra">
                  ${datalistEditarEmpreiteirasHtml}
                </datalist>
                ${sugestoesEditarEmpHtml}
              </div>
              <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
                <label for="editResponsavelObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">Responsável Técnico</label>
                <input type="text" id="editResponsavelObra" value="${escapeHtml(obra.responsavel || '')}" style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px;" />
              </div>
            </div>

            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
              <label for="editStatusObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">Status da Obra</label>
              <select id="editStatusObra" style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: #FFFFFF;">
                <option value="REGULAR" ${obra.status === 'REGULAR' ? 'selected' : ''}>REGULAR</option>
                <option value="EM_ANDAMENTO" ${obra.status === 'EM_ANDAMENTO' ? 'selected' : ''}>EM_ANDAMENTO</option>
                <option value="PENDENTE_AJUSTE" ${obra.status === 'PENDENTE_AJUSTE' ? 'selected' : ''}>PENDENTE_AJUSTE</option>
                <option value="CONCLUIDO" ${obra.status === 'CONCLUIDO' ? 'selected' : ''}>CONCLUIDO</option>
              </select>
            </div>
          </div>

          <footer class="bb-modal-footer" style="padding: 14px 22px; justify-content: flex-end; gap: 10px; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
            <button type="button" class="btn-modal-cancel" id="btnCancelEditarObra">Cancelar</button>
            <button type="submit" class="btn-modal-confirm" id="btnSalvarEditarObra" style="background: #002D62; color: #FFFFFF; padding: 9px 22px; font-size: 13px; font-weight: 700; border-radius: 6px;">Salvar Alterações</button>
          </footer>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const closeHandler = () => this.close();
    overlay.querySelector('#btnCloseEditarObra').addEventListener('click', closeHandler);
    overlay.querySelector('#btnCancelEditarObra').addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    const editEmailEmp = overlay.querySelector('#editEmailEmpreiteira');
    const txtResp = overlay.querySelector('#editResponsavelObra');

    const sincronizarEditResp = () => {
      const emailDigitado = (editEmailEmp?.value || '').trim().toLowerCase();
      const match = listaEmpreiteiras.find(e => String(e.email || '').toLowerCase() === emailDigitado);
      if (match && match.nome && (!txtResp.value.trim() || txtResp.value.trim() === 'A definir')) {
        txtResp.value = match.nome;
      }
    };

    editEmailEmp?.addEventListener('change', sincronizarEditResp);
    editEmailEmp?.addEventListener('blur', sincronizarEditResp);

    overlay.querySelectorAll('.btn-pick-edit-emp-email').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email') || '';
        const nomeEmp = btn.getAttribute('data-nome') || '';
        if (editEmailEmp) editEmailEmp.value = email;
        if (nomeEmp) txtResp.value = nomeEmp;
      });
    });

    overlay.querySelector('#formEditarObra').addEventListener('submit', async (e) => {
      e.preventDefault();
      const empreiteira_email = (editEmailEmp?.value || '').trim().toLowerCase();
      if (!empreiteira_email) {
        toast.warning('Empreiteira Obrigatória', 'Informe o e-mail do perfil da empreiteira vinculada.');
        editEmailEmp?.focus();
        return;
      }
      const empMatch = listaEmpreiteiras.find(emp => String(emp.email || '').toLowerCase() === empreiteira_email);
      const empreiteira_id = empMatch ? empMatch.id : null;

      const btn = overlay.querySelector('#btnSalvarEditarObra');
      btn.disabled = true;
      btn.textContent = 'Salvando...';
      try {
        if (typeof onSave === 'function') {
          await onSave({
            nome: overlay.querySelector('#editNomeObra').value.trim(),
            endereco: overlay.querySelector('#editEnderecoObra').value.trim(),
            tipo: overlay.querySelector('#editTipoObra').value.trim(),
            responsavel: txtResp.value.trim(),
            empreiteira_id,
            empreiteira_email,
            status: overlay.querySelector('#editStatusObra').value,
          });
        }
        this.close();
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Salvar Alterações';
        toast.error('Erro ao Atualizar Obra', err.message || 'Não foi possível salvar.');
      }
    });
  }

  /**
   * Gerenciador Central de Perguntas do Checklist (Template oficial ou Obra específica)
   */
  openGerenciadorPerguntasModal({ fiscalUser, obra = null, onSave = null }) {
    this.close();

    const isObra = Boolean(obra);
    const tituloModal = isObra ? `Checklist Técnico: ${obra.nome}` : 'Modelo Oficial de Checklist';
    const subtituloModal = isObra
      ? 'Perguntas configuradas exclusivamente para vistorias desta obra'
      : 'Template padrão aplicado ao cadastrar novas obras';

    let perguntas = isObra
      ? state.getPerguntasParaObra(obra.id)
      : JSON.parse(JSON.stringify(state.checklistTemplate || PERGUNTAS_PADRAO_BB));

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbGerenciadorPerguntasModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-gerenciador-perguntas-dialog" style="max-width: 680px; width: 95%;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #FED304; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #FED304; display: flex; align-items: center;">
              ${Icons.checklistBb(22, '#FED304')}
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">${escapeHtml(tituloModal)}</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">${escapeHtml(subtituloModal)}</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseGerenciadorPerguntas" title="Fechar">✕</button>
        </header>

        <div style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 140px); padding: 18px 22px; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12.5px; font-weight: 700; color: #002D62;">Itens de Vistoria:</span>
              <span id="badgeGerenciadorCount" style="background: #002D62; color: #FED304; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
                ${perguntas.length} perguntas
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" id="btnRestaurarGerenciador" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #475569; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer;">
                Padrão BB
              </button>
              <button type="button" id="btnAddPerguntaGerenciador" style="background: #002D62; color: #FED304; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer;">
                + Nova Pergunta
              </button>
            </div>
          </div>

          <div id="containerListaGerenciadorPerguntas" style="display: flex; flex-direction: column; gap: 10px;"></div>
        </div>

        <footer class="bb-modal-footer" style="padding: 14px 22px; justify-content: space-between; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
          <button type="button" class="btn-modal-cancel" id="btnFecharGerenciador" style="padding: 9px 18px; font-size: 13px; font-weight: 600;">
            Cancelar
          </button>
          <button type="button" class="btn-modal-confirm" id="btnSalvarGerenciador" style="background: #002D62; color: #FFFFFF; padding: 9px 24px; font-size: 13px; font-weight: 700; border-radius: 6px; cursor: pointer;">
            <span>Salvar Checklist ${isObra ? 'da Obra' : 'Oficial'}</span>
          </button>
        </footer>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    const closeHandler = () => this.close();
    overlay.querySelector('#btnCloseGerenciadorPerguntas').addEventListener('click', closeHandler);
    overlay.querySelector('#btnFecharGerenciador').addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    const renderListaGerenciador = () => {
      const container = overlay.querySelector('#containerListaGerenciadorPerguntas');
      const badgeCount = overlay.querySelector('#badgeGerenciadorCount');
      if (badgeCount) badgeCount.textContent = `${perguntas.length} pergunta${perguntas.length !== 1 ? 's' : ''}`;
      if (!container) return;

      container.innerHTML = perguntas.map((p, idx) => {
        const tipoLabel = p.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : (p.tipo === 'caixa' ? 'Caixas de Seleção' : 'Texto Descritivo');
        return `
          <div class="pergunta-item-card" data-idx="${idx}" style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="background: #002D62; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">#${idx + 1}</span>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;">${tipoLabel}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button type="button" class="btn-mover-pergunta" data-idx="${idx}" data-dir="up" ${idx === 0 ? 'disabled' : ''} style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 3px 6px; border-radius: 4px; font-size: 11px; cursor: ${idx === 0 ? 'not-allowed' : 'pointer'}; opacity: ${idx === 0 ? '0.4' : '1'};">▲</button>
                <button type="button" class="btn-mover-pergunta" data-idx="${idx}" data-dir="down" ${idx === perguntas.length - 1 ? 'disabled' : ''} style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 3px 6px; border-radius: 4px; font-size: 11px; cursor: ${idx === perguntas.length - 1 ? 'not-allowed' : 'pointer'}; opacity: ${idx === perguntas.length - 1 ? '0.4' : '1'};">▼</button>
                <button type="button" class="btn-editar-gerenciador" data-idx="${idx}" style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; padding: 3px 9px; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer;">Editar</button>
                <button type="button" class="btn-remover-gerenciador" data-idx="${idx}" style="background: #FEE2E2; border: 1px solid #FECACA; color: #DC2626; padding: 3px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer;">Excluir</button>
              </div>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0F172A;">${escapeHtml(p.titulo)}</div>
            ${p.subtitulo ? `<div style="font-size: 11.5px; color: #64748B;">${escapeHtml(p.subtitulo)}</div>` : ''}
          </div>
        `;
      }).join('');

      container.querySelectorAll('.btn-mover-pergunta').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const dir = btn.getAttribute('data-dir');
          if (dir === 'up' && idx > 0) {
            [perguntas[idx], perguntas[idx - 1]] = [perguntas[idx - 1], perguntas[idx]];
          } else if (dir === 'down' && idx < perguntas.length - 1) {
            [perguntas[idx], perguntas[idx + 1]] = [perguntas[idx + 1], perguntas[idx]];
          }
          perguntas.forEach((p, i) => { p.numero = i + 1; });
          renderListaGerenciador();
        });
      });

      container.querySelectorAll('.btn-editar-gerenciador').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.openEditarPerguntaModal({
            pergunta: perguntas[idx],
            index: idx,
            onSave: (perguntaEditada) => {
              perguntas[idx] = perguntaEditada;
              renderListaGerenciador();
            },
          });
        });
      });

      container.querySelectorAll('.btn-remover-gerenciador').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (perguntas.length <= 1) {
            toast.warning('Mínimo Obrigatório', 'O checklist deve conter ao menos 1 pergunta técnica.');
            return;
          }
          this.openConfirmDialog({
            title: 'Remover Pergunta',
            message: `Deseja remover a pergunta #${idx + 1}?`,
            confirmLabel: 'Remover',
            danger: true,
            onConfirm: () => {
              perguntas.splice(idx, 1);
              perguntas.forEach((p, i) => { p.numero = i + 1; });
              renderListaGerenciador();
            },
          });
        });
      });
    };

    renderListaGerenciador();

    overlay.querySelector('#btnAddPerguntaGerenciador')?.addEventListener('click', () => {
      this.openEditarPerguntaModal({
        pergunta: null,
        index: perguntas.length,
        onSave: (novaPergunta) => {
          novaPergunta.numero = perguntas.length + 1;
          perguntas.push(novaPergunta);
          renderListaGerenciador();
        },
      });
    });

    overlay.querySelector('#btnRestaurarGerenciador')?.addEventListener('click', () => {
      this.openConfirmDialog({
        title: 'Restaurar Padrão',
        message: 'Deseja restaurar as perguntas para o modelo oficial padrão?',
        confirmLabel: 'Restaurar',
        onConfirm: () => {
          perguntas = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
          renderListaGerenciador();
          toast.info('Padrão Restaurado', 'Checklist redefinido para o modelo oficial.');
        },
      });
    });

    const btnSalvar = overlay.querySelector('#btnSalvarGerenciador');
    btnSalvar?.addEventListener('click', async () => {
      btnSalvar.disabled = true;
      btnSalvar.innerHTML = `<span>Salvando...</span>`;
      try {
        if (isObra) {
          await state.salvarChecklistObra(obra.id, perguntas);
          toast.success('Checklist Atualizado', `Perguntas da obra "${obra.nome}" foram salvas.`);
        } else {
          await state.salvarChecklistTemplate(perguntas);
          toast.success('Modelo Atualizado', 'Modelo padrão de checklist atualizado.');
        }
        if (typeof onSave === 'function') onSave(perguntas);
        this.close();
      } catch (err) {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = `<span>Salvar Checklist</span>`;
        toast.error('Erro ao Salvar', err.message || 'Falha ao salvar checklist.');
      }
    });
  }

  close() {
    this.closeSubModal();
    if (this.activeModal && this.activeModal.parentNode) {
      this.activeModal.parentNode.removeChild(this.activeModal);
    }
    this.activeModal = null;
  }
}

export const modal = new BBVisionModal();
