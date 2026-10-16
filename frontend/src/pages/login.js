/**
 * BBVision - Tela de Autenticação e Cadastro Público
 * Padrão Corporativo Banco do Brasil: Login Seguro e Cadastro de Usuários (Empreiteira e Fiscal de Obra)
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';

let abaAtiva = 'login'; // 'login' | 'cadastro'
let cargoCadastro = 'empreiteira'; // 'empreiteira' | 'fiscal'

export function renderLogin() {
  return `
    <div class="auth-page-wrapper fade-in" id="authPage">
      <div class="auth-card-container">
        
        <!-- Header da Instituição -->
        <div class="auth-header-brand">
          <div class="auth-logo-symbol">
            <img src="src/assets/logo.png" alt="BBVision" class="auth-logo-img">
          </div>
          <div class="auth-brand-text">
            <h1 class="auth-title">BBVision</h1>
            <span class="auth-badge-gov">Banco do Brasil S.A.</span>
          </div>
          <p class="auth-desc">Plataforma Oficial de Fiscalização Remota de Obras e Fé Pública</p>
        </div>

        <!-- Abas de Navegação: Login vs Cadastro -->
        <div class="auth-nav-tabs">
          <button type="button" class="auth-tab-btn ${abaAtiva === 'login' ? 'active' : ''}" id="tabBtnLogin">
            Entrar
          </button>
          <button type="button" class="auth-tab-btn ${abaAtiva === 'cadastro' ? 'active' : ''}" id="tabBtnCadastro">
            Criar Nova Conta
          </button>
        </div>

        <!-- Formulário 1: Login -->
        <div class="auth-form-body ${abaAtiva === 'login' ? '' : 'hidden'}" id="loginFormSection">
          <form id="formLogin" onsubmit="event.preventDefault();">
            <div class="auth-field-group">
              <label for="loginEmail" class="auth-field-label">E-mail corporativo ou institucional</label>
              <input 
                type="email" 
                id="loginEmail" 
                class="auth-input-field" 
                placeholder="seu.email@empresa.com.br" 
                value="" 
                required 
                autocomplete="email"
              />
            </div>

            <div class="auth-field-group">
              <label for="loginSenha" class="auth-field-label">Senha de acesso</label>
              <input 
                type="password" 
                id="loginSenha" 
                class="auth-input-field" 
                placeholder="Digite sua senha de acesso" 
                value="" 
                required 
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="btn-auth-submit" id="btnSubmitLogin">
              Entrar no Sistema
            </button>
          </form>
        </div>

        <!-- Formulário 2: Cadastro de Novo Usuário -->
        <div class="auth-form-body ${abaAtiva === 'cadastro' ? '' : 'hidden'}" id="cadastroFormSection">
          <form id="formCadastro" onsubmit="event.preventDefault();">
            
            <div class="auth-field-group">
              <label class="auth-field-label">Selecione o seu perfil de atuação:</label>
              <div class="role-selector-grid">
                <label class="role-option-card ${cargoCadastro === 'empreiteira' ? 'selected' : ''}" id="cardRoleEmpreiteira">
                  <input type="radio" name="cargoCadastroRadio" value="empreiteira" ${cargoCadastro === 'empreiteira' ? 'checked' : ''} />
                  <div class="role-icon">👷‍♂️</div>
                  <div class="role-meta">
                    <strong>Empreiteira</strong>
                    <span>Vistoria de campo, fotos in-loco e checklists</span>
                  </div>
                </label>

                <label class="role-option-card ${cargoCadastro === 'fiscal' ? 'selected' : ''}" id="cardRoleFiscal">
                  <input type="radio" name="cargoCadastroRadio" value="fiscal" ${cargoCadastro === 'fiscal' ? 'checked' : ''} />
                  <div class="role-icon">👩‍💼</div>
                  <div class="role-meta">
                    <strong>Fiscal de Obra (BB)</strong>
                    <span>Auditoria, laudos, conferência e parecer</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="auth-field-group">
              <label for="cadNome" class="auth-field-label">Nome Completo</label>
              <input type="text" id="cadNome" class="auth-input-field" placeholder="Ex: Carlos Eduardo Silva" required />
            </div>

            <div class="auth-field-group">
              <label for="cadEmail" class="auth-field-label">E-mail Corporativo</label>
              <input type="email" id="cadEmail" class="auth-input-field" placeholder="carlos.silva@empresa.com.br" required />
            </div>

            <div class="auth-row-dual">
              <div class="auth-field-group">
                <label for="cadEmpresa" class="auth-field-label">Empresa / Órgão</label>
                <input type="text" id="cadEmpresa" class="auth-input-field" placeholder="Nome da empresa ou agência" />
              </div>
              <div class="auth-field-group">
                <label for="cadDoc" class="auth-field-label">CREA / CAU / Matrícula</label>
                <input type="text" id="cadDoc" class="auth-input-field" placeholder="Ex: CREA-SP 123456/D" />
              </div>
            </div>

            <div class="auth-row-dual">
              <div class="auth-field-group">
                <label for="cadSenha" class="auth-field-label">Senha</label>
                <input type="password" id="cadSenha" class="auth-input-field" placeholder="Mínimo 6 caracteres" required />
              </div>
              <div class="auth-field-group">
                <label for="cadConfirmaSenha" class="auth-field-label">Confirmar Senha</label>
                <input type="password" id="cadConfirmaSenha" class="auth-input-field" placeholder="Repita a senha" required />
              </div>
            </div>

            <button type="submit" class="btn-auth-submit" id="btnSubmitCadastro">
              Criar Conta e Acessar
            </button>
          </form>
        </div>

        <!-- Rodapé do Card de Autenticação -->
        <div class="auth-card-footer">
          <button type="button" class="btn-link-public-doc" id="btnIrValidadorSemLogin">
            🛡️ Validar Autenticidade de Laudo / Relatório (Público)
          </button>
        </div>

      </div>
    </div>
  `;
}

export function bindLoginEvents() {
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabCad = document.getElementById('tabBtnCadastro');
  const secLogin = document.getElementById('loginFormSection');
  const secCad = document.getElementById('cadastroFormSection');

  // Alternar entre Login e Cadastro
  if (tabLogin && tabCad) {
    tabLogin.addEventListener('click', () => {
      abaAtiva = 'login';
      tabLogin.classList.add('active');
      tabCad.classList.remove('active');
      secLogin.classList.remove('hidden');
      secCad.classList.add('hidden');
    });

    tabCad.addEventListener('click', () => {
      abaAtiva = 'cadastro';
      tabCad.classList.add('active');
      tabLogin.classList.remove('active');
      secCad.classList.remove('hidden');
      secLogin.classList.add('hidden');
    });
  }

  // Seletor de Perfil no Cadastro
  const cardEmp = document.getElementById('cardRoleEmpreiteira');
  const cardFisc = document.getElementById('cardRoleFiscal');

  if (cardEmp && cardFisc) {
    cardEmp.addEventListener('click', () => {
      cargoCadastro = 'empreiteira';
      cardEmp.classList.add('selected');
      cardFisc.classList.remove('selected');
      const radio = cardEmp.querySelector('input');
      if (radio) radio.checked = true;
    });

    cardFisc.addEventListener('click', () => {
      cargoCadastro = 'fiscal';
      cardFisc.classList.add('selected');
      cardEmp.classList.remove('selected');
      const radio = cardFisc.querySelector('input');
      if (radio) radio.checked = true;
    });
  }

  // Ação de Login
  const formLogin = document.getElementById('formLogin');
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');

  async function processarLogin(email, senha) {
    if (btnSubmitLogin) {
      btnSubmitLogin.disabled = true;
      btnSubmitLogin.innerText = 'Autenticando...';
    }
    try {
      await state.login(email, senha);
      toast.success('Autenticado com Sucesso', `Bem-vindo ao BBVision, ${state.user?.nome || 'Usuário'}!`);
    } catch (err) {
      toast.error('Erro de Autenticação', err.message || 'Credenciais inválidas.');
      if (btnSubmitLogin) {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.innerText = 'Entrar no Sistema';
      }
    }
  }

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim();
      const senha = document.getElementById('loginSenha')?.value;
      if (!email || !senha) {
        toast.warning('Atenção', 'Preencha o e-mail e a senha.');
        return;
      }
      processarLogin(email, senha);
    });
  }



  // Ação de Cadastro
  const formCad = document.getElementById('formCadastro');
  const btnSubmitCad = document.getElementById('btnSubmitCadastro');

  if (formCad) {
    formCad.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nome = document.getElementById('cadNome')?.value.trim();
      const email = document.getElementById('cadEmail')?.value.trim();
      const empresa = document.getElementById('cadEmpresa')?.value.trim();
      const doc = document.getElementById('cadDoc')?.value.trim();
      const senha = document.getElementById('cadSenha')?.value;
      const confirma = document.getElementById('cadConfirmaSenha')?.value;

      if (!nome || !email || !senha) {
        toast.warning('Campos Obrigatórios', 'Preencha nome, e-mail e senha.');
        return;
      }

      if (senha.length < 6) {
        toast.warning('Senha Curta', 'A senha deve conter no mínimo 6 caracteres.');
        return;
      }

      if (senha !== confirma) {
        toast.error('Inconsistência', 'As senhas digitadas não coincidem.');
        return;
      }

      if (btnSubmitCad) {
        btnSubmitCad.disabled = true;
        btnSubmitCad.innerText = 'Criando Conta...';
      }

      try {
        await state.register({
          nome,
          email,
          senha,
          cargo: cargoCadastro,
          empresa,
          registro_profissional: doc,
        });

        toast.success(
          'Conta Criada com Sucesso!', 
          `Cadastrado como ${cargoCadastro === 'fiscal' ? 'Fiscal de Obra (BB)' : 'Empreiteira de Campo'}.`
        );
      } catch (err) {
        toast.error('Erro no Cadastro', err.message || 'Falha ao criar usuário.');
        if (btnSubmitCad) {
          btnSubmitCad.disabled = false;
          btnSubmitCad.innerText = 'Criar Conta e Acessar';
        }
      }
    });
  }

  // Link para o Validador Público
  document.getElementById('btnIrValidadorSemLogin')?.addEventListener('click', () => {
    state.navigate('validador-publico');
  });
}
