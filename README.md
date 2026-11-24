# BBVision — Plataforma de Fiscalização Remota de Obras (Banco do Brasil)

[![Hostinger Deploy](https://img.shields.io/badge/Deploy-Hostinger%20Produção-green?style=for-the-badge&logo=hostinger)](https://antiquewhite-dolphin-779579.hostingersite.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Banco do Brasil](https://img.shields.io/badge/Banco%20do%20Brasil-TakeOff%202026-FEE000?style=for-the-badge&logo=banco-do-brasil&logoColor=003399)](https://www.bb.com.br)

Plataforma de monitoramento, auditoria e fiscalização remota de obras do **Banco do Brasil**, desenvolvida na **Residência Tecnológica em Software & IA (Porto Digital / TakeOff)**.

---

## Acesso em Produção

- **Portal Oficial:** [https://antiquewhite-dolphin-779579.hostingersite.com/](https://antiquewhite-dolphin-779579.hostingersite.com/)
- **Validador Público (Fé Pública):** [https://antiquewhite-dolphin-779579.hostingersite.com/validador](https://antiquewhite-dolphin-779579.hostingersite.com/validador)

### Perfis de Acesso
O sistema opera sem contas de exemplo pré-cadastradas. Novos usuários realizam cadastro na tela inicial selecionando seu perfil:
- **Empreiteira (Campo & Vistorias):** Executa vistorias in-loco nas obras designadas, captura fotos exclusivamente pela câmera ao vivo com validação por IA, preenche checklists técnicos, assina digitalmente e gera relatórios imutáveis com código único e hash SHA-256.
- **Fiscal de Obra (Auditoria & Governança):** Cadastra e gerencia obras e checklists técnicos, vincula empreiteiras credenciadas, audita evidências e PDFs oficiais, e homologa vistorias (`REGULAR`) ou solicita correções (`PENDENTE_AJUSTE`).
- **Validador Público (Acesso Livre):** Qualquer cidadão ou auditor verifica a autenticidade e integridade SHA-256 de um relatório usando seu Código Único de 16 caracteres ou Hash SHA-256.

---

## Estrutura do Projeto

```text
BBvision/
├── server.js                           # Entrypoint raiz universal (Hostinger / PM2 / Cloud)
├── package.json                        # Dependências e scripts (v1.2.0)
│
├── backend/                            # Servidor API REST (Node.js + Express)
│   ├── database/
│   │   └── schema.sql                  # DDL oficial PostgreSQL / Supabase com índices e RLS
│   ├── src/
│   │   ├── config/                     # Configurações de IA, e-mail, Supabase e domínio
│   │   ├── controllers/                # Auth, Obras, Fotos/IA e Relatórios
│   │   ├── middlewares/                # JWT, RBAC, Upload seguro, Rate Limiter, Headers OWASP
│   │   ├── repositories/
│   │   │   └── dataStore.js            # Repositório unificado (Supabase + persistência atômica local)
│   │   ├── routes/                     # Endpoints REST (/api/*), MCP (/api/mcp) e Agent-Readiness
│   │   ├── services/                   # Visão Computacional IA, PDFKit, E-mail e Conteúdo Semântico
│   │   ├── utils/                      # SHA-256, Código Único 16 hex, Magic Bytes e Anti-Path Traversal
│   │   ├── app.js                      # Pipeline Express e servir SPA
│   │   └── server.js                   # Servidor HTTP com Graceful Shutdown
│   ├── tests/
│   │   └── test_backend.js             # Suite E2E completa sobre base limpa e isolada
│   ├── uploads/                        # Evidências fotográficas e PDFs compilados
│   └── .env.example                    # Modelo de variáveis de ambiente
│
├── frontend/                           # SPA Mobile-First (Vanilla JS, HTML5 e CSS3)
│   ├── index.html                      # Entrada principal com JSON-LD, WebMCP e semântica
│   ├── robots.txt / sitemap.xml / llms.txt
│   └── src/
│       ├── app.js                      # Roteamento, guards de acesso e cleanup de hardware
│       ├── assets/                     # Logotipo e ícones SVG corporativos
│       ├── components/                 # Header, BottomNav, Modais, Toast
│       ├── pages/                      # Fluxo completo de Empreiteira, Fiscal e Validador Público
│       ├── services/                   # API client, State management e Fila Offline (HU05)
│       ├── styles/                     # Design System corporativo
│       └── utils/                      # Formatação, anti-XSS, Web Crypto SHA-256 e WebMCP
│
└── docs/                               # Documentação técnica de entrega
```

---

## Principais Endpoints da API

- `GET /api/health` e `GET /api/ready` — Telemetria e Readiness Probe
- `POST /api/auth/register` | `POST /api/auth/login` | `GET /api/auth/me` | `PATCH /api/auth/me` | `PATCH /api/auth/senha` | `GET /api/auth/empreiteiras`
- `GET /api/obras` | `POST /api/obras` | `PATCH /api/obras/:id` | `DELETE /api/obras/:id` | `PUT /api/obras/:id/checklist`
- `POST /api/fotos/avaliar` | `POST /api/fotos/sugerir-observacao`
- `POST /api/relatorios` | `GET /api/relatorios` | `PUT /api/relatorios/:id/respostas` | `POST /api/relatorios/:id/fotos` | `POST /api/relatorios/:id/finalizar` | `PATCH /api/relatorios/:id/status` | `GET /api/relatorios/:id/pdf` | `POST /api/relatorios/sincronizar-offline`
- `GET /api/validador/:codigoOuHash` — Validação pública de Fé Pública
- `POST /api/mcp` e `GET /.well-known/mcp/server-card.json` — Servidor MCP Streamable HTTP

---

## Execução Local e Testes

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente (opcional — copie backend/.env.example para backend/.env)
# Em produção, defina JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e GEMINI_API_KEY

# Iniciar servidor unificado (API + Frontend)
npm start

# Executar bateria completa de testes E2E
npm test
```

Acesse localmente em `http://localhost:3000`.
