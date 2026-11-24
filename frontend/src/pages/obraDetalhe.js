/**
 * BVision - Tela de Detalhe da Obra / Atualizar Obra
 * Fiel ao print de referência: WhatsApp Image 2026-10-08 at 11.43.18.jpeg
 * Conforme Requisitos E1, E2 e HU01 do Documento Oficial de Entrega TakeOff
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { modal } from '../components/modal.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderObraDetalhe() {
  const vistoria = state.currentVistoria;
  const isFiscal = state.user?.cargo === 'fiscal';
  const perguntasObra = state.getPerguntasParaObra(vistoria.obraId);

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
          <h1 class="topbar-title">${escapeHtml(vistoria.obraNome)}</h1>
        </div>
      </header>

      <!-- Foto da Obra com Overlay de Metadados Criptográficos -->
      <div class="obra-foto-wrapper">
        <img 
          src="${escapeHtml(vistoria.fotoCamera || vistoria.fotoUrl || '/uploads/evidencias/seed_fachada_bb.png')}" 
          alt="${escapeHtml(vistoria.obraNome)}" 
          class="obra-hero-img"
          onerror="this.onerror=null; this.src='/uploads/evidencias/seed_fachada_bb.png';"
        />
        <div class="obra-foto-overlay">
          <div class="meta-tag">Data: ${escapeHtml(vistoria.dataFoto)} às ${escapeHtml(vistoria.horaFoto)}</div>
          <div class="meta-tag">Localização: ${escapeHtml(vistoria.localizacaoFoto)}</div>
        </div>
      </div>

      <!-- Card com Informações Cadastrais da Fiscalização -->
      <div class="obra-detalhes-card">
        <div class="detalhe-item-row">
          <div class="detalhe-text-group">
            <span class="detalhe-label">Responsável Técnico de Campo</span>
            <strong class="detalhe-val">${escapeHtml(vistoria.responsavel)}</strong>
            <span class="detalhe-sub">Matrícula / Registro: ${escapeHtml(vistoria.matricula)}</span>
          </div>
          <div class="detalhe-action-icon">
            ${Icons.eye(20)}
          </div>
        </div>

        <div class="detalhe-divider"></div>

        <div class="detalhe-item-row">
          <div class="detalhe-text-group">
            <span class="detalhe-label">Obra: ${escapeHtml(vistoria.obraNome)}</span>
            <span class="detalhe-sub">Etapa da obra: ${escapeHtml(vistoria.etapa)}</span>
          </div>
        </div>

        ${isFiscal ? `
          <div class="detalhe-divider"></div>
          <div class="detalhe-item-row" id="btnFiscalEditarChecklistObra" style="cursor: pointer; background: #F8FAFC; border: 1.5px solid #002D62; padding: 12px 14px; border-radius: 8px; margin-top: 6px; display: flex; align-items: center; justify-content: space-between;" title="Clique para gerenciar as perguntas do checklist desta obra">
            <div class="detalhe-text-group">
              <span class="detalhe-label" style="color: #002D62; font-weight: 700;">Checklist Técnico Desta Obra</span>
              <strong class="detalhe-val" style="color: #002D62; font-size: 13px;">${perguntasObra.length} perguntas configuradas</strong>
              <span class="detalhe-sub" style="font-size: 11.5px; color: #475569;">Clique para visualizar ou alterar perguntas exclusivas desta unidade</span>
            </div>
            <div class="detalhe-action-icon" style="color: #002D62; display: flex; align-items: center;">
              ${Icons.penAssinatura(18)}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Botão Amarelo de Ação Principal (Coerente com RBAC da Persona) -->
      <div class="obra-action-footer">
        ${isFiscal ? `
          <button class="btn-primary-bb-yellow" id="btnAbrirAuditoriaObra">
            Abrir Painel de Auditoria e Parecer
          </button>
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
  const btnVoltar = document.getElementById('btnVoltarObrasDetalhe');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
      state.navigate('obras');
    });
  }

  const btnAtualizar = document.getElementById('btnAtualizarObra');
  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', () => {
      state.navigate('tipo-local');
    });
  }

  const btnAbrirAuditoria = document.getElementById('btnAbrirAuditoriaObra');
  if (btnAbrirAuditoria) {
    btnAbrirAuditoria.addEventListener('click', () => {
      const relObra = state.relatorios.find(r => r.obraId === state.currentVistoria.obraId);
      if (relObra) {
        state.currentVistoria.relatorioId = relObra.id;
        state.currentVistoria.codigoUnico = relObra.codigoUnico;
        state.currentVistoria.hashSha256 = relObra.hash || state.currentVistoria.hashSha256;
        state.currentVistoria.statusObra = relObra.obraStatus || 'REGULAR';
        state.currentVistoria.justificativaFiscal = relObra.justificativaFiscal || null;
      }
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
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
