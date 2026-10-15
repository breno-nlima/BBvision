# BBVision - Solução de Engenharia para Fiscalização de Obras (Banco do Brasil)

Sistema inteligente de fiscalização de obras para o **Banco do Brasil**, desenvolvido no âmbito do desafio de Residência Tecnológica.

---

## 📁 Estrutura de Pastas do Projeto

O projeto foi estruturado no modelo **Fullstack desacoplado (Node.js / JavaScript)**, focado em simplicidade, manutenibilidade e padrão profissional:

```text
Bvision/
├── backend/                             # Servidor da API REST em Node.js (Básico e desacoplado)
│   ├── src/
│   │   ├── config/                     # Configurações de IA Gemini, e-mail e ambiente
│   │   ├── controllers/                # Camada de controle de requisições e respostas
│   │   ├── middlewares/                # Autenticação JWT e upload seguro Multer
│   │   ├── routes/                     # Definição e roteamento das rotas da API
│   │   ├── services/                   # Regras de negócio (IA Gemini, PDF, e-mail)
│   │   ├── utils/                      # Criptografia, hashes SHA-256 e códigos únicos
│   │   └── mockData.js                 # Armazenamento em memória desacoplado de banco
│   └── uploads/
│       ├── evidencias/                 # Fotos capturadas da câmera
│       └── relatorios/                 # PDFs gerados
│
├── frontend/                            # Aplicação cliente (Interface do Usuário em JavaScript)
│   ├── public/                         # Arquivos públicos e estáticos
│   └── src/
│       ├── assets/                     # Ícones, logotipos do BB e ilustrações
│       ├── components/                 # Componentes de interface modulares e reutilizáveis
│       ├── pages/                      # Telas separadas por fluxo e Persona
│       ├── services/                   # Comunicação com a API backend e chamadas HTTP
│       ├── styles/                     # Folhas de estilo (CSS) e design system
│       └── utils/                      # Formatações e validações
│
└── docs/                               # Documentação técnica, requisitos e diagramas
```

---

## 🎯 Correspondência das Pastas com as Premissas do BB

| Pasta | Premissas Atendidas | Justificativa |
| :--- | :--- | :--- |
| `frontend/src/pages/` | 2, 3, 7, 10, 15, 16, 19 | Interface mobile responsiva para uso no canteiro de obras e painel do fiscal. |
| `frontend/src/components/` | 4, 5, 7, 16, 17, 23 | Bloqueia galeria do celular; força câmera em tempo real, visualização e navegação. |
| `backend/src/services` | 5, 6, 8, 11, 13, 20, 21 | Avaliação de fotos com Gemini, hashes anti-adulteração SHA-256 e emissão de PDF com carimbo. |
| `backend/src/middlewares` | 6, 7, 19, 20 | Proteção de rotas com JWT e validação de arquivos. |
| `backend/uploads/evidencias` | 4, 6, 22 | Armazenamento de evidências fotográficas in-loco. |
| `docs/` | 1, 9, 12, 17 | Manuais de checklist, modelos de orientação visual e documentação de entrega. |

---

## 📖 Especificação Oficial e Regras de Negócio

Todo o projeto segue rigorosamente a **Entrega Parcial TakeOff | Residência em Software & IA** (Porto Digital / Banco do Brasil):
- 📄 [Documento de Entrega Oficial (TakeOff)](file:///c:/xampp/htdocs/Bvision/docs/TAKEOFF_DOCUMENTO_ENTREGA.md)
- 📌 Regras de IA, critérios de aceite, prompts homologados e contratos de endpoints definidos no documento base.

