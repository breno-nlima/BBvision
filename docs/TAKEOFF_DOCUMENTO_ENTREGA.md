# BBVision - Documento Base de Entrega Parcial (TakeOff | Residência em Software & IA)

> **Documento Oficial de Referência**  
> **Programa:** Residência em Software & IA — Porto Digital / TakeOff  
> **Desafio:** Banco do Brasil — Sistema de Monitoramento e Fiscalização Remota de Obras  
> **Data de Entrega:** 02/10/2026  
> **Grupo:** Arthur Lucas, Breno Lima, Fábio Pereira, George Rafhael, Isabela Melo, Jefferson Veiga, Lucas Antonio, Luiz Augusto e Vitória Celeste  
> **Stakeholder / Mentor Entrevistado:** Mauricio Comrad  

---

## 1. Definição do Problema, Hipótese e Personas ("AI-Augmented")

### 1.1 O Problema
O modelo tradicional de fiscalização de obras apresenta um **alto custo operacional** devido à obrigatoriedade da presença física de engenheiros em campo. Os principais agravantes são:
- **Custo e logística de deslocamentos:** Engenheiros não estão presentes em todos os municípios com obras ativas, demandando viagens caras e demoradas.
- **Registros manuais e vulneráveis:** Uso de papel, caneta e fotos comuns sem garantia de autenticidade ou integridade.
- **Imagens inadequadas ou adulteradas:** Fotos fora de padrão (escuras, desfocadas, com ângulos incorretos) ou passíveis de manipulação geram retrabalho, lentidão e conflitos entre equipes.
- **Falta de validação automatizada:** Ausência de mecanismos em tempo real para validar local, ângulo, nitidez e o momento exato da inspeção.

### 1.2 Hipótese Central Validada
> Substituir parte das vistorias presenciais por vistorias remotas, com fotos capturadas exclusivamente dentro do aplicativo e armazenadas de forma imutável, reduz significativamente os custos de deslocamento do Banco do Brasil sem perder a confiabilidade e precisão da medição do avanço físico das obras.

### 1.3 Requisitos Chave do Stakeholder (Banco do Brasil)
1. **Captura direta in-app:** A foto deve ser capturada exclusivamente pela câmera dentro da aplicação, **sem possibilidade de envio da galeria**.
2. **Alta resolução e nitidez:** Imagens devem ter qualidade técnica comprovada.
3. **Imutabilidade total:** As fotos e registros devem ser armazenados em banco de dados que impeça alterações posteriores (o que chega permanece exatamente como foi enviado).
4. **Comprovação temporal e de avanço:** O registro serve como prova do avanço real da obra até o prazo estipulado.
5. **Acompanhamento remoto:** O fiscal/engenheiro do banco acompanha tudo à distância pelo painel web/app.

### 1.4 Personas do Sistema
- **Rodrigo — Empreiteira (29 anos):**
  - *Perfil:* Executa a obra em campo; antes usava papel, prancheta e fotos avulsas; arcava com custos e atrasos de visita.
  - *Necessidade:* Registrar a obra remotamente, reduzir deslocamentos, gerar relatórios digitais rápidos.
  - *Ganho com IA:* Validação instantânea da qualidade da foto, geração assistida de observações e envio imediato com recibo criptografado.
- **Mariana — Fiscal de Serviço / Engenheira do BB (37 anos):**
  - *Perfil:* Responsável por auditar o progresso físico das obras; alta sobrecarga de viagens a múltiplos municípios.
  - *Necessidade:* Analisar relatórios remotamente, auditar integridade de fotos e aprovar/reprovar medições com segurança jurídica.
  - *Ganho com IA:* Triagem de qualidade prévia, observações técnicas estruturadas, carimbo digital inviolável e relatórios PDF consolidados.

---

## 2. Onde a Inteligência Artificial Gera Valor

| Pilar | Como Atua no BBVision |
| :--- | :--- |
| **Automação** | O **Google Gemini** analisa a foto instantaneamente no momento do disparo, substituindo análises manuais demoradas. |
| **Predição** | Detecta problemas de qualidade (escuridão, desfoque, ângulo incorreto ou desconformidade com o gabarito) antes de o registro ser concluído. |
| **Geração de Conteúdo** | Sugere observações técnicas contextualizadas a partir da foto para agilizar o preenchimento do checklist. |

---

## 3. Backlog e Engenharia de Requisitos "AI-First"

### 3.1 Épicos
- **E1 — Autenticação e Gestão de Usuários**
- **E2 — Captura e Validação de Imagens com Gemini**
- **E3 — Checklist Dinâmico e Relatório Automático**
- **E4 — Integridade Digital, Armazenamento e Entrega**

### 3.2 Histórias de Usuário (HUs)
- **HU01:** Como empreiteira, quero fazer login para acessar as minhas obras.
- **HU02:** Como empreiteira, quero ver a imagem de referência antes de fotografar.
- **HU03:** Como empreiteira, quero que o Gemini valide a minha foto na hora.
- **HU04:** Como empreiteira, quero preencher o checklist com tipos variados de resposta.
- **HU05:** Como empreiteira, quero trabalhar sem internet e sincronizar depois.
- **HU06:** Como sistema, quero gerar um código único e carimbo digital em cada registro finalizado para garantir a integridade.
- **HU07:** Como fiscal, quero acessar o painel de auditoria para visualizar o relatório em PDF.
- **HU08:** Como fiscal, quero aprovar ou reprovar o relatório validado para atualizar o status da obra.

### 3.3 Detalhamento de Tarefas Técnicas
1. Configurar acesso à API do Google Gemini com chave de API.
2. Criar endpoint backend de envio de imagem e recebimento de análise visual.
3. Implementar orientação visual em tempo real no frontend quando a foto for rejeitada.
4. Gerar hash SHA-256 de integridade e código único alfanumérico após aprovação.
5. Montar estrutura de formulário de checklist com tipos flexíveis de campos.
6. Desenvolver compilação de PDF (PDFKit) e disparo automático de e-mail (Resend / Nodemailer).
7. Criar sistema de fila local (IndexedDB/LocalStorage) para funcionamento offline e sincronização em background.

---

## 4. Padrões de Uso e Critérios de Aceite da IA

### 4.1 Regras de Governança da IA
- **Acionamento cirúrgico:** O Gemini é acionado exclusivamente na captura de imagem (validação) e na geração de sugestões de texto para o checklist.
- **Validação humana mandatória:** A IA apoia o processo, mas a decisão final e a revisão são sempre humanas (Human-in-the-loop).
- **Editabilidade:** Toda sugestão de texto da IA é editável e vem acompanhada do alerta *"Revise antes de enviar"*.
- **Transparência de confiança:** Respostas da IA transportam o índice numérico de confiança (`confianca` entre 0.0 e 1.0).
- **Trilha de auditoria:** Toda chamada à IA deve ser registrada no banco com timestamp, modelo utilizado e resultado.

### 4.2 Critérios de Aceite da IA
- **SLA de Latência:** A resposta do Gemini deve retornar em **até 15 segundos**. Se exceder, o sistema exibe a opção de *"Validação Manual"*.
- **Limiar de Confiança:** Confiança **< 75% (0.75)** força exibição de aviso de revisão ou rejeição.
- **Formato Padronizado:** A saída da avaliação de imagem deve sempre responder: `APROVADO` ou `REJEITADO` + motivo curto (máx. 20 palavras).

---

## 5. Casos de Borda, Exceções e Resiliência (Edge Cases)

### 5.1 No Fluxo da Empreiteira (Campo)
- **Foto escura ou borrada:** Confiança < 75% → IA rejeita e exibe instrução visual para refazer o enquadramento/iluminação.
- **Padrão não reconhecido:** Sistema avisa que a imagem difere da referência e permite ao usuário prosseguir sob aviso visível marcado no relatório.
- **Serviço de IA indisponível ou timeout (>15s):** Sistema abre modal *"Enviar sem validação?"* e grava a condição de "Validação Manual" no relatório.
- **Tentativa de envio duplicado:** O sistema bloqueia a submissão de relatório já finalizado, exibindo a data e hora do envio original.
- **Ambiente offline (sem sinal de internet):** Fotos e respostas são armazenadas na fila local segura do dispositivo e sincronizadas automaticamente ao restabelecer a conexão.

### 5.2 No Fluxo do Fiscal (Auditoria/Gestão)
- **Falso positivo da IA na captura:** O fiscal identifica inconsistência visual no PDF e reprova a vistoria solicitando novo registro.
- **Relatório marcado como "Validação Manual":** O sistema sinaliza que o registro foi realizado sem IA (offline ou timeout), orientando o fiscal a realizar auditoria visual redobrada.
- **Sugestão de texto incoerente:** O fiscal desconsidera o texto da IA e julga o avanço exclusivamente com base na foto criptografada.
- **Ausência de código único ou carimbo digital:** O documento é imediatamente invalidado por quebra de integridade.

---

## 6. Arquitetura e Stack Tecnológica Homologada

| Camada | Tecnologia Adotada | Justificativa |
| :--- | :--- | :--- |
| **Interface (Frontend)** | HTML5 + CSS3 + JavaScript (Vanilla) | Leve, performático, compatível com navegadores móveis sem overhead de frameworks pesados |
| **Back-end (API)** | Node.js com Express | Rápido, assíncrono, ideal para streaming de uploads e integração de APIs |
| **Banco de Dados** | Supabase (PostgreSQL) | Banco relacional robusto, suporte a UUIDs, triggers, RLS e alta integridade |
| **Inteligência Artificial** | Google Gemini API (gemini-1.5-flash) | Alta velocidade multimodal, cota gratuita, excelente análise de visão computacional |
| **Assistência de Dev** | Claude Code | Suporte e esteira de desenvolvimento |
| **Geração de PDF** | PDFKit (Backend) | Criação programática de relatórios imutáveis com hashes e fotos embutidas |
| **Envio de E-mail** | Resend (integrado via Nodemailer) | Disparo transacional seguro de PDFs para partes interessadas |
| **Hospedagem** | Hostinger | Ambiente de deploy da infraestrutura |

---

## 7. Modelagem do Banco de Dados (Supabase / PostgreSQL)

### 7.1 Entidades, Estrutura Relacional e Cardinalidade

> **Princípios Cardeais do Domínio:**
> - **Empreiteira**: Pode possuir **N Obras** sob sua responsabilidade de execução (`empreiteira_id` / `obras_empreiteiras`). Não cadastra obras.
> - **Fiscal**: Pode **cadastrar N Obras** no sistema (`cadastrado_por_fiscal_id`).
> - **Fiscal**: Pode **fiscalizar N Obras** emitindo pareceres e laudos técnicos (`fiscal_responsavel_id` / `obras_fiscais`).

```
 [USUARIO: cargo='empreiteira'] (1) ─── pode ter ─── (N) [OBRA]
 [USUARIO: cargo='fiscal']      (1) ─── cadastra ─── (N) [OBRA]
 [USUARIO: cargo='fiscal']      (1) ─── fiscaliza ── (N) [OBRA]
                                                            │
                                                            ├────── (1) ──── (N) [RELATORIO] (1) ──── (N) [FOTO]
                                                            │                               │
                                                            │                               ├──────── (1) ──── (N) [RESPOSTA]
                                                            │
                                    [USUARIO: Vistoriador] ─┘
```

#### Tabela: `usuarios` (ou `usuario`)
- `id`: UUID (PK, DEFAULT gen_random_uuid())
- `nome`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) NOT NULL UNIQUE
- `senha_hash`: VARCHAR(255) NOT NULL
- `cargo`: VARCHAR(100) NOT NULL (ex: `'empreiteira'`, `'fiscal'`, `'engenheiro'`)
- `empresa`: VARCHAR(255)
- `registro_profissional`: VARCHAR(100)
- `created_at`: TIMESTAMP WITH TIME ZONE

#### Tabela: `obras` (ou `obra`)
- `id`: UUID (PK, DEFAULT gen_random_uuid())
- `nome`: VARCHAR(255) NOT NULL
- `endereco`: TEXT NOT NULL
- `responsavel`: VARCHAR(255) NOT NULL
- `status`: VARCHAR(50) DEFAULT 'REGULAR' (ex: `'REGULAR'`, `'PENDENTE_AJUSTE'`, `'EM_ANDAMENTO'`)
- `tipo`: VARCHAR(100) DEFAULT 'Reforma e Modernização de Agência'
- `empreiteira_id`: UUID REFERENCES usuarios(id) (**1 Empreiteira pode ter N Obras**)
- `cadastrado_por_fiscal_id`: UUID REFERENCES usuarios(id) (**1 Fiscal pode cadastrar N Obras**)
- `fiscal_responsavel_id`: UUID REFERENCES usuarios(id) (**1 Fiscal pode fiscalizar N Obras**)
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

#### Tabelas Associativas Opcionais (Extensão N:N para Consórcios e Múltiplos Fiscais)
- `obras_empreiteiras`: `(obra_id, empreiteira_id, data_vinculo, ativo)`
- `obras_fiscais`: `(obra_id, fiscal_id, papel, data_designacao)`

#### Tabela: `relatorios` (ou `relatorio`)
- `id`: UUID (PK, DEFAULT gen_random_uuid())
- `obra_id`: UUID NOT NULL REFERENCES obras(id)
- `usuario_id`: UUID NOT NULL REFERENCES usuarios(id)
- `codigo_unico`: VARCHAR(50) UNIQUE (ex: hex uppercase de 16 caracteres)
- `data`: TIMESTAMP WITH TIME ZONE DEFAULT now()
- `status`: VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO' (ex: `'EM_ANDAMENTO'`, `'FINALIZADO'`, `'APROVADO'`, `'PENDENTE_AJUSTE'`)
- `justificativa`: TEXT (parecer do fiscal em caso de aprovação/reprovação)
- `created_at`: TIMESTAMP WITH TIME ZONE

#### Tabela: `fotos` (ou `foto`)
- `id`: UUID (PK, DEFAULT gen_random_uuid())
- `relatorio_id`: UUID NOT NULL REFERENCES relatorios(id) ON DELETE CASCADE
- `caminho_arquivo`: TEXT NOT NULL
- `hash_integridade`: VARCHAR(64) NOT NULL (SHA-256 do arquivo)
- `avaliacao_gemini`: VARCHAR(50) (ex: `'APROVADO'`, `'REJEITADO'`, `'VALIDACAO_MANUAL'`)
- `confianca`: NUMERIC(5, 4) (ex: 0.9500)
- `motivo`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

#### Tabela: `respostas` (ou `resposta`)
- `id`: UUID (PK, DEFAULT gen_random_uuid())
- `relatorio_id`: UUID NOT NULL REFERENCES relatorios(id) ON DELETE CASCADE
- `pergunta`: TEXT NOT NULL
- `valor`: TEXT NOT NULL
- `tipo`: VARCHAR(50) NOT NULL (ex: `'texto'`, `'multipla_escolha'`, `'booleano'`)
- `sugestao_ia`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE

---

## 8. Contratos de API (Endpoints e Métodos HTTP)

### 8.1 Autenticação
- **POST** `/api/auth/login`
  - **Body:** `{ "email": "...", "senha": "..." }`
  - **Retorno (200):** `{ "mensagem": "login bem-sucedido", "token": "...", "usuario": { "id": "...", "nome": "...", "cargo": "..." } }`
  - **Retorno (401):** `{ "erro": "Credenciais inválidas" }`

### 8.2 Obras
- **GET** `/api/obras`
  - **Headers:** `Authorization: Bearer <token>`
  - **Retorno (200):** `[ { "id": "uuid", "nome": "...", "endereco": "...", "responsavel": "...", "status": "REGULAR" } ]`

### 8.3 Gestão de Relatórios
- **POST** `/api/relatorios`
  - **Body:** `{ "obra_id": "uuid" }`
  - **Retorno (201):** `{ "id": "uuid-do-relatorio", "status": "EM_ANDAMENTO" }`

### 8.4 Validação de Imagem com Gemini
- **POST** `/api/fotos/avaliar`
  - **Body:** `multipart/form-data` contendo o arquivo de imagem (ou `imagemBase64`)
  - **Retorno (200):**
    ```json
    {
      "status": "APROVADO",
      "confianca": 0.95,
      "motivo": "Imagem nítida e bem enquadrada"
    }
    ```
  - **Timeout (>15s) ou Erro (503):**
    ```json
    {
      "erro": "Serviço de IA indisponível. Validação manual liberada."
    }
    ```

### 8.5 Respostas do Checklist
- **PUT** `/api/relatorios/:id/respostas`
  - **Body:**
    ```json
    [
      { "pergunta": "Status da alvenaria", "valor": "Conforme", "sugestao_ia": "Alvenaria nivelada com juntas regulares" }
    ]
    ```
  - **Retorno (200):** `{ "mensagem": "Respostas salvas com sucesso" }`

### 8.6 Finalização do Relatório, PDF e Disparo
- **POST** `/api/relatorios/:id/finalizar`
  - **Processamento:**
    1. Gera `codigoUnico`: `crypto.randomBytes(8).toString('hex').toUpperCase()`.
    2. Gera `hashIntegridade`: `crypto.createHash('sha256').update(codigoUnico + Date.now()).digest('hex')`.
    3. Compila PDF via `PDFKit` em buffer.
    4. Envia e-mail via `Resend` / `Nodemailer` para o fiscal com o PDF anexo.
    5. Atualiza o relatório no Supabase para `status = 'FINALIZADO'`, salvando `codigo_unico`.
    6. **Bloqueia edições posteriores** no relatório.
  - **Retorno (200):** `{ "mensagem": "Relatório finalizado com sucesso!", "codigo": "..." }`

### 8.7 Auditoria e Parecer do Fiscal
- **PATCH** `/api/relatorios/:id/status`
  - **Body:** `{ "status": "APROVADO" | "REPROVADO", "justificativa": "..." }`
  - **Processamento:**
    1. Atualiza `relatorio.status` e `relatorio.justificativa`.
    2. Atualiza `obra.status` (`'REGULAR'` se aprovado, `'PENDENTE_AJUSTE'` se reprovado).
  - **Retorno (200):** `{ "mensagem": "Vistoria aprovada/reprovada com sucesso!", "id": "..." }`

---

## 9. Repositório de Prompts Homologados

### P1 — Avaliar Qualidade da Foto
- **Prompt:**  
  `"Analise nitidez, iluminação e enquadramento. Responda APROVADO ou REJEITADO + motivo curto (máx 20 palavras)."`
- **Saída esperada:** `APROVADO` ou `REJEITADO` acompanhado do motivo direto.
- **Aprendizado:** Limitar palavras e caracteres evita respostas prolixas e facilita parser backend.

### P2 — Comparar com Imagem Padrão de Referência
- **Prompt:**  
  `"Esta foto segue o padrão de referência? Diga o que está certo e o que ajustar."`
- **Saída esperada:** Confirmação objetiva e pontos específicos de atenção.
- **Aprendizado:** Instrução com foco em ângulo e enquadramento reduz falsas rejeições.

### P3 — Sugerir Observação Técnica para o Checklist
- **Prompt:**  
  `"Com base nesta imagem, escreva uma observação curta para o relatório."`
- **Saída esperada:** Texto técnico descritivo conciso focado na etapa da obra.
- **Aprendizado:** Exigir termos objetivos e vocabulário de construção civil evita observações genéricas.
