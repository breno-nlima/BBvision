-- ==============================================================================
-- BBVision - Banco do Brasil | Residência em Software & IA (TakeOff / Porto Digital)
-- Carga Inicial de Dados (Seeds Oficiais) para Testes, Demonstração e Homologação
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USUÁRIOS OFICIAIS (PERSONAS RODRIGO, MARIANA E ENGENHARIA BB)
-- Senha padrão para todos: '123456' (Hash bcrypt: $2a$10$fWJ2a.6Z1oYJkvb2Q3F45.h9W73e7m62mD1f6H169o6w0C2xZpT1W)
-- ------------------------------------------------------------------------------
INSERT INTO public.usuarios (id, nome, email, senha_hash, cargo, telefone, ativo)
VALUES
    (
        '11111111-1111-4111-8111-111111111111',
        'Rodrigo Silva',
        'rodrigo@empreiteira.com',
        '$2a$10$fWJ2a.6Z1oYJkvb2Q3F45.h9W73e7m62mD1f6H169o6w0C2xZpT1W',
        'empreiteira',
        '(11) 98765-4321',
        true
    ),
    (
        '22222222-2222-4222-8222-222222222222',
        'Mariana Vasconcelos',
        'mariana@bb.com.br',
        '$2a$10$fWJ2a.6Z1oYJkvb2Q3F45.h9W73e7m62mD1f6H169o6w0C2xZpT1W',
        'fiscal',
        '(61) 99123-4567',
        true
    ),
    (
        '33333333-3333-4333-8333-111111111111',
        'Mauricio Comrad',
        'mauricio.comrad@bb.com.br',
        '$2a$10$fWJ2a.6Z1oYJkvb2Q3F45.h9W73e7m62mD1f6H169o6w0C2xZpT1W',
        'engenheiro',
        '(61) 98888-7777',
        true
    )
ON CONFLICT (email) DO UPDATE SET
    nome = EXCLUDED.nome,
    cargo = EXCLUDED.cargo;

-- ------------------------------------------------------------------------------
-- 2. OBRAS DE EXEMPLO DO BANCO DO BRASIL (GEOFENCING & STATUS)
-- ------------------------------------------------------------------------------
INSERT INTO public.obras (id, nome, endereco, cidade, uf, responsavel, status, latitude, longitude, raio_tolerancia_metros)
VALUES
    (
        '33333333-3333-4333-8333-333333333333',
        'Obra Centro - Brasília (Ed. Sede III)',
        'SBS Quadra 1 Bloco G Lote 32',
        'Brasília',
        'DF',
        'Rodrigo Silva',
        'REGULAR',
        -15.7986,
        -47.8825,
        150
    ),
    (
        '44444444-4444-4444-8444-444444444444',
        'Obra Zona Sul - Agência Paulista',
        'Av. Paulista, 2163 - Cerqueira César',
        'São Paulo',
        'SP',
        'Rodrigo Silva',
        'REGULAR',
        -23.5587,
        -46.6601,
        100
    ),
    (
        '55555555-5555-4555-8555-555555555555',
        'Residência Alpha - Agência Cinelândia',
        'Praça Floriano, 51 - Centro',
        'Rio de Janeiro',
        'RJ',
        'Rodrigo Silva',
        'PENDENTE_AJUSTE',
        -22.9103,
        -43.1764,
        120
    )
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 3. CHECKLIST NORMATIVO PADRÃO DO BANCO DO BRASIL
-- ------------------------------------------------------------------------------
INSERT INTO public.checklists_modelo (id, titulo, categoria, descricao, tipo_campo, opcoes_resposta, obrigatorio, exige_foto, ordem, ativo)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'EPIs e Segurança do Trabalho',
        'Segurança',
        'Verificar uso obrigatório de capacete, óculos, luvas e calçado adequado pelos operários.',
        'multipla_escolha',
        '["Conforme", "Não Conforme", "Não se aplica"]'::jsonb,
        true,
        true,
        1,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'Quadro de Distribuição e Painel Elétrico',
        'Elétrica',
        'Inspecionar barramentos, disjuntores, identificação dos circuitos e aterramento conforme projeto.',
        'multipla_escolha',
        '["Conforme", "Não Conforme", "Não se aplica"]'::jsonb,
        true,
        true,
        2,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'Rampa e Rotas de Acessibilidade (NBR 9050)',
        'Acessibilidade',
        'Conferir inclinação de rampas de acesso, piso tátil direcional/alerta e largura livre.',
        'multipla_escolha',
        '["Conforme", "Não Conforme", "Não se aplica"]'::jsonb,
        true,
        true,
        3,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'Condição da Alvenaria e Estrutura',
        'Alvenaria',
        'Avaliar regularidade de paredes, emboço, gesso e ausência de fissuras e patologias.',
        'multipla_escolha',
        '["Conforme", "Não Conforme", "Não se aplica"]'::jsonb,
        true,
        true,
        4,
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000005',
        'Instalações Hidrossanitárias e Esgoto',
        'Hidráulica',
        'Testar escoamento de ralos, teste de estanqueidade e vedação de tubulações.',
        'multipla_escolha',
        '["Conforme", "Não Conforme", "Não se aplica"]'::jsonb,
        true,
        true,
        5,
        true
    )
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    categoria = EXCLUDED.categoria;

-- ------------------------------------------------------------------------------
-- 4. HISTÓRICO DE RELATÓRIOS CONSOLIDADOS (PARA DASHBOARDS E AUDITORIA)
-- ------------------------------------------------------------------------------
INSERT INTO public.relatorios (
    id,
    obra_id,
    usuario_id,
    codigo_unico,
    data,
    status,
    justificativa,
    hash_integridade,
    arquivo_pdf_url,
    validacao_manual,
    fiscal_auditor_id,
    finalizado_em,
    auditado_em
)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        '33333333-3333-4333-8333-333333333333',
        '11111111-1111-4111-8111-111111111111',
        '8F4A2C19E70B34DF',
        timezone('utc'::text, now() - INTERVAL '2 days'),
        'APROVADO',
        'Evidências visuais nítidas com gabarito alinhado. Avanço físico da etapa de alvenaria confirmado.',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'uploads/relatorios/relatorio_8F4A2C19E70B34DF.pdf',
        false,
        '22222222-2222-4222-8222-222222222222',
        timezone('utc'::text, now() - INTERVAL '2 days'),
        timezone('utc'::text, now() - INTERVAL '1 day')
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        '44444444-4444-4444-8444-444444444444',
        '11111111-1111-4111-8111-111111111111',
        '91BC34EFA87210DC',
        timezone('utc'::text, now() - INTERVAL '1 day'),
        'FINALIZADO',
        NULL,
        'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14',
        'uploads/relatorios/relatorio_91BC34EFA87210DC.pdf',
        false,
        NULL,
        timezone('utc'::text, now() - INTERVAL '1 day'),
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. FOTOS IN-LOCO VINCULADAS AOS RELATÓRIOS COM HASHES
-- ------------------------------------------------------------------------------
INSERT INTO public.fotos (
    id,
    relatorio_id,
    caminho_arquivo,
    hash_integridade,
    avaliacao_gemini,
    confianca,
    motivo,
    origem_camera_ao_vivo
)
VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'uploads/evidencias/exemplo-fachada.jpg',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'APROVADO',
        0.9600,
        'Imagem nítida e bem enquadrada, mantendo prumo e alinhamento do gabarito.',
        true
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000002',
        'uploads/evidencias/exemplo-fachada.jpg',
        'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14',
        'APROVADO',
        0.9200,
        'Iluminação adequada e enquadramento frontal da unidade.',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. RESPOSTAS DO CHECKLIST DOS RELATÓRIOS
-- ------------------------------------------------------------------------------
INSERT INTO public.respostas (
    id,
    relatorio_id,
    pergunta,
    valor,
    tipo,
    sugestao_ia,
    revisado_humano
)
VALUES
    (
        'd0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Condição da Alvenaria e Estrutura',
        'Conforme',
        'multipla_escolha',
        'Alvenaria externa erguida conforme gabarito de referência, juntas regulares e sem fissuras visíveis.',
        true
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        'Quadro de Distribuição e Painel Elétrico',
        'Conforme',
        'multipla_escolha',
        'Disjuntores identificados com cabeamento protegido e aterramento em conformidade.',
        true
    ),
    (
        'd0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000002',
        'Condição da Alvenaria e Estrutura',
        'Conforme',
        'multipla_escolha',
        'Estrutura em conformidade física.',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. LOGS DE AUDITORIA DE IA (SLA & GOVERNANÇA)
-- ------------------------------------------------------------------------------
INSERT INTO public.auditoria_ia_logs (
    id,
    relatorio_id,
    usuario_id,
    modelo,
    prompt_tipo,
    duracao_ms,
    sla_cumprido,
    resultado_status,
    confianca,
    motivo,
    hash_imagem
)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        '11111111-1111-4111-8111-111111111111',
        'gemini-1.5-flash',
        'P1_QUALIDADE',
        1420,
        true,
        'APROVADO',
        0.9600,
        'Imagem nítida e bem enquadrada.',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000002',
        '11111111-1111-4111-8111-111111111111',
        'gemini-1.5-flash',
        'P1_QUALIDADE',
        1580,
        true,
        'APROVADO',
        0.9200,
        'Iluminação adequada e enquadramento frontal.',
        'd41d8cd98f00b204e9800998ecf8427e98a12c19e70b34dfe3b0c44298fc1c14'
    )
ON CONFLICT (id) DO NOTHING;
