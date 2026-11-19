/**
 * BBVision - Configurações Institucionais, SEO e Agent-Readiness
 * Fonte única de verdade para metadados públicos, Structured Data (JSON-LD),
 * Sitemap, robots.txt, llms.txt, Markdown negotiation e MCP Server Card (SEP-1649).
 */

const SITE_URL = (process.env.SITE_URL || 'https://antiquewhite-dolphin-779579.hostingersite.com').replace(/\/+$/, '');

const siteConfig = {
  siteUrl: SITE_URL,
  name: 'BBVision',
  title: 'BBVision - Fiscalização Remota de Obras | Banco do Brasil',
  shortDescription:
    'Sistema Inteligente de Fiscalização e Monitoramento Remoto de Obras do Banco do Brasil com IA Google Gemini, Fé Pública e Inviolabilidade Criptográfica SHA-256.',
  longDescription:
    'Plataforma corporativa desenvolvida no programa Residência Tecnológica em Software & IA (Porto Digital / TakeOff) para substituir vistorias presenciais dispendiosas por fiscalizações remotas auditáveis, com captura fotográfica exclusiva in-loco, validação visual via Google Gemini 1.5 Flash, checklists dinâmicos, assinatura digital e selo criptográfico SHA-256 com validação pública de Fé Pública.',
  version: '1.2.0',
  language: 'pt-BR',
  logoUrl: `${SITE_URL}/src/assets/logo.png`,
  organization: {
    name: 'BBVision — Equipe TakeOff',
    legalName: 'BBVision — Solução de Fiscalização Remota de Obras para o Banco do Brasil (TakeOff / Porto Digital)',
    alternateName: 'BBVision',
    email: process.env.EMAIL_FROM || 'bbvision-notificacoes@bancodobrasil.com.br',
    fiscalEmail: process.env.FISCAL_EMAIL_PADRAO || 'mariana.fiscal@bb.com.br',
    telephone: '+55-81-3419-8000',
    telephoneDisplay: '+55 (81) 3419-8000',
    address: {
      streetAddress: 'Cais do Apolo, 222 - Bairro do Recife',
      addressLocality: 'Recife',
      addressRegion: 'PE',
      postalCode: '50030-230',
      addressCountry: 'BR',
    },
    sameAs: [
      'https://github.com/breno-nlima/BBvision',
      'https://www.bb.com.br',
      'https://www.portodigital.org',
      'https://www.linkedin.com/company/bancodobrasil/',
      'https://www.instagram.com/bancodobrasil/',
    ],
  },
  repositoryUrl: 'https://github.com/breno-nlima/BBvision',
  contentSignal: 'search=yes, ai-input=yes, ai-train=no',
  publicPages: [
    {
      key: 'home',
      path: '/',
      mdPath: '/index.md',
      title: 'BBVision - Fiscalização Remota de Obras | Banco do Brasil',
      priority: '1.0',
      changefreq: 'weekly',
    },
    {
      key: 'validador',
      path: '/validador',
      mdPath: '/validador.md',
      title: 'Validador Público de Fé Pública | BBVision',
      priority: '0.9',
      changefreq: 'daily',
    },
    {
      key: 'about',
      path: '/about',
      mdPath: '/about.md',
      title: 'Sobre o BBVision | Fiscalização Remota de Obras',
      priority: '0.8',
      changefreq: 'monthly',
    },
    {
      key: 'contact',
      path: '/contact',
      mdPath: '/contact.md',
      title: 'Contato e Suporte Institucional | BBVision',
      priority: '0.7',
      changefreq: 'monthly',
    },
    {
      key: 'terms',
      path: '/terms',
      mdPath: '/terms.md',
      title: 'Termos de Uso e Governança | BBVision',
      priority: '0.5',
      changefreq: 'yearly',
    },
    {
      key: 'privacy',
      path: '/privacy',
      mdPath: '/privacy.md',
      title: 'Política de Privacidade e LGPD | BBVision',
      priority: '0.5',
      changefreq: 'yearly',
    },
  ],
};

module.exports = siteConfig;
