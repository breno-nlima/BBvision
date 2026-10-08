/**
 * BVision Icons & SVG Assets Module
 * Vetores fiéis à identidade visual e mockups fornecidos
 */

export const Icons = {
  // Logo Principal BVision (Edifício em planta com olho e grid de engenharia)
  logoBVision: (size = 80) => `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Padrão de Grade / Blueprint -->
        <pattern id="blueprintGrid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.7"/>
        </pattern>
        <!-- Clip do quadrado com cantos suaves -->
        <clipPath id="logoClip">
          <rect width="100" height="100" rx="14" fill="white"/>
        </clipPath>
      </defs>

      <g clip-path="url(#logoClip)">
        <!-- Fundo Amarelo BB -->
        <rect width="100" height="100" fill="#FED304"/>
        <rect width="100" height="100" fill="url(#blueprintGrid)"/>

        <!-- Círculos concêntricos de radar/visão computacional -->
        <circle cx="50" cy="50" r="42" stroke="rgba(0, 45, 98, 0.2)" stroke-width="0.8" fill="none"/>
        <circle cx="50" cy="50" r="32" stroke="rgba(0, 45, 98, 0.25)" stroke-width="0.8" fill="none"/>
        <circle cx="50" cy="50" r="22" stroke="rgba(0, 45, 98, 0.3)" stroke-width="0.8" fill="none"/>

        <!-- Estrutura do Edifício / Isométrico (Parte Esquerda Branca) -->
        <path d="M50 22 L24 38 V82 L50 82 Z" fill="#FFFFFF"/>
        
        <!-- Estrutura do Edifício / Isométrico (Parte Direita Azul Marinho com Janelas) -->
        <path d="M50 22 L76 38 V82 L50 82 Z" fill="#002D62"/>
        
        <!-- Janelas Amarelas no Edifício Direito -->
        <rect x="54" y="32" width="4" height="6" fill="#FED304"/>
        <rect x="62" y="36" width="4" height="6" fill="#FED304"/>
        <rect x="70" y="40" width="4" height="6" fill="#FED304"/>
        
        <circle cx="64" cy="62" r="14" stroke="rgba(255, 255, 255, 0.25)" stroke-width="0.8" fill="none"/>
        <circle cx="64" cy="62" r="22" stroke="rgba(255, 255, 255, 0.2)" stroke-width="0.8" fill="none"/>

        <!-- Olho Central (BVision AI) -->
        <!-- Contorno externo do olho -->
        <path d="M 22 50 Q 50 26 78 50 Q 50 74 22 50 Z" fill="#FFFFFF" stroke="#002D62" stroke-width="3" stroke-linejoin="round"/>
        
        <!-- Íris Azul Marinho -->
        <circle cx="50" cy="50" r="14" fill="#002D62"/>
        
        <!-- Pupila e Brilho da Câmera -->
        <circle cx="50" cy="50" r="7" fill="#FFFFFF"/>
        <circle cx="51.5" cy="48.5" r="4.5" fill="#002D62"/>
        <circle cx="53" cy="47" r="1.8" fill="#FFFFFF"/>
      </g>
    </svg>
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
  `
};
