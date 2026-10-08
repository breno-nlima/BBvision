# Regra de Ouro do Projeto: Especificação TakeOff BBVision

> **Fonte Suprema de Requisitos**: Todo e qualquer desenvolvimento, refatoração, modelagem ou funcionalidade no sistema **BBVision** DEVE ter como base a especificação oficial de entrega ("Entrega Parcial TakeOff | Residência em Software & IA", de 02/10/2026).
>
> Arquivo de referência detalhado: `docs/TAKEOFF_DOCUMENTO_ENTREGA.md`.

---

## Diretrizes Invioláveis

1. **Stack Oficial**:
   - **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla). Não usar frameworks pesados (React/Next/Vue) a menos que explicitamente solicitado pelo usuário.
   - **Backend**: Node.js com Express.
   - **Banco de Dados**: Supabase (PostgreSQL).
   - **IA**: Google Gemini (gemini-1.5-flash) para visão computacional e sugestões de texto.
   - **Geração de PDF**: PDFKit (no backend).
   - **Envio de E-mail**: Resend (integrado via Nodemailer).
   - **Deploy**: Hostinger.

2. **Personas e Fluxos**:
   - **Rodrigo (Empreiteira)**:
     - Login -> Seleciona Obra -> Visualiza Imagem de Referência -> Captura foto **exclusivamente via câmera** (bloquear galeria) -> IA Gemini valida na hora -> Preenche checklist dinâmico com sugestões editáveis da IA -> Finaliza vistoria -> Gera código único + hash SHA-256 + dispara PDF por e-mail -> **Bloqueia relatório para novas edições**.
     - Suporte **offline**: Fila local (IndexedDB/LocalStorage) e sincronização automática.
   - **Mariana (Fiscal / Engenheira do BB)**:
     - Login -> Painel de Auditoria -> Seleciona Obra -> Visualiza PDF com fotos, código único e carimbo digital -> Analisa checklist e notas da IA -> Aprova avanço (Obra fica 'REGULAR') ou Reprova solicitando ajuste (Obra fica 'PENDENTE_AJUSTE').

3. **Governança e Critérios de Aceite da IA (Gemini)**:
   - **Timeout de 15 segundos**: Se exceder ou a API estiver indisponível, oferecer *"Validar Manualmente?"* e sinalizar no relatório a condição *"Validação Manual"*.
   - **Limiar de Confiança de 75% (0.75)**: Abaixo disso, rejeitar ou forçar aviso de revisão.
   - **Resposta padronizada**: `APROVADO` ou `REJEITADO` + motivo curto (máx. 20 palavras).
   - **Human-in-the-loop**: Sugestões de texto da IA para checklist sempre vêm acompanhadas de aviso *"Revise antes de enviar"* e campos editáveis.
   - **Trilha de auditoria**: Toda ação da IA deve registrar modelo, horário e confiança.

4. **Integridade e Criptografia**:
   - **Código único**: 16 caracteres hex uppercase gerados criptograficamente.
   - **Hash SHA-256**: SHA-256 da imagem e do relatório (`codigoUnico + timestamp`).
   - Ausência de código único ou carimbo no PDF acarreta invalidação imediata pelo fiscal.
   - Prevenção de duplicidade: relatórios finalizados não podem ser reenviados ou editados.

5. **Modelagem de Dados Supabase**:
   - Entidades principais: `usuarios`, `obras`, `relatorios`, `fotos`, `respostas`.
   - Compatível com expansões de geofencing e agências do BB conforme as premissas do projeto.
