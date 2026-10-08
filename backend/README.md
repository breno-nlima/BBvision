# BBVision - Backend API (Node.js & Express)

API RESTful desenvolvida para o sistema de **Fiscalização e Monitoramento Remoto de Obras do Banco do Brasil**, no âmbito do programa **Residência em Software & IA (Porto Digital / TakeOff)**.

Todo o desenvolvimento segue rigorosamente a especificação oficial contida em [`docs/TAKEOFF_DOCUMENTO_ENTREGA.md`](../docs/TAKEOFF_DOCUMENTO_ENTREGA.md).

---

## 🛠️ Stack Tecnológica

- **Linguagem & Runtime:** Node.js (v18+)
- **Framework Web:** Express.js com CORS e tratamento global de erros
- **Banco de Dados:** Supabase (PostgreSQL) com persistência local de fallback resiliente (HU05)
- **Inteligência Artificial:** Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai`
- **Compilação de Relatórios:** PDFKit (PDFs invioláveis com carimbo digital e hashes)
- **Disparo de E-mails:** Resend integrado via Nodemailer
- **Autenticação & Segurança:** JWT (JSON Web Tokens), bcryptjs e módulo nativo `crypto`

---

## 📋 Arquitetura em Camadas

```text
backend/
├── data/                       # Base local de persistência e seeds para modo offline
│   └── db.json
├── src/
│   ├── config/                 # Supabase, Gemini, E-mail e Variáveis
│   │   ├── email.js
│   │   ├── gemini.js
│   │   └── supabase.js
│   ├── controllers/            # Lógica de controle e orquestração de requisições
│   │   ├── authController.js
│   │   ├── fotosController.js
│   │   ├── obrasController.js
│   │   └── relatoriosController.js
│   ├── middlewares/            # Autenticação JWT, Upload Multer e ErrorHandler
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── models/                 # Repositório híbrido Supabase + Resiliência Local
│   │   └── repository.js
│   ├── routes/                 # Roteamento dos endpoints oficiais (/api/*)
│   │   ├── authRoutes.js
│   │   ├── fotosRoutes.js
│   │   ├── obrasRoutes.js
│   │   ├── relatoriosRoutes.js
│   │   └── index.js
│   ├── services/               # Regras de negócio, IA, PDF e E-mail
│   │   ├── emailService.js
│   │   ├── geminiService.js
│   │   └── pdfService.js
│   ├── utils/                  # Inviolabilidade e hashes criptográficos
│   │   └── cryptoUtils.js
│   ├── app.js                  # Configuração do Express
│   └── server.js               # Servidor HTTP com auto-fallback de porta
├── tests/                      # Bateria de testes de integração end-to-end
│   └── test_backend.js
├── uploads/                    # Diretório seguro de arquivos gerados
│   ├── evidencias/             # Fotos in-loco da câmera
│   └── relatorios/             # PDFs gerados com carimbo digital
└── .env                        # Variáveis de ambiente locais
```

---

## 🔒 Princípios de Inviolabilidade e Criptografia

1. **Código Único:** Gerado criptograficamente com 16 caracteres hexadecimais em maiúsculas (`crypto.randomBytes(8).toString('hex').toUpperCase()`).
2. **Hash SHA-256 de Imagem:** Calculado no momento em que a imagem é recebida do viewfinder da câmera.
3. **Hash SHA-256 do Relatório:** Compilado a partir do código único e timestamp (`crypto.createHash('sha256').update(codigoUnico + timestamp).digest('hex')`).
4. **Imutabilidade Total:** Ao finalizar o relatório, o status passa para `'FINALIZADO'` e qualquer tentativa subsequente de alteração de respostas ou novo envio é bloqueada com status HTTP `403` ou `400`.
5. **Carimbo Digital e Fé Pública:** O PDF gerado pelo PDFKit contém o carimbo digital visual, metadados invioláveis e declaração de não-repúdio.

---

## 🤖 Governança de Inteligência Artificial (Google Gemini)

- **Modelo Homologado:** `gemini-1.5-flash`
- **SLA de Latência:** Limite estrito de **15 segundos**. Se a chamada exceder ou falhar, é acionada a condição de *"Validação Manual"* com registro na trilha de auditoria.
- **Limiar de Confiança:** Confiança mínima de **75% (0.75)**. Respostas abaixo do limiar forçam rejeição ou solicitação de recaptura com melhor iluminação.
- **Prompts Homologados:**
  - **P1 (Qualidade):** *"Analise nitidez, iluminação e enquadramento. Responda APROVADO ou REJEITADO + motivo curto (máx 20 palavras)."*
  - **P2 (Gabarito):** *"Esta foto segue o padrão de referência? Diga o que está certo e o que ajustar."*
  - **P3 (Checklist):** *"Com base nesta imagem, escreva uma observação curta para o relatório."* (Sempre com o alerta *"Revise antes de enviar"*).

---

## 🚀 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login das personas (`rodrigo@empreiteira.com` / `mariana@bb.com.br`, senha `123456`)
- `GET /api/auth/me` - Dados do usuário logado via Token Bearer

### Obras
- `GET /api/obras` - Listagem de obras monitoradas
- `GET /api/obras/:id` - Detalhes da obra com relatórios vinculados
- `POST /api/obras` - Cadastro de nova obra

### Fotos & IA Gemini
- `POST /api/fotos/avaliar` - Avaliação multimodal in-loco (SLA <= 15s) e cálculo de hash SHA-256
- `POST /api/fotos/sugerir-observacao` - Sugestão assistida por IA para itens do checklist
- `POST /api/fotos/comparar-referencia` - Comparação visual com imagem de referência

### Relatórios
- `POST /api/relatorios` - Inicializa nova vistoria técnica (`status = 'EM_ANDAMENTO'`)
- `GET /api/relatorios` - Lista relatórios de vistoria
- `GET /api/relatorios/:id` - Retorna vistoria completa (dados, fotos e checklist)
- `PUT /api/relatorios/:id/respostas` - Salva itens do checklist (bloqueado se finalizado)
- `POST /api/relatorios/:id/fotos` - Anexa foto com metadados de inviolabilidade
- `POST /api/relatorios/:id/finalizar` - Gera código único, hash SHA-256, compila PDF e dispara e-mail
- `GET /api/relatorios/:id/pdf` - Download/Stream do PDF oficial gerado
- `PATCH /api/relatorios/:id/status` - Parecer do fiscal Mariana (aprova/reprova e atualiza status da obra)

### Health Check
- `GET /api/health` - Status do serviço e integridade operacional

---

## 🧪 Como Executar os Testes

Execute a suíte completa de 13 testes de integração com o comando:

```bash
npm test
```
