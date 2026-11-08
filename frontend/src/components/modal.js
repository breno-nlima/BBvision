/**
 * BBVision - Modal Corporativo & Visualizador de PDF Oficial
 * Permite exibição de documentos com Fé Pública e diálogos de parecer técnico
 */

import { Icons } from '../assets/icons.js';
import { state, PERGUNTAS_PADRAO_BB } from '../services/state.js';
import { toast } from './toast.js';

class BBVisionModal {
  constructor() {
    this.activeModal = null;
    this.secondaryModal = null;
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
            <span class="bb-stamp-icon" style="display:inline-flex; align-items:center;">${Icons.shieldFePublica(26)}</span>
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
            <a href="${pdfUrl}" target="_blank" download="BBVision_${codigo || 'Relatorio'}.pdf" class="btn-modal-action btn-download" title="Baixar PDF Oficial" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.downloadFile(15)} Baixar PDF
            </a>
            <a href="${pdfUrl}" target="_blank" class="btn-modal-action btn-open-external" title="Abrir em Nova Aba" style="display:inline-flex; align-items:center; gap:5px;">
              ${Icons.externalOpen(15)} Abrir Aba
            </a>
          </div>
        </div>

        <div class="bb-modal-pdf-container">
          <iframe src="${pdfUrl}#toolbar=1" class="bb-pdf-iframe" title="Visualizador de PDF BBVision"></iframe>
        </div>

        <footer class="bb-modal-footer">
          <span class="bb-security-seal" style="display:inline-flex; align-items:center; gap:6px;">${Icons.lockInviolavel(16)} Documento inviolável com carimbo temporal ICP-Brasil / Banco do Brasil S.A.</span>
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
            <span class="bb-stamp-icon" style="display:inline-flex; align-items:center;">${Icons.gavelAuditoria(26)}</span>
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
                <strong style="display:inline-flex; align-items:center; gap:6px;">${Icons.checkVerified(16)} Aprovar Vistoria (Obra REGULAR)</strong>
                <span>Todos os itens do checklist e fotos atendem aos requisitos do Banco do Brasil.</span>
              </div>
            </label>

            <label class="parecer-option" id="optReprovar">
              <input type="radio" name="decisaoFiscal" value="REPROVADO" />
              <div class="opt-body">
                <strong style="display:inline-flex; align-items:center; gap:6px;">${Icons.warningAlert(16)} Solicitar Ajuste Técnico (PENDENTE_AJUSTE)</strong>
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

  /**
   * Abre diálogo profissional de confirmação de encerramento de sessão (Log-out)
   */
  confirmLogout({ user, onConfirm }) {
    this.close();

    const userName = user?.nome || 'Usuário Autenticado';
    const isFiscal = user?.cargo === 'fiscal';
    const cargoLabel = isFiscal ? 'Fiscalização e Engenharia BB' : 'Empreiteira de Campo & Vistorias';
    const avatarUrl = user?.avatar || (isFiscal
      ? 'src/assets/icons/perfil_bb.png'
      : 'src/assets/icons/perfil_obras.png');

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbLogoutModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-logout-dialog" style="max-width: 480px;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #EF4444; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #F87171; display: flex; align-items: center;">
              ${Icons.logOut ? Icons.logOut(24, '#F87171') : '🚪'}
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">Encerrar Sessão do BBVision</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">Desconexão segura de usuário corporativo</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseLogoutModal" title="Fechar">✕</button>
        </header>

        <div style="padding: 22px 20px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Card de identificação do usuário logado -->
          <div style="display: flex; align-items: center; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
            <img 
              src="${avatarUrl}" 
              alt="${userName}" 
              style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid ${isFiscal ? '#93C5FD' : '#FED304'};"
            />
            <div style="display: flex; flex-direction: column;">
              <strong style="color: #0F172A; font-size: 14px; font-weight: 700;">${userName}</strong>
              <span style="color: #002D62; font-size: 12px; font-weight: 600;">${cargoLabel}</span>
              <span style="color: #64748B; font-size: 11px;">${user?.email || 'usuario@bbvision.com.br'}</span>
            </div>
          </div>

          <p style="color: #334155; font-size: 13.5px; line-height: 1.55; margin: 0;">
            Tem certeza de que deseja sair da sua conta? Para voltar a fiscalizar obras, capturar fotos com IA ou homologar laudos, será necessário informar suas credenciais de acesso novamente.
          </p>

          <!-- Aviso de segurança de dados em campo / contingência -->
          <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; padding: 10px 14px; border-radius: 6px; font-size: 12px; color: #065F46; display: flex; align-items: flex-start; gap: 10px; line-height: 1.45;">
            <span style="font-size: 16px;">🛡️</span>
            <span><strong>Garantia de Integridade:</strong> Vistorias concluídas, relatórios bloqueados e dados salvos em contingência offline permanecem preservados com segurança neste dispositivo.</span>
          </div>
        </div>

        <footer class="bb-modal-footer" style="padding: 14px 20px; justify-content: flex-end; gap: 10px; background: #F8FAFC;">
          <button class="btn-modal-cancel" id="btnCancelLogout" style="padding: 9px 18px; font-size: 13px; font-weight: 600;">
            Permanecer Conectado
          </button>
          <button class="btn-modal-confirm" id="btnConfirmLogoutAction" style="background: #DC2626; color: #FFFFFF; padding: 9px 20px; font-size: 13px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);">
            ${Icons.logOut ? Icons.logOut(16, '#FFFFFF') : ''}
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

  /**
   * Fecha o submodal secundário (usado pelo editor de perguntas)
   */
  closeSubModal() {
    if (this.secondaryModal && this.secondaryModal.parentNode) {
      this.secondaryModal.parentNode.removeChild(this.secondaryModal);
    }
    this.secondaryModal = null;
  }

  /**
   * Abre modal para criar ou editar uma pergunta técnica do checklist
   */
  openEditarPerguntaModal({ pergunta = null, index = null, onSave }) {
    this.closeSubModal();

    const isEdit = !!pergunta;
    const initialTitulo = pergunta?.titulo || '';
    const initialSubtitulo = pergunta?.subtitulo || '';
    const initialTipo = pergunta?.tipo || 'multipla_escolha';

    // Clona opções ou usa padrão para tipo
    let localOpcoes = [];
    if (pergunta && Array.isArray(pergunta.opcoes)) {
      localOpcoes = JSON.parse(JSON.stringify(pergunta.opcoes));
    } else if (initialTipo === 'multipla_escolha') {
      localOpcoes = [
        { valor: 'Sim', label: 'Sim (Conforme)', detalhe: 'Atende integralmente aos manuais do Banco do Brasil', tag: 'Conforme', classeTag: 'tag-conforme' },
        { valor: 'Parcial', label: 'Parcial (Ressalva)', detalhe: 'Atendimento parcial com acompanhamento técnico', tag: 'Atenção', classeTag: 'tag-atencao' },
        { valor: 'Não', label: 'Não (Inconforme)', detalhe: 'Não atende aos requisitos mínimos do padrão BB', tag: 'Não Conforme', classeTag: 'tag-erro' }
      ];
    } else if (initialTipo === 'caixa') {
      localOpcoes = [
        { valor: 'Isolamento perimetral e tapumes íntegros', label: 'Isolamento perimetral e tapumes íntegros', detalhe: 'Canteiro devidamente fechado sem brechas' },
        { valor: 'Sinalização visual de perigo ativa', label: 'Sinalização visual de perigo ativa', detalhe: 'Placas e avisos de segurança montados' },
        { valor: 'Uso obrigatório de EPIs completos', label: 'Uso obrigatório de EPIs completos', detalhe: 'Equipe utilizando capacetes e botas' }
      ];
    }

    let localChips = Array.isArray(pergunta?.chipsRapidos) ? [...pergunta.chipsRapidos] : [
      'Alvenaria aprumada e nivelada',
      'Ausência de trincas estruturais',
      'Instalações embutidas conforme projeto BB'
    ];

    const subOverlay = document.createElement('div');
    subOverlay.className = 'bb-modal-overlay fade-in';
    subOverlay.id = 'bbEditarPerguntaModalOverlay';
    subOverlay.style.zIndex = '10050';

    subOverlay.innerHTML = `
      <div class="bb-modal-dialog bb-editar-pergunta-dialog" style="max-width: 580px; width: 95%; box-shadow: 0 25px 60px rgba(0,0,0,0.5);">
        <header class="bb-modal-header" style="background: #002D62; border-bottom: 3px solid #FED304; padding: 14px 18px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="font-size: 20px;">⚙️</span>
            <div>
              <h3 class="bb-modal-title" style="font-size: 15px; color: #FFFFFF;">
                ${isEdit ? `Editar Pergunta ${(index !== null ? '#' + (index + 1) : '')}` : 'Nova Pergunta Técnica do Checklist'}
              </h3>
              <span class="bb-modal-subtitle" style="color: #CBD5E1;">Configuração de item de vistoria técnica do Banco do Brasil</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseSubModal" title="Fechar">✕</button>
        </header>

        <form id="formEditarPergunta" style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 120px); padding: 18px 20px; gap: 14px;">
          <!-- Campo 1: Título / Enunciado -->
          <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
            <label for="txtPerguntaTitulo" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
              Enunciado da Pergunta <span style="color: #DC2626;">*</span>
            </label>
            <input 
              type="text" 
              id="txtPerguntaTitulo" 
              class="form-control-input" 
              placeholder="Ex: A fachada da agência está legível e conforme padrão BB?" 
              value="${initialTitulo.replace(/"/g, '&quot;')}"
              required 
              style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
            />
          </div>

          <!-- Campo 2: Orientações Técnicas / Subtítulo -->
          <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
            <label for="txtPerguntaSubtitulo" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
              Orientações Técnicas ao Vistoriador (Subtítulo explicativo)
            </label>
            <textarea 
              id="txtPerguntaSubtitulo" 
              rows="2" 
              placeholder="Ex: Verifique a visibilidade da marca, totem institucional e desobstrução visual frontal..." 
              style="padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; outline: none; resize: vertical;"
            >${initialSubtitulo}</textarea>
          </div>

          <!-- Campo 3: Tipo de Resposta -->
          <div class="form-group-field" style="display: flex; flex-direction: column; gap: 5px;">
            <label for="selPerguntaTipo" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
              Formato de Resposta no Canteiro de Obras <span style="color: #DC2626;">*</span>
            </label>
            <select 
              id="selPerguntaTipo" 
              class="form-control-input"
              style="padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px; background: #FFFFFF; outline: none;"
            >
              <option value="multipla_escolha" ${initialTipo === 'multipla_escolha' ? 'selected' : ''}>🔘 Múltipla Escolha (Opção única com avaliação de conformidade)</option>
              <option value="caixa" ${initialTipo === 'caixa' ? 'selected' : ''}>☑️ Caixas de Seleção (Múltiplas opções cumulativas de checklist)</option>
              <option value="texto" ${initialTipo === 'texto' ? 'selected' : ''}>📝 Campo de Texto Descritivo (Relato livre com chips sugestivos)</option>
            </select>
          </div>

          <!-- Seção Dinâmica de Opções / Itens -->
          <div id="secaoOpcoesPergunta" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;">
            <!-- Renderizado dinamicamente via JS -->
          </div>

          <div style="background: rgba(0, 45, 98, 0.04); border-left: 3px solid #002D62; padding: 8px 12px; border-radius: 4px; font-size: 11.5px; color: #475569;">
            💡 <strong>Diretriz BB:</strong> Esta pergunta será apresentada diretamente à empreiteira durante o checklist de vistoria in-loco da obra.
          </div>

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
                  <span style="font-size: 12px; color: #64748B; font-weight: 700;">${isMultipla ? '🔘' : '☑️'}</span>
                  <input 
                    type="text" 
                    class="txt-opcao-item" 
                    data-op-idx="${opIdx}" 
                    value="${label.replace(/"/g, '&quot;')}" 
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

        // Eventos das opções
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
              localOpcoes[idx].classeTag = e.target.value === 'Conforme' ? 'tag-conforme' : (e.target.value === 'Atenção' ? 'tag-atencao' : 'tag-erro');
            }
          });
        });

        secaoOpcoes.querySelectorAll('.btn-remove-opcao').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-op-idx'), 10);
            if (localOpcoes.length <= 2) {
              alert('A pergunta deve conter ao menos duas opções de resposta.');
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
            classeTag: 'tag-conforme'
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
        // Tipo Texto
        secaoOpcoes.innerHTML = `
          <label style="font-size: 12px; font-weight: 700; color: #002D62;">
            Sugestões Técnicas Rápidas (Chips para preenchimento ágil no canteiro)
          </label>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="containerChipsTexto">
            ${localChips.map((chip, cIdx) => `
              <span style="font-size: 11px; padding: 4px 8px; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 999px; color: #334155; display: inline-flex; align-items: center; gap: 6px;">
                ${chip}
                <button type="button" class="btn-remove-chip" data-chip-idx="${cIdx}" style="background: none; border: none; color: #DC2626; cursor: pointer; padding: 0; font-size: 11px;">✕</button>
              </span>
            `).join('')}
          </div>
          <div style="display: flex; gap: 6px; margin-top: 4px;">
            <input 
              type="text" 
              id="txtNovoChipInput" 
              placeholder="Digite sugestão técnica (ex: Prumo regular)..." 
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
          { valor: 'Não', label: 'Não (Inconforme)', detalhe: 'Não atende', tag: 'Não Conforme', classeTag: 'tag-erro' }
        ];
      } else if (novoTipo === 'caixa' && (!localOpcoes || localOpcoes.length === 0)) {
        localOpcoes = [
          { valor: 'Item 1 verificado', label: 'Item 1 verificado', detalhe: 'Conforme' },
          { valor: 'Item 2 em conformidade', label: 'Item 2 em conformidade', detalhe: 'Conforme' }
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
        alert('Por favor, informe o enunciado da pergunta.');
        return;
      }

      if ((tipo === 'multipla_escolha' || tipo === 'caixa') && localOpcoes.length < 2) {
        alert('Por favor, informe ao menos 2 opções de resposta.');
        return;
      }

      const tipoLabel = tipo === 'multipla_escolha' ? 'Múltipla Escolha' : (tipo === 'caixa' ? 'Caixas de Seleção' : 'Campo de Texto Descritivo');
      const tipoIcon = tipo === 'multipla_escolha' ? '🔘' : (tipo === 'caixa' ? '☑️' : '📝');
      const chaveResposta = pergunta?.chaveResposta || pergunta?.id || `perg_${Date.now()}`;

      const perguntaEditada = {
        ...(pergunta || {}),
        id: pergunta?.id || `perg_${Date.now()}`,
        numero: index !== null ? index + 1 : (pergunta?.numero || 1),
        tipo,
        tipoLabel,
        tipoIcon,
        titulo,
        subtitulo,
        chaveResposta,
        padrao: tipo === 'multipla_escolha' 
          ? (localOpcoes[0]?.valor || 'Sim') 
          : (tipo === 'caixa' ? [localOpcoes[0]?.valor || 'Item 1'] : 'Execução conforme projeto BB.'),
        opcoes: (tipo === 'multipla_escolha' || tipo === 'caixa') ? localOpcoes : undefined,
        chipsRapidos: tipo === 'texto' ? localChips : undefined,
        placeholder: tipo === 'texto' ? (pergunta?.placeholder || 'Digite observações técnicas...') : undefined
      };

      if (typeof onSave === 'function') {
        onSave(perguntaEditada);
      }

      this.closeSubModal();
    });
  }

  /**
   * Abre formulário corporativo para o Fiscal de Obras cadastrar nova obra
   * Exclusivo para Fiscais de Obra / Engenharia do Banco do Brasil
   * Inclui visualização, edição, adição e remoção de perguntas do checklist desta obra
   */
  openNovaObraModal({ fiscalUser, onSave }) {
    this.close();

    const fiscalNome = fiscalUser?.nome || 'Mariana Vasconcelos';
    const fiscalMatricula = fiscalUser?.registro_profissional || 'Matrícula BB 459812-X';

    // Copia do checklist padrão para customização desta obra
    let perguntasObra = JSON.parse(JSON.stringify(state.checklistTemplate || PERGUNTAS_PADRAO_BB));

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbNovaObraModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-nova-obra-dialog" style="max-width: 640px; width: 95%;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #FED304; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #FED304; display: flex; align-items: center;">
              ${Icons.iconeCadastro(28)}
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">Cadastrar Nova Obra BB</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">Credenciamento, Atribuição e Checklist Técnico • Banco do Brasil S.A.</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseNovaObraModal" title="Fechar">✕</button>
        </header>

        <form id="formNovaObra" style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 130px);">
          <div style="padding: 20px 22px; display: flex; flex-direction: column; gap: 16px;">
            <!-- Badge de fiscal responsável cadastrador -->
            <div style="background: #F1F5F9; border-left: 3px solid #002D62; padding: 10px 14px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #002D62; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.perfilBb(18)} Fiscal Cadastrador(a):
              </span>
              <span style="color: #334155; font-weight: 600;">${fiscalNome} (${fiscalMatricula})</span>
            </div>

            <!-- Campo 1: Nome da Obra / Agência -->
            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="txtNomeObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Nome da Obra / Unidade BB <span style="color: #DC2626;">*</span>
              </label>
              <input 
                type="text" 
                id="txtNomeObra" 
                class="form-control-input" 
                placeholder="Ex: Agência Centro Histórico (Reforma e Modernização)" 
                required 
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none; transition: border-color 0.2s;"
              />
            </div>

            <!-- Campo 2: Tipo de Obra -->
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

            <!-- Campo 3: Endereço Completo -->
            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="txtEnderecoObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Endereço Completo da Unidade <span style="color: #DC2626;">*</span>
              </label>
              <input 
                type="text" 
                id="txtEnderecoObra" 
                class="form-control-input" 
                placeholder="Ex: Av. Rio Branco, 240 - Bairro do Recife, Recife/PE" 
                required 
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
              />
            </div>

            <!-- Campo 4: Empreiteira Designada (1:N) & Responsável -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
                <label for="selEmpreiteira" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                  Empreiteira Designada <span style="color: #DC2626;">*</span>
                </label>
                <select 
                  id="selEmpreiteira" 
                  class="form-control-input"
                  style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: #FFFFFF; outline: none;"
                >
                  <option value="11111111-1111-4111-8111-111111111111" selected>Silva Engenharia (Rodrigo)</option>
                  <option value="33333333-3333-4333-8333-333333333333">Consórcio Construtor Brasil</option>
                  <option value="55555555-5555-4555-8555-555555555555">Aliança Reformas Prediais</option>
                </select>
              </div>

              <!-- Campo 5: Responsável Técnico da Empreiteira -->
              <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
                <label for="txtResponsavelObra" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                  Engenheiro de Campo <span style="color: #DC2626;">*</span>
                </label>
                <input 
                  type="text" 
                  id="txtResponsavelObra" 
                  class="form-control-input" 
                  value="Rodrigo Silva" 
                  required 
                  style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; outline: none;"
                />
              </div>
            </div>

            <!-- Campo 6: Status Inicial -->
            <div class="form-group-field" style="display: flex; flex-direction: column; gap: 6px;">
              <label for="selStatusInicial" style="font-size: 12.5px; font-weight: 700; color: #002D62;">
                Status Inicial no Radar de Fiscalização
              </label>
              <select 
                id="selStatusInicial" 
                class="form-control-input"
                style="padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13.5px; background: #FFFFFF; outline: none;"
              >
                <option value="REGULAR" selected>REGULAR — Aprovada para Vistorias</option>
                <option value="EM_ANDAMENTO">EM_ANDAMENTO — Mobilização Inicial</option>
              </select>
            </div>

            <!-- ============================================================== -->
            <!-- SEÇÃO DE GESTÃO DAS PERGUNTAS DO CHECKLIST DESTA OBRA -->
            <!-- ============================================================== -->
            <div class="form-group-field" style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #002D62; font-size: 13.5px;">📋 Perguntas do Checklist Desta Obra</strong>
                    <span id="badgePerguntasNovaObraCount" style="background: #002D62; color: #FED304; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
                      ${perguntasObra.length} perguntas
                    </span>
                  </div>
                  <p style="font-size: 11.5px; color: #64748B; margin: 3px 0 0 0;">
                    O fiscal de obras pode editar, excluir ou adicionar perguntas que a empreiteira responderá no canteiro.
                  </p>
                </div>

                <div style="display: flex; align-items: center; gap: 6px;">
                  <button type="button" id="btnRestaurarPerguntasNovaObra" title="Restaurar Perguntas Padrão BB" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #475569; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    🔄 Padrão BB
                  </button>
                  <button type="button" id="btnAddPerguntaNovaObra" title="Adicionar Nova Pergunta" style="background: #002D62; color: #FED304; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 1px 4px rgba(0,45,98,0.25);">
                    ➕ Nova Pergunta
                  </button>
                </div>
              </div>

              <!-- Lista Dinâmica de Perguntas -->
              <div id="containerPerguntasNovaObra" style="display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; padding-right: 4px;">
                <!-- Preenchido via renderPerguntasList() -->
              </div>
            </div>

            <!-- Aviso de Governança e Regras de Negócio BB -->
            <div style="background: rgba(0, 45, 98, 0.05); border: 1px dashed rgba(0, 45, 98, 0.25); border-radius: 8px; padding: 10px 14px; font-size: 11.5px; color: #475569; display: flex; gap: 10px; align-items: flex-start;">
              <span style="font-size: 16px;">📌</span>
              <span><strong>Regra de Negócio:</strong> Conforme diretrizes oficiais do BB, a Empreiteira designada receberá esta obra automaticamente em sua lista para vistorias in-loco com o checklist configurado e IA Gemini.</span>
            </div>
          </div>

          <footer class="bb-modal-footer" style="padding: 14px 22px; justify-content: space-between; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
            <button type="button" class="btn-modal-cancel" id="btnCancelNovaObra" style="padding: 9px 18px; font-size: 13px; font-weight: 600;">
              Cancelar
            </button>
            <button type="submit" class="btn-modal-confirm" id="btnSubmitNovaObra" style="background: #002D62; color: #FFFFFF; padding: 9px 24px; font-size: 13px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0, 45, 98, 0.25);">
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

    const selEmpreiteira = overlay.querySelector('#selEmpreiteira');
    const txtResponsavel = overlay.querySelector('#txtResponsavelObra');
    selEmpreiteira.addEventListener('change', () => {
      if (selEmpreiteira.value === '11111111-1111-4111-8111-111111111111') {
        txtResponsavel.value = 'Rodrigo Silva';
      } else if (selEmpreiteira.value === '33333333-3333-4333-8333-333333333333') {
        txtResponsavel.value = 'Carlos Drummond';
      } else {
        txtResponsavel.value = 'Engenheiro Responsável';
      }
    });

    // Função para renderizar a lista de perguntas dentro do modal de Nova Obra
    const renderPerguntasList = () => {
      const container = overlay.querySelector('#containerPerguntasNovaObra');
      const badgeCount = overlay.querySelector('#badgePerguntasNovaObraCount');
      if (badgeCount) badgeCount.textContent = `${perguntasObra.length} pergunta${perguntasObra.length !== 1 ? 's' : ''}`;
      if (!container) return;

      if (perguntasObra.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 20px 12px; background: #FFFFFF; border: 1.5px dashed #CBD5E1; border-radius: 8px; color: #64748B;">
            <span style="font-size: 24px; display: block; margin-bottom: 4px;">📋</span>
            <strong style="font-size: 13px; color: #1E293B;">Nenhuma pergunta configurada</strong>
            <p style="font-size: 11.5px; margin: 4px 0 10px;">Adicione ao menos uma pergunta ou restaure o modelo padrão do Banco do Brasil.</p>
            <button type="button" id="btnRestaurarVazio" style="background: #002D62; color: #FED304; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Restaurar Padrão BB
            </button>
          </div>
        `;
        container.querySelector('#btnRestaurarVazio')?.addEventListener('click', () => {
          perguntasObra = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
          renderPerguntasList();
        });
        return;
      }

      container.innerHTML = perguntasObra.map((p, idx) => {
        const tipoLabel = p.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : (p.tipo === 'caixa' ? 'Caixas de Seleção' : 'Texto Descritivo');
        const tipoIcon = p.tipo === 'multipla_escolha' ? '🔘' : (p.tipo === 'caixa' ? '☑️' : '📝');
        const tipoTagStyle = p.tipo === 'multipla_escolha' 
          ? 'background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;' 
          : (p.tipo === 'caixa' ? 'background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0;' : 'background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;');

        let opcoesResumo = '';
        if (Array.isArray(p.opcoes) && p.opcoes.length > 0) {
          opcoesResumo = `
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">
              ${p.opcoes.map(op => {
                const label = typeof op === 'string' ? op : (op.label || op.valor || '');
                return `<span style="font-size: 10.5px; padding: 2px 7px; background: #F1F5F9; border-radius: 4px; color: #475569;">${label}</span>`;
              }).join('')}
            </div>
          `;
        } else if (p.tipo === 'texto') {
          opcoesResumo = `<span style="font-size: 11px; color: #64748B; font-style: italic; margin-top: 2px; display: block;">Campo de texto com observações técnicas e chips rápidos</span>`;
        }

        return `
          <div class="pergunta-item-card" data-idx="${idx}" style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="background: #002D62; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 4px;">#${idx + 1}</span>
                <span style="font-size: 10.5px; font-weight: 700; padding: 2px 7px; border-radius: 999px; ${tipoTagStyle}">${tipoIcon} ${tipoLabel}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <button type="button" class="btn-editar-pergunta-obra" data-idx="${idx}" title="Editar Pergunta" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #002D62; padding: 3px 8px; border-radius: 5px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                  ✏️ Editar
                </button>
                <button type="button" class="btn-remover-pergunta-obra" data-idx="${idx}" title="Remover Pergunta" style="background: #FEE2E2; border: 1px solid #FECACA; color: #DC2626; padding: 3px 7px; border-radius: 5px; font-size: 11.5px; font-weight: 600; cursor: pointer;">
                  🗑️
                </button>
              </div>
            </div>

            <div style="font-size: 12.5px; font-weight: 700; color: #0F172A; line-height: 1.3;">
              ${p.titulo}
            </div>

            ${p.subtitulo ? `
              <div style="font-size: 11.5px; color: #64748B; line-height: 1.25;">
                ${p.subtitulo}
              </div>
            ` : ''}

            ${opcoesResumo}
          </div>
        `;
      }).join('');

      // Wire up botões de editar pergunta
      container.querySelectorAll('.btn-editar-pergunta-obra').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.openEditarPerguntaModal({
            pergunta: perguntasObra[idx],
            index: idx,
            onSave: (perguntaEditada) => {
              perguntasObra[idx] = perguntaEditada;
              renderPerguntasList();
            }
          });
        });
      });

      // Wire up botões de remover pergunta
      container.querySelectorAll('.btn-remover-pergunta-obra').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (perguntasObra.length <= 1) {
            alert('O checklist da obra deve possuir ao menos 1 pergunta técnica.');
            return;
          }
          if (confirm(`Deseja remover a pergunta #${idx + 1} do checklist desta obra?`)) {
            perguntasObra.splice(idx, 1);
            perguntasObra.forEach((p, i) => p.numero = i + 1);
            renderPerguntasList();
          }
        });
      });
    };

    renderPerguntasList();

    // Botão Adicionar Pergunta
    const btnAddPergunta = overlay.querySelector('#btnAddPerguntaNovaObra');
    if (btnAddPergunta) {
      btnAddPergunta.addEventListener('click', () => {
        this.openEditarPerguntaModal({
          pergunta: null,
          index: perguntasObra.length,
          onSave: (novaPergunta) => {
            novaPergunta.numero = perguntasObra.length + 1;
            perguntasObra.push(novaPergunta);
            renderPerguntasList();
          }
        });
      });
    }

    // Botão Restaurar Padrão BB
    const btnRestaurar = overlay.querySelector('#btnRestaurarPerguntasNovaObra');
    if (btnRestaurar) {
      btnRestaurar.addEventListener('click', () => {
        if (confirm('Deseja restaurar as perguntas para o modelo oficial padrão do Banco do Brasil?')) {
          perguntasObra = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
          renderPerguntasList();
          toast.info('Padrão Restaurado', 'As perguntas do checklist foram redefinidas para o modelo oficial do Banco do Brasil.');
        }
      });
    }

    const form = overlay.querySelector('#formNovaObra');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = overlay.querySelector('#txtNomeObra').value.trim();
      const endereco = overlay.querySelector('#txtEnderecoObra').value.trim();
      const tipo = overlay.querySelector('#selTipoObra').value;
      const responsavel = txtResponsavel.value.trim() || 'Rodrigo Silva';
      const empreiteira_id = selEmpreiteira.value;
      const status = overlay.querySelector('#selStatusInicial').value;

      if (!nome || !endereco) {
        alert('Por favor, preencha o nome e o endereço completo da obra.');
        return;
      }

      if (!perguntasObra || perguntasObra.length === 0) {
        alert('Por favor, defina ao menos 1 pergunta para o checklist técnico desta obra.');
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
            status,
            perguntasChecklist: perguntasObra,
            checklist_perguntas: perguntasObra
          });
        }
        this.close();
      } catch (err) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Salvar e Cadastrar Obra</span>`;
        alert(`Erro ao cadastrar obra: ${err.message}`);
      }
    });
  }

  /**
   * Abre o Gerenciador Central de Perguntas do Checklist
   * Permite ao Fiscal Mariana visualizar, editar, reordenar, adicionar e excluir perguntas
   * Pode operar sobre o template oficial BB ou sobre uma obra específica
   */
  openGerenciadorPerguntasModal({ fiscalUser, obra = null, onSave = null }) {
    this.close();

    const isObra = !!obra;
    const tituloModal = isObra ? `Checklist Técnico: ${obra.nome}` : 'Modelo Oficial de Checklist do Banco do Brasil';
    const subtituloModal = isObra 
      ? 'Perguntas configuradas exclusivamente para vistorias desta obra' 
      : 'Template corporativo padrão para novos canteiros de obras';

    let perguntas = [];
    if (isObra) {
      perguntas = state.getPerguntasParaObra(obra.id);
    } else {
      perguntas = JSON.parse(JSON.stringify(state.checklistTemplate || PERGUNTAS_PADRAO_BB));
    }

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbGerenciadorPerguntasModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-gerenciador-perguntas-dialog" style="max-width: 680px; width: 95%;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #FED304; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #FED304; display: flex; align-items: center; font-size: 22px;">
              📋
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">${tituloModal}</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">${subtituloModal}</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseGerenciadorPerguntas" title="Fechar">✕</button>
        </header>

        <div style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 140px); padding: 18px 22px; gap: 14px;">
          
          <!-- Barra de Ações do Gerenciador -->
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12.5px; font-weight: 700; color: #002D62;">Itens de Vistoria:</span>
              <span id="badgeGerenciadorCount" style="background: #002D62; color: #FED304; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px;">
                ${perguntas.length} perguntas
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <button type="button" id="btnRestaurarGerenciador" style="background: #FFFFFF; border: 1px solid #CBD5E1; color: #475569; padding: 6px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                🔄 Padrão BB
              </button>
              <button type="button" id="btnAddPerguntaGerenciador" style="background: #002D62; color: #FED304; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 1px 4px rgba(0,45,98,0.25);">
                ➕ Nova Pergunta
              </button>
            </div>
          </div>

          <!-- Container da Lista de Perguntas -->
          <div id="containerListaGerenciadorPerguntas" style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Renderizado dinamicamente -->
          </div>

          <!-- Aviso de Governança -->
          <div style="background: rgba(0, 45, 98, 0.04); border-left: 3px solid #002D62; padding: 10px 12px; border-radius: 4px; font-size: 11.5px; color: #475569;">
            🔒 <strong>Acesso Exclusivo Fiscal BB:</strong> Alterações nas perguntas passarão a vigorar imediatamente nas vistorias técnicas executadas pelas empreiteiras no aplicativo móvel.
          </div>
        </div>

        <footer class="bb-modal-footer" style="padding: 14px 22px; justify-content: space-between; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
          <button type="button" class="btn-modal-cancel" id="btnFecharGerenciador" style="padding: 9px 18px; font-size: 13px; font-weight: 600;">
            Cancelar
          </button>
          <button type="button" class="btn-modal-confirm" id="btnSalvarGerenciador" style="background: #002D62; color: #FFFFFF; padding: 9px 24px; font-size: 13px; font-weight: 700; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0, 45, 98, 0.25); cursor: pointer;">
            <span>Salvar Checklist ${isObra ? 'da Obra' : 'Oficial BB'}</span>
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

      if (perguntas.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 28px 16px; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 8px; color: #64748B;">
            <span style="font-size: 28px; display: block; margin-bottom: 6px;">📋</span>
            <strong style="font-size: 13.5px; color: #1E293B;">Nenhuma pergunta cadastrada</strong>
            <p style="font-size: 12px; margin: 4px 0 12px;">Adicione ao menos uma pergunta ou restaure o modelo padrão do Banco do Brasil.</p>
            <button type="button" id="btnRestaurarVazioGerenciador" style="background: #002D62; color: #FED304; border: none; padding: 7px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer;">
              Restaurar Padrão BB
            </button>
          </div>
        `;
        container.querySelector('#btnRestaurarVazioGerenciador')?.addEventListener('click', () => {
          perguntas = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
          renderListaGerenciador();
        });
        return;
      }

      container.innerHTML = perguntas.map((p, idx) => {
        const tipoLabel = p.tipo === 'multipla_escolha' ? 'Múltipla Escolha' : (p.tipo === 'caixa' ? 'Caixas de Seleção' : 'Texto Descritivo');
        const tipoIcon = p.tipo === 'multipla_escolha' ? '🔘' : (p.tipo === 'caixa' ? '☑️' : '📝');
        const tipoTagStyle = p.tipo === 'multipla_escolha' 
          ? 'background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE;' 
          : (p.tipo === 'caixa' ? 'background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0;' : 'background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;');

        let opcoesResumo = '';
        if (Array.isArray(p.opcoes) && p.opcoes.length > 0) {
          opcoesResumo = `
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px;">
              ${p.opcoes.map(op => {
                const label = typeof op === 'string' ? op : (op.label || op.valor || '');
                return `<span style="font-size: 11px; padding: 2px 8px; background: #F1F5F9; border-radius: 4px; color: #475569;">${label}</span>`;
              }).join('')}
            </div>
          `;
        } else if (p.tipo === 'texto') {
          opcoesResumo = `<span style="font-size: 11.5px; color: #64748B; font-style: italic; margin-top: 4px; display: block;">Campo de texto com observações técnicas e chips rápidos</span>`;
        }

        return `
          <div class="pergunta-item-card" data-idx="${idx}" style="background: #FFFFFF; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span style="background: #002D62; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;">#${idx + 1}</span>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; ${tipoTagStyle}">${tipoIcon} ${tipoLabel}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px;">
                <!-- Botões de mover para cima/baixo -->
                <button type="button" class="btn-mover-pergunta" data-idx="${idx}" data-dir="up" title="Mover para cima" ${idx === 0 ? 'disabled' : ''} style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 3px 6px; border-radius: 4px; font-size: 11px; cursor: ${idx === 0 ? 'not-allowed' : 'pointer'}; opacity: ${idx === 0 ? '0.4' : '1'};">
                  ▲
                </button>
                <button type="button" class="btn-mover-pergunta" data-idx="${idx}" data-dir="down" title="Mover para baixo" ${idx === perguntas.length - 1 ? 'disabled' : ''} style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 3px 6px; border-radius: 4px; font-size: 11px; cursor: ${idx === perguntas.length - 1 ? 'not-allowed' : 'pointer'}; opacity: ${idx === perguntas.length - 1 ? '0.4' : '1'};">
                  ▼
                </button>
                <button type="button" class="btn-editar-gerenciador" data-idx="${idx}" title="Editar Pergunta" style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; padding: 3px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                  ✏️ Editar
                </button>
                <button type="button" class="btn-remover-gerenciador" data-idx="${idx}" title="Remover Pergunta" style="background: #FEE2E2; border: 1px solid #FECACA; color: #DC2626; padding: 3px 7px; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer;">
                  🗑️
                </button>
              </div>
            </div>

            <div style="font-size: 13px; font-weight: 700; color: #0F172A; line-height: 1.35;">
              ${p.titulo}
            </div>

            ${p.subtitulo ? `
              <div style="font-size: 11.5px; color: #64748B; line-height: 1.3;">
                ${p.subtitulo}
              </div>
            ` : ''}

            ${opcoesResumo}
          </div>
        `;
      }).join('');

      // Wire up mover botões
      container.querySelectorAll('.btn-mover-pergunta').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          const dir = btn.getAttribute('data-dir');
          if (dir === 'up' && idx > 0) {
            const temp = perguntas[idx];
            perguntas[idx] = perguntas[idx - 1];
            perguntas[idx - 1] = temp;
          } else if (dir === 'down' && idx < perguntas.length - 1) {
            const temp = perguntas[idx];
            perguntas[idx] = perguntas[idx + 1];
            perguntas[idx + 1] = temp;
          }
          perguntas.forEach((p, i) => p.numero = i + 1);
          renderListaGerenciador();
        });
      });

      // Wire up editar botões
      container.querySelectorAll('.btn-editar-gerenciador').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.openEditarPerguntaModal({
            pergunta: perguntas[idx],
            index: idx,
            onSave: (perguntaEditada) => {
              perguntas[idx] = perguntaEditada;
              renderListaGerenciador();
            }
          });
        });
      });

      // Wire up remover botões
      container.querySelectorAll('.btn-remover-gerenciador').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (perguntas.length <= 1) {
            alert('O checklist deve conter ao menos 1 pergunta técnica.');
            return;
          }
          if (confirm(`Deseja remover a pergunta #${idx + 1}?`)) {
            perguntas.splice(idx, 1);
            perguntas.forEach((p, i) => p.numero = i + 1);
            renderListaGerenciador();
          }
        });
      });
    };

    renderListaGerenciador();

    // Botão Adicionar Pergunta
    const btnAdd = overlay.querySelector('#btnAddPerguntaGerenciador');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.openEditarPerguntaModal({
          pergunta: null,
          index: perguntas.length,
          onSave: (novaPergunta) => {
            novaPergunta.numero = perguntas.length + 1;
            perguntas.push(novaPergunta);
            renderListaGerenciador();
          }
        });
      });
    }

    // Botão Restaurar Padrão BB
    const btnRestaurar = overlay.querySelector('#btnRestaurarGerenciador');
    if (btnRestaurar) {
      btnRestaurar.addEventListener('click', () => {
        if (confirm('Deseja restaurar as perguntas para o modelo oficial padrão do Banco do Brasil?')) {
          perguntas = JSON.parse(JSON.stringify(PERGUNTAS_PADRAO_BB));
          renderListaGerenciador();
          toast.info('Padrão Restaurado', 'Checklist redefinido para o padrão Banco do Brasil.');
        }
      });
    }

    // Botão Salvar Geral
    const btnSalvar = overlay.querySelector('#btnSalvarGerenciador');
    if (btnSalvar) {
      btnSalvar.addEventListener('click', async () => {
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = `<span>Salvando...</span>`;

        try {
          if (isObra) {
            await state.salvarChecklistObra(obra.id, perguntas);
            toast.success('Checklist Atualizado', `Perguntas da obra "${obra.nome}" foram salvas.`);
          } else {
            await state.salvarChecklistTemplate(perguntas);
            toast.success('Modelo Atualizado', 'Modelo padrão de checklist do Banco do Brasil atualizado.');
          }

          if (typeof onSave === 'function') {
            onSave(perguntas);
          }

          this.close();
        } catch (err) {
          btnSalvar.disabled = false;
          btnSalvar.innerHTML = `<span>Salvar Checklist</span>`;
          alert(`Erro ao salvar checklist: ${err.message}`);
        }
      });
    }
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

