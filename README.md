# BBVision - Solução de Fiscalização Remota de Obras (Banco do Brasil)

[![Hostinger Deploy](https://img.shields.io/badge/Deploy-Hostinger%20Produção-green?style=for-the-badge&logo=hostinger)](https://antiquewhite-dolphin-779579.hostingersite.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Banco do Brasil](https://img.shields.io/badge/Banco%20do%20Brasil-TakeOff%202026-FEE000?style=for-the-badge&logo=banco-do-brasil&logoColor=003399)](https://www.bb.com.br)

Plataforma inteligente de monitoramento, auditoria e fiscalização remota de obras para o **Banco do Brasil**, desenvolvida pela equipe no âmbito do programa **Residência Tecnológica em Software & IA (Porto Digital / TakeOff)**.

---

## 🌐 Acesso Público em Produção

A aplicação completa (Frontend + Backend API + Validador) encontra-se implantada e operacional na nuvem Hostinger:

👉 **Link Público Oficial:** [https://antiquewhite-dolphin-779579.hostingersite.com/](https://antiquewhite-dolphin-779579.hostingersite.com/)

### 🔑 Credenciais para Demonstração e Homologação

Você pode utilizar os botões de **Acesso Rápido** na tela de login ou inserir os acessos oficiais:

| Perfil | E-mail Oficial | Senha | Função / Permissões |
| :--- | :--- | :--- | :--- |
| **👷 Rodrigo Silva (Empreiteira)** | `rodrigo@empreiteira.com` | `123456` | Acesso de campo, câmera obrigatória sem galeria, sugestões de IA, checklist e finalização de laudo com bloqueio imediato. |
| **👩‍💼 Engª Mariana (Fiscalização BB)** | `mariana@bb.com.br` | `123456` | Painel de Auditoria e Julgamento com Fé Pública, verificação forense de hash SHA-256 e emissão de laudo homologado. |
| **🛡️ Validador Público de Fé Pública** | *Sem login (Acesso livre)* | — | Consulta instantânea da autenticidade e validade de laudos via Código Único ou Hash SHA-256 no rodapé da página. |

---

## 📁 Estrutura de Pastas do Projeto

O projeto adota uma arquitetura **Fullstack desacoplada e unificada**, operando com servidor Express integrado para servir simultaneamente a API RESTful e os arquivos estáticos do frontend:

```text
BBvision/
├── server.js                           # Entrypoint raiz universal para Node.js (Hostinger / PM2 / Cloud)
├── package.json                        # Dependências gerais, metadados e scripts de execução (v1.1.0)
│
├── backend/                            # Servidor da API REST em Node.js (Express)
│   ├── src/
│   │   ├── config/                     # Configurações de IA Gemini, e-mail e ambiente
│   │   ├── controllers/                # Controladores de rotas (Auth, Obras, Relatórios, Fotos/IA)
│   │   ├── middlewares/                # Autenticação JWT, Upload Multer e ErrorHandler
│   │   ├── routes/                     # Roteamento dos endpoints oficiais (/api/*)
│   │   ├── services/                   # Regras de negócio (IA Gemini, PDFKit, E-mail Resend)
│   │   ├── utils/                      # Criptografia, hashes SHA-256 e códigos únicos
│   │   ├── mockData.js                 # Camada de persistência desacoplada em memória
│   │   ├── app.js                      # Inicialização do Express, middlewares e rotas SPA
│   │   └── server.js                   # Servidor HTTP resiliente
│   ├── tests/                          # Bateria de testes automatizados da API
│   ├── uploads/                        # Armazenamento de evidências fotográficas e PDFs
│   └── .env                            # Variáveis de ambiente
│
├── frontend/                           # Aplicação cliente (Vanilla JavaScript / HTML5 / CSS3)
│   ├── server.js                       # Servidor unificado para execução direta da pasta frontend
│   ├── index.html                      # Ponto de entrada SPA com design system Banco do Brasil
│   └── src/
│       ├── assets/                     # Logotipo oficial BBVision, ícones SVG e ilustrações
│       ├── components/                 # Componentes modulares (Navbar, Toast, Câmera, BottomNav)
│       ├── pages/                      # Telas completas organizadas pelo fluxo das Personas
│       ├── services/                   # Cliente API fetch same-origin, estado reativo e fila offline (HU05)
│       ├── styles/                     # Design system corporativo BB (cores, tipografia, componentes)
│       └── utils/                      # Utilitários de criptografia Web Crypto API e formatação
│
└── docs/                               # Documentação técnica oficial e especificações de entrega
    └── TAKEOFF_DOCUMENTO_ENTREGA.md    # Documento de entrega oficial do desafio
```

---

## 🎯 Correspondência com as Premissas e Critérios do BB

| Pasta / Componente | Premissas Atendidas | Justificativa Técnica |
| :--- | :--- | :--- |
| `frontend/src/pages/` | 2, 3, 7, 10, 15, 16, 19 | Interface mobile-first fluida para uso em campo pelo encarregado e painel de governança da fiscal. |
| `frontend/src/components/camera.js` | 4, 5, 7, 16, 17, 23 | Inviolabilidade de captura: bloqueio absoluto de upload via galeria; disparo obrigatório por câmera ao vivo. |
| `backend/src/services/geminiService.js` | 5, 6, 8, 11, 13, 20 | Análise de nitidez, enquadramento e contexto via Google Gemini 1.5 Flash com SLA &le; 15s e limiar &ge; 75%. |
| `backend/src/utils/cryptoUtils.js` | 6, 7, 19, 20 | Geração de Código Único hexadecimal de 16 dígitos e hash criptográfico SHA-256 anti-adulteração. |
| `backend/src/services/pdfService.js` | 13, 14, 21 | Emissão de Laudo Técnico oficial em PDF com carimbo de autenticidade, QR Code e Fé Pública. |
| `frontend/src/services/state.js` | HU05 (Resiliência) | Modo offline de contingência com cache local e fila sincronizável caso ocorra oscilação de sinal 4G/5G. |

---

## 🔍 Endpoints da API em Produção

Os endpoints abaixo estão ativos no domínio de produção:

- **Healthcheck Geral**: `GET https://antiquewhite-dolphin-779579.hostingersite.com/api/health`
- **Metadados da API**: `GET https://antiquewhite-dolphin-779579.hostingersite.com/api-info`
- **Autenticação**: `POST https://antiquewhite-dolphin-779579.hostingersite.com/api/auth/login`
- **Catálogo de Obras**: `GET https://antiquewhite-dolphin-779579.hostingersite.com/api/obras`
- **Histórico de Relatórios**: `GET https://antiquewhite-dolphin-779579.hostingersite.com/api/relatorios`
- **Análise de Imagem (IA)**: `POST https://antiquewhite-dolphin-779579.hostingersite.com/api/fotos/avaliar`
- **Validação de Fé Pública**: `GET https://antiquewhite-dolphin-779579.hostingersite.com/api/relatorios/validar/:termo`

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- **Node.js** (versão 18, 20 ou 22 recomendada)
- **NPM**

### 2. Instalação e Execução
```bash
# Clone o repositório
git clone https://github.com/breno-nlima/BBvision.git
cd BBvision

# Instale as dependências
npm install

# Inicie a aplicação unificada (API + Frontend)
npm start
# ou para desenvolvimento
npm run dev
```

Acesse o sistema localmente em: [http://localhost:3000](http://localhost:3000)

### 3. Testes Automatizados
```bash
npm test
```

---

## ☁️ Arquitetura de Deploy (Hostinger Node.js)

1. **Runtime:** Node.js v22 (Express).
2. **Entrypoint:** `server.js` na raiz do projeto.
3. **Variáveis de Ambiente Configuradas:**
   - `PORT`: Gerenciada dinamicamente pelo processo da Hostinger.
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Chave criptográfica de alta entropia.
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY`: Integração com camada de nuvem Supabase.
   - `GEMINI_MODEL`: `gemini-1.5-flash`
   - `GEMINI_TIMEOUT_MS`: `15000`
   - `GEMINI_CONFIDENCE_THRESHOLD`: `0.75`
   - `EMAIL_FROM`: `bbvision-notificacoes@bancodobrasil.com.br`
   - `FISCAL_EMAIL_PADRAO`: `mariana.fiscal@bb.com.br`
   - `UPLOAD_DIR`: `uploads`

---

## 👥 Integrantes e Residência Tecnológica

Projeto concebido para a **Residência em Software & IA (Porto Digital / TakeOff)** em parceria com o **Banco do Brasil**.
Documentação completa de entrega: [docs/TAKEOFF_DOCUMENTO_ENTREGA.md](file:///c:/xampp/htdocs/BBvision/docs/TAKEOFF_DOCUMENTO_ENTREGA.md).
