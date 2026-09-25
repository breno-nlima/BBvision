-- ==============================================================================
-- BVision - Banco do Brasil | Solução de Engenharia para Fiscalização de Obras
-- Dados Iniciais (Seed) para Testes e Desenvolvimento
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AGÊNCIAS DE EXEMPLO DO BANCO DO BRASIL
-- ------------------------------------------------------------------------------
INSERT INTO public.agencias (id, codigo_agencia, nome, endereco, cidade, uf, latitude, longitude, raio_tolerancia_metros, ativo)
VALUES 
    (
        'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
        '0001-9',
        'Agência Centro - Brasília (Ed. Sede III)',
        'SBS Quadra 1 Bloco G Lote 32',
        'Brasília',
        'DF',
        -15.7986,
        -47.8825,
        150,
        true
    ),
    (
        'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e',
        '1810-4',
        'Agência Paulista - São Paulo',
        'Av. Paulista, 2163 - Cerqueira César',
        'São Paulo',
        'SP',
        -23.5587,
        -46.6601,
        100,
        true
    ),
    (
        'c3d4e5f6-a1b2-4c3d-0e4f-5a6b7c8d9e0f',
        '0089-2',
        'Agência Cinelândia - Rio de Janeiro',
        'Praça Floriano, 51 - Centro',
        'Rio de Janeiro',
        'RJ',
        -22.9103,
        -43.1764,
        120,
        true
    )
ON CONFLICT (codigo_agencia) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. ITENS DE CHECKLIST PADRÃO PARA FISCALIZAÇÃO DE OBRAS
-- ------------------------------------------------------------------------------
INSERT INTO public.checklists (id, titulo, categoria, descricao, obrigatorio, exige_foto, ordem, ativo)
VALUES
    (
        'd4e5f6a1-b2c3-4d4e-1f5a-6b7c8d9e0f1a',
        'EPIs e Segurança do Trabalho',
        'Segurança',
        'Verificar o uso obrigatório de capacete, óculos, luvas e calçado adequado por todos os operários no canteiro.',
        true,
        true,
        1,
        true
    ),
    (
        'e5f6a1b2-c3d4-4e5f-2a6b-7c8d9e0f1a2b',
        'Quadro de Distribuição e Painel Elétrico',
        'Elétrica',
        'Inspecionar barramentos, disjuntores, identificação dos circuitos e aterramento conforme projeto executivo.',
        true,
        true,
        2,
        true
    ),
    (
        'f6a1b2c3-d4e5-4f6a-3b7c-8d9e0f1a2b3c',
        'Rampa e Rotas de Acessibilidade (NBR 9050)',
        'Acessibilidade',
        'Conferir inclinação de rampas de acesso, piso tátil direcional/alerta e largura livre de circulação.',
        true,
        true,
        3,
        true
    ),
    (
        'a2b3c4d5-e6f1-4a2b-4c5d-6e7f8a9b0c1d',
        'Acabamento de Alvenaria e Pintura',
        'Acabamento',
        'Avaliar regularidade de paredes, emboço, gesso e aplicação da tonalidade e padrão visual BB.',
        true,
        true,
        4,
        true
    ),
    (
        'b3c4d5e6-f1a2-4b3c-5d6e-7f8a9b0c1d2e',
        'Instalações Hidrossanitárias',
        'Hidráulica',
        'Testar escoamento de ralos, teste de estanqueidade de tubulações e vedação de bacias sanitárias.',
        true,
        true,
        5,
        true
    )
ON CONFLICT (id) DO NOTHING;
