-- ============================================================================
-- BBVision - Dados Iniciais de Homologação (Seed)
-- Banco do Brasil S.A. | TakeOff - Residência em Software & IA
-- ============================================================================

-- 1. Inserção de Usuários de Referência
-- Senha padrão para testes locais: '123456' (hash bcrypt)
INSERT INTO usuarios (id, nome, email, senha_hash, cargo, empresa, registro_profissional, telefone)
VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'Rodrigo Silva (Empreiteira)',
    'rodrigo@empreiteira.com',
    '$2a$10$wB73r.vYf2oDq1JgT5yLneKkYqA8O3h8a.dMhV6Q9vj.7Kk.1mZ0a',
    'empreiteira',
    'Silva Engenharia & Reformas',
    'CREA-SP 987654/D',
    '(11) 98888-1111'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Mariana Vasconcelos (Fiscalização BB)',
    'mariana@bb.com.br',
    '$2a$10$wB73r.vYf2oDq1JgT5yLneKkYqA8O3h8a.dMhV6Q9vj.7Kk.1mZ0a',
    'fiscal',
    'Banco do Brasil S.A. - DIESE',
    'CREA-DF 123456/D - Matrícula BB 459812-X',
    '(61) 97777-2222'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Engenheiro de Campo (Empreiteira Modelo)',
    'empreiteira@bbvision.com',
    '$2a$10$wB73r.vYf2oDq1JgT5yLneKkYqA8O3h8a.dMhV6Q9vj.7Kk.1mZ0a',
    'empreiteira',
    'Empreiteira Modelo de Obras',
    'CREA-SP 554433/D',
    '(11) 96666-3333'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Auditor de Fiscalização (BB)',
    'fiscal@bbvision.com',
    '$2a$10$wB73r.vYf2oDq1JgT5yLneKkYqA8O3h8a.dMhV6Q9vj.7Kk.1mZ0a',
    'fiscal',
    'Banco do Brasil S.A. - Fiscalização de Obras',
    'CREA-DF 112233/D - Matrícula BB F1234567',
    '(61) 95555-4444'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Inserção de Obras Demonstrando as Cardinalidades:
-- - Rodrigo (11111111-1111-4111-8111-111111111111) tem N Obras (obr-001, obr-002, obr-003)
-- - Mariana (22222222-2222-4222-8222-222222222222) cadastrou N Obras (obr-001, obr-002, obr-003, obr-004)
-- - Mariana fiscaliza N Obras (obr-001, obr-002, obr-004)
INSERT INTO obras (
  id, 
  nome, 
  endereco, 
  responsavel, 
  status, 
  tipo, 
  empreiteira_id, 
  cadastrado_por_fiscal_id, 
  fiscal_responsavel_id
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Obra Centro (Agência Sede)',
    'Av. Rio Branco, 120 - Centro, Rio de Janeiro - RJ',
    'Rodrigo Silva',
    'REGULAR',
    'Reforma e Modernização de Agência',
    '11111111-1111-4111-8111-111111111111', -- Empreiteira Rodrigo
    '22222222-2222-4222-8222-222222222222', -- Fiscal Mariana (cadastrou)
    '22222222-2222-4222-8222-222222222222'  -- Fiscal Mariana (fiscaliza)
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Obra Zona Sul (Agência Paulista)',
    'Av. Paulista, 2163 - Cerqueira César, São Paulo - SP',
    'Rodrigo Silva',
    'REGULAR',
    'Adequação de Acessibilidade',
    '11111111-1111-4111-8111-111111111111', -- Empreiteira Rodrigo
    '22222222-2222-4222-8222-222222222222', -- Fiscal Mariana (cadastrou)
    '22222222-2222-4222-8222-222222222222'  -- Fiscal Mariana (fiscaliza)
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Agência Asa Sul (Edificação Nova)',
    'SBS Quadra 1 Bloco G Lote 32, Brasília - DF',
    'Rodrigo Silva',
    'EM_ANDAMENTO',
    'Construção de Nova Agência',
    '11111111-1111-4111-8111-111111111111', -- Empreiteira Rodrigo
    '22222222-2222-4222-8222-222222222222', -- Fiscal Mariana (cadastrou)
    '44444444-4444-4444-8444-444444444444'  -- Auditor BB (fiscaliza)
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Obra Copacabana (Fachada e Interior)',
    'Rua Barata Ribeiro, 300 - Rio de Janeiro - RJ',
    'Engenheiro de Campo',
    'EM_ANDAMENTO',
    'Manutenção Predial e Fachada',
    '33333333-3333-4333-8333-333333333333', -- Outra Empreiteira
    '22222222-2222-4222-8222-222222222222', -- Fiscal Mariana (cadastrou)
    '22222222-2222-4222-8222-222222222222'  -- Fiscal Mariana (fiscaliza)
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Inserção nas tabelas associativas N:N
INSERT INTO obras_empreiteiras (obra_id, empreiteira_id)
VALUES
  ('00000000-0000-0000-0000-000000000001', '11111111-1111-4111-8111-111111111111'),
  ('00000000-0000-0000-0000-000000000002', '11111111-1111-4111-8111-111111111111'),
  ('00000000-0000-0000-0000-000000000003', '11111111-1111-4111-8111-111111111111'),
  ('00000000-0000-0000-0000-000000000004', '33333333-3333-4333-8333-333333333333')
ON CONFLICT DO NOTHING;

INSERT INTO obras_fiscais (obra_id, fiscal_id, papel)
VALUES
  ('00000000-0000-0000-0000-000000000001', '22222222-2222-4222-8222-222222222222', 'titular'),
  ('00000000-0000-0000-0000-000000000002', '22222222-2222-4222-8222-222222222222', 'titular'),
  ('00000000-0000-0000-0000-000000000003', '22222222-2222-4222-8222-222222222222', 'cadastrador'),
  ('00000000-0000-0000-0000-000000000003', '44444444-4444-4444-8444-444444444444', 'titular'),
  ('00000000-0000-0000-0000-000000000004', '22222222-2222-4222-8222-222222222222', 'titular')
ON CONFLICT DO NOTHING;
