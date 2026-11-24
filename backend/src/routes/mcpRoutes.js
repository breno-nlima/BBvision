/**
 * BBVision - Endpoint MCP Streamable HTTP (JSON-RPC 2.0)
 * Expõe ferramentas públicas e recursos somente leitura anunciados pelo
 * MCP Server Card em /.well-known/mcp/server-card.json (SEP-1649).
 */

const express = require('express');
const router = express.Router();
const dataStore = require('../repositories/dataStore');
const siteConfig = require('../config/siteConfig');
const { getLlmsTxt, getMarkdownPage, getMcpServerCard } = require('../services/agentContentService');

const MCP_PROTOCOL_VERSION = '2025-11-25';

function jsonRpcResult(id, result) {
  return {
    jsonrpc: '2.0',
    id: id !== undefined ? id : null,
    result,
  };
}

function jsonRpcError(id, code, message) {
  return {
    jsonrpc: '2.0',
    id: id !== undefined ? id : null,
    error: { code, message },
  };
}

router.get('/', (req, res) => {
  res.status(200).json({
    protocol: 'model-context-protocol',
    protocolVersion: MCP_PROTOCOL_VERSION,
    transport: 'streamable-http',
    serverCard: `${siteConfig.siteUrl}/.well-known/mcp/server-card.json`,
    serverInfo: {
      name: 'bbvision-mcp',
      version: siteConfig.version,
    },
    usage: 'Envie requisições JSON-RPC 2.0 via POST para este endpoint (initialize, tools/list, tools/call, resources/list, resources/read).',
  });
});

router.post('/', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || body.jsonrpc !== '2.0' || !body.method) {
    return res.status(400).json(jsonRpcError(null, -32600, 'Requisição JSON-RPC 2.0 inválida.'));
  }

  const { id, method, params = {} } = body;
  const card = getMcpServerCard();

  try {
    switch (method) {
      case 'initialize':
        return res.status(200).json(
          jsonRpcResult(id, {
            protocolVersion: MCP_PROTOCOL_VERSION,
            capabilities: card.capabilities,
            serverInfo: card.serverInfo,
          })
        );

      case 'notifications/initialized':
        return res.status(202).end();

      case 'ping':
        return res.status(200).json(jsonRpcResult(id, {}));

      case 'tools/list':
        return res.status(200).json(jsonRpcResult(id, { tools: card.tools }));

      case 'tools/call': {
        const toolName = params.name;
        const args = params.arguments || {};

        if (toolName === 'validate_report_authenticity') {
          const termo = String(args.codigoOuHash || '').trim().toUpperCase();
          if (!termo || !/^[a-zA-Z0-9_-]{1,64}$/.test(termo)) {
            return res.status(200).json(
              jsonRpcResult(id, {
                isError: true,
                content: [
                  {
                    type: 'text',
                    text: 'Parâmetro codigoOuHash inválido. Informe código alfanumérico de até 64 caracteres.',
                  },
                ],
              })
            );
          }

          const relatorio = await dataStore.findRelatorioByCodigoOuHashAsync(termo);
          const relValido = relatorio && relatorio.status !== 'EM_ANDAMENTO' ? relatorio : null;
          let relPublico = null;
          if (relValido) {
            const { assinatura_base64, ...rest } = relValido;
            relPublico = rest;
          }

          const payload = relPublico
            ? {
                autentico: true,
                mensagem: 'Documento de vistoria atestado como autêntico e íntegro.',
                relatorio: relPublico,
              }
            : {
                autentico: false,
                mensagem: 'Documento não localizado no acervo oficial de vistorias.',
                termoPesquisado: termo,
              };

          return res.status(200).json(
            jsonRpcResult(id, {
              content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            })
          );
        }

        if (toolName === 'get_system_health') {
          const payload = {
            status: 'online',
            sistema: 'BBVision Backend',
            versao: siteConfig.version,
            bancoDados: dataStore.getStorageModeLabel(),
            timestamp: new Date().toISOString(),
          };
          return res.status(200).json(
            jsonRpcResult(id, {
              content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            })
          );
        }

        if (toolName === 'get_platform_info') {
          const payload = {
            name: siteConfig.name,
            title: siteConfig.title,
            version: siteConfig.version,
            siteUrl: siteConfig.siteUrl,
            organization: siteConfig.organization,
            pages: siteConfig.publicPages.map((p) => ({
              title: p.title,
              url: `${siteConfig.siteUrl}${p.path}`,
              markdownUrl: `${siteConfig.siteUrl}${p.mdPath}`,
            })),
          };
          return res.status(200).json(
            jsonRpcResult(id, {
              content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
            })
          );
        }

        return res.status(200).json(jsonRpcError(id, -32602, `Ferramenta desconhecida: ${toolName}`));
      }

      case 'resources/list':
        return res.status(200).json(jsonRpcResult(id, { resources: card.resources }));

      case 'resources/read': {
        const uri = String(params.uri || '');
        if (uri.endsWith('/llms.txt')) {
          return res.status(200).json(
            jsonRpcResult(id, {
              contents: [{ uri, mimeType: 'text/plain', text: getLlmsTxt() }],
            })
          );
        }
        if (uri.endsWith('/index.md')) {
          return res.status(200).json(
            jsonRpcResult(id, {
              contents: [{ uri, mimeType: 'text/markdown', text: getMarkdownPage('home') }],
            })
          );
        }
        return res.status(200).json(jsonRpcError(id, -32602, `Recurso não encontrado: ${uri}`));
      }

      case 'prompts/list':
        return res.status(200).json(jsonRpcResult(id, { prompts: [] }));

      default:
        return res.status(200).json(jsonRpcError(id, -32601, `Método MCP não suportado: ${method}`));
    }
  } catch (err) {
    return res.status(500).json(jsonRpcError(id, -32603, err.message || 'Erro interno no servidor MCP.'));
  }
});

module.exports = router;
