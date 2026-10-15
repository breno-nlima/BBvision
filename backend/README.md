# BBVision - Backend API Básico (Node.js & Express)

API RESTful desenvolvida para o sistema de **Fiscalização e Monitoramento Remoto de Obras do Banco do Brasil**, no âmbito do programa **Residência em Software & IA (Porto Digital / TakeOff)**.

> **Nota de Divisão da Squad:**
> A parte de banco de dados foi desacoplada deste repositório para ser gerenciada diretamente pelo membro da equipe responsável pelo banco. O backend atual encontra-se em formato básico e enxuto com persistência em memória, permitindo execução ágil e servindo as integrações do frontend e da IA Google Gemini.

---

## 🛠️ Stack Tecnológica

- **Linguagem & Runtime:** Node.js (v18+)
- **Framework Web:** Express.js com CORS
- **Camada de Dados:** Desacoplada (Mock em memória para testes e desenvolvimento do frontend)
- **Inteligência Artificial:** Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai`
- **Compilação de Relatórios:** PDFKit (PDFs com carimbo digital, código único e hashes)
- **Autenticação & Segurança:** JWT (JSON Web Tokens), bcryptjs e módulo nativo `crypto`

---

## 📋 Estrutura de Pastas

```text
backend/
├── src/
│   ├── config/                 # Gemini e E-mail
│   │   ├── email.js
│   │   └── gemini.js
│   ├── controllers/            # Controladores das rotas
│   │   ├── authController.js
│   │   ├── fotosController.js
│   │   ├── obrasController.js
│   │   └── relatoriosController.js
│   ├── middlewares/            # Autenticação JWT, Upload Multer e ErrorHandler
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── routes/                 # Roteamento dos endpoints oficiais (/api/*)
│   │   ├── authRoutes.js
│   │   ├── fotosRoutes.js
│   │   ├── obrasRoutes.js
│   │   ├── relatoriosRoutes.js
│   │   └── index.js
│   ├── services/               # IA Gemini, PDF e E-mail
│   │   ├── emailService.js
│   │   ├── geminiService.js
│   │   └── pdfService.js
│   ├── utils/                  # Inviolabilidade e hashes criptográficos
│   │   └── cryptoUtils.js
│   ├── mockData.js             # Base básica em memória (Usuários, Obras, Relatórios)
│   ├── app.js                  # Configuração do Express
│   └── server.js               # Servidor HTTP
├── tests/                      # Bateria de testes automatizados
│   └── test_backend.js
├── uploads/                    # Diretório de evidências fotográficas e PDFs
└── .env                        # Variáveis de ambiente locais
```

---

## 🚀 Como Executar

```bash
# Iniciar o backend (porta 3000 por padrão)
npm run dev

# Executar bateria de testes automatizados
npm test
```
