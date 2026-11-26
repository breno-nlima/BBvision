/**
 * BBVision - Sistema de Ícones Vetoriais Corporativos (Design System v4.0)
 * Padrão Minimalista Enterprise Banking — Banco do Brasil S.A.
 *
 * Diretrizes de Design:
 * - Ícones de UI/Navegação: traço único geométrico 24x24, stroke-width 1.75,
 *   monocromáticos (currentColor) para herdar contraste limpo em fundos claros ou escuros.
 * - Destaques de Marca e Selos: paleta institucional contida (#002D62 + #FED304)
 *   reservada exclusivamente para logotipos, ilustrações CAD e selos de Fé Pública.
 */

export const Icons = {
  // =========================================================================
  // 1. LOGOTIPOS E INSÍGNIAS OFICIAIS BBVISION (DESTAQUE DE MARCA)
  // =========================================================================

  // Logotipo Principal BBVision (Geometria Limpa Marinho + Visor Ouro BB)
  logoBVision: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon bbv-icon-logo" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="15" fill="#002D62"/>
      <rect x="5" y="5" width="54" height="54" rx="14" stroke="#FED304" stroke-opacity="0.55" stroke-width="1.5"/>
      <path d="M16 22V17C16 16.4477 16.4477 16 17 16H22" stroke="#FED304" stroke-width="2" stroke-linecap="round"/>
      <path d="M42 16H47C47.5523 16 48 16.4477 48 17V22" stroke="#FED304" stroke-width="2" stroke-linecap="round"/>
      <path d="M16 42V47C16 47.5523 16.4477 48 17 48H22" stroke="#FED304" stroke-width="2" stroke-linecap="round"/>
      <path d="M48 42V47C48 47.5523 47.5523 48 47 48H42" stroke="#FED304" stroke-width="2" stroke-linecap="round"/>
      <path d="M15 32C19.2 24.4 25 21 32 21C39 21 44.8 24.4 49 32C44.8 39.6 39 43 32 43C25 43 19.2 39.6 15 32Z" stroke="#FFFFFF" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="6" fill="#FED304"/>
      <circle cx="32" cy="32" r="2.4" fill="#002D62"/>
    </svg>
  `,

  // Símbolo Geométrico Oficial Banco do Brasil
  logoBBOficial: (size = 34, color = '#002D62') => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon" aria-hidden="true">
      <path d="M24 3L6 15.5L13.5 20.8L24 13.5L34.5 20.8L42 15.5L24 3Z" fill="${color}"/>
      <path d="M24 45L42 32.5L34.5 27.2L24 34.5L13.5 27.2L6 32.5L24 45Z" fill="${color}"/>
      <path d="M6 21.2L24 33.5L42 21.2L35.2 16.4L24 24.2L12.8 16.4L6 21.2Z" fill="${color}" fill-opacity="0.88"/>
      <path d="M42 26.8L24 14.5L6 26.8L12.8 31.6L24 23.8L35.2 31.6L42 26.8Z" fill="${color}" fill-opacity="0.88"/>
    </svg>
  `,

  // Badge Compacto BBVision
  logoBVisionBadge: (size = 28) => `
    <div style="display:inline-flex; align-items:center; gap:7px; background:#002D62; color:#FED304; padding:5px 11px; border-radius:9px; font-weight:700; font-size:13px; border:1px solid rgba(254,211,4,0.35);">
      <svg width="${Math.round(size * 0.68)}" height="${Math.round(size * 0.68)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2 12C4.8 7.4 8.2 5.5 12 5.5C15.8 5.5 19.2 7.4 22 12C19.2 16.6 15.8 18.5 12 18.5C8.2 18.5 4.8 16.6 2 12Z" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" fill="#FED304"/>
      </svg>
      <span style="letter-spacing:-0.25px;">BB<span style="color:#FFFFFF;">Vision</span></span>
    </div>
  `,

  // =========================================================================
  // 2. ÍCONES UTILITÁRIOS DE INTERFACE & NAVEGAÇÃO (MONOCROMÁTICOS LIMPOS)
  // =========================================================================

  search: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="11" cy="11" r="7.5"/>
      <path d="M20 20L16.35 16.35"/>
    </svg>
  `,

  eye: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M2 12C4.6 7.5 8 5.25 12 5.25C16 5.25 19.4 7.5 22 12C19.4 16.5 16 18.75 12 18.75C8 18.75 4.6 16.5 2 12Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `,

  chevronDown: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M6 9L12 15L18 9"/>
    </svg>
  `,

  chevronRight: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M9 6L15 12L9 18"/>
    </svg>
  `,

  logOut: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9"/>
      <path d="M16 17L21 12L16 7"/>
      <path d="M21 12H9"/>
    </svg>
  `,

  // =========================================================================
  // 3. ÍCONES PRINCIPAIS DE DASHBOARD E ATALHOS (TRAÇO FINO CORPORATIVO)
  // =========================================================================

  iconeInicio: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M3 10.5L12 3.5L21 10.5V19.5C21 20.3284 20.3284 21 19.5 21H4.5C3.67157 21 3 20.3284 3 19.5V10.5Z"/>
      <path d="M9 21V13.5H15V21"/>
    </svg>
  `,

  iconeObras: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M4 21H20"/>
      <path d="M6 21V5C6 4.44772 6.44772 4 7 4H14C14.5523 4 15 4.44772 15 5V21"/>
      <path d="M15 10H18C18.5523 10 19 10.4477 19 11V21"/>
      <path d="M9.5 8H11.5M9.5 12H11.5M9.5 16H11.5"/>
    </svg>
  `,

  iconeAuditoria: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H12"/>
      <path d="M15 5H17C18.1046 5 19 5.89543 19 7V11"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <circle cx="16.5" cy="16.5" r="3"/>
      <path d="M19 19L21 21"/>
      <path d="M9 12H12M9 16H11"/>
    </svg>
  `,

  iconeRelatorio: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z"/>
      <path d="M14 3V8H19"/>
      <path d="M9 13H15M9 17H13"/>
    </svg>
  `,

  iconeCadastro: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4"/>
      <path d="M12 8V16M8 12H16"/>
    </svg>
  `,

  iconeCrea: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="9" r="5"/>
      <path d="M9.5 13.5L8.5 21L12 19L15.5 21L14.5 13.5"/>
    </svg>
  `,

  // Avatar Minimalista Perfil Fiscal Banco do Brasil
  perfilBb: (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#002D62" stroke="#FED304" stroke-width="1.6"/>
      <circle cx="20" cy="15.5" r="4.8" stroke="#FFFFFF" stroke-width="1.8"/>
      <path d="M11.5 29.5C12.8 25.3 16 23.2 20 23.2C24 23.2 27.2 25.3 28.5 29.5" stroke="#FED304" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `,

  // Avatar Minimalista Perfil Empreiteira de Obras
  perfilObras: (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon" aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
      <path d="M14.5 14.5C14.5 11.4624 16.9624 9 20 9C23.0376 9 25.5 11.4624 25.5 14.5H14.5Z" fill="#FED304" stroke="#002D62" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M13 14.5H27" stroke="#002D62" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M16 15.5V16.8C16 19.0091 17.7909 20.8 20 20.8C22.2091 20.8 24 19.0091 24 16.8V15.5" stroke="#002D62" stroke-width="1.6"/>
      <path d="M11.5 29.5C12.8 25.5 16 23.5 20 23.5C24 23.5 27.2 25.5 28.5 29.5" stroke="#002D62" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `,

  iconeControle: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/>
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/>
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/>
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>
    </svg>
  `,

  iconeBanco: (size = 22, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M3 10L12 4L21 10H3Z"/>
      <path d="M5 10V18M10 10V18M14 10V18M19 10V18"/>
      <path d="M3 20H21"/>
    </svg>
  `,

  // Escudo de Destaque Institucional (Hero Validador & Selo Autêntico)
  shieldYellow: (size = 28, color = '#FED304') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 3L4.5 6.3V11.8C4.5 16.7 7.7 21 12 22.5C16.3 21 19.5 16.7 19.5 11.8V6.3L12 3Z"/>
      <path d="M9 12.2L11.1 14.3L15.3 10"/>
    </svg>
  `,

  folderObras: (size = 24, color = 'currentColor') => Icons.iconeObras(size, color),

  reportsHex: (size = 24, color = 'currentColor') => Icons.iconeRelatorio(size, color),

  // =========================================================================
  // 4. ÍCONES ESPECIALIZADOS DE DOMÍNIO (MONOCROMÁTICOS GEOMÉTRICOS)
  // =========================================================================

  shieldFePublica: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 3L4.5 6.3V11.8C4.5 16.7 7.7 21 12 22.5C16.3 21 19.5 16.7 19.5 11.8V6.3L12 3Z"/>
      <path d="M9 12.2L11.1 14.3L15.3 10"/>
    </svg>
  `,

  checklistBb: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2"/>
      <path d="M9 4V3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V4"/>
      <path d="M9 11L10.5 12.5L13.5 9.5"/>
      <path d="M9 16H15"/>
    </svg>
  `,

  cameraAiLens: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M4 8.5C4 7.39543 4.89543 6.5 6 6.5H8L9.5 4.5H14.5L16 6.5H18C19.1046 6.5 20 7.39543 20 8.5V17.5C20 18.6046 19.1046 19.5 18 19.5H6C4.89543 19.5 4 18.6046 4 17.5V8.5Z"/>
      <circle cx="12" cy="13" r="3.25"/>
    </svg>
  `,

  cameraFlip: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M20 11C19.5 6.9 16.1 4 12 4C8.9 4 6.2 5.7 4.8 8.3"/>
      <path d="M4.5 4.5V8.5H8.5"/>
      <path d="M4 13C4.5 17.1 7.9 20 12 20C15.1 20 17.8 18.3 19.2 15.7"/>
      <path d="M19.5 19.5V15.5H15.5"/>
    </svg>
  `,

  lockInviolavel: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7.5C8 5.29086 9.79086 3.5 12 3.5C14.2091 3.5 16 5.29086 16 7.5V11"/>
      <circle cx="12" cy="16" r="1"/>
    </svg>
  `,

  pdfDocument: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z"/>
      <path d="M14 3V8H19"/>
      <path d="M9 13H15M9 17H13"/>
    </svg>
  `,

  gavelAuditoria: (size = 20, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 4V20M7 20H17M5 8H19"/>
      <path d="M6 8L4 14H8L6 8Z"/>
      <path d="M18 8L16 14H20L18 8Z"/>
    </svg>
  `,

  penAssinatura: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M16.5 3.5L20.5 7.5L9 19H5V15L16.5 3.5Z"/>
      <path d="M4 21H20"/>
    </svg>
  `,

  gpsPin: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 21C12 21 18.5 15.2 18.5 10C18.5 6.41015 15.5899 3.5 12 3.5C8.41015 3.5 5.5 6.41015 5.5 10C5.5 15.2 12 21 12 21Z"/>
      <circle cx="12" cy="10" r="2.5"/>
    </svg>
  `,

  clockTimestamp: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 7.5V12L15 14"/>
    </svg>
  `,

  hashCrypto: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 3L19.5 7.3V16.7L12 21L4.5 16.7V7.3L12 3Z"/>
      <circle cx="12" cy="12" r="2.2"/>
    </svg>
  `,

  aiSparkle: (size = 17, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 3L14 9.5L20.5 12L14 14.5L12 21L10 14.5L3.5 12L10 9.5L12 3Z"/>
      <path d="M19 4V6.5M17.75 5.25H20.25"/>
    </svg>
  `,

  boltFlash: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M13 3L5 14H12L11 21L19 10H12L13 3Z"/>
    </svg>
  `,

  keyProtocolo: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="8" cy="15" r="4"/>
      <path d="M11 12L20 3M16.5 6.5L19 9M14 9L16.5 11.5"/>
    </svg>
  `,

  warningAlert: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M10.3 4.3L2.4 18C1.7 19.2 2.6 20.5 4 20.5H20C21.4 20.5 22.3 19.2 21.6 18L13.7 4.3C12.9 3 11.1 3 10.3 4.3Z"/>
      <path d="M12 9.5V13.5"/>
      <circle cx="12" cy="17" r="0.7" fill="${color}"/>
    </svg>
  `,

  errorCross: (size = 20, color = '#DC2626') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M15 9L9 15M9 9L15 15"/>
    </svg>
  `,

  infoBadge: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 11.5V16"/>
      <circle cx="12" cy="8.2" r="0.7" fill="${color}"/>
    </svg>
  `,

  downloadFile: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M12 4V15M12 15L8 11M12 15L16 11"/>
      <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17"/>
    </svg>
  `,

  externalOpen: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M14 4H20V10"/>
      <path d="M20 4L11 13"/>
      <path d="M19 14V19C19 20.1046 18.1046 21 17 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5H10"/>
    </svg>
  `,

  signalOffline: (size = 16, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M3 3L21 21"/>
      <path d="M8.5 16.5C10.4 14.6 13.6 14.6 15.5 16.5"/>
      <path d="M5 13C7.2 10.8 10 9.8 12.8 10"/>
      <circle cx="12" cy="19.5" r="1" fill="${color}"/>
    </svg>
  `,

  questionRadio: (size = 15, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5"/>
      <circle cx="12" cy="12" r="3.5" fill="${color}"/>
    </svg>
  `,

  questionCheckbox: (size = 15, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3"/>
      <path d="M8.5 12.2L10.8 14.5L15.8 9.5"/>
    </svg>
  `,

  questionText: (size = 15, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M4 6H20M4 12H16M4 18H12"/>
    </svg>
  `,

  // =========================================================================
  // 5. STATUS DE ANÁLISE & INDICADORES
  // =========================================================================

  checkVerified: (size = 16, color = '#059669') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8.5 12.3L10.8 14.6L15.8 9.6"/>
    </svg>
  `,

  clockPending: (size = 16, color = '#D97706') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7.5V12L15 14"/>
    </svg>
  `,

  // =========================================================================
  // 6. ILUSTRAÇÕES ARQUITETÔNICAS / CAD BLUEPRINT (CARDS DE OBRAS)
  // =========================================================================

  // Elevação Arquitetônica Minimalista Agência BB (Blueprint Técnico)
  cadHouse1: () => `
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-cad-illustration" aria-hidden="true">
      <defs>
        <pattern id="cadGrid1" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#CBD5E1" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="220" height="130" fill="url(#cadGrid1)" opacity="0.45"/>
      <line x1="42" y1="20" x2="178" y2="20" stroke="#94A3B8" stroke-width="0.9" stroke-dasharray="3 3"/>
      <line x1="42" y1="16" x2="42" y2="24" stroke="#64748B" stroke-width="1"/>
      <line x1="178" y1="16" x2="178" y2="24" stroke="#64748B" stroke-width="1"/>

      <rect x="42" y="42" width="136" height="64" rx="2" fill="#FFFFFF" stroke="#002D62" stroke-width="1.6"/>
      <rect x="38" y="34" width="144" height="10" rx="2" fill="#FED304" stroke="#002D62" stroke-width="1.4"/>

      <rect x="54" y="56" width="38" height="32" rx="1.5" fill="#F1F5F9" stroke="#002D62" stroke-width="1.3"/>
      <line x1="73" y1="56" x2="73" y2="88" stroke="#002D62" stroke-width="1"/>
      <line x1="54" y1="72" x2="92" y2="72" stroke="#002D62" stroke-width="1"/>

      <rect x="104" y="60" width="26" height="46" fill="#F8FAFC" stroke="#002D62" stroke-width="1.4"/>
      <line x1="117" y1="60" x2="117" y2="106" stroke="#002D62" stroke-width="1.1"/>

      <rect x="144" y="54" width="22" height="52" rx="1.5" fill="#002D62"/>
      <rect x="149" y="62" width="12" height="4" rx="1" fill="#FED304"/>
      <line x1="149" y1="72" x2="161" y2="72" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round"/>

      <line x1="22" y1="106" x2="198" y2="106" stroke="#002D62" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `,

  // Perspectiva Arquitetônica Minimalista Complexo Corporativo BB
  cadHouse2: () => `
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-cad-illustration" aria-hidden="true">
      <defs>
        <pattern id="cadGrid2" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke="#CBD5E1" stroke-width="0.5"/>
        </pattern>
      </defs>
      <rect width="220" height="130" fill="url(#cadGrid2)" opacity="0.45"/>

      <polygon points="78,24 118,38 118,104 78,104" fill="#FFFFFF" stroke="#002D62" stroke-width="1.6" stroke-linejoin="round"/>
      <polygon points="48,36 78,24 78,104 48,104" fill="#F1F5F9" stroke="#002D62" stroke-width="1.6" stroke-linejoin="round"/>
      <polygon points="48,36 78,24 118,38 88,48" fill="#FED304" stroke="#002D62" stroke-width="1.4" stroke-linejoin="round"/>

      <line x1="78" y1="52" x2="118" y2="64" stroke="#94A3B8" stroke-width="1.1"/>
      <line x1="78" y1="70" x2="118" y2="82" stroke="#94A3B8" stroke-width="1.1"/>
      <line x1="78" y1="88" x2="118" y2="98" stroke="#94A3B8" stroke-width="1.1"/>

      <rect x="118" y="56" width="54" height="48" fill="#FFFFFF" stroke="#002D62" stroke-width="1.6"/>
      <rect x="118" y="48" width="58" height="8" rx="1.5" fill="#002D62"/>
      <rect x="128" y="66" width="14" height="12" rx="1" fill="#F1F5F9" stroke="#002D62" stroke-width="1.2"/>
      <rect x="148" y="66" width="14" height="12" rx="1" fill="#FEF9C3" stroke="#002D62" stroke-width="1.2"/>
      <rect x="135" y="84" width="20" height="20" fill="#F8FAFC" stroke="#002D62" stroke-width="1.3"/>

      <line x1="26" y1="104" x2="194" y2="104" stroke="#002D62" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `,

  // =========================================================================
  // 7. BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM NAV MOBILE)
  // =========================================================================

  navHome: (active = false) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${active ? '2.1' : '1.75'}" stroke-linecap="round" stroke-linejoin="round" class="bbv-nav-svg" aria-hidden="true">
      <path d="M3 10.5L12 3.5L21 10.5V19.5C21 20.3284 20.3284 21 19.5 21H4.5C3.67157 21 3 20.3284 3 19.5V10.5Z"/>
      <path d="M9 21V13.5H15V21"/>
    </svg>
  `,

  navObras: (active = false) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${active ? '2.1' : '1.75'}" stroke-linecap="round" stroke-linejoin="round" class="bbv-nav-svg" aria-hidden="true">
      <path d="M4 21H20"/>
      <path d="M6 21V5C6 4.44772 6.44772 4 7 4H14C14.5523 4 15 4.44772 15 5V21"/>
      <path d="M15 10H18C18.5523 10 19 10.4477 19 11V21"/>
      <path d="M9.5 8H11.5M9.5 12H11.5M9.5 16H11.5"/>
    </svg>
  `,

  navRelatorios: (active = false) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${active ? '2.1' : '1.75'}" stroke-linecap="round" stroke-linejoin="round" class="bbv-nav-svg" aria-hidden="true">
      <path d="M14 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V8L14 3Z"/>
      <path d="M14 3V8H19"/>
      <path d="M9 13H15M9 17H13"/>
    </svg>
  `,

  navPerfil: (active = false) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${active ? '2.1' : '1.75'}" stroke-linecap="round" stroke-linejoin="round" class="bbv-nav-svg" aria-hidden="true">
      <circle cx="12" cy="8.5" r="4"/>
      <path d="M5 20C6.2 16.2 8.8 14.5 12 14.5C15.2 14.5 17.8 16.2 19 20"/>
    </svg>
  `,

  // =========================================================================
  // 8. ÍCONES DA TELA "SELECIONE O TIPO DE LOCAL" (TRAÇO ARQUITETÔNICO LIMPO)
  // =========================================================================

  iconAgencia: (size = 32, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M3 9.5L12 4L21 9.5H3Z"/>
      <path d="M5.5 9.5V18M10 9.5V18M14 9.5V18M18.5 9.5V18"/>
      <path d="M3 20H21"/>
    </svg>
  `,

  iconAtm: (size = 32, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2.5"/>
      <rect x="8" y="6.5" width="8" height="5.5" rx="1"/>
      <path d="M8 15.5H11.5M14.5 15.5H16"/>
      <path d="M8 18H16"/>
    </svg>
  `,

  iconAreaExterna: (size = 32, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="2.2"/>
      <path d="M16 14C18.2 14 19.8 12.4 19.8 10.3C19.8 8.3 18.2 6.7 16.2 6.7C14.1 6.7 12.5 8.3 12.5 10.3C12.5 12.4 14.1 14 16 14Z"/>
      <path d="M16 14V20"/>
      <path d="M3 20H21"/>
      <path d="M7.5 20V14.5C7.5 13.7 8.2 13 9 13H10"/>
    </svg>
  `,

  iconPredioAdmin: (size = 32, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon" aria-hidden="true">
      <path d="M3 21H21"/>
      <path d="M5 21V5C5 4.44772 5.44772 4 6 4H14C14.5523 4 15 4.44772 15 5V21"/>
      <path d="M15 10H18C18.5523 10 19 10.4477 19 11V21"/>
      <path d="M8.5 8H11.5M8.5 12H11.5M8.5 16H11.5"/>
    </svg>
  `,

  // =========================================================================
  // 9. SELOS DE INVIOLABILIDADE E BLOQUEIO CRIPTOGRÁFICO (DESTAQUE HERO)
  // =========================================================================

  // Escudo com Cadeado (Tela Imagem Protegida & Confirmação de Conclusão)
  lockShieldGold: (size = 54) => `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="#002D62" fill-opacity="0.06"/>
      <path d="M32 9L14 16.5V30C14 42.2 21.7 52.8 32 56C42.3 52.8 50 42.2 50 30V16.5L32 9Z" fill="#002D62" stroke="#FED304" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="24" y="30" width="16" height="12.5" rx="2.5" fill="#FED304"/>
      <path d="M27.5 30V26C27.5 23.5147 29.5147 21.5 32 21.5C34.4853 21.5 36.5 23.5147 36.5 26V30" stroke="#FED304" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="32" cy="36" r="1.6" fill="#002D62"/>
    </svg>
  `,

  // Selo Criptográfico de Documento Lacrado (Tela Relatório Concluído)
  boxLocked3D: (size = 64) => `
    <svg width="${size}" height="${size}" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon" aria-hidden="true">
      <circle cx="36" cy="36" r="32" fill="#002D62" fill-opacity="0.06"/>
      <path d="M36 12L58 24V48L36 60L14 48V24L36 12Z" fill="#002D62" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
      <path d="M14 24L36 36L58 24" stroke="#FED304" stroke-opacity="0.6" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M36 36V60" stroke="#FED304" stroke-opacity="0.6" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="12" fill="#FED304" stroke="#FFFFFF" stroke-width="2.2"/>
      <rect x="45.5" y="49.5" width="9" height="7" rx="1.5" fill="#002D62"/>
      <path d="M47.5 49.5V47.3C47.5 45.9 48.6 44.8 50 44.8C51.4 44.8 52.5 45.9 52.5 47.3V49.5" stroke="#002D62" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `
};
