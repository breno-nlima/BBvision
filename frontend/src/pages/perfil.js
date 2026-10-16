/**
 * BBVision - Tela de Perfil e Gestão de Conta do Usuário
 * Padrão Corporativo Banco do Brasil S.A.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { toast } from '../components/toast.js';

export function renderPerfil() {
  const user = state.user;
  const isEmpreiteira = user?.cargo === 'empreiteira';
  const roleLabel = isEmpreiteira ? '👷‍♂️ Empreiteira (Campo & Vistorias)' : '👩‍💼 Fiscal de Obra (Banco do Brasil)';
  const dataCadastro = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '10/10/2026';

  return `
    <div class="page-container fade-in" id="perfilPage">
      ${renderHeader('perfil')}

      <!-- Card do Usuário Autenticado -->
      <div class="profile-card-top">
        <div class="profile-avatar-large">
          <img 
            src="${user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" 
            alt="${user?.nome || 'Usuário'}"
          >
        </div>
        <h2 class="profile-name">${user?.nome || 'Usuário BBVision'}</h2>
        <span class="profile-role-badge ${isEmpreiteira ? 'empreiteira' : 'fiscal'}">
          ${roleLabel}
        </span>
        <span class="profile-email">${user?.email || 'usuario@empresa.com.br'}</span>

        <div class="profile-meta-tags-row" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
          <span style="background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #94A3B8;">
            🏢 ${user?.empresa || (isEmpreiteira ? 'Empreiteira Contratada' : 'Banco do Brasil - DIPAT')}
          </span>
          ${user?.registro_profissional ? `
            <span style="background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #94A3B8;">
              📜 ${user.registro_profissional}
            </span>
          ` : ''}
          <span style="background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #94A3B8;">
            📅 Cadastro: ${dataCadastro}
          </span>
        </div>
      </div>

      <!-- Escopo de Atuação e Privilégios do Perfil -->
      <div class="profile-permissions-card">
        <h4 class="perm-card-title">Privilégios e Escopo Operacional:</h4>
        ${isEmpreiteira ? `
          <ul class="perm-list">
            <li>✓ Acesso ao fluxo de captura e câmera in-loco (inviolável)</li>
            <li>✓ Avaliação instantânea por IA com Google Gemini (SLA &le; 15s)</li>
            <li>✓ Preenchimento guiado de checklists normativos</li>
            <li>✓ Assinatura digital com fé pública e responsabilidade técnica</li>
            <li>✓ Geração de código único e bloqueio de relatório</li>
            <li class="restricted">✕ Bloqueado para homologação e julgamento técnico (Função do Fiscal BB)</li>
          </ul>
        ` : `
          <ul class="perm-list">
            <li>✓ Acesso ao Centro de Controle e Governança do Banco do Brasil</li>
            <li>✓ Auditoria de evidências com verificação de hashes SHA-256</li>
            <li>✓ Inspeção e download de PDFs oficiais certificados</li>
            <li>✓ Julgamento técnico com Fé Pública: Aprovação (Regular) ou Reprovação (Pendente de Ajuste)</li>
            <li class="restricted">✕ Captura in-loco desabilitada (Função exclusiva da empreiteira de campo)</li>
          </ul>
        `}
      </div>

      <!-- Informações Corporativas e Governança Técnica -->
      <div class="system-info-box">
        <div class="info-row">
          <span>Instituição:</span>
          <strong>Banco do Brasil S.A.</strong>
        </div>
        <div class="info-row">
          <span>Sistema:</span>
          <strong>BBVision — Plataforma de Fiscalização Remota</strong>
        </div>
        <div class="info-row">
          <span>Motor de IA:</span>
          <strong>Google Gemini 1.5 Flash (SLA &le; 15s • Confiança &ge; 75%)</strong>
        </div>
        <div class="info-row">
          <span>Padrão Criptográfico:</span>
          <strong>SHA-256 + Código Hexadecimal Único 16 Dígitos</strong>
        </div>
        <div class="info-row">
          <span>Emissão de Documentos:</span>
          <strong>PDFKit Certificado com Carimbo e Hash de Fé Pública</strong>
        </div>
      </div>

      <!-- Ações da Conta -->
      <div class="logout-container">
        <button class="btn-logout" id="btnLogout">
          Sair da Conta (Encerrar Sessão)
        </button>
      </div>
    </div>
  `;
}

export function bindPerfilEvents() {
  bindHeaderEvents();

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      state.logout();
      toast.info('Sessão Encerrada', 'Você saiu com sucesso do sistema BBVision.');
    });
  }
}
