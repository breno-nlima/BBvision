/**
 * BBVision - Tela de Perfil e Gestão de Conta do Usuário
 * Padrão Corporativo Banco do Brasil S.A.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderPerfil() {
  const user = state.user;
  const isEmpreiteira = user?.cargo === 'empreiteira';
  const roleLabel = isEmpreiteira
    ? `${Icons.perfilObras(18)} Empreiteira (Campo & Vistorias)`
    : `${Icons.perfilBb(18)} Fiscal de Obra (Banco do Brasil)`;
  const dataCadastro = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '10/10/2026';

  return `
    <div class="page-container fade-in" id="perfilPage">
      ${renderHeader('perfil')}

      <!-- Card do Usuário Autenticado -->
      <div class="profile-card-top">
        <div class="profile-avatar-large" style="display:flex; align-items:center; justify-content:center; background:transparent; border:none; box-shadow:none;">
          ${isEmpreiteira ? Icons.perfilObras(76) : Icons.perfilBb(76)}
        </div>
        <h2 class="profile-name">${user?.nome || 'Usuário BBVision'}</h2>
        <span class="profile-role-badge ${isEmpreiteira ? 'empreiteira' : 'fiscal'}" style="display:inline-flex; align-items:center; gap:6px;">
          ${roleLabel}
        </span>
        <span class="profile-email">${user?.email || 'usuario@empresa.com.br'}</span>

        <div class="profile-meta-tags-row" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
          <span style="background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #94A3B8; display:inline-flex; align-items:center; gap:6px;">
            ${Icons.iconeBanco(14)} ${user?.empresa || (isEmpreiteira ? 'Empreiteira Contratada' : 'Banco do Brasil - DIPAT')}
          </span>
          ${user?.registro_profissional ? `
            <span style="background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #94A3B8; display: inline-flex; align-items: center; gap: 6px;">
              ${Icons.iconeCrea(16)} ${user.registro_profissional}
            </span>
          ` : ''}
          <span style="background: rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #94A3B8; display: inline-flex; align-items: center; gap: 6px;">
            ${Icons.iconeCadastro(16)} Cadastro: ${dataCadastro}
          </span>
        </div>
      </div>

      <!-- Escopo de Atuação e Privilégios do Perfil -->
      <div class="profile-permissions-card">
        <h4 class="perm-card-title">Privilégios e Escopo Operacional:</h4>
        ${isEmpreiteira ? `
          <ul class="perm-list">
            <li>✓ Acesso ao fluxo de captura e câmera in-loco (inviolável)</li>
            <li>✓ Avaliação instantânea por Visão Computacional IA BBVision (SLA &le; 15s)</li>
            <li>✓ Preenchimento guiado de checklists normativos</li>
            <li>✓ Assinatura digital com fé pública e responsabilidade técnica</li>
            <li>✓ Geração de código único e bloqueio de relatório</li>
            <li class="restricted">✕ Bloqueado para cadastro de novas obras (Função exclusiva do Banco do Brasil / Fiscal)</li>
            <li class="restricted">✕ Bloqueado para homologação e julgamento técnico (Função do Fiscal BB)</li>
          </ul>
        ` : `
          <ul class="perm-list">
            <li style="display: flex; align-items: center; gap: 6px;">✓ ${Icons.iconeControle(16)} Acesso ao Centro de Controle e Governança do Banco do Brasil</li>
            <li style="display: flex; align-items: center; gap: 6px;">✓ ${Icons.iconeCadastro(16)} Cadastro e credenciamento de novas obras e agências BB</li>
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
          <strong style="display: inline-flex; align-items: center; gap: 6px;">${Icons.iconeBanco(18)} Banco do Brasil S.A.</strong>
        </div>
        <div class="info-row">
          <span>Sistema:</span>
          <strong>BBVision — Plataforma de Fiscalização Remota</strong>
        </div>
        <div class="info-row">
          <span>Motor de IA:</span>
          <strong>Visão Computacional IA BBVision (SLA &le; 15s • Confiança &ge; 75%)</strong>
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

      <!-- Ações da Conta e Encerramento Seguro de Sessão -->
      <div class="profile-logout-section">
        <div class="logout-notice-box">
          <div class="logout-notice-icon">
            ${Icons.logOut(24, '#DC2626')}
          </div>
          <div class="logout-notice-text">
            <h4>Encerrar Sessão do Usuário</h4>
            <p>Desconecte com segurança após finalizar suas vistorias e relatórios no sistema.</p>
          </div>
        </div>
        <button class="btn-logout-full" id="btnLogout" title="Sair da Conta">
          ${Icons.logOut(18, '#FFFFFF')}
          <span>Sair da Conta (Encerrar Sessão)</span>
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
      modal.confirmLogout({
        user: state.user,
        onConfirm: async () => {
          await state.logout();
          toast.info('Sessão Encerrada', 'Você saiu com sucesso do sistema BBVision.');
        }
      });
    });
  }
}
