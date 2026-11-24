# BBVision — Backend API RESTful (Node.js & Express)

API RESTful corporativa do sistema **BBVision** para fiscalização remota de obras do **Banco do Brasil**.

---

## Arquitetura & Segurança

- **Runtime:** Node.js (v18/v20/v22+) com operações assíncronas não-bloqueantes (bcrypt, fs/promises, PDFKit).
- **Segurança OWASP:** Headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, CSP restrita, `Permissions-Policy: camera=(self)`, Rate Limiting por janela deslizante, validação de Magic Bytes em imagens e mitigação de Path Traversal (CWE-22).
- **Autenticação & RBAC:** JWT Bearer obrigatório em todas as rotas privadas (incluindo `/api/fotos/*`), verificação real de senha (`bcrypt.compare`) na assinatura digital de relatórios e isolamento de obras/relatórios por empreiteira (anti-IDOR).
- **Persistência Desacoplada:** `src/repositories/dataStore.js` suporta **Supabase (PostgreSQL)** em produção com fallback automático para persistência atômica em disco (`backend/data/bbvision_store.json`), sem quaisquer dados fictícios ou sementes hardcoded.
- **Inviolabilidade & Fé Pública:** Código único criptográfico (16 caracteres hexadecimais maiúsculos), hash SHA-256 sobre dados reais do relatório, bloqueio permanente pós-finalização, PDFKit com assinatura digital e carimbo de auditoria, além de fila de sincronização offline (HU05).

---

## Estrutura de Pastas

```text
backend/
├── database/
│   └── schema.sql                 # DDL completo PostgreSQL / Supabase com índices e RLS
├── src/
│   ├── config/                    # IA, E-mail (Resend/SMTP), Supabase e SiteConfig
│   ├── controllers/               # Auth, Obras, Fotos/IA e Relatórios
│   ├── middlewares/               # Auth JWT, RBAC, Upload seguro, RateLimiter, SecurityHeaders
│   ├── repositories/
│   │   └── dataStore.js           # Camada de persistência unificada (Supabase + JSON atômico)
│   ├── routes/                    # API REST, MCP e rotas Agent-Ready
│   ├── services/                  # Visão Computacional IA, PDFKit, E-mail e AgentContent
│   ├── utils/                     # Criptografia SHA-256, Magic Bytes e Path Traversal defense
│   ├── app.js                     # Aplicação Express
│   └── server.js                  # Servidor HTTP com Graceful Shutdown
├── tests/
│   └── test_backend.js            # Suite E2E completa em base isolada
├── uploads/                       # Evidências fotográficas e PDFs emitidos
└── .env.example                   # Template de variáveis de ambiente
```

---

## Comandos

```bash
# Iniciar API + Frontend
npm start

# Executar suite automatizada completa
npm test
```
