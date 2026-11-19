/**
 * BBVision - Registro de Ferramentas WebMCP (navigator.modelContext.registerTool)
 * Expõe ações estruturadas para agentes de IA no navegador sem interferir na navegação humana.
 */

const WEBMCP_TOOLS = [
  {
    name: 'validate_report_authenticity',
    description:
      'Valida a autenticidade e integridade criptográfica (Fé Pública SHA-256) de um laudo de vistoria BBVision usando Código Único de 16 caracteres hexadecimais ou Hash SHA-256 de 64 caracteres.',
    inputSchema: {
      type: 'object',
      properties: {
        codigoOuHash: {
          type: 'string',
          description: 'Código Único de 16 caracteres hexadecimais ou Hash SHA-256 de 64 caracteres do relatório.',
        },
      },
      required: ['codigoOuHash'],
    },
    execute: async ({ codigoOuHash } = {}) => {
      const termo = String(codigoOuHash || '').trim();
      if (!termo) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ autentico: false, erro: 'Informe codigoOuHash.' }) }],
        };
      }
      const response = await fetch(`/api/validador/${encodeURIComponent(termo)}`);
      const data = await response.json();
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  },
  {
    name: 'get_system_health',
    description:
      'Consulta o status operacional, versão e estado da camada de dados da plataforma BBVision.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    execute: async () => {
      const response = await fetch('/api/health');
      const data = await response.json();
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      };
    },
  },
  {
    name: 'open_public_page',
    description:
      'Navega para uma página pública do BBVision (home, validador, about, contact, terms, privacy) ou abre diretamente o Validador Público com um código de relatório.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: ['home', 'validador', 'about', 'contact', 'terms', 'privacy'],
          description: 'Destino público desejado no portal BBVision.',
        },
        codigo: {
          type: 'string',
          description: 'Código Único ou Hash SHA-256 opcional quando page="validador".',
        },
      },
      required: ['page'],
    },
    execute: async ({ page, codigo } = {}) => {
      const routeMap = {
        home: '/',
        validador: codigo ? `/validador?codigo=${encodeURIComponent(codigo)}` : '/validador',
        about: '/about',
        contact: '/contact',
        terms: '/terms',
        privacy: '/privacy',
      };
      const targetUrl = routeMap[page] || '/';
      window.location.assign(targetUrl);
      return {
        content: [{ type: 'text', text: JSON.stringify({ navigatedTo: targetUrl }) }],
      };
    },
  },
];

let webMcpRegistered = false;

export function registerBBVisionWebMcpTools() {
  if (webMcpRegistered) return true;
  if (typeof navigator === 'undefined') return false;

  const modelContext = navigator.modelContext;
  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    return false;
  }

  for (const tool of WEBMCP_TOOLS) {
    try {
      modelContext.registerTool(tool);
    } catch (err) {
      console.warn(`[BBVision WebMCP] Falha ao registrar ferramenta "${tool.name}":`, err);
    }
  }

  webMcpRegistered = true;
  return true;
}

// Registra imediatamente no carregamento e reforça nos eventos DOMContentLoaded / load
registerBBVisionWebMcpTools();

if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', registerBBVisionWebMcpTools, { once: true });
}
if (typeof window !== 'undefined') {
  window.addEventListener('load', registerBBVisionWebMcpTools, { once: true });
}
