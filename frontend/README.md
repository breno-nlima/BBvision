# BBVision — Frontend SPA (Vanilla JavaScript, HTML5 & CSS3)

Interface web responsiva e mobile-first para a plataforma de fiscalização remota de obras do **Banco do Brasil**, construída sem frameworks externos para máximo desempenho em campo.

---

## Garantias de Campo & Inviolabilidade

1. **Bloqueio de Galeria:** Captura fotográfica exclusivamente ao vivo via `navigator.mediaDevices.getUserMedia` com liberação automática de câmera e GPS ao trocar de tela.
2. **Validação por IA e Fallback Seguro:** Análise de iluminação, contexto de obra/construção e enquadramento central com SLA de até 15s e acionamento transparente de Validação Manual Assistida (com hash SHA-256 local) em caso de indisponibilidade ou modo offline.
3. **Assinatura Digital & Fé Pública:** Canvas obrigatório de assinatura, confirmação de senha validada no servidor e consulta pública de autenticidade via Código Único ou Hash SHA-256.
4. **Resiliência Offline (HU05):** Fila local persistente em `localStorage` com sincronização automática quando a conectividade é restabelecida.

---

## Estrutura de Pastas

```text
frontend/
├── index.html                      # Container SPA, JSON-LD, SEO e WebMCP
├── server.js                       # Entrypoint unificado
└── src/
    ├── app.js                      # Roteador SPA, guards de sessão/obra e cleanup de hardware
    ├── assets/                     # Logotipo e ícones SVG
    ├── components/                 # Header, BottomNav, Modais corporativos e Toast
    ├── pages/
    │   ├── login.js                # Autenticação e criação de conta
    │   ├── inicio.js               # Painel inicial por perfil (Empreiteira / Fiscal)
    │   ├── obras.js                # Catálogo e gestão de obras
    │   ├── obraDetalhe.js          # Detalhes da obra, edição, exclusão e checklist
    │   ├── tipoLocal.js            # Seleção do tipo de ambiente
    │   ├── checklistPergunta.js    # Checklist passo a passo com Assistente de IA
    │   ├── checklistDinamico.js    # Checklist complementar e consolidação com IA
    │   ├── checklistVerificacao.js # Verificação final pré-captura
    │   ├── cameraIa.js             # Câmera ao vivo, GPS, carimbo temporal e validação IA
    │   ├── imagemProtegida.js      # Confirmação de metadados e hash SHA-256
    │   ├── assinaturaResponsavel.js # Assinatura em canvas e confirmação de senha
    │   ├── relatorioBloqueado.js   # Confirmação de selo inviolável e PDF oficial
    │   ├── fiscalAuditoria.js      # Auditoria fiscal com seletor de relatórios e parecer
    │   ├── relatorios.js           # Busca, filtros e visualização de relatórios
    │   ├── perfil.js               # Edição de perfil, troca de senha e logout
    │   └── validadorPublico.js     # Consulta pública de Fé Pública (SHA-256 / Código)
    ├── services/                   # API client, State management e Fila Offline
    ├── styles/                     # Design System corporativo
    └── utils/                      # Anti-XSS, Web Crypto SHA-256, clipboard e WebMCP
```
