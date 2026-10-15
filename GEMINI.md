# Diretrizes do Projeto BBVision (TakeOff | Residência em Software & IA)

Este repositório implementa a solução de fiscalização remota de obras do **Banco do Brasil** desenvolvida pelo grupo na Residência Tecnológica Porto Digital / TakeOff.

Todo desenvolvimento neste repositório DEVE rigorosamente respeitar o documento de entrega oficial (`docs/TAKEOFF_DOCUMENTO_ENTREGA.md` e `.agents/rules/takeoff_documento_base.md`).

## Pontos Chave de Arquitetura e Negócio

1. **Stack Tecnológica**:
   - **Frontend**: HTML5, CSS3 moderno e Vanilla JavaScript (sem React/Next a menos que pedido expressamente).
   - **Backend**: Node.js com Express.
   - **Banco**: Desacoplado no backend local (um membro da equipe ficará responsável pelo banco).
   - **IA**: Google Gemini (gemini-1.5-flash) com SLA <= 15s e limiar de confiança de 75%.
   - **PDF**: PDFKit no backend.
   - **E-mail**: Resend (via Nodemailer).
   - **Hospedagem**: Hostinger.

2. **Fluxo e Personas**:
   - **Rodrigo (Empreiteira)**: Vê imagem de referência -> Dispara foto exclusivamente pela câmera -> Gemini valida -> Preenche checklist com sugestões editáveis de IA -> Finaliza vistoria -> Bloqueio imediato do relatório -> Geração de código único e hash SHA-256 -> Disparo de PDF por e-mail.
   - **Mariana (Fiscal / Engenheira)**: Painel de auditoria -> Análise de PDF com código único e carimbo -> Aprovação (obra 'REGULAR') ou reprovação (obra 'PENDENTE_AJUSTE').

3. **Inviolabilidade**:
   - Proibição de upload via galeria no fluxo de campo (somente captura ao vivo da câmera).
   - Geração de código único (`crypto.randomBytes(8).toString('hex').toUpperCase()`) e hash criptográfico SHA-256.
   - Bloqueio de edição e reenvio após finalização.

4. **Resiliência e Fallbacks**:
   - Modo offline com fila local e sincronização automática.
   - Fallback para validação manual caso a API do Gemini atinja timeout (>15s) ou falhe.
