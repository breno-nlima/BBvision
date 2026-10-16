# BBVision - Backend API RESTful (Node.js & Express)

API RESTful desenvolvida para o sistema de **Fiscalização e Monitoramento Remoto de Obras do Banco do Brasil**, no âmbito do programa **Residência em Software & IA (Porto Digital / TakeOff)**.

[![Status](https://img.shields.io/badge/Status-Produção%20Online-green)](https://antiquewhite-dolphin-779579.hostingersite.com/api/health)
[![Versão](https://img.shields.io/badge/Versão-1.1.0-blue)](https://antiquewhite-dolphin-779579.hostingersite.com/api-info)

---

## 🌐 Produção (Hostinger)

- **URL Base:** `https://antiquewhite-dolphin-779579.hostingersite.com`
- **Healthcheck:** `https://antiquewhite-dolphin-779579.hostingersite.com/api/health`
- **API Info:** `https://antiquewhite-dolphin-779579.hostingersite.com/api-info`

---

## 🛠️ Stack Tecnológica

- **Linguagem & Runtime:** Node.js (v18, v20, v22+)
- **Framework Web:** Express.js 5.x com CORS e middlewares de segurança
- **Camada de Dados:** Desacoplada e resiliente com persistência em memória e integração Supabase
- **Inteligência Artificial:** Google Gemini (`gemini-1.5-flash`) via SDK oficial `@google/generative-ai`
- **Geração de Documentos:** PDFKit (Laudos com carimbo institucional, código de autenticação e hash)
- **Criptografia & Inviolabilidade:** SHA-256 (`crypto`), tokens JWT e senhas com bcryptjs
- **E-mails Transacionais:** Resend / Nodemailer para envio automático após homologação

---

## 📋 Estrutura da Camada Backend

```text
backend/
├── src/
│   ├── config/                 # Configurações de IA Gemini, e-mail e Supabase
│   ├── controllers/            # Controladores das rotas de negócio
│   │   ├── authController.js   # Login, registro de novos usuários e JWT
│   │   ├── fotosController.js  # Análise via IA Gemini e upload de evidências
│   │   ├── obrasController.js  # Catálogo e detalhamento de obras do Banco do Brasil
│   │   └── relatoriosController.js # Finalização, julgamento técnico e emissão de laudo PDF
│   ├── middlewares/            # Autenticação JWT, Upload Multer e ErrorHandler
│   ├── routes/                 # Roteamento dos endpoints oficiais (/api/*)
│   ├── services/               # IA Gemini (gemini-1.5-flash), PDF e E-mail
│   ├── utils/                  # Inviolabilidade e hashes criptográficos SHA-256
│   ├── mockData.js             # Base desacoplada em memória para desenvolvimento ágil
│   ├── app.js                  # Configuração do Express e fallback SPA
│   └── server.js               # Servidor HTTP com detecção de IP de rede
├── tests/                      # Bateria de testes automatizados da API
├── uploads/                    # Diretório local de evidências fotográficas e PDFs
└── .env                        # Variáveis de ambiente locais
```

---

## 🚀 Como Executar Localmente

```bash
# Iniciar a API com o servidor completo
npm start

# Modo de desenvolvimento
npm run dev

# Executar bateria de testes automatizados
npm test
```

A API estará disponível em `http://localhost:3000/api`.

---

## 🛡️ Contas Padrão de Homologação

- **Rodrigo (Empreiteira):** `rodrigo@empreiteira.com` | `123456`
- **Mariana (Fiscalização BB):** `mariana@bb.com.br` | `123456`
