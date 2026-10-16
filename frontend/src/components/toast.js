/**
 * BBVision - Sistema Corporativo de Toast Notifications
 * Padrão Banco do Brasil: Notificações elegantes, acessíveis e não intrusivas
 */

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
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const icon = iconMap[type] || 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon-badge">${icon}</div>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close-btn" title="Fechar">✕</button>
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
