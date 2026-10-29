/**
 * BVision Icons & SVG Assets Module
 * Vetores fiéis à identidade visual e mockups fornecidos
 */

export const Icons = {
  // Logo Principal BBVision Oficial
  logoBVision: (size = 80) => `
    <img src="src/assets/logo.png" width="${size}" height="${size}" alt="BBVision" style="width: ${size}px; height: ${size}px; border-radius: ${Math.max(4, Math.round(size * 0.18))}px; object-fit: cover; display: inline-block; vertical-align: middle; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  `,

  // Ilustração de Casa Arquitetônica 1 (Fachada com Telhado e Chaminé - CAD Style)
  cadHouse1: (width = "100%", height = 100) => `
    <svg width="${width}" height="${height}" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Linha do chão -->
      <line x1="15" y1="95" x2="145" y2="95" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Paredes -->
      <rect x="30" y="55" width="100" height="40" stroke="#0F172A" stroke-width="1.6" fill="#FFFFFF"/>
      <!-- Telhado -->
      <polygon points="20,55 80,24 140,55" stroke="#0F172A" stroke-width="1.8" fill="#FFFFFF" stroke-linejoin="round"/>
      <!-- Chaminé -->
      <polyline points="106,37 106,28 116,28 116,42" stroke="#0F172A" stroke-width="1.6" fill="#FFFFFF"/>
      <!-- Beiral -->
      <line x1="26" y1="58" x2="134" y2="58" stroke="#0F172A" stroke-width="1.2"/>
      <!-- Porta -->
      <rect x="74" y="68" width="16" height="27" stroke="#0F172A" stroke-width="1.4" fill="#FFFFFF"/>
      <!-- Maçaneta -->
      <circle cx="86" cy="82" r="1" fill="#0F172A"/>
      <!-- Janela Esquerda -->
      <rect x="42" y="68" width="18" height="15" stroke="#0F172A" stroke-width="1.4" fill="#FFFFFF"/>
      <line x1="51" y1="68" x2="51" y2="83" stroke="#0F172A" stroke-width="1"/>
      <!-- Janela Direita Pequena -->
      <rect x="104" y="68" width="10" height="8" stroke="#0F172A" stroke-width="1.4" fill="#FFFFFF"/>
    </svg>
  `,

  // Ilustração de Casa Arquitetônica 2 (Perspectiva Isométrica 2 Andares - CAD Style)
  cadHouse2: (width = "100%", height = 100) => `
    <svg width="${width}" height="${height}" viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Linha do solo -->
      <line x1="15" y1="96" x2="145" y2="96" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Bloco Principal Frontal -->
      <polygon points="35,62 82,42 82,96 35,96" stroke="#0F172A" stroke-width="1.6" fill="#FFFFFF"/>
      <!-- Bloco Lateral Perspectiva -->
      <polygon points="82,42 128,58 128,96 82,96" stroke="#0F172A" stroke-width="1.6" fill="#FFFFFF"/>
      <!-- Telhado Frontal -->
      <polygon points="30,62 82,32 82,42" stroke="#0F172A" stroke-width="1.8" fill="#FFFFFF" stroke-linejoin="round"/>
      <!-- Telhado Lateral -->
      <polygon points="82,32 134,50 128,58 82,42" stroke="#0F172A" stroke-width="1.8" fill="#FFFFFF" stroke-linejoin="round"/>
      <!-- Janelas 2º Andar Lateral -->
      <polygon points="90,58 102,62 102,74 90,70" stroke="#0F172A" stroke-width="1.4" fill="#FFFFFF"/>
      <polygon points="108,64 120,68 120,80 108,76" stroke="#0F172A" stroke-width="1.4" fill="#FFFFFF"/>
      <!-- Vão de Entrada / Porta -->
      <polygon points="46,74 68,66 68,96 46,96" stroke="#0F172A" stroke-width="1.4" fill="#FFFFFF"/>
    </svg>
  `,

  // Ícone de Escudo com Fita Amarela (Nova Análise)
  shieldYellow: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L6 7V15C6 22 10.5 27.5 16 29C21.5 27.5 26 22 26 15V7L16 3Z" stroke="#002D62" stroke-width="2" stroke-linejoin="round" fill="#FFFFFF"/>
      <path d="M11 18L16 24L21 18H11Z" fill="#FED304"/>
      <path d="M16 11V18" stroke="#002D62" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `,

  // Ícone de Pasta/Caixa (Obras Recentes)
  folderObras: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 8C7 6.89543 7.89543 6 9 6H14L17 9H23C24.1046 9 25 9.89543 25 11V23C25 24.1046 24.1046 25 23 25H9C7.89543 25 7 24.1046 7 23V8Z" stroke="#002D62" stroke-width="2" fill="#FFFFFF"/>
      <line x1="12" y1="17" x2="20" y2="17" stroke="#FED304" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,

  // Ícone de Hexágono com Centro Amarelo (Relatórios)
  reportsHex: (size = 28) => `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L26 9.8V21.4L16 27.2L6 21.4V9.8L16 4Z" stroke="#002D62" stroke-width="2" fill="#FFFFFF" stroke-linejoin="round"/>
      <polygon points="16,10 21,13 21,19 16,22 11,19 11,13" fill="#FED304"/>
      <circle cx="16" cy="16" r="2" fill="#002D62"/>
    </svg>
  `,

  // Ícone de Lupa / Pesquisa
  search: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7"></circle>
      <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
    </svg>
  `,

  // Ícone de Olho / Visualizar
  eye: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `,

  // Ícone Chevron para baixo
  chevronDown: (size = 16) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,

  // Bottom Nav: Início
  navInicio: (size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,

  // Bottom Nav: Obras (Casinha / Prédio)
  navObras: (size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1M9 14h1M14 10h1M14 14h1M9 18h6v3H9v-3z"></path>
    </svg>
  `,

  // Bottom Nav: Relatórios
  navRelatorios: (size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `,

  // Bottom Nav: Perfil
  navPerfil: (size = 22) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `,

  // Logo Oficial do Banco do Brasil (Símbolo Losango Amarelo e Azul)
  logoBBOficial: (size = 32) => `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="9" fill="#FED304"/>
      <!-- Símbolo geométrico emblemático BB em azul marinho -->
      <path d="M20 7L31 18L20 29L9 18L20 7Z" stroke="#002D62" stroke-width="3.2" stroke-linejoin="round" fill="none"/>
      <path d="M20 12L26 18L20 24L14 18L20 12Z" fill="#002D62"/>
      <circle cx="20" cy="18" r="2.2" fill="#FED304"/>
    </svg>
  `,

  // Logo BVision Compacto Horizontal
  logoBVisionBadge: (size = 28) => `
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <img src="src/assets/logo.png" width="${size}" height="${size}" alt="BBVision" style="width: ${size}px; height: ${size}px; border-radius: ${Math.max(4, Math.round(size * 0.2))}px; object-fit: cover; display: inline-block; vertical-align: middle; box-shadow: 0 1px 4px rgba(0,0,0,0.15);" />
      <span style="font-weight: 800; font-size: 18px; color: #002D62; letter-spacing: -0.5px;">BBVision</span>
    </div>
  `,

  // Ícone Agência Bancária (Fachada, colunas clássicas)
  iconAgencia: (size = 32, color = "#002D62") => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 2 7 22 7 12 2"/>
      <line x1="5" y1="10" x2="5" y2="18"/>
      <line x1="9" y1="10" x2="9" y2="18"/>
      <line x1="15" y1="10" x2="15" y2="18"/>
      <line x1="19" y1="10" x2="19" y2="18"/>
      <rect x="2" y="18" width="20" height="3" rx="0.5"/>
    </svg>
  `,

  // Ícone Caixa Eletrônico (Documento / Tela de ATM)
  iconAtm: (size = 32, color = "#FFFFFF") => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="7" y1="8" x2="17" y2="8"/>
      <line x1="7" y1="12" x2="13" y2="12"/>
      <circle cx="15.5" cy="14.5" r="2.5" fill="#FED304" stroke="${color}" stroke-width="1.5"/>
    </svg>
  `,

  // Ícone Área Externa (Maleta com cruz médica / segurança)
  iconAreaExterna: (size = 32, color = "#FFFFFF") => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="6" width="18" height="15" rx="3"/>
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="12" y1="10" x2="12" y2="16" stroke="#FED304" stroke-width="2.5"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke="#FED304" stroke-width="2.5"/>
    </svg>
  `,

  // Ícone Prédio Administrativo (Prancheta / Checklist de Gestão)
  iconPredioAdmin: (size = 32, color = "#FFFFFF") => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M9 14l2 2 4-4" stroke="#FED304" stroke-width="2.5"/>
    </svg>
  `,

  // Cadeado Amarelo Inviolável (Imagem Protegida)
  lockShieldGold: (size = 72) => `
    <svg width="${size}" height="${size}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lockGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FED304" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#002D62" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="80" height="80" rx="18" fill="#001B3D"/>
      <circle cx="40" cy="40" r="30" fill="url(#lockGlow)"/>
      <!-- Arco do cadeado -->
      <path d="M28 35V26C28 19.37 33.37 14 40 14C46.63 14 52 19.37 52 26V35" stroke="#FED304" stroke-width="5" stroke-linecap="round"/>
      <!-- Corpo do cadeado -->
      <rect x="22" y="34" width="36" height="30" rx="6" fill="#FED304"/>
      <!-- Fechadura -->
      <circle cx="40" cy="46" r="3.5" fill="#002D62"/>
      <path d="M38.5 48L37.5 56H42.5L41.5 48Z" fill="#002D62"/>
    </svg>
  `,

  // Caixa 3D Laranja/Dourada (Relatório Bloqueado)
  boxLocked3D: (size = 80) => `
    <svg width="${size}" height="${size}" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Face Superior -->
      <polygon points="45,15 75,32 45,48 15,32" fill="#FFAF1A"/>
      <!-- Face Esquerda -->
      <polygon points="15,32 45,48 45,78 15,62" fill="#E68A00"/>
      <!-- Face Direita -->
      <polygon points="45,48 75,32 75,62 45,78" fill="#FFC043"/>
      <!-- Pequena fechadura / etiqueta na caixa -->
      <rect x="49" y="47" width="10" height="12" rx="2" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="54" cy="51" r="1.5" fill="#002D62"/>
      <line x1="54" y1="52.5" x2="54" y2="56" stroke="#002D62" stroke-width="1.2"/>
    </svg>
  `,

  // Ícone de Log-out / Encerrar Sessão Corporativa
  logOut: (size = 18, color = "currentColor") => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  `,

  // 1. Ícone Oficial de Cadastro (Documento + Silhueta + Badge +)
  iconeCadastro: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_cadastro.png" width="${size}" height="${size}" alt="Cadastro" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 2. Ícone Oficial CREA-DF (Documento Oficial + Capacete + Checkmark de Fé Pública)
  iconeCrea: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_crea.png" width="${size}" height="${size}" alt="CREA-DF" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 3. Perfil Oficial Fiscal BB (Mariana - Silhueta Azul + Brasão BB Amarelo)
  perfilBb: (size = 24, className = '') => `
    <img src="src/assets/icons/perfil_bb.png" width="${size}" height="${size}" alt="Perfil Fiscal BB" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 4. Ícone Oficial de Controle (Sliders + Engrenagem de Governança / Auditoria)
  iconeControle: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_controle.png" width="${size}" height="${size}" alt="Controle" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 5. Perfil Oficial Obras / Empreiteira (Rodrigo - Responsável Técnico de Campo com Capacete e Prancheta)
  perfilObras: (size = 24, className = '') => `
    <img src="src/assets/icons/perfil_obras.png" width="${size}" height="${size}" alt="Perfil Obras" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 6. Ícone Oficial Banco / Agência (Fachada Clássica com Colunas e Medalhão Dourado)
  iconeBanco: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_banco.png" width="${size}" height="${size}" alt="Banco" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 7. Ícone Oficial Auditoria (Prancheta + Escudo Dourado com Checkmark + Lupa com Gráfico)
  iconeAuditoria: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_auditoria.png" width="${size}" height="${size}" alt="Auditoria" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 8. Ícone Oficial Obras (Estrutura Predial em Construção + Guindaste / Grua BB)
  iconeObras: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_obras.png" width="${size}" height="${size}" alt="Obras" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 9. Ícone Oficial Relatório (Documento de Checklist com Gráfico Ascendente e Lupa)
  iconeRelatorio: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_relatorio.png" width="${size}" height="${size}" alt="Relatório" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `,

  // 10. Ícone Oficial Início (Casa Azul com Porta Dourada e Raios de Sol)
  iconeInicio: (size = 24, className = '') => `
    <img src="src/assets/icons/icone_inicio.png" width="${size}" height="${size}" alt="Início" class="${className}" style="width: ${size}px; height: ${size}px; object-fit: contain; display: inline-block; vertical-align: middle;" />
  `
};



