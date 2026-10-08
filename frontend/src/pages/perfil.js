/**
 * BVision Perfil Screen
 * Gestão de Perfil e Alternância de Personas (Rodrigo vs Mariana)
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
          ${isEmpreiteira ? 'Empreiteira (Campo)' : 'Fiscal de Serviço (Engenharia BB)'}
        </span>
        <span class="profile-email">${state.user?.email}</span>
      </div>

      <!-- Alternador de Personas para Demonstração da Residência TakeOff -->
      <div class="persona-switch-box">
        <h4>Simular Persona do Projeto</h4>
        <p>Alterne entre a visão de campo da empreiteira e a auditoria do fiscal do Banco do Brasil:</p>
        
        <div class="persona-buttons-row">
          <button class="btn-persona ${isEmpreiteira ? 'active' : ''}" id="btnSwitchRodrigo">
            👷‍♂️ Rodrigo (Empreiteira)
          </button>
          <button class="btn-persona ${!isEmpreiteira ? 'active' : ''}" id="btnSwitchMariana">
            👩‍💼 Mariana (Fiscal BB)
          </button>
        </div>
      </div>

      <!-- Informações do Sistema -->
      <div class="system-info-box">
        <div class="info-row">
          <span>Programa:</span>
          <strong>Residência TakeOff / Porto Digital</strong>
        </div>
        <div class="info-row">
          <span>Desafio:</span>
          <strong>Fiscalização Remota de Obras (BB)</strong>
        </div>
        <div class="info-row">
          <span>Versão da IA:</span>
          <strong>Google Gemini 1.5 Flash (SLA &lt; 15s)</strong>
        </div>
      </div>

      <div class="logout-container">
        <button class="btn-logout" id="btnLogout">
          Sair da Conta
        </button>
      </div>
    </div>
  `;
}

export function bindPerfilEvents() {
  bindHeaderEvents();

  const btnRodrigo = document.getElementById('btnSwitchRodrigo');
  if (btnRodrigo) {
    btnRodrigo.addEventListener('click', () => {
      state.login('rodrigo@empreiteira.com', '123456');
      state.navigate('perfil', 'perfil');
    });
  }

  const btnMariana = document.getElementById('btnSwitchMariana');
  if (btnMariana) {
    btnMariana.addEventListener('click', () => {
      state.login('mariana@bb.com.br', '123456');
      state.navigate('perfil', 'perfil');
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      state.logout();
    });
  }
}
