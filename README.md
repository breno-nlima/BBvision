# BVision - Solução de Engenharia para Fiscalização de Obras (Banco do Brasil)

Sistema inteligente de fiscalização de obras para o **Banco do Brasil**, desenvolvido no âmbito do desafio de Residência Tecnológica.

---

## 📁 Estrutura de Pastas do Projeto

O projeto foi estruturado no modelo **Fullstack desacoplado (Node.js / JavaScript)**, focado em simplicidade, manutenibilidade e padrão profissional:

```text
Bvision/
├── backend/                             # Servidor da API REST em Node.js
│   ├── src/
│   │   ├── config/                     # Configurações de banco de dados, upload e ambiente
│   │   ├── controllers/                # Camada de controle de requisições e respostas
│   │   ├── middlewares/                # Autenticação, upload seguro e validação de token único
│   │   ├── models/                     # Modelos de dados (Agência, Vistoria, Checklist, Evidência)
│   │   ├── routes/                     # Definição e roteamento das rotas da API
│   │   ├── services/                   # Regras de negócio (inviolabilidade, GPS, relatórios, e-mail)
│   │   └── utils/                      # Utilitários (cálculo de tempo, formatações, validações)
│   └── uploads/
│       └── evidencias/                 # Armazenamento seguro de fotos e evidências capturadas
│
├── frontend/                            # Aplicação cliente (Interface do Usuário em JavaScript)
│   ├── public/                         # Arquivos públicos e estáticos
│   └── src/
│       ├── assets/                     # Ícones, logotipos do BB e ilustrações
│       ├── components/                 # Componentes de interface modulares e reutilizáveis
│       │   ├── camera/                 # Componente de captura in-loco direta pela câmera
│       │   ├── checklist/              # Componente dinâmico de perguntas e respostas
│       │   ├── assinatura/             # Canvas para assinatura digital do responsável
│       │   └── common/                 # Botões, cabeçalhos, alertas e modais compartilhados
│       ├── pages/                      # Telas separadas por Persona (Premissa 2 e 3)
│       │   ├── campo/                  # Telas Mobile/Tablet para Empreiteiras e Terceiros
│       │   └── gestao/                 # Telas Desktop para Engenheiros e Arquitetos do BB
│       ├── services/                   # Comunicação com a API backend e chamadas HTTP
│       ├── styles/                     # Folhas de estilo (CSS) e design system
│       └── utils/                      # Geolocalização, formatação de datas e validações locais
│
└── docs/                               # Documentação técnica, requisitos e diagramas
```

---

## 🎯 Correspondência das Pastas com as Premissas do BB

| Pasta | Premissas Atendidas | Justificativa |
| :--- | :--- | :--- |
| `frontend/src/pages/campo` | 2, 3, 7, 10, 15, 16, 19 | Interface mobile responsiva para uso no canteiro de obras. Garante abertura por link único inviolável. |
| `frontend/src/pages/gestao`| 2, 3, 18, 21, 22 | Painel desktop para engenheiros do BB com Dashboard analítico e visualização de relatórios. |
| `frontend/src/components/camera` | 4, 5, 7, 17, 23 | Bloqueia galeria do celular; força uso da câmera em tempo real com preview e descarte automático de capturas anteriores. |
| `frontend/src/components/assinatura` | 16 | Coleta a assinatura digital do profissional diretamente no dispositivo ao finalizar. |
| `backend/src/services` | 5, 6, 8, 11, 13, 20, 21 | Lógica de cálculo de tempo, validação de raio GPS (geofencing), geração de hash anti-adulteração, envio de e-mail e emissão do PDF pré-definido. |
| `backend/src/middlewares` | 6, 7, 19, 20 | Proteção de uso único do token do relatório e validação de integridade. |
| `backend/uploads/evidencias` | 4, 6, 22 | Armazenamento com metadados invioláveis das fotos e pequenos vídeos. |
| `docs/` | 1, 9, 12, 17 | Manuais de checklist, modelos de orientação visual (plantas) e guias da solução. |
