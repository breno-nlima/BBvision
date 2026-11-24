/**
 * BBVision - Tela de Perfil e Gestão de Conta do Usuário
 * Permite edição real dos dados cadastrais, alteração segura de senha e encerramento de sessão.
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';

export function renderPerfil() {
  const user = state.user;
  const isEmpreiteira = user?.cargo === 'empreiteira';
  const roleLabel = isEmpreiteira
    ? 'Empreiteira (Campo & Vistorias)'
    : 'Fiscal de Obra (Banco do Brasil)';
  const dataCadastro = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Recente';

  return `
    <div class="page-container fade-in" id="perfilPage">
      ${renderHeader('perfil')}

      <div class="profile-card-top">
        <div class="profile-avatar-large" style="display:flex; align-items:center; justify-content:center; background:transparent; border:none; box-shadow:none;">
          ${isEmpreiteira ? Icons.perfilObras(72) : Icons.perfilBb(72)}
        </div>
        <h2 class="profile-name">${escapeHtml(user?.nome || 'Usuário')}</h2>
        <span class="profile-role-badge ${isEmpreiteira ? 'empreiteira' : 'fiscal'}">
          ${escapeHtml(roleLabel)}
        </span>
        <span class="profile-email">${escapeHtml(user?.email || '')}</span>

        <div class="profile-meta-tags-row" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
          ${
            user?.empresa
              ? `<span style="background: #F1F5F9; border: 1px solid #E2E8F0; padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #475569; font-weight: 500;">
                  ${escapeHtml(user.empresa)}
                </span>`
              : ''
          }
          ${
            user?.registro_profissional
              ? `<span style="background: #F1F5F9; border: 1px solid #E2E8F0; padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #475569; font-weight: 500;">
                  ${escapeHtml(user.registro_profissional)}
                </span>`
              : ''
          }
          <span style="background: #F1F5F9; border: 1px solid #E2E8F0; padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #475569; font-weight: 500;">
            Cadastro: ${escapeHtml(dataCadastro)}
          </span>
        </div>
      </div>

      <!-- Edição de Dados Cadastrais -->
      <div class="profile-permissions-card" style="margin-top: 14px;">
        <h4 class="perm-card-title">Meus Dados Cadastrais</h4>
        <form id="formEditarPerfil" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
          <div>
            <label for="perfilNome" style="display:block; font-size: 12px; font-weight: 700; color: #002D62; margin-bottom: 4px;">Nome Completo</label>
            <input type="text" id="perfilNome" value="${escapeHtml(user?.nome || '')}" required minlength="2" style="width:100%; padding: 9px 11px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <div>
            <label for="perfilEmpresa" style="display:block; font-size: 12px; font-weight: 700; color: #002D62; margin-bottom: 4px;">Empresa / Unidade</label>
            <input type="text" id="perfilEmpresa" value="${escapeHtml(user?.empresa || '')}" placeholder="Ex.: Nome da construtora ou superintendência" style="width:100%; padding: 9px 11px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <div>
            <label for="perfilRegistro" style="display:block; font-size: 12px; font-weight: 700; color: #002D62; margin-bottom: 4px;">Registro Profissional (CREA / CAU / Matrícula)</label>
            <input type="text" id="perfilRegistro" value="${escapeHtml(user?.registro_profissional || '')}" placeholder="Opcional" style="width:100%; padding: 9px 11px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <button type="submit" id="btnSalvarPerfil" class="btn-primary-bb-yellow" style="padding: 10px 14px; font-size: 13px;">
            Salvar Alterações do Perfil
          </button>
        </form>
      </div>

      <!-- Alteração de Senha -->
      <div class="profile-permissions-card" style="margin-top: 14px;">
        <h4 class="perm-card-title">Segurança e Alteração de Senha</h4>
        <form id="formAlterarSenha" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
          <div>
            <label for="perfilSenhaAtual" style="display:block; font-size: 12px; font-weight: 700; color: #002D62; margin-bottom: 4px;">Senha Atual</label>
            <input type="password" id="perfilSenhaAtual" autocomplete="current-password" required style="width:100%; padding: 9px 11px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <div>
            <label for="perfilNovaSenha" style="display:block; font-size: 12px; font-weight: 700; color: #002D62; margin-bottom: 4px;">Nova Senha (mínimo 6 caracteres)</label>
            <input type="password" id="perfilNovaSenha" autocomplete="new-password" minlength="6" required style="width:100%; padding: 9px 11px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <div>
            <label for="perfilConfirmaSenha" style="display:block; font-size: 12px; font-weight: 700; color: #002D62; margin-bottom: 4px;">Confirmar Nova Senha</label>
            <input type="password" id="perfilConfirmaSenha" autocomplete="new-password" minlength="6" required style="width:100%; padding: 9px 11px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 13px;" />
          </div>
          <button type="submit" id="btnAlterarSenha" class="btn-secondary-white" style="padding: 10px 14px; font-size: 13px; border-color: #002D62; color: #002D62; font-weight: 700;">
            Atualizar Senha de Acesso
          </button>
        </form>
      </div>

      <div class="profile-permissions-card">
        <h4 class="perm-card-title">Privilégios e Escopo Operacional:</h4>
        ${
          isEmpreiteira
            ? `
          <ul class="perm-list">
            <li>✓ Acesso ao fluxo de captura e câmera in-loco (inviolável)</li>
            <li>✓ Avaliação instantânea por Visão Computacional IA (SLA &le; 15s)</li>
            <li>✓ Preenchimento guiado de checklists normativos</li>
            <li>✓ Assinatura digital com fé pública e responsabilidade técnica</li>
            <li>✓ Geração de código único e bloqueio permanente do relatório</li>
            <li class="restricted">✕ Cadastro de novas obras restrito a Fiscais de Obra</li>
            <li class="restricted">✕ Homologação e julgamento técnico restritos a Fiscais de Obra</li>
          </ul>
        `
            : `
          <ul class="perm-list">
            <li>✓ Acesso ao Centro de Controle e Governança</li>
            <li>✓ Cadastro, edição e gestão de obras e checklists técnicos</li>
            <li>✓ Auditoria de evidências com verificação de hashes SHA-256</li>
            <li>✓ Inspeção e download de PDFs oficiais certificados</li>
            <li>✓ Julgamento técnico com Fé Pública: Aprovação (Regular) ou Reprovação (Pendente de Ajuste)</li>
            <li class="restricted">✕ Captura in-loco restrita às empreiteiras de campo</li>
          </ul>
        `
        }
      </div>

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
          <strong>Visão Computacional IA (SLA &le; 15s • Confiança &ge; 75%)</strong>
        </div>
        <div class="info-row">
          <span>Padrão Criptográfico:</span>
          <strong>SHA-256 + Código Hexadecimal Único 16 Dígitos</strong>
        </div>
        <div class="info-row">
          <span>Emissão de Documentos:</span>
          <strong>PDF Certificado com Carimbo e Hash de Fé Pública</strong>
        </div>
      </div>

      <div class="profile-logout-section">
        <div class="logout-notice-text">
          <h4>Encerrar Sessão do Usuário</h4>
          <p>Desconecte com segurança após finalizar suas vistorias e relatórios no sistema.</p>
        </div>
        <button class="btn-logout-full" id="btnLogout" title="Sair da Conta">
          ${Icons.logOut(16, '#FFFFFF')}
          <span>Sair da Conta (Encerrar Sessão)</span>
        </button>
      </div>
    </div>
  `;
}

export function bindPerfilEvents() {
  bindHeaderEvents();

  const formPerfil = document.getElementById('formEditarPerfil');
  if (formPerfil) {
    formPerfil.addEventListener('submit', async e => {
      e.preventDefault();
      const nome = document.getElementById('perfilNome')?.value.trim() || '';
      const empresa = document.getElementById('perfilEmpresa')?.value.trim() || '';
      const registro_profissional = document.getElementById('perfilRegistro')?.value.trim() || '';
      const btn = document.getElementById('btnSalvarPerfil');

      if (nome.length < 2) {
        toast.warning('Nome Inválido', 'Informe seu nome completo.');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Salvando...';
      }
      try {
        await state.atualizarPerfil({ nome, empresa, registro_profissional });
        toast.success('Perfil Atualizado', 'Seus dados cadastrais foram salvos com sucesso.');
      } catch (err) {
        toast.error('Erro ao Atualizar Perfil', err.message || 'Não foi possível salvar suas alterações.');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Salvar Alterações do Perfil';
        }
      }
    });
  }

  const formSenha = document.getElementById('formAlterarSenha');
  if (formSenha) {
    formSenha.addEventListener('submit', async e => {
      e.preventDefault();
      const senhaAtual = document.getElementById('perfilSenhaAtual')?.value || '';
      const novaSenha = document.getElementById('perfilNovaSenha')?.value || '';
      const confirmaSenha = document.getElementById('perfilConfirmaSenha')?.value || '';
      const btn = document.getElementById('btnAlterarSenha');

      if (novaSenha.length < 6) {
        toast.warning('Senha Curta', 'A nova senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmaSenha) {
        toast.warning('Senhas Divergentes', 'A confirmação da nova senha não confere.');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerText = 'Atualizando...';
      }
      try {
        await state.alterarSenha(senhaAtual, novaSenha);
        formSenha.reset();
        toast.success('Senha Alterada', 'Sua senha de acesso foi atualizada com segurança.');
      } catch (err) {
        toast.error('Falha ao Alterar Senha', err.message || 'Verifique sua senha atual e tente novamente.');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'Atualizar Senha de Acesso';
        }
      }
    });
  }

  document.getElementById('btnLogout')?.addEventListener('click', () => {
    modal.confirmLogout({
      user: state.user,
      onConfirm: async () => {
        await state.logout();
        toast.info('Sessão Encerrada', 'Você saiu com sucesso do sistema BBVision.');
      },
    });
  });
}
