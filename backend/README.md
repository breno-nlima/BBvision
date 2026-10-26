# BBVision - Backend API RESTful (Node.js & Express)

API RESTful corporativa de alta performance desenvolvida para o sistema de **Fiscalização e Monitoramento Remoto de Obras do Banco do Brasil**, no âmbito do programa **Residência em Software & IA (Porto Digital / TakeOff)**.

[![Status](https://img.shields.io/badge/Status-Produção%20Online-green)](https://antiquewhite-dolphin-779579.hostingersite.com/api/health)
[![Versão](https://img.shields.io/badge/Versão-1.1.0-blue)](https://antiquewhite-dolphin-779579.hostingersite.com/api-info)
[![Testes](https://img.shields.io/badge/Testes-17%2F17%20Aprovados-success)](https://antiquewhite-dolphin-779579.hostingersite.com)

---

## 🌐 Endpoints de Telemetria e Documentação

- **Healthcheck & Métricas:** `/api/health`
- **Validador Público de Autenticidade:** `/api/validador/:codigoOuHash`
- **Catálogo de Endpoints:** `/api-info`

---

## 🛠️ Stack Tecnológica & Padrões Sênior

- **Linguagem & Runtime:** Node.js (v18, v20, v22+) com Event Loop não-bloqueante (Bcrypt assíncrono, I/O assíncrono).
- **Framework Web:** Express.js 5.x com headers OWASP Defense-in-Depth (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy: camera=(self)`).
- **Proteção & Concorrência:** Rate Limiting em memória (janela deslizante com autolimpeza) para Auth, IA e API geral.
- **Camada de Dados:** Padrão Repository desacoplado e resiliente com persistência em memória e sincronização com Supabase (PostgreSQL).
- **Modelo Relacional & Cardinalidade:**
  - **1 Empreiteira ➔ N Obras**: A empreiteira tem N obras atribuídas a ela (`empreiteira_id`), sendo proibida de cadastrar novas obras.
  - **1 Fiscal ➔ N Obras (Fiscalização)**: O fiscal/engenheiro fiscaliza N obras simultâneas (`fiscal_responsavel_id`).
  - **1 Fiscal ➔ N Obras (Cadastro)**: O fiscal cadastra N obras no sistema (`cadastrado_por_fiscal_id`).

---

## 📋 Arquitetura de Pastas

```text
backend/
├── database/                   # DDL oficial do Banco (Supabase/PostgreSQL) e Seeds
│   ├── schema.sql              # Esquema relacional, RLS, índices e triggers
│   └── seed.sql                # Dados iniciais de homologação (Rodrigo e Mariana)
├── src/
│   ├── config/                 # Conexões oficiais: IA Gemini, Nodemailer/Resend e Supabase
│   ├── controllers/            # Controladores com validação defensiva e sanitização
│   │   ├── authController.js   # Login JWT, registro com bcrypt assíncrono e me
│   │   ├── fotosController.js  # Análise Gemini com SLA de 15s e mitigação de Path Traversal
│   │   ├── obrasController.js  # Catálogo e histórico de vistorias com filtros por empreiteira/fiscal
│   │   └── relatoriosController.js # Finalização com bloqueio de reenvio, laudo PDF e julgamento fiscal
│   ├── middlewares/            # RBAC (Perfis), RateLimiter, Upload Seguro, RequestLogger e ErrorHandler
│   ├── routes/                 # Roteamento dos endpoints oficiais (/api/*)
│   ├── services/               # IA Gemini (gemini-1.5-flash), PDFKit e E-mail Transacional
│   ├── utils/                  # Inviolabilidade SHA-256, Magic Bytes e Path Traversal defense
│   ├── mockData.js             # Repositório de dados desacoplado com suporte assíncrono e filtros
│   ├── app.js                  # Pipeline Express, headers corporativos e fallback SPA
│   └── server.js               # Servidor HTTP com IP de rede local e Graceful Shutdown
├── tests/                      # Suite automatizada com 18 grupos de testes
├── uploads/                    # Diretório seguro de evidências e PDFs gerados
└── .env                        # Variáveis de ambiente
```

---

## 🚀 Como Executar Localmente

```bash
# Iniciar o servidor completo unificado (API + Frontend)
npm start

# Modo de desenvolvimento
npm run dev

# Executar bateria de 17 testes automatizados
npm test
```

A API estará disponível em `http://localhost:3000/api`.

---

## 🛡️ Contas Padrão de Homologação (Seed)

- **Rodrigo (Empreiteira):** `rodrigo@empreiteira.com` | Senha: `123456`
- **Mariana (Fiscalização BB):** `mariana@bb.com.br` | Senha: `123456`
