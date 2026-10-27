/**
 * BBVision - Modal Corporativo & Visualizador de PDF Oficial
 * Permite exibição de documentos com Fé Pública e diálogos de parecer técnico
 */

import { Icons } from '../assets/icons.js';

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

  /**
   * Abre diálogo profissional de confirmação de encerramento de sessão (Log-out)
   */
  confirmLogout({ user, onConfirm }) {
    this.close();

    const userName = user?.nome || 'Usuário Autenticado';
    const isFiscal = user?.cargo === 'fiscal';
    const cargoLabel = isFiscal ? 'Fiscalização e Engenharia BB' : 'Empreiteira de Campo & Vistorias';
    const avatarUrl = user?.avatar || (isFiscal
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

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
   * Abre formulário corporativo para o Fiscal de Obras cadastrar nova obra
   * Exclusivo para Fiscais de Obra / Engenharia do Banco do Brasil
   */
  openNovaObraModal({ fiscalUser, onSave }) {
    this.close();

    const fiscalNome = fiscalUser?.nome || 'Mariana Vasconcelos';
    const fiscalMatricula = fiscalUser?.registro_profissional || 'Matrícula BB 459812-X';

    const overlay = document.createElement('div');
    overlay.className = 'bb-modal-overlay fade-in';
    overlay.id = 'bbNovaObraModalOverlay';

    overlay.innerHTML = `
      <div class="bb-modal-dialog bb-nova-obra-dialog" style="max-width: 580px;">
        <header class="bb-modal-header" style="background: #001B3D; border-bottom: 3px solid #FED304; padding: 16px 20px;">
          <div class="bb-modal-header-brand">
            <span class="bb-stamp-icon" style="color: #FED304; display: flex; align-items: center; font-size: 22px;">
              🏛️
            </span>
            <div>
              <h3 class="bb-modal-title" style="color: #FFFFFF; font-size: 16px;">Cadastrar Nova Obra BB</h3>
              <span class="bb-modal-subtitle" style="color: #94A3B8;">Credenciamento e Atribuição de Canteiro • Banco do Brasil S.A.</span>
            </div>
          </div>
          <button class="bb-modal-close-btn" id="btnCloseNovaObraModal" title="Fechar">✕</button>
        </header>

        <form id="formNovaObra" style="display: flex; flex-direction: column; overflow-y: auto; max-height: calc(85vh - 130px);">
          <div style="padding: 20px 22px; display: flex; flex-direction: column; gap: 16px;">
            <!-- Badge de fiscal responsável cadastrador -->
            <div style="background: #F1F5F9; border-left: 3px solid #002D62; padding: 10px 14px; border-radius: 6px; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #002D62; font-weight: 700;">👩‍💼 Fiscal Cadastrador(a):</span>
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

            <!-- Campo 4: Empreiteira Designada (1:N) -->
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

            <!-- Aviso de Governança e Regras de Negócio BB -->
            <div style="background: rgba(0, 45, 98, 0.05); border: 1px dashed rgba(0, 45, 98, 0.25); border-radius: 8px; padding: 10px 14px; font-size: 11.5px; color: #475569; display: flex; gap: 10px; align-items: flex-start;">
              <span style="font-size: 16px;">📌</span>
              <span><strong>Regra de Negócio:</strong> Conforme diretrizes oficiais do BB, a Empreiteira designada receberá esta obra automaticamente em sua lista para vistorias in-loco com fotos invioláveis e IA Gemini.</span>
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
            status
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

  close() {
    if (this.activeModal && this.activeModal.parentNode) {
      this.activeModal.parentNode.removeChild(this.activeModal);
    }
    this.activeModal = null;
  }
}

export const modal = new BBVisionModal();
