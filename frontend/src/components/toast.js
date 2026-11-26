/**
 * BBVision - Sistema Corporativo de Toast Notifications
 * Padrão Banco do Brasil: Notificações elegantes, acessíveis e não intrusivas
 */

import { escapeHtml } from '../utils/formatters.js?v=2.5';

class BBVisionToast {
  constructor() {
    this.container = null;
    this.ensureContainer();
  }

  ensureContainer() {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.createElement('div');
      this.container.id = 'bbToastContainer';
      this.container.className = 'bb-toast-container';
      document.body.appendChild(this.container);
    }
  }

  show({ type = 'info', title = '', message = '', duration = 4000 }) {
    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `bb-toast-item toast-${type} fade-in`;

    const iconMap = {
      success: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <path d="M8.5 12.3L10.8 14.6L15.8 9.6"/>
        </svg>
      `,
      error: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <path d="M15 9L9 15M9 9L15 15"/>
        </svg>
      `,
      warning: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10.3 4.3L2.4 18C1.7 19.2 2.6 20.5 4 20.5H20C21.4 20.5 22.3 19.2 21.6 18L13.7 4.3C12.9 3 11.1 3 10.3 4.3Z"/>
          <path d="M12 9.5V13.5"/>
          <circle cx="12" cy="17" r="0.7" fill="#D97706"/>
        </svg>
      `,
      info: `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002D62" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 11.5V16"/>
          <circle cx="12" cy="8.2" r="0.7" fill="#002D62"/>
        </svg>
      `
    };

    const icon = iconMap[type] || iconMap.info;

    toast.innerHTML = `
      <div class="toast-icon-badge">${icon}</div>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${escapeHtml(title)}</div>` : ''}
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close-btn" title="Fechar" aria-label="Fechar notificação">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    const dismiss = () => {
      toast.classList.add('toast-dismiss');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    this.container.appendChild(toast);
  }

  success(title, message) {
    this.show({ type: 'success', title, message });
  }

  error(title, message) {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  warning(title, message) {
    this.show({ type: 'warning', title, message, duration: 5000 });
  }

  info(title, message) {
    this.show({ type: 'info', title, message });
  }
}

export const toast = new BBVisionToast();
