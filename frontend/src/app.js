/**
 * BBVision Main Frontend Application Controller
 * Coordena ciclo de vida, limpeza automática de hardware (câmera/GPS), RBAC e roteamento SPA.
 */

import { state } from './services/state.js';
import { renderLogin, bindLoginEvents } from './pages/login.js';
import { renderInicio, bindInicioEvents } from './pages/inicio.js';
import { renderObras, bindObrasEvents } from './pages/obras.js';
import { renderRelatorios, bindRelatoriosEvents } from './pages/relatorios.js';
import { renderPerfil, bindPerfilEvents } from './pages/perfil.js';
import { renderBottomNav, bindBottomNavEvents } from './components/bottomNav.js';
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
    this.currentRenderedPage = null;
    this.activeCleanup = null;
    this.init();
  }

  init() {
    this.handleInitialRouting();

    try {
      window.history.replaceState(
        { bbvisionPage: state.currentPage, navTab: state.activeNav },
        ''
      );
    } catch (_) {}

    window.addEventListener('popstate', (event) => {
      const target = event?.state?.bbvisionPage;
      const bloqueadasAposSelo = [
        'tipo-local',
        'checklist-pergunta',
        'checklist-dinamico',
        'checklist-verificacao',
        'camera-ia',
        'imagem-protegida',
        'assinatura-responsavel',
      ];

      if (target && target !== state.currentPage) {
        if (state.currentVistoria?.bloqueado && bloqueadasAposSelo.includes(target)) {
          state.navigate('inicio', 'inicio', { fromPopstate: true, clearHistory: true });
          return;
        }
        state.navigate(target, event?.state?.navTab || null, { fromPopstate: true, replace: true });
        return;
      }

      if (state.historyStack.length > 0) {
        state.goBack(state.user ? 'inicio' : 'login');
        return;
      }

      this.handleInitialRouting();
    });
    window.addEventListener('hashchange', () => this.handleInitialRouting());
    window.addEventListener('pagehide', () => this.runCleanup());

    state.subscribe(() => {
      this.render();
    });

    this.render();
  }

  runCleanup() {
    if (typeof this.activeCleanup === 'function') {
      try {
        this.activeCleanup();
      } catch (err) {
        console.warn('[BBVision App] Erro ao liberar recursos da tela anterior:', err);
      }
      this.activeCleanup = null;
    }
  }

  handleInitialRouting() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash || '';
      const codigoParam = urlParams.get('codigo') || urlParams.get('validar') || urlParams.get('hash');

      if (codigoParam || hash === '#validador' || hash.includes('validador')) {
        if (codigoParam) {
          state.currentVistoria.codigoParaValidar = codigoParam;
        }
        state.currentPage = 'validador-publico';
        state.notify();
      }
    } catch (e) {
      console.warn('[BBVision App] Erro ao processar rota de URL:', e);
    }
  }

  render(force = false) {
    const page = state.currentPage;
    const userRole = state.user?.cargo || 'empreiteira';

    // Evita reiniciar a câmera ao vivo durante atualizações internas de estado na mesma tela
    if (this.currentRenderedPage === page && page === 'camera-ia' && !force) {
      return;
    }

    // Sempre libera câmera/GPS/intervals ao sair de uma tela
    if (this.currentRenderedPage !== page || force) {
      this.runCleanup();
    }

    this.currentRenderedPage = page;

    // Regra de Autenticação: redireciona para login se não autenticado
    if (!state.user && page !== 'login' && page !== 'validador-publico') {
      state.currentPage = 'login';
      this.currentRenderedPage = 'login';
      this.screenContainer.innerHTML = renderLogin();
      bindLoginEvents();
      this.bottomNavSlot.innerHTML = '';
      this.screenContainer.style.paddingBottom = '0px';
      return;
    }

    // RBAC: Empreiteira não acessa Painel de Auditoria do Fiscal
    if (page === 'fiscal-auditoria' && userRole === 'empreiteira') {
      toast.warning('Acesso Restrito', 'O Painel de Auditoria e Julgamento é restrito aos Fiscais de Obra.');
      state.navigate('inicio', 'inicio');
      return;
    }

    // RBAC: Fiscal não executa captura in-loco de campo
    const paginasExclusivasEmpreiteira = [
      'tipo-local',
      'checklist-pergunta',
      'checklist-dinamico',
      'checklist-verificacao',
      'camera-ia',
      'imagem-protegida',
      'assinatura-responsavel',
    ];
    if (paginasExclusivasEmpreiteira.includes(page) && userRole === 'fiscal') {
      toast.warning('Fluxo Exclusivo de Campo', 'A vistoria in-loco e captura fotográfica são exclusivas da Empreiteira.');
      state.navigate('fiscal-auditoria', 'fiscal-auditoria');
      return;
    }

    // Guard: telas de vistoria exigem uma obra selecionada
    if ((page === 'obra-detalhe' || paginasExclusivasEmpreiteira.includes(page)) && !state.currentVistoria?.obraId) {
      toast.info('Selecione uma Obra', 'Escolha uma obra na lista antes de iniciar a vistoria.');
      state.navigate('obras', 'obras');
      return;
    }

    let cleanupFn = null;

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
        cleanupFn = bindCameraIaEvents();
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

    if (typeof cleanupFn === 'function') {
      this.activeCleanup = cleanupFn;
    }

    this.screenContainer.scrollTop = 0;

    const semBottomNav = ['login', 'camera-ia', 'assinatura-responsavel', 'validador-publico'];
    if (semBottomNav.includes(page) || !state.user) {
      this.bottomNavSlot.innerHTML = '';
      this.screenContainer.style.paddingBottom = '0px';
    } else {
      this.bottomNavSlot.innerHTML = renderBottomNav();
      bindBottomNavEvents();
      this.screenContainer.style.paddingBottom = '90px';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BVisionApp();
});
