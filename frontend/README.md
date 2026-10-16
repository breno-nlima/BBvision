# BBVision - Frontend SPA (Vanilla JavaScript, HTML5 & CSS3)

Interface web móvel e responsiva para a solução de fiscalização remota de obras do **Banco do Brasil**, desenvolvida sem frameworks externos (Single-Page Application em Vanilla JavaScript) para máxima performance, fidelidade visual e controle do fluxo de canteiro de obras.

[![Ambiente de Produção](https://img.shields.io/badge/Produção-Hostinger-green)](https://antiquewhite-dolphin-779579.hostingersite.com/)
[![Design System](https://img.shields.io/badge/Design%20System-Banco%20do%20Brasil-003399)](https://antiquewhite-dolphin-779579.hostingersite.com/)

---

## 🎨 Design System e Identidade Visual

- **Cores Oficiais:** Azul BB (`#003399`), Amarelo BB (`#FCF000` / `#F8D200`), tons neutros e modo de alto contraste para canteiro de obras.
- **Tipografia:** *Plus Jakarta Sans* via Google Fonts.
- **Componentes:**
  - Barra de navegação corporativa com identificação do usuário e cargo.
  - Cards de obra com indicador de status e selos visuais.
  - Visualizador de imagem protegida com overlay de metadados invioláveis.
  - Toast notifications customizadas para feedback imediato.
  - Validador público com verificação em tempo real.

---

## 🔒 Princípios de Inviolabilidade em Campo

1. **Bloqueio de Galeria:**
   O componente de câmera (`src/components/camera.js`) utiliza a API nativa `navigator.mediaDevices.getUserMedia`, não permitindo envio de fotos antigas ou manipuladas da galeria.
2. **Criptografia no Cliente (Web Crypto API):**
   Geração de hash SHA-256 e código único de 16 caracteres hexadecimais no momento do disparo.
3. **Resiliência Offline (HU05):**
   Fila local em `localStorage` com sincronização automática quando a conectividade for restabelecida no canteiro.

---

## 📁 Estrutura de Pastas

```text
frontend/
├── index.html                  # Container SPA principal e importação de estilos
├── server.js                   # Servidor de fallback integrado ao backend
├── src/
│   ├── app.js                  # Orquestrador central e roteamento das páginas
│   ├── assets/                 # Logo oficial BBVision, ícones SVG e ilustrações
│   ├── components/             # Componentes modulares reutilizáveis (Toast, Câmera, BottomNav)
│   ├── pages/                  # Telas segregadas por fluxo de Persona
│   │   ├── login.js            # Login com contas rápidas e cadastro
│   │   ├── inicio.js           # Visão geral e atalhos de vistoria
│   │   ├── obras.js            # Listagem de obras em andamento
│   │   ├── obraDetalhe.js      # Detalhes, plantas e histórico
│   │   ├── tipoLocal.js        # Seleção de tipo de ambiente da agência
│   │   ├── cameraIa.js         # Captura e validação por IA Gemini
│   │   ├── imagemProtegida.js  # Visualização com metadados invioláveis
│   │   ├── checklist*.js       # Checklists normativos e perguntas dinâmicas
│   │   ├── assinaturaResponsavel.js # Assinatura digital técnica
│   │   ├── relatorioBloqueado.js    # Resumo final e bloqueio pós-conclusão
│   │   ├── fiscalAuditoria.js  # Painel de julgamento e homologação do BB
│   │   └── validadorPublico.js # Consulta pública de Fé Pública
│   ├── services/
│   │   ├── api.js              # Cliente de chamadas RESTful same-origin
│   │   ├── offlineSync.js      # Gerenciamento da fila local offline (HU05)
│   │   └── state.js            # Armazenamento e reatividade do estado da aplicação
│   └── styles/
│       ├── variables.css       # Tokens de cor, fontes e espaçamento
│       ├── base.css            # Reset e tipografia global
│       ├── components.css      # Estilização de botões, inputs, cards e badges
│       └── screens.css         # Layout das telas corporativas e mobile
```
