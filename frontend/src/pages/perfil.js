/**
 * BBVision - Tela de Perfil e Gestão de Conta do Usuário
 * Layout limpo em 2 colunas com edição cadastral, segurança de senha e informações recolhíveis.
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
  const roleLabel = isEmpreiteira ? 'Empreiteira de Campo' : 'Fiscal de Obra • Banco do Brasil';
  const dataCadastro = user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'Ativo';

  return `
    <div class="page-container page-medium fade-in" id="perfilPage">
      ${renderHeader('perfil')}

      <section class="profile-header-card">
        <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${isEmpreiteira ? Icons.perfilObras(64) : Icons.perfilBb(64)}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;">
            <h1 class="profile-name" style="margin: 0; font-size: 19px;">${escapeHtml(user?.nome || 'Usuário')}</h1>
            <span class="profile-role-badge ${isEmpreiteira ? 'empreiteira' : 'fiscal'}" style="margin: 0;">
              ${escapeHtml(roleLabel)}
            </span>
          </div>
          <div class="profile-email" style="margin-bottom: 6px;">${escapeHtml(user?.email || '')}</div>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #64748B;">
            ${user?.empresa ? `<span>${escapeHtml(user.empresa)}</span>` : ''}
            ${user?.registro_profissional ? `<span>• ${escapeHtml(user.registro_profissional)}</span>` : ''}
            <span>• Desde ${escapeHtml(dataCadastro)}</span>
          </div>
        </div>
      </section>

      <div class="profile-forms-grid">
        <section class="profile-card-panel">
          <h3>Dados Cadastrais</h3>
          <form id="formEditarPerfil" style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label for="perfilNome" style="display:block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Nome completo</label>
              <input type="text" id="perfilNome" class="profile-input" value="${escapeHtml(user?.nome || '')}" required minlength="2" />
            </div>
            <div>
              <label for="perfilEmpresa" style="display:block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Empresa / Unidade</label>
              <input type="text" id="perfilEmpresa" class="profile-input" value="${escapeHtml(user?.empresa || '')}" placeholder="Construtora ou superintendência" />
            </div>
            <div>
              <label for="perfilRegistro" style="display:block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">CREA / CAU / Matrícula</label>
              <input type="text" id="perfilRegistro" class="profile-input" value="${escapeHtml(user?.registro_profissional || '')}" placeholder="Opcional" />
            </div>
            <button type="submit" id="btnSalvarPerfil" class="btn-primary-bb-yellow" style="height: 42px; font-size: 13.5px; margin-top: 4px;">
              Salvar Alterações
            </button>
          </form>
        </section>

        <section class="profile-card-panel">
          <h3>Alterar Senha</h3>
          <form id="formAlterarSenha" style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label for="perfilSenhaAtual" style="display:block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Senha atual</label>
              <input type="password" id="perfilSenhaAtual" class="profile-input" autocomplete="current-password" required />
            </div>
            <div>
              <label for="perfilNovaSenha" style="display:block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Nova senha (mín. 6 caracteres)</label>
              <input type="password" id="perfilNovaSenha" class="profile-input" autocomplete="new-password" minlength="6" required />
            </div>
            <div>
              <label for="perfilConfirmaSenha" style="display:block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Confirmar nova senha</label>
              <input type="password" id="perfilConfirmaSenha" class="profile-input" autocomplete="new-password" minlength="6" required />
            </div>
            <button type="submit" id="btnAlterarSenha" class="btn-secondary-white" style="height: 42px; font-size: 13.5px; margin-top: 4px; color: #002D62; border-color: #CBD5E1;">
              Atualizar Senha
            </button>
          </form>
        </section>
      </div>

      <details class="bb-details-accordion">
        <summary>Escopo de permissões e especificações técnicas</summary>
        <div class="bb-details-body">
          ${
            isEmpreiteira
              ? `
            <ul class="perm-list" style="margin-bottom: 12px;">
              <li>✓ Captura fotográfica exclusivamente in-loco com validação via IA</li>
              <li>✓ Preenchimento de checklists técnicos e assinatura digital</li>
              <li>✓ Emissão de código único e bloqueio permanente do relatório</li>
              <li class="restricted">✕ Cadastro de obras e homologação restritos ao Fiscal de Obra</li>
            </ul>
          `
              : `
            <ul class="perm-list" style="margin-bottom: 12px;">
              <li>✓ Cadastro, edição e gestão de obras e checklists técnicos</li>
              <li>✓ Auditoria de evidências, PDFs certificados e hashes SHA-256</li>
              <li>✓ Homologação técnica com Fé Pública (Regular ou Pendente de Ajuste)</li>
              <li class="restricted">✕ Captura in-loco restrita às empreiteiras atribuídas</li>
            </ul>
          `
          }
          <div style="border-top: 1px solid #F1F5F9; padding-top: 10px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: #64748B;">
            <span><strong>Motor IA:</strong> SLA &le; 15s • Confiança &ge; 75%</span>
            <span><strong>Criptografia:</strong> SHA-256 + Hex 16 dígitos</span>
          </div>
        </div>
      </details>

      <div class="profile-logout-bar">
        <div>
          <strong style="font-size: 13.5px; color: #0F172A; display: block;">Sessão ativa neste dispositivo</strong>
          <span style="font-size: 12px; color: #64748B;">Encerre sua sessão com segurança ao concluir suas atividades.</span>
        </div>
        <button type="button" class="btn-logout-outline" id="btnLogout" title="Sair da Conta">
          ${Icons.logOut(15)}
          <span>Encerrar Sessão</span>
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
          btn.innerText = 'Salvar Alterações';
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
          btn.innerText = 'Atualizar Senha';
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
