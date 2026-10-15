/**
 * BVision Perfil Screen
 * Gestão de Perfil e Alternância de Personas com RBAC (Rodrigo vs Mariana)
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';

export function renderPerfil() {
  const isEmpreiteira = state.user?.cargo === 'empreiteira';

  return `
    <div class="page-container fade-in" id="perfilPage">
      ${renderHeader('perfil')}

      <div class="profile-card-top">
        <div class="profile-avatar-large">
          <img src="${state.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="Perfil">
        </div>
        <h2 class="profile-name">${state.user?.nome || 'Usuário'}</h2>
        <span class="profile-role-badge ${isEmpreiteira ? 'empreiteira' : 'fiscal'}">
          ${isEmpreiteira ? '👷‍♂️ Empreiteira (Campo & Vistorias)' : '👩‍💼 Fiscal de Serviço (Engenharia BB)'}
        </span>
        <span class="profile-email">${state.user?.email}</span>
      </div>

      <!-- Resumo das Permissões do Perfil Ativo -->
      <div class="profile-permissions-card">
        <h4 class="perm-card-title">Permissões do Perfil Ativo:</h4>
        ${isEmpreiteira ? `
          <ul class="perm-list">
            <li>✓ Acesso ao fluxo de captura e câmera com IA (inviolável)</li>
            <li>✓ Preenchimento de checklists dinâmicos com Gemini</li>
            <li>✓ Assinatura digital com fé pública</li>
            <li>✓ Emissão e bloqueio de relatórios</li>
            <li class="restricted">✕ Bloqueado para homologação/julgamento de obras (Exclusivo BB)</li>
          </ul>
        ` : `
          <ul class="perm-list">
            <li>✓ Acesso ao Centro de Controle do Banco do Brasil</li>
            <li>✓ Auditoria de evidências com hashes SHA-256 e códigos únicos</li>
            <li>✓ Download e análise de PDFs oficiais compilados</li>
            <li>✓ Julgamento técnico com Fé Pública: Aprovar (Regular) ou Reprovar (Pendente)</li>
            <li class="restricted">✕ Captura in-loco desabilitada (Função das empreiteiras de campo)</li>
          </ul>
        `}
      </div>

      <!-- Alternador de Personas para Demonstração da Residência TakeOff -->
      <div class="persona-switch-box">
        <h4>Alternar Tipo de Acesso (Personas TakeOff):</h4>
        <p>Troque instantaneamente entre o fluxo de campo e a governança de auditoria do Banco do Brasil:</p>
        
        <div class="persona-buttons-row">
          <button class="btn-persona ${isEmpreiteira ? 'active' : ''}" id="btnSwitchRodrigo">
            👷‍♂️ Rodrigo (Empreiteira)
          </button>
          <button class="btn-persona ${!isEmpreiteira ? 'active' : ''}" id="btnSwitchMariana">
            👩‍💼 Mariana (Fiscal BB)
          </button>
        </div>
      </div>

      <!-- Informações do Sistema e Governança -->
      <div class="system-info-box">
        <div class="info-row">
          <span>Programa:</span>
          <strong>Residência TakeOff / Porto Digital</strong>
        </div>
        <div class="info-row">
          <span>Desafio:</span>
          <strong>Fiscalização Remota de Obras (Banco do Brasil)</strong>
        </div>
        <div class="info-row">
          <span>Modelo de IA:</span>
          <strong>Google Gemini 1.5 Flash (SLA &le; 15s)</strong>
        </div>
        <div class="info-row">
          <span>Criptografia:</span>
          <strong>SHA-256 + Código Hex 16 Dígitos</strong>
        </div>
      </div>

      <div class="logout-container">
        <button class="btn-logout" id="btnLogout">
          Sair da Conta (Logout)
        </button>
      </div>
    </div>
  `;
}

export function bindPerfilEvents() {
  bindHeaderEvents();

  const btnRodrigo = document.getElementById('btnSwitchRodrigo');
  if (btnRodrigo) {
    btnRodrigo.addEventListener('click', async () => {
      await state.login('rodrigo@empreiteira.com', '123456');
    });
  }

  const btnMariana = document.getElementById('btnSwitchMariana');
  if (btnMariana) {
    btnMariana.addEventListener('click', async () => {
      await state.login('mariana@bb.com.br', '123456');
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      state.logout();
    });
  }
}
