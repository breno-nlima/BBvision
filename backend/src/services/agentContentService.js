/**
 * BBVision - Serviço de Conteúdo Agent-Ready, SEO, Markdown e Páginas Institucionais
 * Gera robots.txt (com Content-Signal e Sitemap), sitemap.xml, llms.txt,
 * MCP Server Card (SEP-1649), representações Markdown (Accept: text/markdown),
 * Link Headers (RFC 8288) e páginas semânticas institucionais (/about, /contact, /terms, /privacy, /validador, 404).
 */

const siteConfig = require('../config/siteConfig');

const LAST_MOD = '2026-11-19';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRobotsTxt() {
  return [
    '# BBVision - Robots & Content Signals Policy',
    'User-agent: *',
    `Content-Signal: ${siteConfig.contentSignal}`,
    'Allow: /',
    'Disallow: /api/auth/',
    'Disallow: /uploads/',
    '',
    `Sitemap: ${siteConfig.siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

function getSitemapXml() {
  const urls = siteConfig.publicPages
    .map(
      (p) => `  <url>
    <loc>${siteConfig.siteUrl}${p.path}</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function getLlmsTxt() {
  const base = siteConfig.siteUrl;
  return `# BBVision

> ${siteConfig.shortDescription}

O BBVision é a plataforma de monitoramento, auditoria e fiscalização remota de obras para o Banco do Brasil, desenvolvida pela Equipe TakeOff no programa Residência Tecnológica em Software & IA (Porto Digital). Empreiteiras executam vistorias de campo com captura fotográfica exclusivamente in-loco (bloqueio de galeria), validação visual instantânea por IA (SLA <= 15s, confiança >= 75%), checklists dinâmicos, modo offline e assinatura digital com bloqueio imediato do laudo. Fiscais de engenharia do Banco do Brasil auditam os relatórios PDF carimbados com Código Único (16 caracteres hex) e Hash criptográfico SHA-256, homologando obras como REGULAR ou PENDENTE_AJUSTE.

## Páginas Principais

- [Início e Portal BBVision](${base}/): Acesso ao portal corporativo de fiscalização remota de obras para Empreiteiras e Fiscais do Banco do Brasil.
- [Validador Público de Fé Pública](${base}/validador): Consulta aberta para verificar a autenticidade e integridade criptográfica SHA-256 de laudos emitidos pelo BBVision.
- [Sobre o BBVision](${base}/about): Visão geral da arquitetura, personas (Rodrigo — Empreiteira e Mariana — Fiscal BB), governança de IA e equipe TakeOff / Porto Digital.
- [Contato e Suporte Institucional](${base}/contact): E-mail oficial, telefone institucional, endereço no Porto Digital (Recife/PE) e canais de suporte técnico.
- [Termos de Uso e Governança](${base}/terms): Regras de utilização, inviolabilidade documental, proibição de upload via galeria e responsabilidades legais.
- [Política de Privacidade e LGPD](${base}/privacy): Tratamento de dados pessoais, evidências fotográficas, trilhas de auditoria e direitos dos titulares conforme a LGPD.

## API e Descoberta para Agentes

- [Metadados da API REST](${base}/api-info): Inventário JSON dos endpoints públicos e autenticados do backend Express.
- [Health Check Operacional](${base}/api/health): Telemetria de disponibilidade, versão do sistema, memória e camada de persistência.
- [Validador Público JSON](${base}/api/validador/{codigoOuHash}): Endpoint GET público que valida Código Único (16 hex) ou Hash SHA-256 (64 hex) e retorna o laudo autenticado.
- [MCP Server Card (SEP-1649)](${base}/.well-known/mcp/server-card.json): Cartão de descoberta do servidor MCP BBVision com endpoint, capacidades e ferramentas suportadas.
- [Endpoint MCP Streamable HTTP](${base}/api/mcp): Endpoint JSON-RPC 2.0 do Model Context Protocol para ferramentas públicas de leitura e validação.
- [Sitemap XML](${base}/sitemap.xml): Lista estruturada de todas as páginas públicas indexáveis.

## Optional

- [Página Inicial em Markdown](${base}/index.md): Representação enxuta em Markdown da página inicial (também servida via cabeçalho HTTP Accept: text/markdown).
- [Repositório Oficial no GitHub](${siteConfig.repositoryUrl}): Código-fonte completo, documentação TakeOff e suíte de testes automatizados.
`;
}

function getMcpServerCard() {
  const base = siteConfig.siteUrl;
  const mcpEndpoint = `${base}/api/mcp`;

  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
    name: 'com.hostingersite.antiquewhite-dolphin-779579/bbvision',
    title: 'BBVision — Fiscalização Remota de Obras (Banco do Brasil)',
    version: siteConfig.version,
    protocolVersion: '2025-11-25',
    description:
      'Servidor MCP público do BBVision para validação criptográfica SHA-256 de laudos de obras (Fé Pública), telemetria de disponibilidade e consulta de metadados institucionais da plataforma.',
    websiteUrl: `${base}/`,
    documentationUrl: `${base}/llms.txt`,
    endpoint: mcpEndpoint,
    serverInfo: {
      name: 'bbvision-mcp',
      title: 'BBVision MCP Server',
      version: siteConfig.version,
    },
    transport: {
      type: 'streamable-http',
      endpoint: mcpEndpoint,
    },
    remotes: [
      {
        type: 'streamable-http',
        url: mcpEndpoint,
        supportedProtocolVersions: ['2025-11-25', '2025-03-26'],
      },
    ],
    authentication: {
      required: false,
      schemes: ['none', 'bearer'],
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: {
        subscribe: false,
        listChanged: false,
      },
      prompts: {
        listChanged: false,
      },
    },
    tools: [
      {
        name: 'validate_report_authenticity',
        description:
          'Valida a autenticidade e integridade criptográfica (Fé Pública) de um laudo de vistoria BBVision usando Código Único de 16 caracteres hexadecimais ou Hash SHA-256 de 64 caracteres.',
        inputSchema: {
          type: 'object',
          properties: {
            codigoOuHash: {
              type: 'string',
              description: 'Código Único de 16 caracteres hexadecimais ou Hash SHA-256 de 64 caracteres do laudo.',
            },
          },
          required: ['codigoOuHash'],
        },
      },
      {
        name: 'get_system_health',
        description: 'Retorna status operacional, versão, tempo de atividade e estado da camada de dados do BBVision.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'get_platform_info',
        description: 'Retorna informações institucionais, páginas públicas, canais de contato e endpoints do BBVision.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
    ],
    resources: [
      {
        uri: `${base}/llms.txt`,
        name: 'BBVision LLMs Guide',
        description: 'Guia estruturado do BBVision para agentes e LLMs.',
        mimeType: 'text/plain',
      },
      {
        uri: `${base}/index.md`,
        name: 'BBVision Homepage (Markdown)',
        description: 'Versão Markdown da página inicial do BBVision.',
        mimeType: 'text/markdown',
      },
    ],
    icons: [
      {
        src: siteConfig.logoUrl,
        type: 'image/png',
      },
    ],
    repository: {
      source: 'github',
      url: siteConfig.repositoryUrl,
    },
  };
}

function getLinkHeader(pageKey = 'home') {
  const page = siteConfig.publicPages.find((p) => p.key === pageKey) || siteConfig.publicPages[0];
  return [
    '</llms.txt>; rel="describedby"; type="text/plain"',
    `<${page.mdPath}>; rel="alternate"; type="text/markdown"`,
    '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
    '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  ].join(', ');
}

function getMarkdownPage(pageKey = 'home') {
  const base = siteConfig.siteUrl;
  const org = siteConfig.organization;

  const pages = {
    home: `# BBVision — Fiscalização Remota de Obras do Banco do Brasil

> ${siteConfig.shortDescription}

**URL Canônica:** ${base}/  
**Versão:** ${siteConfig.version}  
**Organização:** ${org.legalName}

## O que é o BBVision

${siteConfig.longDescription}

## Fluxo Operacional e Personas

### 1. Empreiteira em Campo (Persona Rodrigo)
- Seleciona a obra atribuída e o tipo de local de vistoria.
- Preenche checklist técnico dinâmico com sugestões editáveis de Inteligência Artificial.
- Realiza captura fotográfica exclusivamente ao vivo pela câmera (upload via galeria bloqueado).
- Recebe validação visual em tempo real via **IA** (SLA <= 15s, limiar de confiança >= 75%, com fallback manual assistido).
- Assina digitalmente, bloqueia o relatório contra alterações posteriores e gera Código Único (16 hex) + Hash SHA-256 + PDF oficial enviado por e-mail.
- Conta com modo offline de contingência com fila local e sincronização automática.

### 2. Fiscal de Engenharia do Banco do Brasil (Persona Mariana)
- Cadastra novas obras e vincula empreiteiras responsáveis.
- Audita relatórios consolidados em PDF com carimbo de autenticidade e evidências protegidas.
- Emite parecer técnico homologando a obra como \`REGULAR\` ou reprovando como \`PENDENTE_AJUSTE\`.

### 3. Validação Pública de Fé Pública
- Qualquer auditor externo pode verificar a autenticidade de um documento em [Validador Público](${base}/validador) ou via API em \`GET ${base}/api/validador/{codigoOuHash}\`.

## Páginas Institucionais e Recursos

- [Validador Público de Fé Pública](${base}/validador)
- [Sobre o BBVision](${base}/about)
- [Contato e Suporte](${base}/contact)
- [Termos de Uso](${base}/terms)
- [Política de Privacidade e LGPD](${base}/privacy)
- [Guia para Agentes (llms.txt)](${base}/llms.txt)
- [MCP Server Card (SEP-1649)](${base}/.well-known/mcp/server-card.json)

## Contato Institucional

- **E-mail:** [${org.email}](mailto:${org.email})
- **Telefone:** [${org.telephoneDisplay}](tel:${org.telephone.replace(/[^+\d]/g, '')})
- **Endereço:** ${org.address.streetAddress}, ${org.address.addressLocality} - ${org.address.addressRegion}, CEP ${org.address.postalCode}, Brasil
`,

    validador: `# Validador Público de Fé Pública — BBVision

> Verificação pública e gratuita da autenticidade e integridade criptográfica SHA-256 de laudos técnicos de obras do Banco do Brasil.

**URL Canônica:** ${base}/validador  
**Endpoint JSON:** \`GET ${base}/api/validador/{codigoOuHash}\`

## Como Funciona

1. **Geração do Código Único:** Ao finalizar uma vistoria, o BBVision gera um código hexadecimal único de 16 caracteres e um lacre SHA-256 de 64 caracteres gravados no PDF oficial.
2. **Consulta Pública:** Informe o Código Único ou o Hash SHA-256 no formulário de validação ou via requisição \`GET /api/validador/{codigoOuHash}\`.
3. **Certidão Anti-Fraude:** O sistema confirma se o laudo existe na base oficial, exibindo a unidade bancária, situação de homologação, parecer fiscal e link para o PDF autenticado.

## Links Relacionados

- [Voltar ao Portal BBVision](${base}/)
- [Sobre o BBVision](${base}/about)
- [Contato Institucional](${base}/contact)
- [Termos de Uso](${base}/terms)
`,

    about: `# Sobre o BBVision

> Solução de Fiscalização Remota de Obras para o Banco do Brasil desenvolvida no programa Residência Tecnológica em Software & IA (Porto Digital / TakeOff).

**URL Canônica:** ${base}/about

## Missão e Problema Resolvido

O modelo tradicional de fiscalização de obras exige deslocamentos frequentes de engenheiros fiscais a municípios distantes, elevando custos operacionais e gerando atrasos com registros manuais suscetíveis a inconsistências. O **BBVision** substitui vistorias presenciais recorrentes por fiscalizações remotas auditáveis, garantindo rigor técnico, agilidade e inviolabilidade documental.

## Pilares Arquiteturais

- **Frontend Corporativo:** HTML5, CSS3 moderno e Vanilla JavaScript (mobile-first, PWA e modo offline).
- **Backend RESTful:** Node.js com Express, headers OWASP Top 10, rate limiting e camada de dados desacoplada (memória e Supabase/PostgreSQL).
- **Inteligência Artificial Responsável:** Validação visual por IA com SLA <= 15s, confiança mínima de 75%, fallback manual e revisão humana obrigatória (Human-in-the-loop).
- **Inviolabilidade e Fé Pública:** Proibição de upload pela galeria, geração de Código Único criptográfico (16 caracteres hex), Hash SHA-256 e bloqueio imediato pós-assinatura.
- **Emissão Documental:** Geração automática de PDF oficial via PDFKit e notificações institucionais via Resend / Nodemailer.

## Equipe TakeOff (Residência em Software & IA — Porto Digital)

Desenvolvido pelo grupo da Residência Tecnológica Porto Digital / TakeOff: Arthur Lucas, Breno Lima, Fábio Pereira, George Rafhael, Isabela Melo, Jefferson Veiga, Lucas Antonio, Luiz Augusto e Vitória Celeste.

## Perfis Oficiais e Referências

- Repositório Oficial: ${siteConfig.repositoryUrl}
- Banco do Brasil: https://www.bb.com.br
- Porto Digital: https://www.portodigital.org

## Navegação

- [Página Inicial](${base}/)
- [Validador Público](${base}/validador)
- [Contato](${base}/contact)
- [Termos de Uso](${base}/terms)
- [Política de Privacidade](${base}/privacy)
`,

    contact: `# Contato e Suporte Institucional — BBVision

> Canais oficiais de atendimento técnico, auditoria de laudos e contato institucional do BBVision (TakeOff / Porto Digital).

**URL Canônica:** ${base}/contact

## Canais Diretos

- **E-mail Institucional / Notificações:** [${org.email}](mailto:${org.email})
- **E-mail de Fiscalização / Auditoria:** [${org.fiscalEmail}](mailto:${org.fiscalEmail})
- **Telefone Institucional:** [${org.telephoneDisplay}](tel:${org.telephone.replace(/[^+\d]/g, '')})
- **Horário de Atendimento:** Segunda a sexta-feira, das 08h às 18h (Horário de Brasília — BRT)

## Endereço Institucional

**${org.name}**  
${org.address.streetAddress}  
${org.address.addressLocality} — ${org.address.addressRegion}, CEP ${org.address.postalCode}  
Brasil

## Perfis Externos

- GitHub: ${siteConfig.repositoryUrl}
- Portal Banco do Brasil: https://www.bb.com.br
- Porto Digital: https://www.portodigital.org

## Navegação

- [Página Inicial](${base}/)
- [Sobre o BBVision](${base}/about)
- [Validador Público](${base}/validador)
- [Termos de Uso](${base}/terms)
- [Política de Privacidade](${base}/privacy)
`,

    terms: `# Termos de Uso e Governança — BBVision

> Condições gerais de utilização, segurança documental, inviolabilidade de evidências e responsabilidades na plataforma BBVision.

**URL Canônica:** ${base}/terms  
**Última atualização:** ${LAST_MOD}

## 1. Objeto e Finalidade

O **BBVision** destina-se exclusivamente ao monitoramento, registro de vistorias técnicas in-loco, auditoria remota e validação pública de integridade de laudos de obras vinculadas ao Banco do Brasil.

## 2. Regras de Inviolabilidade e Captura em Campo

- Todas as evidências fotográficas de campo devem ser capturadas ao vivo pela câmera integrada à aplicação, sendo proibido o envio de arquivos oriundos de galeria no fluxo de vistoria.
- Após a assinatura digital e finalização do relatório, o documento é bloqueado de forma irreversível, recebendo Código Único de 16 caracteres e Hash SHA-256.
- Tentativas de edição ou reenvio posterior de laudos finalizados são automaticamente rejeitadas pelo servidor.

## 3. Perfis de Acesso e Responsabilidades (RBAC)

- **Empreiteira:** Pode visualizar e vistoriar exclusivamente obras atribuídas à sua equipe, não possuindo permissão para cadastrar novas obras nem homologar relatórios.
- **Fiscal de Obra (Banco do Brasil):** Pode cadastrar obras, vincular empreiteiras, auditar relatórios PDF e registrar parecer oficial (\`REGULAR\` ou \`PENDENTE_AJUSTE\`).
- **Auditoria Pública:** A verificação via Código Único ou Hash SHA-256 no Validador Público é aberta e gratuita, sujeita a limites de taxa (rate limiting) contra uso abusivo.

## 4. Governança de Inteligência Artificial

As análises de IA têm caráter de apoio técnico à verificação de qualidade visual e sugestão de texto. Toda decisão final de vistoria e homologação é de responsabilidade humana (Human-in-the-loop).

## 5. Contato Jurídico e Institucional

Dúvidas sobre estes Termos de Uso podem ser encaminhadas para [${org.email}](mailto:${org.email}) ou telefone [${org.telephoneDisplay}](tel:${org.telephone.replace(/[^+\d]/g, '')}).
`,

    privacy: `# Política de Privacidade e LGPD — BBVision

> Diretrizes de privacidade, proteção de dados pessoais, segurança da informação e conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

**URL Canônica:** ${base}/privacy  
**Última atualização:** ${LAST_MOD}

## 1. Dados Coletados

O BBVision trata exclusivamente os dados estritamente necessários para a fiscalização de obras e auditoria técnica:
- **Dados cadastrais profissionais:** Nome completo, e-mail corporativo, empresa/órgão, cargo (Empreiteira ou Fiscal) e registro profissional (CREA/CAU/Matrícula).
- **Evidências técnicas de vistoria:** Fotografias do canteiro de obras, carimbo temporal, coordenadas de geolocalização quando autorizadas, respostas do checklist e assinatura digital do responsável.
- **Trilha de auditoria e segurança:** Hashes criptográficos SHA-256, logs de requisições HTTP, registros de avaliação da IA e pareceres fiscais.

## 2. Finalidade e Base Legal

O tratamento é realizado para execução contratual, cumprimento de obrigações regulatórias de auditoria de engenharia e prevenção a fraudes documentais, nos termos da LGPD (art. 7º).

## 3. Segurança e Proteção

- Senhas protegidas por hash criptográfico (bcrypt) e sessões autenticadas via JWT.
- Cabeçalhos corporativos de segurança HTTP (CSP, HSTS, X-Frame-Options, nosniff) e controle de taxa contra abuso.
- Validação por IA do enquadramento de obras, prédios, edifícios, casas ou construções com área central livre de pessoas.

## 4. Direitos do Titular e Encarregado (DPO)

Para exercer seus direitos de confirmação, acesso, correção ou esclarecimentos sobre privacidade, entre em contato pelo e-mail [${org.email}](mailto:${org.email}) ou telefone [${org.telephoneDisplay}](tel:${org.telephone.replace(/[^+\d]/g, '')}).
`,
  };

  return pages[pageKey] || pages.home;
}

function getOrganizationSchema() {
  const org = siteConfig.organization;
  return {
    '@type': 'Organization',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: org.name,
    legalName: org.legalName,
    alternateName: org.alternateName,
    url: `${siteConfig.siteUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: siteConfig.logoUrl,
    },
    description: siteConfig.shortDescription,
    email: org.email,
    telephone: org.telephone,
    address: {
      '@type': 'PostalAddress',
      ...org.address,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'technical support',
        email: org.email,
        telephone: org.telephone,
        areaServed: 'BR',
        availableLanguage: ['pt-BR', 'en'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'auditing and compliance',
        email: org.fiscalEmail,
        telephone: org.telephone,
        areaServed: 'BR',
        availableLanguage: ['pt-BR'],
      },
    ],
    sameAs: org.sameAs,
  };
}

function renderStaticLayout({
  pageKey,
  title,
  description,
  canonicalPath,
  mdPath,
  h1,
  subtitle,
  bodyHtml,
  jsonLdGraph,
  robots = 'index, follow',
  extraScript = '',
}) {
  const canonicalUrl = `${siteConfig.siteUrl}${canonicalPath}`;
  const org = siteConfig.organization;
  const telHref = `tel:${org.telephone.replace(/[^+\d]/g, '')}`;

  const structuredData = jsonLdGraph
    ? `<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLdGraph }, null, 2)}\n  </script>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${escapeHtml(robots)}">
  <meta name="theme-color" content="#002D62">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <link rel="alternate" type="text/markdown" href="${escapeHtml(mdPath)}" title="${escapeHtml(title)} (Markdown)">
  <link rel="describedby" type="text/plain" href="/llms.txt" title="BBVision LLMs Guide">
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/png" href="/src/assets/logo.png">

  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="BBVision">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(siteConfig.logoUrl)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/styles/variables.css?v=2.1">
  <link rel="stylesheet" href="/src/styles/base.css?v=2.1">
  ${structuredData}
</head>
<body>
  <header class="bb-navbar">
    <a class="bb-navbar-brand" href="/">
      <div class="bb-navbar-logo-wrap">
        <img src="/src/assets/logo.png" alt="BBVision" class="bb-navbar-logo">
      </div>
      <div class="bb-navbar-titles">
        <span class="bb-navbar-title">BBVision</span>
        <span class="bb-navbar-sub">Banco do Brasil S.A. • Fiscalização de Obras</span>
      </div>
    </a>
    <nav class="bb-navbar-nav" aria-label="Navegação institucional">
      <a class="bb-nav-link${pageKey === 'home' ? ' active' : ''}" href="/">Portal</a>
      <a class="bb-nav-link highlight-gov${pageKey === 'validador' ? ' active' : ''}" href="/validador">Validar Fé Pública</a>
      <a class="bb-nav-link${pageKey === 'about' ? ' active' : ''}" href="/about">Sobre</a>
      <a class="bb-nav-link${pageKey === 'contact' ? ' active' : ''}" href="/contact">Contato</a>
      <a class="bb-nav-link${pageKey === 'terms' ? ' active' : ''}" href="/terms">Termos</a>
    </nav>
  </header>

  <main class="bb-app-main">
    <article class="bb-static-page">
      <section class="bb-static-hero">
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </section>
      <div class="bb-static-content">
        ${bodyHtml}
      </div>
    </article>
  </main>

  <footer class="bb-site-footer" aria-label="Informações institucionais e contato">
    <div class="bb-site-footer-inner">
      <div class="bb-footer-brand">
        <strong>BBVision</strong> — Fiscalização Remota de Obras • Banco do Brasil (TakeOff / Porto Digital)
      </div>
      <nav class="bb-footer-links" aria-label="Links institucionais">
        <a href="/">Início</a>
        <a href="/validador">Validador Público</a>
        <a href="/about">Sobre</a>
        <a href="/contact">Contato</a>
        <a href="/terms">Termos de Uso</a>
        <a href="/privacy">Privacidade</a>
        <a href="/llms.txt">llms.txt</a>
      </nav>
      <div class="bb-footer-contact">
        <span>Contato:</span>
        <a href="mailto:${escapeHtml(org.email)}">${escapeHtml(org.email)}</a>
        <span aria-hidden="true">•</span>
        <a href="${escapeHtml(telHref)}">${escapeHtml(org.telephoneDisplay)}</a>
      </div>
    </div>
  </footer>

  <script type="module" src="/src/utils/webmcp.js"></script>
  ${extraScript}
</body>
</html>
`;
}

function renderInstitutionalPage(pageKey) {
  const base = siteConfig.siteUrl;
  const org = siteConfig.organization;
  const telHref = `tel:${org.telephone.replace(/[^+\d]/g, '')}`;
  const orgSchema = getOrganizationSchema();

  if (pageKey === 'about') {
    return renderStaticLayout({
      pageKey: 'about',
      title: 'Sobre o BBVision | Fiscalização Remota de Obras do Banco do Brasil',
      description:
        'Conheça a arquitetura, personas, governança de IA e garantias criptográficas SHA-256 do BBVision (Porto Digital / TakeOff).',
      canonicalPath: '/about',
      mdPath: '/about.md',
      h1: 'Sobre o BBVision',
      subtitle:
        'Solução inteligente de monitoramento, auditoria e fiscalização remota de obras do Banco do Brasil — Residência em Software & IA (Porto Digital / TakeOff).',
      bodyHtml: `
        <section class="bb-static-card">
          <h2>Missão e Problema Resolvido</h2>
          <p>O modelo tradicional de fiscalização de obras apresenta alto custo operacional com deslocamentos presenciais de engenheiros fiscais e registros manuais vulneráveis. O <strong>BBVision</strong> substitui vistorias presenciais recorrentes por fiscalizações remotas auditáveis, garantindo provas fotográficas autênticas e acompanhamento confiável do avanço físico das obras.</p>
        </section>

        <section class="bb-static-card">
          <h2>Personas e Fluxo de Operação</h2>
          <h3>Empreiteira em Campo (Rodrigo)</h3>
          <p>Seleciona a obra atribuída, preenche checklists dinâmicos com apoio de IA editável, captura evidências exclusivamente pela câmera ao vivo (sem upload da galeria), assina digitalmente e bloqueia o laudo com geração automática de Código Único, Hash SHA-256 e PDF.</p>
          <h3>Fiscal de Engenharia do Banco do Brasil (Mariana)</h3>
          <p>Cadastra obras, vincula empreiteiras, audita relatórios consolidados em PDF com carimbo criptográfico de Fé Pública e homologa cada medição como <strong>REGULAR</strong> ou <strong>PENDENTE_AJUSTE</strong>.</p>
        </section>

        <section class="bb-static-card">
          <h2>Arquitetura e Governança de IA</h2>
          <ul>
            <li><strong>Captura Inviolável:</strong> Bloqueio de galeria no fluxo de campo, selo temporal e Hash SHA-256 por imagem e relatório.</li>
            <li><strong>Validação por IA:</strong> Validação de nitidez, iluminação e enquadramento com SLA &le; 15s, limiar de confiança &ge; 75% e fallback manual assistido.</li>
            <li><strong>Resiliência Offline:</strong> Fila local com sincronização automática para canteiros com oscilação de rede 4G/5G.</li>
            <li><strong>Equipe TakeOff:</strong> Arthur Lucas, Breno Lima, Fábio Pereira, George Rafhael, Isabela Melo, Jefferson Veiga, Lucas Antonio, Luiz Augusto e Vitória Celeste.</li>
          </ul>
          <p class="bb-static-actions">
            <a class="bb-static-btn-primary" href="/">Acessar Portal BBVision</a>
            <a class="bb-static-btn-secondary" href="/validador">Abrir Validador Público</a>
          </p>
        </section>
      `,
      jsonLdGraph: [
        orgSchema,
        {
          '@type': 'AboutPage',
          '@id': `${base}/about#webpage`,
          url: `${base}/about`,
          name: 'Sobre o BBVision',
          description: siteConfig.longDescription,
          inLanguage: 'pt-BR',
          mainEntity: { '@id': `${base}/#organization` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: `${base}/` },
            { '@type': 'ListItem', position: 2, name: 'Sobre', item: `${base}/about` },
          ],
        },
      ],
    });
  }

  if (pageKey === 'contact') {
    return renderStaticLayout({
      pageKey: 'contact',
      title: 'Contato e Suporte Institucional | BBVision',
      description:
        'Canais oficiais de suporte técnico, auditoria de engenharia e contato institucional do BBVision (TakeOff / Porto Digital).',
      canonicalPath: '/contact',
      mdPath: '/contact.md',
      h1: 'Contato e Suporte Institucional',
      subtitle:
        'Fale com a equipe técnica do BBVision ou com a central de fiscalização e auditoria de obras.',
      bodyHtml: `
        <section class="bb-static-card">
          <h2>Canais Oficiais de Atendimento</h2>
          <dl class="bb-contact-list">
            <dt>E-mail de Notificações e Suporte Técnico</dt>
            <dd><a href="mailto:${escapeHtml(org.email)}">${escapeHtml(org.email)}</a></dd>
            <dt>E-mail de Fiscalização e Auditoria BB</dt>
            <dd><a href="mailto:${escapeHtml(org.fiscalEmail)}">${escapeHtml(org.fiscalEmail)}</a></dd>
            <dt>Telefone Institucional</dt>
            <dd><a href="${escapeHtml(telHref)}">${escapeHtml(org.telephoneDisplay)}</a></dd>
            <dt>Endereço Institucional</dt>
            <dd>${escapeHtml(org.address.streetAddress)}, ${escapeHtml(org.address.addressLocality)} - ${escapeHtml(org.address.addressRegion)}, CEP ${escapeHtml(org.address.postalCode)}, Brasil</dd>
            <dt>Horário de Atendimento</dt>
            <dd>Segunda a sexta-feira, das 08h às 18h (Horário de Brasília — BRT)</dd>
          </dl>
        </section>

        <section class="bb-static-card">
          <h2>Perfis Oficiais e Documentação</h2>
          <ul>
            <li><a href="${escapeHtml(siteConfig.repositoryUrl)}" rel="noopener noreferrer">Repositório Oficial no GitHub (BBVision)</a></li>
            <li><a href="https://www.bb.com.br" rel="noopener noreferrer">Portal Oficial do Banco do Brasil</a></li>
            <li><a href="https://www.portodigital.org" rel="noopener noreferrer">Porto Digital — Recife/PE</a></li>
            <li><a href="/validador">Validador Público de Autenticidade (Fé Pública)</a></li>
          </ul>
        </section>
      `,
      jsonLdGraph: [
        orgSchema,
        {
          '@type': 'ContactPage',
          '@id': `${base}/contact#webpage`,
          url: `${base}/contact`,
          name: 'Contato e Suporte Institucional — BBVision',
          description: 'Canais oficiais de contato por e-mail, telefone e endereço institucional do BBVision.',
          inLanguage: 'pt-BR',
          mainEntity: { '@id': `${base}/#organization` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: `${base}/` },
            { '@type': 'ListItem', position: 2, name: 'Contato', item: `${base}/contact` },
          ],
        },
      ],
    });
  }

  if (pageKey === 'terms') {
    return renderStaticLayout({
      pageKey: 'terms',
      title: 'Termos de Uso e Governança | BBVision',
      description:
        'Termos de Uso da plataforma BBVision: regras de captura fotográfica in-loco, imutabilidade criptográfica SHA-256 e governança de IA.',
      canonicalPath: '/terms',
      mdPath: '/terms.md',
      h1: 'Termos de Uso e Governança',
      subtitle: `Condições aplicáveis ao uso do portal BBVision, captura de evidências em campo e auditoria remota de obras. Atualizado em ${LAST_MOD}.`,
      bodyHtml: `
        <section class="bb-static-card">
          <h2>1. Finalidade da Plataforma</h2>
          <p>O BBVision é uma plataforma corporativa voltada ao registro, validação e auditoria remota de obras vinculadas ao Banco do Brasil, bem como à verificação pública de integridade de laudos emitidos pelo sistema.</p>

          <h2>2. Inviolabilidade Documental e Captura In-Loco</h2>
          <p>No fluxo de vistoria de campo, as imagens devem ser capturadas exclusivamente ao vivo pela câmera integrada, sendo vedado o envio de imagens pré-existentes da galeria. Após a assinatura digital e finalização, o relatório é bloqueado contra edições ou reenvios, recebendo Código Único de 16 caracteres hexadecimais e Hash SHA-256.</p>

          <h2>3. Controle de Acesso por Perfil (RBAC)</h2>
          <ul>
            <li><strong>Empreiteira:</strong> Acesso às obras vinculadas para execução de vistorias e envio de relatórios; sem permissão para cadastrar obras ou homologar pareceres.</li>
            <li><strong>Fiscal de Obra (Banco do Brasil):</strong> Cadastro de obras, gestão de checklists, auditoria de PDFs e emissão de parecer técnico oficial (REGULAR ou PENDENTE_AJUSTE).</li>
          </ul>

          <h2>4. Governança de Inteligência Artificial</h2>
          <p>A validação automática via IA atua como ferramenta auxiliar de qualidade visual e sugestão de texto editável. A decisão final de envio e homologação é sempre humana (Human-in-the-loop).</p>

          <h2>5. Contato e Esclarecimentos</h2>
          <p>Para dúvidas jurídicas ou técnicas sobre estes termos, escreva para <a href="mailto:${escapeHtml(org.email)}">${escapeHtml(org.email)}</a> ou ligue para <a href="${escapeHtml(telHref)}">${escapeHtml(org.telephoneDisplay)}</a>. Consulte também nossa <a href="/privacy">Política de Privacidade e LGPD</a>.</p>
        </section>
      `,
      jsonLdGraph: [
        orgSchema,
        {
          '@type': 'WebPage',
          '@id': `${base}/terms#webpage`,
          url: `${base}/terms`,
          name: 'Termos de Uso e Governança — BBVision',
          inLanguage: 'pt-BR',
          isPartOf: { '@id': `${base}/#website` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: `${base}/` },
            { '@type': 'ListItem', position: 2, name: 'Termos de Uso', item: `${base}/terms` },
          ],
        },
      ],
    });
  }

  if (pageKey === 'privacy') {
    return renderStaticLayout({
      pageKey: 'privacy',
      title: 'Política de Privacidade e LGPD | BBVision',
      description:
        'Política de Privacidade e proteção de dados pessoais da plataforma BBVision em conformidade com a LGPD (Lei nº 13.709/2018).',
      canonicalPath: '/privacy',
      mdPath: '/privacy.md',
      h1: 'Política de Privacidade e LGPD',
      subtitle: `Compromisso com a proteção de dados pessoais, segurança da informação e trilha de auditoria conforme a Lei nº 13.709/2018. Atualizado em ${LAST_MOD}.`,
      bodyHtml: `
        <section class="bb-static-card">
          <h2>1. Dados Pessoais e Técnicos Tratados</h2>
          <p>O BBVision trata exclusivamente dados profissionais necessários à operação: nome completo, e-mail corporativo, vínculo empresarial, registro profissional (CREA/CAU/Matrícula), fotografias técnicas do canteiro de obras, carimbos temporais, respostas de checklists e pareceres fiscais.</p>

          <h2>2. Segurança e Integridade</h2>
          <p>Credenciais são protegidas por hashing criptográfico bcrypt, sessões operam via JWT, comunicações utilizam headers corporativos OWASP (HSTS, CSP, nosniff, X-Frame-Options) e evidências recebem selo SHA-256 para prevenção a fraudes. A triagem por IA verifica que a foto retrata uma obra, prédio, edifício, casa ou construção sem obstrução de pessoas na parte central.</p>

          <h2>3. Direitos dos Titulares</h2>
          <p>Titulares podem solicitar confirmação de tratamento, acesso ou retificação de seus dados cadastrais pelo canal oficial <a href="mailto:${escapeHtml(org.email)}">${escapeHtml(org.email)}</a> ou telefone <a href="${escapeHtml(telHref)}">${escapeHtml(org.telephoneDisplay)}</a>.</p>
        </section>
      `,
      jsonLdGraph: [
        orgSchema,
        {
          '@type': 'WebPage',
          '@id': `${base}/privacy#webpage`,
          url: `${base}/privacy`,
          name: 'Política de Privacidade e LGPD — BBVision',
          inLanguage: 'pt-BR',
          isPartOf: { '@id': `${base}/#website` },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: `${base}/` },
            { '@type': 'ListItem', position: 2, name: 'Privacidade', item: `${base}/privacy` },
          ],
        },
      ],
    });
  }

  // Dedicated semantic Public Validator page (/validador)
  return renderStaticLayout({
    pageKey: 'validador',
    title: 'Validador Público de Fé Pública | BBVision',
    description:
      'Consulte gratuitamente a autenticidade e integridade criptográfica SHA-256 de laudos e relatórios técnicos de obras emitidos pelo BBVision.',
    canonicalPath: '/validador',
    mdPath: '/validador.md',
    h1: 'Validador Público de Fé Pública',
    subtitle:
      'Verificação criptográfica SHA-256 e certificação oficial de autenticidade de relatórios de vistoria do Banco do Brasil.',
    bodyHtml: `
      <section class="bb-static-card">
        <h2>Consultar Autenticidade do Relatório</h2>
        <p>Informe o <strong>Código Único</strong> (16 caracteres hexadecimais) ou o <strong>Hash SHA-256</strong> (64 caracteres) impresso no topo do laudo PDF.</p>
        <form id="staticValidatorForm" class="bb-static-validator-form" action="/validador" method="get" toolname="validate_report_authenticity" tooldescription="Valida a autenticidade e integridade criptográfica SHA-256 de um relatório de vistoria BBVision pelo Código Único ou Hash.">
          <label for="codigoOuHashInput">Código Único ou Hash SHA-256</label>
          <div class="bb-static-input-row">
            <input type="text" id="codigoOuHashInput" name="codigo" placeholder="Ex.: 8F4A2C19E70B34DF" autocomplete="off" spellcheck="false" required>
            <button type="submit" class="bb-static-btn-primary">Validar Documento</button>
          </div>
        </form>
        <div id="staticValidatorResult" class="bb-static-validator-result" aria-live="polite"></div>
      </section>

      <section class="bb-static-card">
        <h2>Como Funciona a Certificação Criptográfica</h2>
        <h3>1. Emissão Inviolável</h3>
        <p>Cada relatório finalizado gera automaticamente um Código Único de 16 caracteres e um hash SHA-256 vinculando fotos, respostas, assinatura e carimbo temporal.</p>
        <h3>2. Auditoria Aberta via Web ou API</h3>
        <p>Auditores externos e agentes automatizados podem validar documentos por esta página ou via <code>GET /api/validador/{codigoOuHash}</code>.</p>
      </section>
    `,
    jsonLdGraph: [
      orgSchema,
      {
        '@type': 'WebPage',
        '@id': `${base}/validador#webpage`,
        url: `${base}/validador`,
        name: 'Validador Público de Fé Pública — BBVision',
        description: 'Validação pública de integridade criptográfica SHA-256 para laudos técnicos BBVision.',
        inLanguage: 'pt-BR',
        isPartOf: { '@id': `${base}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${base}/` },
          { '@type': 'ListItem', position: 2, name: 'Validador Público', item: `${base}/validador` },
        ],
      },
    ],
    extraScript: `<script>
    (function () {
      const form = document.getElementById('staticValidatorForm');
      const input = document.getElementById('codigoOuHashInput');
      const out = document.getElementById('staticValidatorResult');
      if (!form || !input || !out) return;

      async function consultar(termo) {
        out.innerHTML = '<p>Consultando base oficial de Fé Pública...</p>';
        try {
          const resp = await fetch('/api/validador/' + encodeURIComponent(termo.trim()));
          const data = await resp.json();
          if (resp.ok && data.autentico) {
            const rel = data.relatorio || {};
            const obra = rel.obra || {};
            out.innerHTML = '<div class="bb-val-ok"><h3>Documento Autêntico e Íntegro</h3>' +
              '<p><strong>Código Único:</strong> ' + (rel.codigo_unico || termo) + '</p>' +
              '<p><strong>Hash SHA-256:</strong> <code>' + (rel.hash_integridade || '-') + '</code></p>' +
              '<p><strong>Obra / Unidade:</strong> ' + (obra.nome || 'Unidade Banco do Brasil') + '</p>' +
              '<p><strong>Status:</strong> ' + (rel.status || 'FINALIZADO') + '</p>' +
              (rel.id ? '<p><a class="bb-static-btn-secondary" href="/api/relatorios/' + encodeURIComponent(rel.id) + '/pdf" target="_blank" rel="noopener">Visualizar PDF Oficial</a></p>' : '') +
              '</div>';
          } else {
            out.innerHTML = '<div class="bb-val-err"><h3>Documento Não Localizado</h3><p>' + (data.mensagem || 'Código não encontrado na base oficial.') + '</p></div>';
          }
        } catch (err) {
          out.innerHTML = '<div class="bb-val-err"><h3>Erro na Consulta</h3><p>Não foi possível contatar o servidor de validação.</p></div>';
        }
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (input.value.trim()) consultar(input.value.trim());
      });

      const params = new URLSearchParams(window.location.search);
      const q = params.get('codigo') || params.get('validar') || params.get('hash');
      if (q) {
        input.value = q;
        consultar(q);
      }
    })();
  </script>`,
  });
}

function renderNotFoundPage(requestedPath = '/') {
  return renderStaticLayout({
    pageKey: '404',
    title: '404 — Página não encontrada | BBVision',
    description: 'O recurso solicitado não existe no portal BBVision.',
    canonicalPath: '/404',
    mdPath: '/index.md',
    robots: 'noindex, nofollow',
    h1: '404 — Página não encontrada',
    subtitle: `O endereço "${requestedPath}" não foi localizado no portal BBVision.`,
    bodyHtml: `
      <section class="bb-static-card">
        <h2>Páginas Disponíveis</h2>
        <p>Verifique o endereço digitado ou navegue para uma das páginas oficiais abaixo:</p>
        <ul>
          <li><a href="/">Página Inicial — Portal BBVision</a></li>
          <li><a href="/validador">Validador Público de Fé Pública</a></li>
          <li><a href="/about">Sobre o BBVision</a></li>
          <li><a href="/contact">Contato e Suporte</a></li>
          <li><a href="/terms">Termos de Uso</a></li>
          <li><a href="/privacy">Política de Privacidade</a></li>
        </ul>
      </section>
    `,
    jsonLdGraph: null,
  });
}

module.exports = {
  getRobotsTxt,
  getSitemapXml,
  getLlmsTxt,
  getMcpServerCard,
  getLinkHeader,
  getMarkdownPage,
  renderInstitutionalPage,
  renderNotFoundPage,
};
