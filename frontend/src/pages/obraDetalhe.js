/**
 * BVision - Tela de Detalhe da Obra / Atualizar Obra
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.18.jpeg
 * Conforme Requisitos E1, E2 e HU01 do Documento Oficial de Entrega TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { modal } from '../components/modal.js';

export function renderObraDetalhe() {
  const vistoria = state.currentVistoria;
  const isFiscal = state.user?.cargo === 'fiscal';
  const perguntasObra = state.getPerguntasParaObra(vistoria.obraId);
  const user = state.user || { nome: 'Responsável Técnico', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' };
  const responsavelNome = state.user?.nome || vistoria.responsavel || 'Responsável Técnico';

  return `
    <div class="page-container fade-in" id="obraDetalhePage">
      <!-- Top Bar com Voltar, Logo BB, Título e Avatar do Responsável -->
      <header class="obra-detalhe-topbar">
        <button class="btn-icon-simple-sm" id="btnVoltarObrasDetalhe" title="Voltar para Obras" style="margin-right: 6px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002D62" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="topbar-brand">
          ${Icons.logoBBOficial(34)}
          <h1 class="topbar-title">${vistoria.obraNome}</h1>
        </div>
      </header>

      <!-- Foto da Obra com Overlay de Metadados Criptográficos -->
      <div class="obra-foto-wrapper">
        <img 
          src="${vistoria.fotoCamera || vistoria.fotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=800&auto=format&fit=crop&q=80'}" 
          alt="${vistoria.obraNome}" 
          class="obra-hero-img"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?w=800&auto=format&fit=crop&q=80';"
        />
        <div class="obra-foto-overlay">
          <div class="meta-tag">Data: ${vistoria.dataFoto} às ${vistoria.horaFoto}</div>
          <div class="meta-tag">Localização: ${vistoria.localizacaoFoto}</div>
        </div>
      </div>

      <!-- Card com Informações Cadastrais da Fiscalização -->
      <div class="obra-detalhes-card">
        <div class="detalhe-item-row">
          <div class="detalhe-text-group">
            <span class="detalhe-label">Nome de quem tirou a foto</span>
            <strong class="detalhe-val">${vistoria.responsavel}</strong>
            <span class="detalhe-sub">Matricula: ${vistoria.matricula}</span>
          </div>
          <div class="detalhe-action-icon">
            ${Icons.eye(20)}
          </div>
        </div>

        <div class="detalhe-divider"></div>

        <div class="detalhe-item-row">
          <div class="detalhe-text-group">
            <span class="detalhe-label">Obra: ${vistoria.obraNome}</span>
            <span class="detalhe-sub">Etapa da obra: ${vistoria.etapa}</span>
          </div>
        </div>

        ${isFiscal ? `
          <div class="detalhe-divider"></div>
          <div class="detalhe-item-row" id="btnFiscalEditarChecklistObra" style="cursor: pointer; background: #F8FAFC; border: 1.5px solid #002D62; padding: 12px 14px; border-radius: 8px; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;" title="Clique para gerenciar as perguntas do checklist desta obra">
            <div class="detalhe-text-group">
              <span class="detalhe-label" style="color: #002D62; font-weight: 700;">📋 Checklist Técnico Desta Obra</span>
              <strong class="detalhe-val" style="color: #002D62; font-size: 13px;">${perguntasObra.length} perguntas configuradas</strong>
              <span class="detalhe-sub" style="font-size: 11.5px; color: #475569;">Clique para visualizar ou alterar perguntas exclusivas desta unidade</span>
            </div>
            <div class="detalhe-action-icon" style="color: #002D62; font-size: 18px;">
              ✏️
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Botão Amarelo de Ação Principal -->
      <div class="obra-action-footer">
        <button class="btn-primary-bb-yellow" id="btnAtualizarObra">
          Atualizar obra
        </button>
      </div>
    </div>
  `;
}

export function bindObraDetalheEvents() {
  const btnVoltar = document.getElementById('btnVoltarObrasDetalhe');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('obras');
    });
  }

  const btnAtualizar = document.getElementById('btnAtualizarObra');
  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', () => {
      // Avança para a seleção de Tipo de Local conforme o fluxo oficial
      state.navigate('tipo-local');
    });
  }

  const btnFiscalEditarChecklist = document.getElementById('btnFiscalEditarChecklistObra');
  if (btnFiscalEditarChecklist) {
    btnFiscalEditarChecklist.addEventListener('click', () => {
      modal.openGerenciadorPerguntasModal({
        fiscalUser: state.user,
        obra: state.selectedObra
      });
    });
  }
}
