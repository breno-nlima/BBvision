/**
 * BBVision - Tela de Detalhe da Obra
 * Exibe dados da unidade, gestão de cadastro/checklist/exclusão (Fiscal) e início de vistoria (Empreiteira).
 */

import { Icons } from '../assets/icons.js?v=2.5';
import { state } from '../services/state.js?v=2.5';
import { modal } from '../components/modal.js?v=2.5';
import { toast } from '../components/toast.js?v=2.5';
import { renderBackButton } from '../components/backButton.js?v=2.5';
import { escapeHtml, NEUTRAL_PHOTO_PLACEHOLDER } from '../utils/formatters.js?v=2.5';

export function renderObraDetalhe() {
  const vistoria = state.currentVistoria;
  const obra = state.selectedObra || {};
  const isFiscal = state.user?.cargo === 'fiscal';
  const perguntasObra = state.getPerguntasParaObra(vistoria.obraId);
  const relatoriosDaObra = state.relatorios.filter(r => r.obraId === vistoria.obraId);
  const fotoReal = vistoria.fotoCamera || vistoria.fotoUrl || '';

  const statusAtual = obra.status || vistoria.statusObra || 'REGULAR';
  const statusChipClass =
    statusAtual === 'REGULAR' || statusAtual === 'CONCLUIDO'
      ? 'concluido'
      : statusAtual === 'PENDENTE_AJUSTE'
      ? 'pendente'
      : 'andamento';
  const statusChipText =
    statusAtual === 'REGULAR'
      ? 'Regular'
      : statusAtual === 'PENDENTE_AJUSTE'
      ? 'Pendente ajuste'
      : statusAtual === 'CONCLUIDO'
      ? 'Concluída'
      : 'Em andamento';

  return `
    <div class="page-container page-narrow fade-in" id="obraDetalhePage">
      <header class="screen-topbar">
        <div class="screen-topbar-left">
          ${renderBackButton({
            id: 'btnVoltarObrasDetalhe',
            label: 'Voltar',
            variant: 'light',
            title: 'Voltar para a tela anterior',
          })}
          <div class="screen-topbar-titles">
            <h1 class="screen-topbar-title">${escapeHtml(vistoria.obraNome)}</h1>
            <span class="screen-topbar-sub">${escapeHtml(obra.endereco || vistoria.endereco || 'Unidade Banco do Brasil')}</span>
          </div>
        </div>
        <span class="status-badge-chip ${statusChipClass}">${statusChipText}</span>
      </header>

      <div class="obra-foto-wrapper">
        ${
          fotoReal
            ? `
          <img
            src="${escapeHtml(fotoReal)}"
            alt="${escapeHtml(vistoria.obraNome)}"
            class="obra-hero-img"
            onerror="this.onerror=null; this.src='${NEUTRAL_PHOTO_PLACEHOLDER}';"
          />
        `
            : `
          <div class="obra-empty-media">
            ${Icons.iconeObras(32, '#002D62')}
            <strong>Sem registro fotográfico ainda</strong>
            <span>A última evidência in-loco aparecerá aqui após a vistoria</span>
          </div>
        `
        }
      </div>

      <div class="obra-detalhes-card">
        <div class="obra-meta-grid">
          <div class="obra-meta-cell">
            <span class="meta-k">Responsável técnico</span>
            <strong class="meta-v">${escapeHtml(obra.responsavel || vistoria.responsavel || 'A definir')}</strong>
            ${vistoria.matricula ? `<span class="meta-sub">${escapeHtml(vistoria.matricula)}</span>` : ''}
          </div>

          <div class="obra-meta-cell">
            <span class="meta-k">Tipo de intervenção</span>
            <strong class="meta-v">${escapeHtml(obra.tipo || vistoria.etapa || 'Reforma e Adequação')}</strong>
            <span class="meta-sub">${relatoriosDaObra.length} ${relatoriosDaObra.length === 1 ? 'vistoria registrada' : 'vistorias registradas'}</span>
          </div>
        </div>
      </div>

      ${
        isFiscal
          ? `
        <div class="obra-manage-list">
          <div class="obra-manage-row" id="btnFiscalEditarObra">
            <div class="detalhe-text-group">
              <span class="detalhe-label">Dados cadastrais e empreiteira</span>
              <span class="detalhe-sub">Editar nome, endereço, status ou vínculo de empreiteira</span>
            </div>
            <div class="detalhe-action-icon" style="color: #002D62; display: flex; align-items: center; gap: 6px;">
              ${Icons.penAssinatura(17)}
              ${Icons.chevronRight(16)}
            </div>
          </div>

          <div class="obra-manage-row" id="btnFiscalEditarChecklistObra">
            <div class="detalhe-text-group">
              <span class="detalhe-label">Checklist técnico da obra</span>
              <span class="detalhe-sub">${perguntasObra.length} perguntas configuradas para esta unidade</span>
            </div>
            <div class="detalhe-action-icon" style="color: #002D62; display: flex; align-items: center; gap: 6px;">
              ${Icons.checklistBb(17)}
              ${Icons.chevronRight(16)}
            </div>
          </div>
        </div>
      `
          : ''
      }

      <div class="obra-action-footer">
        ${
          isFiscal
            ? `
          <button class="btn-primary-bb-yellow" id="btnAbrirAuditoriaObra">
            Abrir Painel de Auditoria (${relatoriosDaObra.length})
          </button>
          ${
            relatoriosDaObra.length === 0
              ? `
            <button type="button" class="btn-secondary-white" id="btnExcluirObraFiscal" style="color:#DC2626; border-color:#FECACA;">
              Excluir Obra Sem Vistorias
            </button>
          `
              : ''
          }
        `
            : `
          <button class="btn-primary-bb-yellow" id="btnAtualizarObra">
            Iniciar Vistoria In-Loco
          </button>
        `
        }
      </div>
    </div>
  `;
}

export function bindObraDetalheEvents() {
  document.getElementById('btnVoltarObrasDetalhe')?.addEventListener('click', () => {
    state.goBack('obras', 'obras');
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
      onSave: async dados => {
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
