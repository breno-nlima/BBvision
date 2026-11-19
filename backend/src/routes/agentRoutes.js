/**
 * BBVision - Rotas de Agent-Readiness, Descoberta e Negociação de Conteúdo
 * Atende:
 * - /robots.txt (Content-Signal + Sitemap)
 * - /sitemap.xml
 * - /llms.txt (text/plain)
 * - /.well-known/mcp/server-card.json (SEP-1649)
 * - Negociação HTTP Accept: text/markdown e endpoints /*.md
 * - Cabeçalhos RFC 8288 Link na homepage e páginas públicas
 * - Páginas institucionais semânticas (/about, /contact, /terms, /privacy, /validador)
 */

const express = require('express');
const path = require('path');
const siteConfig = require('../config/siteConfig');
const {
  getRobotsTxt,
  getSitemapXml,
  getLlmsTxt,
  getMcpServerCard,
  getLinkHeader,
  getMarkdownPage,
  renderInstitutionalPage,
} = require('../services/agentContentService');

const router = express.Router();
const frontendIndexPath = path.resolve(__dirname, '..', '..', '..', 'frontend', 'index.html');

/**
 * Avalia se o cliente solicitou explicitamente text/markdown via cabeçalho HTTP Accept
 * respeitando os pesos de qualidade (q-values) conforme RFC 9110.
 */
function wantsMarkdown(req) {
  const accept = (req.headers.accept || '').toLowerCase();
  if (!accept || (!accept.includes('text/markdown') && !accept.includes('text/x-markdown'))) {
    return false;
  }

  let mdQ = 0;
  let htmlQ = 0;

  const parts = accept.split(',');
  for (const part of parts) {
    const segments = part.trim().split(';');
    const mediaType = (segments[0] || '').trim();
    let q = 1.0;

    for (let i = 1; i < segments.length; i++) {
      const param = segments[i].trim();
      if (param.startsWith('q=')) {
        const parsed = parseFloat(param.slice(2));
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }

    if (mediaType === 'text/markdown' || mediaType === 'text/x-markdown') {
      mdQ = Math.max(mdQ, q);
    } else if (mediaType === 'text/html' || mediaType === 'application/xhtml+xml') {
      htmlQ = Math.max(htmlQ, q);
    }
  }

  return mdQ > 0 && mdQ >= htmlQ;
}

function sendMarkdown(res, pageKey) {
  const md = getMarkdownPage(pageKey);
  res.vary('Accept');
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Link', getLinkHeader(pageKey));
  res.setHeader('Content-Signal', siteConfig.contentSignal);
  res.setHeader('X-Markdown-Tokens', String(Math.ceil(md.length / 4)));
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(md);
}

// 1. robots.txt com Content-Signal e Sitemap
router.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(getRobotsTxt());
});

// 2. sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(getSitemapXml());
});

// 3. llms.txt (texto plano bem-formado conforme especificação llmstxt.org)
router.get('/llms.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Signal', siteConfig.contentSignal);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(getLlmsTxt());
});

// 4. MCP Server Card (SEP-1649)
router.get('/.well-known/mcp/server-card.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).json(getMcpServerCard());
});

// 5. Endpoints explícitos em Markdown (*.md)
const mdRouteMap = {
  '/index.md': 'home',
  '/validador.md': 'validador',
  '/about.md': 'about',
  '/contact.md': 'contact',
  '/terms.md': 'terms',
  '/privacy.md': 'privacy',
};

for (const [routePath, pageKey] of Object.entries(mdRouteMap)) {
  router.get(routePath, (req, res) => sendMarkdown(res, pageKey));
}

// 6. Homepage (/) e /index.html com Link headers (RFC 8288) e Accept: text/markdown
router.get(['/', '/index.html'], (req, res, next) => {
  res.vary('Accept');
  res.setHeader('Link', getLinkHeader('home'));
  res.setHeader('Content-Signal', siteConfig.contentSignal);

  if (wantsMarkdown(req)) {
    return sendMarkdown(res, 'home');
  }

  res.setHeader('Cache-Control', 'no-cache');
  return res.sendFile(frontendIndexPath, (err) => {
    if (err) next(err);
  });
});

// 7. Páginas Institucionais e Validador Público (HTML semântico + Accept: text/markdown)
const institutionalRouteMap = {
  '/validador': 'validador',
  '/about': 'about',
  '/contact': 'contact',
  '/terms': 'terms',
  '/privacy': 'privacy',
};

for (const [routePath, pageKey] of Object.entries(institutionalRouteMap)) {
  router.get(routePath, (req, res) => {
    res.vary('Accept');
    res.setHeader('Link', getLinkHeader(pageKey));
    res.setHeader('Content-Signal', siteConfig.contentSignal);

    if (wantsMarkdown(req)) {
      return sendMarkdown(res, pageKey);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).send(renderInstitutionalPage(pageKey));
  });
}

// 8. Redirecionamentos permanentes 301 para aliases em português -> URLs canônicas
router.get('/sobre', (req, res) => res.redirect(301, '/about'));
router.get('/contato', (req, res) => res.redirect(301, '/contact'));
router.get('/termos', (req, res) => res.redirect(301, '/terms'));
router.get('/privacidade', (req, res) => res.redirect(301, '/privacy'));

module.exports = {
  router,
  wantsMarkdown,
};
