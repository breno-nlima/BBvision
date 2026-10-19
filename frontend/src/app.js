/**
 * BVision Main Frontend Application Controller
 * Coordena o ciclo de vida, navegação e injeção das telas
 */

import { state } from './services/state.js';
import { renderLogin, bindLoginEvents } from './pages/login.js';
import { renderInicio, bindInicioEvents } from './pages/inicio.js';
import { renderObras, bindObrasEvents } from './pages/obras.js';
import { renderVistoria, bindVistoriaEvents } from './pages/vistoria.js';
import { renderRelatorios, bindRelatoriosEvents } from './pages/relatorios.js';
import { renderPerfil, bindPerfilEvents } from './pages/perfil.js';
import { renderBottomNav, bindBottomNavEvents } from './components/bottomNav.js';

// Novas Telas Conforme Prints dos Mockups Oficiais
import { renderObraDetalhe, bindObraDetalheEvents } from './pages/obraDetalhe.js';
import { renderTipoLocal, bindTipoLocalEvents } from './pages/tipoLocal.js';
import { renderCameraIa, bindCameraIaEvents } from './pages/cameraIa.js';
import { renderImagemProtegida, bindImagemProtegidaEvents } from './pages/imagemProtegida.js';
import { renderChecklistPergunta, bindChecklistPerguntaEvents } from './pages/checklistPergunta.js';
import { renderChecklistDinamico, bindChecklistDinamicoEvents } from './pages/checklistDinamico.js';
import { renderChecklistVerificacao, bindChecklistVerificacaoEvents } from './pages/checklistVerificacao.js';
import { renderAssinaturaResponsavel, bindAssinaturaResponsavelEvents } from './pages/assinaturaResponsavel.js';
import { renderRelatorioBloqueado, bindRelatorioBloqueadoEvents } from './pages/relatorioBloqueado.js';
import { renderFiscalAuditoria, bindFiscalAuditoriaEvents } from './pages/fiscalAuditoria.js';
import { renderValidadorPublico, bindValidadorPublicoEvents } from './pages/validadorPublico.js';

import { toast } from './components/toast.js';

class BVisionApp {
  constructor() {
    this.screenContainer = document.getElementById('appScreenContainer');
    this.bottomNavSlot = document.getElementById('bottomNavSlot');
    this.init();
  }

  init() {
    // Escuta mudanças de estado e re-renderiza a tela ativa
    state.subscribe(() => {
      this.render();
    });

    // Render inicial
    this.render();
  }

  render(force = false) {
    const page = state.currentPage;
    const userRole = state.user?.cargo || 'empreiteira';

    // Evita loop de re-renderização e tela piscando na câmera
    if (this.currentRenderedPage === page && page === 'camera-ia' && !force) {
      return;
    }
    this.currentRenderedPage = page;

    // Regra de Autenticação Real: Redireciona para login se não autenticado
    if (!state.user && page !== 'login' && page !== 'validador-publico') {
      state.currentPage = 'login';
      this.screenContainer.innerHTML = renderLogin();
      bindLoginEvents();
      this.bottomNavSlot.innerHTML = '';
      this.screenContainer.style.paddingBottom = '0px';
      this.updateClock();
      return;
    }

    // Regra de Controle de Acesso por Persona (RBAC):
    // Rodrigo (empreiteira) não pode acessar o painel de auditoria e julgamento exclusivo do Banco do Brasil
    if (page === 'fiscal-auditoria' && userRole === 'empreiteira') {
      toast.warning('Acesso Restrito', 'O Painel de Auditoria e Julgamento é restrito aos fiscais de obra e auditores de engenharia do Banco do Brasil.');
      state.navigate('inicio', 'inicio');
      return;
    }

    // 1. Renderiza o conteúdo da tela ativa
    switch (page) {
      case 'login':
        this.screenContainer.innerHTML = renderLogin();
        bindLoginEvents();
        break;

      case 'inicio':
        this.screenContainer.innerHTML = renderInicio();
        bindInicioEvents();
        break;

      case 'obras':
        this.screenContainer.innerHTML = renderObras();
        bindObrasEvents();
        break;

      case 'obra-detalhe':
        this.screenContainer.innerHTML = renderObraDetalhe();
        bindObraDetalheEvents();
        break;

      case 'tipo-local':
        this.screenContainer.innerHTML = renderTipoLocal();
        bindTipoLocalEvents();
        break;

      case 'camera-ia':
        this.screenContainer.innerHTML = renderCameraIa();
        bindCameraIaEvents();
        break;

      case 'imagem-protegida':
        this.screenContainer.innerHTML = renderImagemProtegida();
        bindImagemProtegidaEvents();
        break;

      case 'checklist-pergunta':
        this.screenContainer.innerHTML = renderChecklistPergunta();
        bindChecklistPerguntaEvents();
        break;

      case 'checklist-dinamico':
        this.screenContainer.innerHTML = renderChecklistDinamico();
        bindChecklistDinamicoEvents();
        break;

      case 'checklist-verificacao':
        this.screenContainer.innerHTML = renderChecklistVerificacao();
        bindChecklistVerificacaoEvents();
        break;

      case 'assinatura-responsavel':
        this.screenContainer.innerHTML = renderAssinaturaResponsavel();
        bindAssinaturaResponsavelEvents();
        break;

      case 'relatorio-bloqueado':
        this.screenContainer.innerHTML = renderRelatorioBloqueado();
        bindRelatorioBloqueadoEvents();
        break;

      case 'fiscal-auditoria':
        this.screenContainer.innerHTML = renderFiscalAuditoria();
        bindFiscalAuditoriaEvents();
        break;

      case 'vistoria':
        this.screenContainer.innerHTML = renderVistoria();
        bindVistoriaEvents();
        break;

      case 'relatorios':
        this.screenContainer.innerHTML = renderRelatorios();
        bindRelatoriosEvents();
        break;

      case 'perfil':
        this.screenContainer.innerHTML = renderPerfil();
        bindPerfilEvents();
        break;

      case 'validador-publico':
        this.screenContainer.innerHTML = renderValidadorPublico();
        bindValidadorPublicoEvents();
        break;

      default:
        this.screenContainer.innerHTML = renderInicio();
        bindInicioEvents();
        break;
    }

    // Scroll para o topo ao trocar de tela
    this.screenContainer.scrollTop = 0;

    // 2. Renderiza a barra inferior de navegação (exceto login, câmera e assinatura digital)
    const semBottomNav = ['login', 'camera-ia', 'assinatura-responsavel'];
    if (semBottomNav.includes(page)) {
      this.bottomNavSlot.innerHTML = '';
      this.screenContainer.style.paddingBottom = '0px';
    } else {
      this.bottomNavSlot.innerHTML = renderBottomNav();
      bindBottomNavEvents();
      this.screenContainer.style.paddingBottom = '90px';
    }

    // Atualiza o relógio da barra de status móvel
    this.updateClock();
  }

  updateClock() {
    const timeElem = document.getElementById('deviceTime');
    if (timeElem) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      timeElem.innerText = `${hours}:${minutes}`;
    }
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new BVisionApp();
});

