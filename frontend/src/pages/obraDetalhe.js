/**
 * BBVision - Tela de Detalhe da Obra
 * Exibe dados reais da unidade, gestão de checklist/edição/exclusão (Fiscal) e início de vistoria (Empreiteira).
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml, NEUTRAL_PHOTO_PLACEHOLDER } from '../utils/formatters.js';

export function renderObraDetalhe() {
  const vistoria = state.currentVistoria;
  const obra = state.selectedObra || {};
  const isFiscal = state.user?.cargo === 'fiscal';
  const perguntasObra = state.getPerguntasParaObra(vistoria.obraId);
  const relatoriosDaObra = state.relatorios.filter(r => r.obraId === vistoria.obraId);
  const fotoReal = vistoria.fotoCamera || vistoria.fotoUrl || '';

  return `
    <div class="page-container fade-in" id="obraDetalhePage">
      <header class="obra-detalhe-topbar">
        <button class="btn-icon-simple-sm" id="btnVoltarObrasDetalhe" title="Voltar para Obras" style="margin-right: 6px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002D62" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="topbar-brand">
          ${Icons.logoBBOficial(34)}
          <h1 class="topbar-title">${escapeHtml(vistoria.obraNome)}</h1>
        </div>
      </header>

      <div class="obra-foto-wrapper">
        ${fotoReal ? `
          <img 
            src="${escapeHtml(fotoReal)}" 
            alt="${escapeHtml(vistoria.obraNome)}" 
            class="obra-hero-img"
            onerror="this.onerror=null; this.src='${NEUTRAL_PHOTO_PLACEHOLDER}';"
          />
        ` : `
          <div class="obra-hero-img" style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:linear-gradient(135deg, #002D62 0%, #001B3D 100%); color:#FFFFFF; gap:8px; padding:24px; text-align:center;">
            ${Icons.iconeObras(42, '#FED304')}
            <strong style="font-size:15px;">${escapeHtml(vistoria.obraNome)}</strong>
            <span style="font-size:12px; color:#CBD5E1;">Aguardando captura fotográfica de vistoria in-loco</span>
          </div>
        `}
        <div class="obra-foto-overlay">
          <div class="meta-tag">Status: ${escapeHtml(obra.status || vistoria.statusObra || 'REGULAR')}</div>
          <div class="meta-tag">Endereço: ${escapeHtml(obra.endereco || vistoria.endereco || 'Não informado')}</div>
        </div>
      </div>

      <div class="obra-detalhes-card">
        <div class="detalhe-item-row">
          <div class="detalhe-text-group">
            <span class="detalhe-label">Responsável Técnico de Campo</span>
            <strong class="detalhe-val">${escapeHtml(obra.responsavel || vistoria.responsavel || 'A definir')}</strong>
            ${vistoria.matricula ? `<span class="detalhe-sub">Registro: ${escapeHtml(vistoria.matricula)}</span>` : ''}
          </div>
        </div>

        <div class="detalhe-divider"></div>

        <div class="detalhe-item-row">
          <div class="detalhe-text-group">
            <span class="detalhe-label">Tipo de Intervenção</span>
            <strong class="detalhe-val">${escapeHtml(obra.tipo || vistoria.etapa || 'Reforma e Adequação')}</strong>
            <span class="detalhe-sub">Vistorias registradas nesta obra: ${relatoriosDaObra.length}</span>
          </div>
        </div>

        ${isFiscal ? `
          <div class="detalhe-divider"></div>
          <div class="detalhe-item-row" id="btnFiscalEditarObra" style="cursor: pointer; background: #FFFFFF; border: 1.5px solid #CBD5E1; padding: 12px 14px; border-radius: 8px; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;">
            <div class="detalhe-text-group">
              <span class="detalhe-label" style="color: #002D62; font-weight: 700;">Dados Cadastrais e Empreiteira</span>
              <span class="detalhe-sub" style="font-size: 11.5px; color: #475569;">Editar nome, endereço, status ou vincular empreiteira responsável</span>
            </div>
            <div class="detalhe-action-icon" style="color: #002D62; display: flex; align-items: center;">
              ${Icons.penAssinatura(18)}
            </div>
          </div>

          <div class="detalhe-item-row" id="btnFiscalEditarChecklistObra" style="cursor: pointer; background: #F8FAFC; border: 1.5px solid #002D62; padding: 12px 14px; border-radius: 8px; margin-top: 8px; display: flex; align-items: center; justify-content: space-between;">
            <div class="detalhe-text-group">
              <span class="detalhe-label" style="color: #002D62; font-weight: 700;">Checklist Técnico Desta Obra</span>
              <strong class="detalhe-val" style="color: #002D62; font-size: 13px;">${perguntasObra.length} perguntas configuradas</strong>
              <span class="detalhe-sub" style="font-size: 11.5px; color: #475569;">Clique para visualizar ou alterar perguntas exclusivas desta unidade</span>
            </div>
            <div class="detalhe-action-icon" style="color: #002D62; display: flex; align-items: center;">
              ${Icons.checklistBb(18)}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="obra-action-footer" style="display:flex; flex-direction:column; gap:10px;">
        ${isFiscal ? `
          <button class="btn-primary-bb-yellow" id="btnAbrirAuditoriaObra">
            Abrir Painel de Auditoria e Parecer (${relatoriosDaObra.length})
          </button>
          ${relatoriosDaObra.length === 0 ? `
            <button type="button" class="btn-secondary-white" id="btnExcluirObraFiscal" style="color:#DC2626; border-color:#FECACA;">
              Excluir Obra Sem Vistorias
            </button>
          ` : ''}
        ` : `
          <button class="btn-primary-bb-yellow" id="btnAtualizarObra">
            Iniciar Vistoria In-Loco
          </button>
        `}
      </div>
    </div>
  `;
}

export function bindObraDetalheEvents() {
  document.getElementById('btnVoltarObrasDetalhe')?.addEventListener('click', () => {
    state.navigate('obras', 'obras');
  });

  document.getElementById('btnAtualizarObra')?.addEventListener('click', () => {
    state.navigate('tipo-local');
  });

  document.getElementById('btnAbrirAuditoriaObra')?.addEventListener('click', () => {
    const relObra = state.relatorios.find(r => r.obraId === state.currentVistoria.obraId);
    if (relObra) {
      state.selecionarRelatorioParaAuditoria(relObra.id);
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
    } else {
      toast.info('Sem Vistorias Ainda', 'Esta obra ainda não recebeu relatórios finalizados pela empreiteira.');
    }
  });

  document.getElementById('btnFiscalEditarObra')?.addEventListener('click', async () => {
    const empreiteiras = await state.carregarEmpreiteiras();
    modal.openEditarObraModal({
      obra: state.selectedObra,
      empreiteiras,
      onSave: async (dados) => {
        await state.editarObra(state.selectedObra.id, dados);
        toast.success('Obra Atualizada', 'Os dados da obra e o vínculo da empreiteira foram salvos.');
      },
    });
  });

  document.getElementById('btnFiscalEditarChecklistObra')?.addEventListener('click', () => {
    modal.openGerenciadorPerguntasModal({
      fiscalUser: state.user,
      obra: state.selectedObra,
    });
  });

  document.getElementById('btnExcluirObraFiscal')?.addEventListener('click', () => {
    if (!state.selectedObra) return;
    modal.openConfirmDialog({
      title: 'Excluir Obra',
      message: `Deseja excluir definitivamente a obra "${state.selectedObra.nome}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sim, Excluir Obra',
      danger: true,
      onConfirm: async () => {
        try {
          await state.excluirObra(state.selectedObra.id);
          toast.success('Obra Excluída', 'A obra foi removida do cadastro.');
          state.navigate('obras', 'obras');
        } catch (err) {
          toast.error('Não Foi Possível Excluir', err.message || 'Erro ao excluir obra.');
        }
      },
    });
  });
}
