/**
 * BBVision - Tela de Autenticação e Cadastro Público
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { toast } from '../components/toast.js';

let abaAtiva = 'login';
let cargoCadastro = 'empreiteira';

export function renderLogin() {
  return `
    <div class="auth-page-wrapper fade-in" id="authPage">
      <div class="auth-card-container">
        
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

        <div class="auth-nav-tabs">
          <button type="button" class="auth-tab-btn ${abaAtiva === 'login' ? 'active' : ''}" id="tabBtnLogin">
            Entrar
          </button>
          <button type="button" class="auth-tab-btn ${abaAtiva === 'cadastro' ? 'active' : ''}" id="tabBtnCadastro">
            Criar Nova Conta
          </button>
        </div>

        <div class="auth-form-body ${abaAtiva === 'login' ? '' : 'hidden'}" id="loginFormSection">
          <h2 class="sr-only">Acesso ao Portal de Fiscalização Remota de Obras</h2>
          <form id="formLogin" toolname="bbvision_login" tooldescription="Autentica um usuário Empreiteira ou Fiscal de Obras no portal BBVision usando e-mail corporativo e senha.">
            <div class="auth-field-group">
              <label for="loginEmail" class="auth-field-label">E-mail corporativo ou institucional</label>
              <input 
                type="email" 
                id="loginEmail" 
                class="auth-input-field" 
                placeholder="Digite seu e-mail" 
                value="" 
                required 
                autocomplete="email"
              />
            </div>

            <div class="auth-field-group">
              <label for="loginSenha" class="auth-field-label">Senha de acesso</label>
              <div style="position: relative; display: flex; align-items: center;">
                <input 
                  type="password" 
                  id="loginSenha" 
                  class="auth-input-field" 
                  placeholder="Digite sua senha de acesso" 
                  value="" 
                  required 
                  autocomplete="current-password"
                  style="padding-right: 44px;"
                />
                <button type="button" id="btnToggleLoginSenha" title="Mostrar ou ocultar senha" aria-label="Mostrar senha" style="position: absolute; right: 10px; background: none; border: none; color: #64748B; cursor: pointer; display: inline-flex; align-items: center; padding: 4px;">
                  ${Icons.eye(18)}
                </button>
              </div>
            </div>

            <button type="submit" class="btn-auth-submit" id="btnSubmitLogin">
              Entrar no Sistema
            </button>
          </form>
        </div>

        <div class="auth-form-body ${abaAtiva === 'cadastro' ? '' : 'hidden'}" id="cadastroFormSection">
          <form id="formCadastro">
            <div class="auth-field-group">
              <label class="auth-field-label">Selecione o seu perfil de atuação:</label>
              <div class="role-selector-grid">
                <label class="role-option-card ${cargoCadastro === 'empreiteira' ? 'selected' : ''}" id="cardRoleEmpreiteira">
                  <input type="radio" name="cargoCadastroRadio" value="empreiteira" ${cargoCadastro === 'empreiteira' ? 'checked' : ''} />
                  <div class="role-icon">
                    ${Icons.perfilObras(36)}
                  </div>
                  <div class="role-meta">
                    <strong>Empreiteira</strong>
                    <span>Vistoria de campo, fotos in-loco e checklists</span>
                  </div>
                </label>

                <label class="role-option-card ${cargoCadastro === 'fiscal' ? 'selected' : ''}" id="cardRoleFiscal">
                  <input type="radio" name="cargoCadastroRadio" value="fiscal" ${cargoCadastro === 'fiscal' ? 'checked' : ''} />
                  <div class="role-icon">
                    ${Icons.perfilBb(36)}
                  </div>
                  <div class="role-meta">
                    <strong>Fiscal de Obra</strong>
                    <span>Cadastro de obras, auditoria e parecer</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="auth-field-group">
              <label for="cadNome" class="auth-field-label">Nome Completo</label>
              <input type="text" id="cadNome" class="auth-input-field" placeholder="Digite seu nome completo" required autocomplete="name" />
            </div>

            <div class="auth-field-group">
              <label for="cadEmail" class="auth-field-label">E-mail Corporativo</label>
              <input type="email" id="cadEmail" class="auth-input-field" placeholder="Digite seu e-mail profissional" required autocomplete="email" />
            </div>

            <div class="auth-row-dual">
              <div class="auth-field-group">
                <label for="cadEmpresa" class="auth-field-label">Empresa / Órgão</label>
                <input type="text" id="cadEmpresa" class="auth-input-field" placeholder="Nome da empresa ou órgão" />
              </div>
              <div class="auth-field-group">
                <label for="cadDoc" class="auth-field-label">CREA / CAU / Matrícula</label>
                <input type="text" id="cadDoc" class="auth-input-field" placeholder="Registro profissional" />
              </div>
            </div>

            <div class="auth-row-dual">
              <div class="auth-field-group">
                <label for="cadSenha" class="auth-field-label">Senha</label>
                <input type="password" id="cadSenha" class="auth-input-field" placeholder="Mínimo 6 caracteres" minlength="6" required autocomplete="new-password" />
              </div>
              <div class="auth-field-group">
                <label for="cadConfirmaSenha" class="auth-field-label">Confirmar Senha</label>
                <input type="password" id="cadConfirmaSenha" class="auth-input-field" placeholder="Repita a senha" minlength="6" required autocomplete="new-password" />
              </div>
            </div>

            <button type="submit" class="btn-auth-submit" id="btnSubmitCadastro">
              Criar Conta e Acessar
            </button>
          </form>
        </div>

        <div class="auth-card-footer">
          <button type="button" class="btn-link-public-doc" id="btnIrValidadorSemLogin">
            Validar Autenticidade de Laudo / Relatório (Público)
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

  const btnToggleSenha = document.getElementById('btnToggleLoginSenha');
  const inputLoginSenha = document.getElementById('loginSenha');
  if (btnToggleSenha && inputLoginSenha) {
    btnToggleSenha.addEventListener('click', () => {
      const isPass = inputLoginSenha.type === 'password';
      inputLoginSenha.type = isPass ? 'text' : 'password';
      btnToggleSenha.style.color = isPass ? '#002D62' : '#64748B';
    });
  }

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

  const formLogin = document.getElementById('formLogin');
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  let loginInFlight = false;

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginInFlight) return;

      const email = document.getElementById('loginEmail')?.value.trim();
      const senha = document.getElementById('loginSenha')?.value;

      if (!email || !senha) {
        toast.warning('Atenção', 'Preencha o e-mail e a senha.');
        return;
      }

      loginInFlight = true;
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
      } finally {
        loginInFlight = false;
      }
    });
  }

  const formCad = document.getElementById('formCadastro');
  const btnSubmitCad = document.getElementById('btnSubmitCadastro');
  let cadInFlight = false;

  if (formCad) {
    formCad.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (cadInFlight) return;

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

      cadInFlight = true;
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
          `Cadastrado como ${cargoCadastro === 'fiscal' ? 'Fiscal de Obra' : 'Empreiteira de Campo'}.`
        );
      } catch (err) {
        toast.error('Erro no Cadastro', err.message || 'Falha ao criar usuário.');
        if (btnSubmitCad) {
          btnSubmitCad.disabled = false;
          btnSubmitCad.innerText = 'Criar Conta e Acessar';
        }
      } finally {
        cadInFlight = false;
      }
    });
  }

  document.getElementById('btnIrValidadorSemLogin')?.addEventListener('click', () => {
    state.navigate('validador-publico');
  });
}
