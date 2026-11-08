/**
 * BBVision - Sistema de Ícones Vetoriais Proprietários (Identidade Visual v3.0)
 * Design System Oficial Banco do Brasil S.A. + TakeOff (Vision AI & Fé Pública)
 *
 * Características:
 * - Paleta Duotone & 3D: Azul Marinho Profundo (#002D62 / #001B3D), Ouro BB (#FED304 / #F59E0B),
 *   Ciano Vision AI (#38BDF8) e Esmeralda Forense (#10B981).
 * - Geometria arquitetônica inspirada na marca Banco do Brasil, retículas de visão computacional
 *   e selos criptográficos de inviolabilidade SHA-256.
 */

export const Icons = {
  // =========================================================================
  // 1. LOGOTIPOS E INSÍGNIAS OFICIAIS BBVISION
  // =========================================================================

  // Logotipo Principal BBVision (Hexágono Criptográfico + Olho Biometric IA + Ouro BB)
  logoBVision: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon bbv-icon-logo">
      <defs>
        <linearGradient id="bbvNavyGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#003882"/>
          <stop offset="100%" stop-color="#001B3D"/>
        </linearGradient>
        <linearGradient id="bbvGoldGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#FFE135"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </linearGradient>
        <linearGradient id="bbvCyanGrad" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
      </defs>
      <!-- Base Hexagonal Arredondada -->
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#bbvNavyGrad)" stroke="url(#bbvGoldGrad)" stroke-width="2.5"/>
      <!-- Cantoneiras de Visão Computacional (Retícula IA) -->
      <path d="M13 21V15C13 13.8954 13.8954 13 15 13H21" stroke="#FED304" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M43 13H49C50.1046 13 51 13.8954 51 15V21" stroke="#FED304" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M13 43V49C13 50.1046 13.8954 51 15 51H21" stroke="#FED304" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M51 43V49C51 50.1046 50.1046 51 49 51H43" stroke="#FED304" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Arco do Olho Biometric Vision -->
      <path d="M12 32C16.8 22.5 24 18 32 18C40 18 47.2 22.5 52 32C47.2 41.5 40 46 32 46C24 46 16.8 41.5 12 32Z" fill="#001229" fill-opacity="0.7" stroke="url(#bbvGoldGrad)" stroke-width="2.8" stroke-linejoin="round"/>
      <!-- Íris Digital Ciano & Ouro -->
      <circle cx="32" cy="32" r="9.5" fill="url(#bbvCyanGrad)" stroke="#FED304" stroke-width="2"/>
      <circle cx="32" cy="32" r="4" fill="#001B3D"/>
      <!-- Reflexo Óptico -->
      <circle cx="35.5" cy="28.5" r="2" fill="#FFFFFF"/>
      <circle cx="28.5" cy="35" r="1" fill="#FED304"/>
    </svg>
  `,

  // Símbolo Geométrico Oficial Banco do Brasil
  logoBBOficial: (size = 34, color = '#002D62') => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M24 3L6 15.5L13.5 20.8L24 13.5L34.5 20.8L42 15.5L24 3Z" fill="${color}"/>
      <path d="M24 45L42 32.5L34.5 27.2L24 34.5L13.5 27.2L6 32.5L24 45Z" fill="${color}"/>
      <path d="M6 21.2L24 33.5L42 21.2L35.2 16.4L24 24.2L12.8 16.4L6 21.2Z" fill="${color}" fill-opacity="0.88"/>
      <path d="M42 26.8L24 14.5L6 26.8L12.8 31.6L24 23.8L35.2 31.6L42 26.8Z" fill="${color}" fill-opacity="0.88"/>
    </svg>
  `,

  // Badge Compacto BVision (Fundo Marinho + Olho Dourado + Nome)
  logoBVisionBadge: (size = 28) => `
    <div style="display:inline-flex; align-items:center; gap:7px; background:linear-gradient(135deg, #002D62 0%, #001838 100%); color:#FED304; padding:5px 12px; border-radius:10px; font-weight:800; font-size:13px; border:1px solid rgba(254,211,4,0.45); box-shadow:0 3px 10px rgba(0,27,61,0.2);">
      <svg width="${size * 0.72}" height="${size * 0.72}" viewBox="0 0 32 32" fill="none">
        <path d="M3 16C6.2 9.8 10.8 7 16 7C21.2 7 25.8 9.8 29 16C25.8 22.2 21.2 25 16 25C10.8 25 6.2 22.2 3 16Z" stroke="#FED304" stroke-width="2.6"/>
        <circle cx="16" cy="16" r="5" fill="#38BDF8" stroke="#FED304" stroke-width="1.8"/>
        <circle cx="17.5" cy="14.5" r="1.4" fill="#FFFFFF"/>
      </svg>
      <span style="letter-spacing:-0.3px;">BB<span style="color:#FFFFFF;">Vision</span></span>
    </div>
  `,

  // =========================================================================
  // 2. ÍCONES UTILITÁRIOS DE INTERFACE & NAVEGAÇÃO
  // =========================================================================

  // Lupa de Busca com Lente Duotone
  search: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="11" cy="11" r="7.5" fill="#FED304" fill-opacity="0.16" stroke="currentColor" stroke-width="2.2"/>
      <path d="M8.5 8.5C9.3 7.7 10.5 7.4 11.5 7.6" stroke="#FED304" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M20.5 20.5L16.35 16.35" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,

  // Olho Biometric de Status / Visualização
  eye: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M1.5 12C3.8 7.2 7.5 4.5 12 4.5C16.5 4.5 20.2 7.2 22.5 12C20.2 16.8 16.5 19.5 12 19.5C7.5 19.5 3.8 16.8 1.5 12Z" fill="#002D62" fill-opacity="0.08" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3.5" fill="#FED304" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="1.2" fill="#002D62"/>
    </svg>
  `,

  // Seta Chevron
  chevronDown: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,

  // Sair / Encerrar Sessão Corporativa
  logOut: (size = 18, color = 'currentColor') => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="bbv-icon">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  `,

  // =========================================================================
  // 3. ÍCONES PRINCIPAIS DE DASHBOARD E ATALHOS (SUBSTITUI PNGs ANTIGOS POR SVGs HD)
  // =========================================================================

  // Início / Central de Comando BBVision
  iconeInicio: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M4 14.5L16 5L28 14.5V26C28 27.1046 27.1046 28 26 28H6C4.89543 28 4 27.1046 4 26V14.5Z" fill="#002D62" fill-opacity="0.14" stroke="#002D62" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M16 5L4 14.5L6.5 16.5L16 9L25.5 16.5L28 14.5L16 5Z" fill="#FED304" stroke="#002D62" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="12" y="18" width="8" height="10" rx="2" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <circle cx="16" cy="13.5" r="2" fill="#002D62"/>
    </svg>
  `,

  // Obras / Canteiro Arquitetônico BB
  iconeObras: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <!-- Fundo circular suave -->
      <rect x="2" y="2" width="36" height="36" rx="11" fill="#002D62" fill-opacity="0.07"/>
      <!-- Edifício Principal BB -->
      <rect x="8" y="13" width="15" height="21" rx="2" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2"/>
      <rect x="10.5" y="9" width="10" height="4" rx="1" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <!-- Janelas Técnicas -->
      <rect x="11.5" y="16.5" width="3" height="3" rx="0.6" fill="#002D62"/>
      <rect x="16.5" y="16.5" width="3" height="3" rx="0.6" fill="#002D62"/>
      <rect x="11.5" y="21.5" width="3" height="3" rx="0.6" fill="#38BDF8"/>
      <rect x="16.5" y="21.5" width="3" height="3" rx="0.6" fill="#002D62"/>
      <rect x="13" y="27" width="5" height="7" rx="1" fill="#FED304" stroke="#002D62" stroke-width="1.6"/>
      <!-- Grua / Guindaste de Engenharia à Direita -->
      <path d="M28 34V10M24 10H34M28 10L33 14" stroke="#002D62" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M32 14V20" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
      <rect x="29.5" y="20" width="5" height="5" rx="1" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <!-- Linha de Solo -->
      <line x1="5" y1="34" x2="35" y2="34" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // Auditoria / Nova Vistoria com Scanner Vision AI
  iconeAuditoria: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="2" y="2" width="36" height="36" rx="11" fill="#FED304" fill-opacity="0.18"/>
      <!-- Prancheta Técnica -->
      <rect x="8" y="8" width="20" height="25" rx="3" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2"/>
      <path d="M14 6H22C22.5523 6 23 6.44772 23 7V10H13V7C13 6.44772 13.4477 6 14 6Z" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <!-- Linhas de Checklist -->
      <path d="M12 15L13.8 16.8L17 13.5" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="19.5" y1="15" x2="24" y2="15" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 21L13.8 22.8L17 19.5" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="19.5" y1="21" x2="23" y2="21" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <!-- Lente Escaneadora IA Sobreposta -->
      <circle cx="26.5" cy="26.5" r="7" fill="#002D62" stroke="#FED304" stroke-width="2.2"/>
      <circle cx="26.5" cy="26.5" r="3" fill="#38BDF8"/>
      <path d="M31.8 31.8L35 35" stroke="#002D62" stroke-width="2.8" stroke-linecap="round"/>
    </svg>
  `,

  // Relatórios / Dossiê Técnico com Selo Ouro
  iconeRelatorio: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="2" y="2" width="36" height="36" rx="11" fill="#002D62" fill-opacity="0.07"/>
      <!-- Folha de Laudo -->
      <path d="M9 8C9 6.34315 10.3431 5 12 5H23L30 12V32C30 33.6569 28.6569 35 27 35H12C10.3431 35 9 33.6569 9 32V8Z" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M23 5V12H30" fill="#FED304" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <!-- Gráfico de Barras de Medição -->
      <rect x="13" y="21" width="3" height="6" rx="1" fill="#002D62"/>
      <rect x="18" y="17" width="3" height="10" rx="1" fill="#38BDF8"/>
      <rect x="23" y="14" width="3" height="13" rx="1" fill="#FED304" stroke="#002D62" stroke-width="1.2"/>
      <!-- Selo de Fé Pública no Canto -->
      <circle cx="28" cy="30" r="5.5" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <path d="M26 30L27.5 31.5L30.5 28.5" stroke="#002D62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Cadastrar Nova Obra (Planta + Badge Dourado "+")
  iconeCadastro: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <!-- Prédio em Planta -->
      <rect x="5" y="8" width="18" height="22" rx="3" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2"/>
      <path d="M9 4H19C19.5523 4 20 4.44772 20 5V8H8V5C8 4.44772 8.44772 4 9 4Z" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <rect x="9" y="12" width="4" height="4" rx="0.8" fill="#002D62"/>
      <rect x="15" y="12" width="4" height="4" rx="0.8" fill="#38BDF8"/>
      <rect x="9" y="18" width="4" height="4" rx="0.8" fill="#002D62"/>
      <rect x="15" y="18" width="4" height="4" rx="0.8" fill="#002D62"/>
      <!-- Círculo Dourado de Adição (+) -->
      <circle cx="25.5" cy="25.5" r="7.5" fill="#FED304" stroke="#002D62" stroke-width="2.2"/>
      <path d="M25.5 22V29M22 25.5H29" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // CREA / CAU - Insígnia de Engenharia & Arquitetura Oficial
  iconeCrea: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon" style="vertical-align:middle;">
      <circle cx="14" cy="14" r="11" fill="#FED304" fill-opacity="0.22" stroke="#002D62" stroke-width="2"/>
      <!-- Engrenagem Técnica Simplificada -->
      <circle cx="14" cy="14" r="6.5" fill="#002D62" stroke="#FED304" stroke-width="1.8"/>
      <path d="M14 4V6.5M14 21.5V24M4 14H6.5M21.5 14H24M6.9 6.9L8.7 8.7M19.3 19.3L21.1 21.1M21.1 6.9L19.3 8.7M8.7 19.3L6.9 21.1" stroke="#002D62" stroke-width="2.2" stroke-linecap="round"/>
      <!-- Check Dourado Central -->
      <path d="M11.5 14L13.2 15.7L16.8 12.2" stroke="#FED304" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Avatar / Badge Perfil Fiscal Banco do Brasil (Mariana)
  perfilBb: (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="24" cy="24" r="22" fill="#002D62" stroke="#FED304" stroke-width="2.5"/>
      <!-- Ombros / Blazer Institucional -->
      <path d="M10 40C11.5 33.5 16.8 30 24 30C31.2 30 36.5 33.5 38 40" fill="#004694" stroke="#FED304" stroke-width="2" stroke-linecap="round"/>
      <!-- Gravata / Lenço Ouro BB -->
      <path d="M24 30L21.5 36L24 41L26.5 36L24 30Z" fill="#FED304"/>
      <!-- Rosto -->
      <circle cx="24" cy="19" r="7.5" fill="#FFFFFF" stroke="#FED304" stroke-width="2"/>
      <!-- Capacete / Insígnia de Fiscalização BB -->
      <path d="M16 17C16 12.5 19.5 9.5 24 9.5C28.5 9.5 32 12.5 32 17H16Z" fill="#FED304" stroke="#001B3D" stroke-width="1.8"/>
      <circle cx="36" cy="12" r="5" fill="#10B981" stroke="#001B3D" stroke-width="1.6"/>
      <path d="M34 12L35.4 13.4L38.2 10.6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Avatar / Badge Perfil Empreiteira de Obras (Rodrigo)
  perfilObras: (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="24" cy="24" r="22" fill="#FFFBEB" stroke="#002D62" stroke-width="2.5"/>
      <!-- Colete Refletivo de Engenharia -->
      <path d="M10 40C11.5 33.5 16.8 30 24 30C31.2 30 36.5 33.5 38 40" fill="#002D62" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 31V40M30 31V40" stroke="#FED304" stroke-width="3" stroke-linecap="round"/>
      <!-- Rosto -->
      <circle cx="24" cy="19.5" r="7" fill="#FFFFFF" stroke="#002D62" stroke-width="2"/>
      <!-- Capacete de Engenheiro Dourado com Aba -->
      <path d="M15 17.5C15 12.5 19 9 24 9C29 9 33 12.5 33 17.5H15Z" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <line x1="13" y1="17.5" x2="35" y2="17.5" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="22" y="9" width="4" height="5" rx="1" fill="#002D62"/>
    </svg>
  `,

  // Controle Técnico / Gestão
  iconeControle: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="3" y="3" width="26" height="26" rx="8" fill="#002D62" fill-opacity="0.08"/>
      <line x1="8" y1="11" x2="24" y2="11" stroke="#002D62" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="8" y1="21" x2="24" y2="21" stroke="#002D62" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="13" cy="11" r="3.5" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <circle cx="19" cy="21" r="3.5" fill="#38BDF8" stroke="#002D62" stroke-width="2"/>
    </svg>
  `,

  // Instituição Bancária / Agência BB
  iconeBanco: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M16 4L4 11H28L16 4Z" fill="#FED304" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <line x1="8" y1="11" x2="8" y2="23" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="13.5" y1="11" x2="13.5" y2="23" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="18.5" y1="11" x2="18.5" y2="23" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="24" y1="11" x2="24" y2="23" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="4" y="23" width="24" height="4" rx="1.5" fill="#002D62"/>
    </svg>
  `,

  // Escudo Amarelo (Compatibilidade + Visual Duotone)
  shieldYellow: (size = 36) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect width="40" height="40" rx="12" fill="#FFF9D2"/>
      <path d="M20 7L9 11.8V19.8C9 27.1 13.7 33.7 20 36C26.3 33.7 31 27.1 31 19.8V11.8L20 7Z" fill="#FED304" stroke="#002D62" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M15.5 20.5L18.5 23.5L25 17" stroke="#002D62" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Pasta de Obras
  folderObras: (size = 36) => Icons.iconeObras(size),

  // Hexágono Relatórios
  reportsHex: (size = 36) => Icons.iconeRelatorio(size),

  // =========================================================================
  // 4. NOVOS ÍCONES ESPECIALIZADOS BBVISION (SUBSTITUEM EMOJIS GENÉRICOS)
  // =========================================================================

  // Escudo de Fé Pública & Validação Criptográfica (Substitui 🛡️)
  shieldFePublica: (size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon bbv-icon-shield">
      <path d="M16 3L5 7.8V15.5C5 22.8 9.7 29.2 16 31.5C22.3 29.2 27 22.8 27 15.5V7.8L16 3Z" fill="#002D62" stroke="#FED304" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M16 6.5L8.5 9.8V15.2C8.5 20.4 11.7 25.1 16 27C20.3 25.1 23.5 20.4 23.5 15.2V9.8L16 6.5Z" fill="#004694" fill-opacity="0.55"/>
      <path d="M11.5 16.2L14.6 19.3L20.8 13" stroke="#FED304" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Checklist Técnico BB (Substitui 📋)
  checklistBb: (size = 24) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="6" y="6" width="20" height="23" rx="3.5" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2"/>
      <rect x="11" y="3" width="10" height="5" rx="1.8" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <path d="M10 13.5L11.8 15.3L14.8 12" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="17.5" y1="14" x2="22" y2="14" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 19.5L11.8 21.3L14.8 18" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="17.5" y1="20" x2="22" y2="20" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <rect x="10" y="24" width="12" height="2" rx="1" fill="#FED304"/>
    </svg>
  `,

  // Câmera com Lente de Visão Computacional IA (Substitui 📷 e 📸)
  cameraAiLens: (size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M4 11C4 9.34315 5.34315 8 7 8H9.5L11.5 5H20.5L22.5 8H25C26.6569 8 28 9.34315 28 11V24C28 25.6569 26.6569 27 25 27H7C5.34315 27 4 25.6569 4 24V11Z" fill="#002D62" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="16" cy="17.5" r="5.5" fill="#38BDF8" stroke="#FED304" stroke-width="2"/>
      <circle cx="16" cy="17.5" r="2.2" fill="#001B3D"/>
      <circle cx="17.8" cy="15.8" r="1" fill="#FFFFFF"/>
      <circle cx="24" cy="12" r="1.5" fill="#FED304"/>
    </svg>
  `,

  // Alternar / Inverter Lente da Câmera (Substitui 🔄)
  cameraFlip: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M20 11C19.5 6.8 15.9 3.5 11.5 3.5C8.2 3.5 5.3 5.4 4 8.2M4 4.5V8.5H8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 13C4.5 17.2 8.1 20.5 12.5 20.5C15.8 20.5 18.7 18.6 20 15.8M20 19.5V15.5H16" stroke="#FED304" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="2" fill="#FED304"/>
    </svg>
  `,

  // Cadeado de Inviolabilidade Forense (Substitui 🔒)
  lockInviolavel: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M9 12V8.5C9 5.73858 11.2386 3.5 14 3.5C16.7614 3.5 19 5.73858 19 8.5V12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="6" y="12" width="16" height="12.5" rx="3" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <circle cx="14" cy="17.2" r="1.8" fill="#002D62"/>
      <path d="M14 19V21.5" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  // Documento PDF Oficial com Selo BB (Substitui 📄)
  pdfDocument: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M6 5C6 3.89543 6.89543 3 8 3H17.5L23 8.5V23C23 24.1046 22.1046 25 21 25H8C6.89543 25 6 24.1046 6 23V5Z" fill="#FFFFFF" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <path d="M17.5 3V8.5H23" fill="#FED304" stroke="#002D62" stroke-width="1.8" stroke-linejoin="round"/>
      <rect x="9" y="12" width="10" height="2" rx="1" fill="#002D62"/>
      <rect x="9" y="16" width="7" height="2" rx="1" fill="#38BDF8"/>
      <circle cx="19" cy="20" r="3" fill="#FED304" stroke="#002D62" stroke-width="1.5"/>
    </svg>
  `,

  // Balança / Parecer de Homologação e Auditoria (Substitui ⚖️)
  gavelAuditoria: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <line x1="14" y1="4" x2="14" y2="23" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="8" y1="24" x2="20" y2="24" stroke="#FED304" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M5 9H23" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M6 9L3.5 16H9.5L7 9" fill="#FED304" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M21 9L18.5 16H24.5L22 9" fill="#FED304" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="14" cy="7.5" r="2.2" fill="#FED304" stroke="#002D62" stroke-width="1.6"/>
    </svg>
  `,

  // Caneta de Assinatura Digital / Edição (Substitui ✍️ e ✏️)
  penAssinatura: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M4 23.5C7.5 23.5 10.5 21.5 14 23C17.5 24.5 20.5 22.5 24 22.5" stroke="#FED304" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M18.5 4.5L22.5 8.5L10.5 20.5L5.5 21.5L6.5 16.5L18.5 4.5Z" fill="#FFFFFF" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <path d="M16 7L20 11" stroke="#FED304" stroke-width="2.2"/>
    </svg>
  `,

  // Pino Geodésico GPS in-loco (Substitui 📍)
  gpsPin: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <ellipse cx="14" cy="24" rx="7" ry="2.2" fill="#38BDF8" fill-opacity="0.3"/>
      <path d="M14 3C9.58172 3 6 6.58172 6 11C6 16.8 14 24 14 24C14 24 22 16.8 22 11C22 6.58172 18.4183 3 14 3Z" fill="#002D62" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="14" cy="11" r="3.2" fill="#FED304"/>
    </svg>
  `,

  // Cronômetro Timestamp Oficial (Substitui ⏱️ e ⏳)
  clockTimestamp: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="12" cy="13" r="8.5" fill="#002D62" fill-opacity="0.1" stroke="currentColor" stroke-width="2"/>
      <line x1="9" y1="2" x2="15" y2="2" stroke="#FED304" stroke-width="2.4" stroke-linecap="round"/>
      <polyline points="12 9 12 13 15 15" stroke="#FED304" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Nó Criptográfico SHA-256 (Substitui ◇)
  hashCrypto: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <polygon points="12 2 21 7 21 17 12 22 3 17 3 7" fill="#002D62" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3.2" fill="#38BDF8"/>
    </svg>
  `,

  // Brilho Inteligência Artificial Gemini Vision (Substitui ✨ e 🤖)
  aiSparkle: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="#FED304" stroke="#002D62" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="19" cy="5" r="2" fill="#38BDF8"/>
      <circle cx="5" cy="19" r="1.5" fill="#38BDF8"/>
    </svg>
  `,

  // Raio de Velocidade / Ação Rápida (Substitui ⚡)
  boltFlash: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2" fill="#FED304" stroke="#002D62" stroke-width="1.8" stroke-linejoin="round"/>
    </svg>
  `,

  // Chave de Protocolo / Credencial (Substitui 🔑)
  keyProtocolo: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="8" cy="15" r="5" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <path d="M12 11L21 2M17 6L20 9M14.5 8.5L17 11" stroke="#002D62" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="7.5" cy="15.5" r="1.5" fill="#002D62"/>
    </svg>
  `,

  // Alerta Técnico de Engenharia (Substitui ⚠️)
  warningAlert: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" fill="#FED304" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="13.5" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="12" cy="17" r="1.3" fill="#002D62"/>
    </svg>
  `,

  // Erro / Rejeição Forense (Substitui ❌)
  errorCross: (size = 20) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="12" cy="12" r="9.5" fill="#EF4444" stroke="#991B1B" stroke-width="2"/>
      <path d="M15 9L9 15M9 9L15 15" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,

  // Informação Institucional (Substitui ℹ️)
  infoBadge: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="12" cy="12" r="9.5" fill="#002D62" stroke="#FED304" stroke-width="2"/>
      <line x1="12" y1="11" x2="12" y2="16.5" stroke="#FED304" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="12" cy="7.5" r="1.4" fill="#FED304"/>
    </svg>
  `,

  // Download de Laudo PDF (Substitui 📥)
  downloadFile: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M12 3V15M12 15L7.5 10.5M12 15L16.5 10.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `,

  // Abrir em Nova Guia (Substitui ↗)
  externalOpen: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M14 4H20V10" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 4L11 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M19 14V19C19 20.1046 18.1046 21 17 21H5C3.89543 21 3 20.1046 3 19V7C3 5.89543 3.89543 5 5 5H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  // Sincronização / Rede Offline (Substitui 📡)
  signalOffline: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2C5.5 13.9 5.5 10.1 7.8 7.8" stroke="#FED304" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="#FED304"/>
      <path d="M16.2 7.8C18.5 10.1 18.5 13.9 16.2 16.2M19.1 4.9C23 8.8 23 15.2 19.1 19.1" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `,

  // Tipos de Pergunta do Checklist (Substituem 🔘, ☑️, 📝)
  questionRadio: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="12" cy="12" r="9" fill="#002D62" fill-opacity="0.1" stroke="#002D62" stroke-width="2.2"/>
      <circle cx="12" cy="12" r="4.5" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
    </svg>
  `,

  questionCheckbox: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="3" y="3" width="18" height="18" rx="4.5" fill="#FED304" stroke="#002D62" stroke-width="2.2"/>
      <path d="M7.5 12.2L10.5 15.2L16.5 9" stroke="#002D62" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  questionText: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="3" y="4" width="18" height="16" rx="3" fill="#FFFFFF" stroke="#002D62" stroke-width="2"/>
      <line x1="7" y1="9" x2="17" y2="9" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <line x1="7" y1="13" x2="14" y2="13" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
      <circle cx="17" cy="15" r="2" fill="#FED304"/>
    </svg>
  `,

  // =========================================================================
  // 5. STATUS DE ANÁLISE & INDICADORES
  // =========================================================================

  // Status Concluído / Homologado
  checkVerified: (size = 15) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#065F46" stroke-width="1.8"/>
      <path d="M7.5 12.3L10.5 15.3L16.8 9" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // Status Em Andamento
  clockPending: (size = 15) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="12" cy="12" r="10" fill="#FED304" stroke="#B45309" stroke-width="1.8"/>
      <polyline points="12 7 12 12 15.5 14" stroke="#002D62" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // =========================================================================
  // 6. ILUSTRAÇÕES ARQUITETÔNICAS / CAD BLUEPRINT (CARDS DE OBRAS)
  // =========================================================================

  // Ilustração CAD 1: Elevação Arquitetônica Agência BB + Telemetria IA
  cadHouse1: () => `
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-cad-illustration">
      <defs>
        <pattern id="cadGrid1" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#CBD5E1" stroke-width="0.6" stroke-dasharray="2 2"/>
        </pattern>
      </defs>
      <rect width="220" height="130" fill="url(#cadGrid1)" opacity="0.55"/>
      <!-- Cotas Técnicas Superiores -->
      <line x1="36" y1="18" x2="184" y2="18" stroke="#64748B" stroke-width="1" stroke-dasharray="3 2"/>
      <line x1="36" y1="14" x2="36" y2="22" stroke="#002D62" stroke-width="1.4"/>
      <line x1="184" y1="14" x2="184" y2="22" stroke="#002D62" stroke-width="1.4"/>
      <rect x="92" y="11" width="36" height="13" rx="4" fill="#002D62"/>
      <text x="110" y="20" text-anchor="middle" fill="#FED304" font-size="8" font-weight="800" font-family="monospace">BB-CAD</text>

      <!-- Sombra Projetada -->
      <polygon points="36,108 184,108 198,116 50,116" fill="#002D62" fill-opacity="0.08"/>

      <!-- Corpo Principal da Agência BB -->
      <rect x="42" y="42" width="136" height="66" rx="2" fill="#FFFFFF" stroke="#002D62" stroke-width="2"/>
      <!-- Testeira / Marquise Institucional Ouro BB -->
      <rect x="36" y="32" width="148" height="14" rx="3" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <rect x="46" y="36" width="36" height="6" rx="1.5" fill="#002D62"/>

      <!-- Fachada de Vidro & Autoatendimento -->
      <rect x="52" y="54" width="42" height="36" rx="2" fill="#E0F2FE" stroke="#002D62" stroke-width="1.6"/>
      <line x1="73" y1="54" x2="73" y2="90" stroke="#002D62" stroke-width="1.4"/>
      <line x1="52" y1="72" x2="94" y2="72" stroke="#002D62" stroke-width="1.2"/>

      <!-- Porta Principal com Rampa NBR 9050 -->
      <rect x="104" y="60" width="28" height="48" fill="#002D62" fill-opacity="0.1" stroke="#002D62" stroke-width="1.8"/>
      <line x1="118" y1="60" x2="118" y2="108" stroke="#002D62" stroke-width="1.4"/>
      <polygon points="98,108 138,108 144,115 92,115" fill="#FED304" stroke="#002D62" stroke-width="1.4"/>

      <!-- Totem Vertical Banco do Brasil -->
      <rect x="148" y="50" width="20" height="58" rx="2" fill="#002D62" stroke="#001B3D" stroke-width="1.8"/>
      <circle cx="158" cy="64" r="5" fill="#FED304"/>
      <line x1="153" y1="76" x2="163" y2="76" stroke="#FED304" stroke-width="2" stroke-linecap="round"/>
      <line x1="153" y1="82" x2="163" y2="82" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>

      <!-- Nós de Inspecção IA nos Vértices -->
      <circle cx="36" cy="32" r="3.5" fill="#FED304" stroke="#002D62" stroke-width="1.5"/>
      <circle cx="184" cy="32" r="3.5" fill="#FED304" stroke="#002D62" stroke-width="1.5"/>
      <circle cx="158" cy="64" r="2" fill="#002D62"/>

      <!-- Linha de Terra Arquitetônica -->
      <line x1="20" y1="108" x2="200" y2="108" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // Ilustração CAD 2: Perspectiva Isométrica 3D Complexo Corporativo BB
  cadHouse2: () => `
    <svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-cad-illustration">
      <defs>
        <pattern id="cadGrid2" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#CBD5E1" stroke-width="0.6" stroke-dasharray="2 2"/>
        </pattern>
      </defs>
      <rect width="220" height="130" fill="url(#cadGrid2)" opacity="0.55"/>

      <!-- Torre Corporativa Esquerda (Isométrica) -->
      <polygon points="75,20 115,36 115,104 75,104" fill="#FFFFFF" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="45,34 75,20 75,104 45,104" fill="#E2E8F0" stroke="#002D62" stroke-width="2" stroke-linejoin="round"/>
      <!-- Topo Dourado da Torre -->
      <polygon points="45,34 75,20 115,36 85,48" fill="#FED304" stroke="#002D62" stroke-width="1.8" stroke-linejoin="round"/>

      <!-- Linhas de Pavimentos da Torre -->
      <line x1="75" y1="42" x2="115" y2="56" stroke="#002D62" stroke-width="1.4"/>
      <line x1="75" y1="60" x2="115" y2="74" stroke="#002D62" stroke-width="1.4"/>
      <line x1="75" y1="78" x2="115" y2="92" stroke="#002D62" stroke-width="1.4"/>

      <!-- Bloco Anexo Direito -->
      <rect x="115" y="54" width="58" height="50" fill="#FFFFFF" stroke="#002D62" stroke-width="2"/>
      <rect x="115" y="46" width="62" height="10" rx="2" fill="#002D62"/>
      <rect x="125" y="64" width="16" height="14" rx="1.5" fill="#E0F2FE" stroke="#002D62" stroke-width="1.5"/>
      <rect x="148" y="64" width="16" height="14" rx="1.5" fill="#FED304" stroke="#002D62" stroke-width="1.5"/>
      <rect x="134" y="84" width="22" height="20" fill="#002D62" fill-opacity="0.15" stroke="#002D62" stroke-width="1.6"/>

      <!-- Retícula de Escaneamento IA -->
      <circle cx="156" cy="30" r="10" fill="#002D62" fill-opacity="0.08" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="156" cy="30" r="3" fill="#FED304" stroke="#002D62" stroke-width="1.4"/>

      <!-- Base Estrutural -->
      <line x1="24" y1="104" x2="196" y2="104" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="38" y1="111" x2="182" y2="111" stroke="#FED304" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `,

  // =========================================================================
  // 7. BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM NAV MOBILE COM ESTADOS ATIVOS)
  // =========================================================================

  navHome: (active = false) => `
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-nav-svg">
      <path d="M4 12.5L14 4L24 12.5V22.5C24 23.6046 23.1046 24.5 22 24.5H6C4.89543 24.5 4 23.6046 4 22.5V12.5Z"
        fill="${active ? '#FED304' : 'none'}" fill-opacity="${active ? '0.28' : '0'}"
        stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="11" y="15.5" width="6" height="9" rx="1.5"
        fill="${active ? '#FED304' : 'none'}" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2"/>
    </svg>
  `,

  navObras: (active = false) => `
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-nav-svg">
      <rect x="4" y="8" width="12" height="16.5" rx="2"
        fill="${active ? '#FED304' : 'none'}" fill-opacity="${active ? '0.3' : '0'}"
        stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2.2"/>
      <rect x="16" y="13" width="8" height="11.5" rx="1.5"
        fill="${active ? '#38BDF8' : 'none'}" fill-opacity="${active ? '0.25' : '0'}"
        stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2"/>
      <line x1="8" y1="12" x2="12" y2="12" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="16" x2="12" y2="16" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2" stroke-linecap="round"/>
      <line x1="2" y1="24.5" x2="26" y2="24.5" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `,

  navRelatorios: (active = false) => `
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-nav-svg">
      <path d="M6 5.5C6 4.39543 6.89543 3.5 8 3.5H17.5L22.5 8.5V22.5C22.5 23.6046 21.6046 24.5 20.5 24.5H8C6.89543 24.5 6 23.6046 6 22.5V5.5Z"
        fill="${active ? '#FED304' : 'none'}" fill-opacity="${active ? '0.25' : '0'}"
        stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M17 3.5V9H22.5" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2" stroke-linejoin="round"/>
      <line x1="10" y1="14" x2="18" y2="14" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2" stroke-linecap="round"/>
      <line x1="10" y1="18.5" x2="15" y2="18.5" stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  navPerfil: (active = false) => `
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-nav-svg">
      <circle cx="14" cy="9.5" r="4.5"
        fill="${active ? '#FED304' : 'none'}" fill-opacity="${active ? '0.4' : '0'}"
        stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2.2"/>
      <path d="M5.5 23.5C6.8 18.8 10 16.5 14 16.5C18 16.5 21.2 18.8 22.5 23.5"
        stroke="${active ? '#002D62' : 'currentColor'}" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
  `,

  // =========================================================================
  // 8. ÍCONES DA TELA "SELECIONE O TIPO DE LOCAL" (E3 / FLUXO DE VISTORIA)
  // =========================================================================

  // Agência Bancária BB (Fachada 3D com Marquise Ouro + Colunas + Câmera)
  iconAgencia: (size = 44) => `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="4" y="4" width="48" height="48" rx="14" fill="#002D62" fill-opacity="0.06"/>
      <!-- Frontão & Marquise Ouro BB -->
      <path d="M28 9L9 19H47L28 9Z" fill="#FED304" stroke="#002D62" stroke-width="2.2" stroke-linejoin="round"/>
      <rect x="10" y="19" width="36" height="5" rx="1.5" fill="#002D62"/>
      <!-- Corpo & Colunas -->
      <rect x="13" y="24" width="30" height="20" fill="#FFFFFF" stroke="#002D62" stroke-width="2"/>
      <line x1="19" y1="24" x2="19" y2="44" stroke="#002D62" stroke-width="2.2"/>
      <line x1="37" y1="24" x2="37" y2="44" stroke="#002D62" stroke-width="2.2"/>
      <!-- Porta Giratória / Entrada BB -->
      <rect x="23.5" y="29" width="9" height="15" rx="1.5" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <!-- Base -->
      <rect x="8" y="44" width="40" height="4" rx="2" fill="#002D62"/>
    </svg>
  `,

  // Terminal de Autoatendimento / Caixa Eletrônico (ATM BB)
  iconAtm: (size = 44) => `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="4" y="4" width="48" height="48" rx="14" fill="#FED304" fill-opacity="0.16"/>
      <!-- Gabinete do Terminal ATM -->
      <rect x="14" y="8" width="28" height="40" rx="4" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2"/>
      <!-- Topo Luminoso Amarelo BB -->
      <path d="M14 12C14 9.79086 15.7909 8 18 8H38C40.2091 8 42 9.79086 42 12V15H14V12Z" fill="#FED304" stroke="#002D62" stroke-width="2"/>
      <!-- Tela Digital Touch -->
      <rect x="18" y="19" width="20" height="13" rx="2" fill="#002D62"/>
      <path d="M22 25.5H28M22 28.5H25" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
      <circle cx="33" cy="24" r="2.2" fill="#FED304"/>
      <!-- Leitor de Cartão e Dispensador de Cédulas -->
      <line x1="31" y1="36" x2="37" y2="36" stroke="#10B981" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="19" y="40" width="18" height="3.5" rx="1.5" fill="#FED304" stroke="#002D62" stroke-width="1.5"/>
    </svg>
  `,

  // Área Externa / Calçada / Acessibilidade NBR 9050
  iconAreaExterna: (size = 44) => `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="4" y="4" width="48" height="48" rx="14" fill="#38BDF8" fill-opacity="0.12"/>
      <!-- Sol / Iluminação Natural -->
      <circle cx="17" cy="16" r="4.5" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <!-- Árvore / Paisagismo Urbano -->
      <circle cx="37" cy="23" r="8" fill="#10B981" fill-opacity="0.25" stroke="#002D62" stroke-width="2"/>
      <circle cx="33" cy="26" r="5.5" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <line x1="36" y1="31" x2="36" y2="43" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <!-- Poste de Iluminação da Praça BB -->
      <path d="M18 43V25C18 22.8 19.8 21 22 21H25" stroke="#002D62" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M23 21H27L26 24H24L23 21Z" fill="#FED304" stroke="#002D62" stroke-width="1.5"/>
      <!-- Calçada com Piso Tátil NBR 9050 -->
      <rect x="9" y="43" width="38" height="5" rx="2" fill="#002D62"/>
      <circle cx="15" cy="45.5" r="1" fill="#FED304"/>
      <circle cx="21" cy="45.5" r="1" fill="#FED304"/>
      <circle cx="27" cy="45.5" r="1" fill="#FED304"/>
      <circle cx="33" cy="45.5" r="1" fill="#FED304"/>
      <circle cx="39" cy="45.5" r="1" fill="#FED304"/>
    </svg>
  `,

  // Prédio Administrativo / Sede Corporativa BB
  iconPredioAdmin: (size = 44) => `
    <svg width="${size}" height="${size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <rect x="4" y="4" width="48" height="48" rx="14" fill="#002D62" fill-opacity="0.07"/>
      <!-- Torre Principal -->
      <rect x="13" y="10" width="20" height="36" rx="2.5" fill="#FFFFFF" stroke="#002D62" stroke-width="2.2"/>
      <rect x="17" y="6" width="12" height="4" rx="1" fill="#FED304" stroke="#002D62" stroke-width="1.8"/>
      <!-- Anexo Corporativo -->
      <rect x="33" y="22" width="12" height="24" rx="2" fill="#E0F2FE" stroke="#002D62" stroke-width="2"/>
      <!-- Janelas Espelhadas -->
      <rect x="17" y="15" width="4.5" height="4.5" rx="0.8" fill="#002D62"/>
      <rect x="24.5" y="15" width="4.5" height="4.5" rx="0.8" fill="#FED304"/>
      <rect x="17" y="23" width="4.5" height="4.5" rx="0.8" fill="#38BDF8"/>
      <rect x="24.5" y="23" width="4.5" height="4.5" rx="0.8" fill="#002D62"/>
      <rect x="17" y="31" width="4.5" height="4.5" rx="0.8" fill="#002D62"/>
      <rect x="24.5" y="31" width="4.5" height="4.5" rx="0.8" fill="#002D62"/>
      <line x1="36.5" y1="28" x2="41.5" y2="28" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <line x1="36.5" y1="34" x2="41.5" y2="34" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
      <!-- Solo -->
      <line x1="9" y1="46" x2="47" y2="46" stroke="#002D62" stroke-width="2.6" stroke-linecap="round"/>
    </svg>
  `,

  // =========================================================================
  // 9. SELOS DE INVIOLABILIDADE E BLOQUEIO CRIPTOGRÁFICO (E4 / E5)
  // =========================================================================

  // Escudo com Cadeado Dourado (Tela Imagem Protegida)
  lockShieldGold: (size = 54) => `
    <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <circle cx="32" cy="32" r="29" fill="#FED304" fill-opacity="0.16" stroke="#FED304" stroke-width="1.5" stroke-dasharray="4 3"/>
      <path d="M32 6L11 14.5V29.5C11 43.2 20 55.4 32 59C44 55.4 53 43.2 53 29.5V14.5L32 6Z" fill="#002D62" stroke="#FED304" stroke-width="2.8" stroke-linejoin="round"/>
      <!-- Cadeado Central Ouro -->
      <rect x="22" y="29" width="20" height="16" rx="3.5" fill="#FED304" stroke="#001B3D" stroke-width="2.2"/>
      <path d="M26 29V24C26 20.6863 28.6863 18 32 18C35.3137 18 38 20.6863 38 24V29" stroke="#FED304" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="35.5" r="2.2" fill="#002D62"/>
      <line x1="32" y1="37.5" x2="32" y2="41" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // Cofre / Cubo Criptográfico 3D Bloqueado (Tela Relatório Bloqueado)
  boxLocked3D: (size = 64) => `
    <svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" class="bbv-icon">
      <!-- Aura Hexagonal Externa -->
      <circle cx="40" cy="40" r="36" fill="#FED304" fill-opacity="0.14"/>
      <!-- Cubo Isométrico 3D -->
      <path d="M40 10L68 25V55L40 70L12 55V25L40 10Z" fill="#002D62" stroke="#FED304" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M40 10L68 25L40 40L12 25L40 10Z" fill="#004694" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 25L40 40V70L12 55V25Z" fill="#001B3D" stroke="#FED304" stroke-width="2" stroke-linejoin="round"/>
      <!-- Escudo + Cadeado Dourado Sobposto -->
      <circle cx="54" cy="54" r="16" fill="#FED304" stroke="#002D62" stroke-width="2.8"/>
      <rect x="48" y="53" width="12" height="10" rx="2" fill="#002D62"/>
      <path d="M50.5 53V50C50.5 48.067 52.067 46.5 54 46.5C55.933 46.5 57.5 48.067 57.5 50V53" stroke="#002D62" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="54" cy="58" r="1.5" fill="#FED304"/>
    </svg>
  `
};
