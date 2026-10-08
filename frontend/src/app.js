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

  render() {
    const page = state.currentPage;

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

      default:
        this.screenContainer.innerHTML = renderInicio();
        bindInicioEvents();
        break;
    }

    // Scroll para o topo ao trocar de tela
    this.screenContainer.scrollTop = 0;

    // 2. Renderiza a barra inferior de navegação (exceto na tela de login)
    if (page === 'login') {
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
