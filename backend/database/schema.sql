-- ============================================================================
-- BBVision - Esquema Oficial do Banco de Dados (PostgreSQL / Supabase)
-- Sistema Inteligente de Fiscalização e Monitoramento Remoto de Obras BB
-- TakeOff | Residência em Software & IA
-- ============================================================================
--
-- REGRAS FUNDAMENTAIS DE NEGÓCIO E CARDINALIDADE:
-- 1. Uma EMPREITEIRA pode ter N - OBRAS (1 Empreiteira -> N Obras).
-- 2. Um FISCAL pode fiscalizar N - OBRAS (1 Fiscal -> N Obras fiscalizadas).
-- 3. Um FISCAL pode cadastrar N - OBRAS (1 Fiscal -> N Obras cadastradas).
-- 4. A EMPREITEIRA NÃO cadastra obras (apenas executa e vistoria obras atribuídas).
-- ============================================================================

-- Habilitar extensão para geração de UUIDs criptográficos
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABELA: usuarios
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('empreiteira', 'fiscal', 'engenheiro', 'admin')),
    empresa VARCHAR(255),
    registro_profissional VARCHAR(100),
    telefone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE usuarios IS 'Usuários do sistema BBVision (Empreiteiras e Fiscais de Engenharia BB)';
COMMENT ON COLUMN usuarios.cargo IS 'Perfil de acesso: empreiteira (campo) ou fiscal/engenheiro (Banco do Brasil)';

-- ============================================================================
-- 2. TABELA: obras
-- ============================================================================
-- Cardinalidades implementadas:
-- - empreiteira_id: Uma Empreiteira pode ter N Obras associadas
-- - cadastrado_por_fiscal_id: Um Fiscal pode cadastrar N Obras
-- - fiscal_responsavel_id: Um Fiscal pode fiscalizar N Obras
-- ============================================================================
CREATE TABLE IF NOT EXISTS obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REGULAR' CHECK (status IN ('REGULAR', 'EM_ANDAMENTO', 'PENDENTE_AJUSTE', 'CONCLUIDO')),
    tipo VARCHAR(100) DEFAULT 'Reforma e Modernização de Agência',
    
    -- [1:N] Uma empreiteira pode ter N obras
    empreiteira_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- [1:N] Um fiscal pode cadastrar N obras
    cadastrado_por_fiscal_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- [1:N] Um fiscal pode fiscalizar N obras
    fiscal_responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE obras IS 'Catálogo de agências bancárias e canteiros sob fiscalização do BB';
COMMENT ON COLUMN obras.empreiteira_id IS 'FK para o usuário da Empreiteira encarregada (Uma empreiteira possui N obras)';
COMMENT ON COLUMN obras.cadastrado_por_fiscal_id IS 'FK para o Fiscal do BB que cadastrou a unidade (Um fiscal cadastra N obras)';
COMMENT ON COLUMN obras.fiscal_responsavel_id IS 'FK para o Fiscal/Engenheiro do BB designado para auditoria (Um fiscal fiscaliza N obras)';

-- ============================================================================
-- 2.1 TABELAS ASSOCIATIVAS N:N (Múltipla Atribuição e Consórcios)
-- ============================================================================
-- Permite que uma empreiteira participe de N obras e uma obra receba N empreiteiras parceiras
CREATE TABLE IF NOT EXISTS obras_empreiteiras (
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    empreiteira_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data_vinculo TIMESTAMPTZ NOT NULL DEFAULT now(),
    ativo BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (obra_id, empreiteira_id)
);

COMMENT ON TABLE obras_empreiteiras IS 'Associação N:N entre Obras e Empreiteiras contratadas';

-- Permite que um fiscal atue em N obras e uma obra possua comissão de fiscalização com N fiscais
CREATE TABLE IF NOT EXISTS obras_fiscais (
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    fiscal_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    papel VARCHAR(50) NOT NULL DEFAULT 'titular' CHECK (papel IN ('titular', 'suplente', 'cadastrador', 'auditor')),
    data_designacao TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (obra_id, fiscal_id)
);

COMMENT ON TABLE obras_fiscais IS 'Associação N:N entre Obras e Fiscais de Engenharia BB';

-- ============================================================================
-- 3. TABELA: relatorios (Vistorias In-Loco Imutáveis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    codigo_unico VARCHAR(32) UNIQUE,
    hash_integridade VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE')),
    justificativa TEXT,
    arquivo_pdf_url TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    precisao_gps NUMERIC(6, 2),
    validacao_manual BOOLEAN NOT NULL DEFAULT false,
    motivo_validacao_manual TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finalizado_em TIMESTAMPTZ,
    julgado_em TIMESTAMPTZ,
    julgado_por_fiscal_id UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE relatorios IS 'Laudos de vistoria in-loco com hash SHA-256 e código único de 16 caracteres';

-- ============================================================================
-- 4. TABELA: fotos (Evidências Fotográficas Multimodais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES relatorios(id) ON DELETE CASCADE,
    caminho_arquivo TEXT NOT NULL,
    hash_integridade VARCHAR(64) NOT NULL,
    tipo_local VARCHAR(100),
    avaliacao_gemini VARCHAR(50) DEFAULT 'PENDENTE' CHECK (avaliacao_gemini IN ('APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL', 'PENDENTE')),
    confianca NUMERIC(5, 4),
    motivo TEXT,
    modelo_ia VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    tempo_resposta_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE fotos IS 'Evidências fotográficas capturadas exclusivamente por câmera ao vivo com validação IA';

-- ============================================================================
-- 5. TABELA: respostas (Checklist Dinâmico de Engenharia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES relatorios(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'texto',
    sugestao_ia TEXT,
    editado_pelo_usuario BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE respostas IS 'Respostas do checklist normativo com sugestões assistidas por IA';

-- ============================================================================
-- ÍNDICES DE PERFORMANCE (Conforme Postgres Best Practices)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_obras_empreiteira_id ON obras(empreiteira_id);
CREATE INDEX IF NOT EXISTS idx_obras_cadastrado_por ON obras(cadastrado_por_fiscal_id);
CREATE INDEX IF NOT EXISTS idx_obras_fiscal_responsavel ON obras(fiscal_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);

CREATE INDEX IF NOT EXISTS idx_obras_empreiteiras_obra ON obras_empreiteiras(obra_id);
CREATE INDEX IF NOT EXISTS idx_obras_empreiteiras_emp ON obras_empreiteiras(empreiteira_id);

CREATE INDEX IF NOT EXISTS idx_obras_fiscais_obra ON obras_fiscais(obra_id);
CREATE INDEX IF NOT EXISTS idx_obras_fiscais_fisc ON obras_fiscais(fiscal_id);

CREATE INDEX IF NOT EXISTS idx_relatorios_obra_id ON relatorios(obra_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_usuario_id ON relatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_codigo_unico ON relatorios(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_relatorios_status ON relatorios(status);

CREATE INDEX IF NOT EXISTS idx_fotos_relatorio_id ON fotos(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_respostas_relatorio_id ON respostas(relatorio_id);

-- ============================================================================
-- TRIGGERS DE ATUALIZAÇÃO TEMPORAL AUTOMÁTICA
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_usuarios ON usuarios;
CREATE TRIGGER set_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_obras ON obras;
CREATE TRIGGER set_timestamp_obras
BEFORE UPDATE ON obras
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - GOVERNANÇA E CONTROLE DE ACESSO
-- ============================================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas ENABLE ROW LEVEL SECURITY;

-- Regra RLS: Obras
-- 1. Fiscais podem visualizar todas as obras, cadastrar novas obras e atualizar status.
-- 2. Empreiteiras podem visualizar apenas as obras atribuídas a elas.
-- 3. Empreiteiras NÃO PODEM inserir obras (bloqueio rigoroso de cadastro).
CREATE POLICY "Fiscais BB possuem acesso total a obras"
ON obras
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
      AND usuarios.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
      AND usuarios.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

CREATE POLICY "Empreiteiras visualizam suas N obras vinculadas"
ON obras
FOR SELECT
TO authenticated
USING (
  empreiteira_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM obras_empreiteiras
    WHERE obras_empreiteiras.obra_id = obras.id
      AND obras_empreiteiras.empreiteira_id = auth.uid()
      AND obras_empreiteiras.ativo = true
  )
);
