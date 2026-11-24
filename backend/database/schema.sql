-- ============================================================================
-- BBVision - Esquema Oficial do Banco de Dados (PostgreSQL / Supabase)
-- Sistema Inteligente de Fiscalização e Monitoramento Remoto de Obras
-- ============================================================================
--
-- REGRAS FUNDAMENTAIS DE NEGÓCIO E CARDINALIDADE:
-- 1. Uma EMPREITEIRA pode ter N OBRAS (1 Empreiteira -> N Obras).
-- 2. Um FISCAL pode fiscalizar N OBRAS (1 Fiscal -> N Obras fiscalizadas).
-- 3. Um FISCAL pode cadastrar N OBRAS (1 Fiscal -> N Obras cadastradas).
-- 4. A EMPREITEIRA NÃO cadastra obras (apenas executa e vistoria obras atribuídas).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABELA: usuarios
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('empreiteira', 'fiscal', 'engenheiro', 'admin')),
    empresa VARCHAR(255) DEFAULT '',
    registro_profissional VARCHAR(100) DEFAULT '',
    telefone VARCHAR(50) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.usuarios IS 'Usuários cadastrados no BBVision (Empreiteiras e Fiscais de Obra)';

-- ============================================================================
-- 2. TABELA: obras
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'REGULAR' CHECK (status IN ('REGULAR', 'EM_ANDAMENTO', 'PENDENTE_AJUSTE', 'CONCLUIDO')),
    tipo VARCHAR(120) NOT NULL DEFAULT 'Reforma e Modernização de Agência',
    checklist_perguntas JSONB,
    empreiteira_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    cadastrado_por_fiscal_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    fiscal_responsavel_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.obras IS 'Obras e unidades cadastradas para fiscalização remota';

-- ============================================================================
-- 2.1 TABELAS ASSOCIATIVAS N:N (Consórcios e Comissões de Fiscalização)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.obras_empreiteiras (
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    empreiteira_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data_vinculo TIMESTAMPTZ NOT NULL DEFAULT now(),
    ativo BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (obra_id, empreiteira_id)
);

CREATE TABLE IF NOT EXISTS public.obras_fiscais (
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
    fiscal_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    papel VARCHAR(50) NOT NULL DEFAULT 'titular' CHECK (papel IN ('titular', 'suplente', 'cadastrador', 'auditor')),
    data_designacao TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (obra_id, fiscal_id)
);

-- ============================================================================
-- 3. TABELA: relatorios (Vistorias In-Loco Imutáveis)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    codigo_unico VARCHAR(32) UNIQUE,
    hash_integridade VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE')),
    tipo_local VARCHAR(120),
    localizacao_texto TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    precisao_gps NUMERIC(8, 2),
    assinatura_base64 TEXT,
    validacao_manual BOOLEAN NOT NULL DEFAULT false,
    motivo_validacao_manual TEXT,
    justificativa_fiscal TEXT,
    arquivo_pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    finalizado_em TIMESTAMPTZ,
    julgado_em TIMESTAMPTZ,
    julgado_por_fiscal_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.relatorios IS 'Laudos de vistoria in-loco com código único de 16 caracteres hex e hash SHA-256';

-- ============================================================================
-- 4. TABELA: fotos (Evidências Fotográficas Multimodais)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
    caminho_arquivo TEXT NOT NULL,
    hash_integridade VARCHAR(64) NOT NULL,
    tipo_local VARCHAR(120),
    avaliacao_gemini VARCHAR(50) NOT NULL DEFAULT 'PENDENTE' CHECK (avaliacao_gemini IN ('APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL', 'PENDENTE')),
    confianca NUMERIC(5, 4),
    motivo TEXT,
    modelo_ia VARCHAR(100),
    tempo_resposta_ms INTEGER,
    data_captura TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.fotos IS 'Evidências fotográficas capturadas exclusivamente por câmera ao vivo com validação IA';

-- ============================================================================
-- 5. TABELA: respostas (Checklist Dinâmico de Engenharia)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    valor TEXT NOT NULL,
    justificativa TEXT,
    tipo VARCHAR(50) NOT NULL DEFAULT 'texto',
    sugestao_ia TEXT,
    editado_pelo_usuario BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.respostas IS 'Respostas do checklist normativo com justificativas e sugestões assistidas por IA';

-- ============================================================================
-- 6. TABELA: configuracoes_sistema (Template de Checklist Oficial)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.configuracoes_sistema (
    chave VARCHAR(100) PRIMARY KEY,
    valor JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.configuracoes_sistema IS 'Configurações persistentes da plataforma (ex.: checklist_template)';

-- ============================================================================
-- ÍNDICES DE PERFORMANCE (Postgres Best Practices)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_cargo ON public.usuarios(cargo);

CREATE INDEX IF NOT EXISTS idx_obras_empreiteira_id ON public.obras(empreiteira_id);
CREATE INDEX IF NOT EXISTS idx_obras_cadastrado_por ON public.obras(cadastrado_por_fiscal_id);
CREATE INDEX IF NOT EXISTS idx_obras_fiscal_responsavel ON public.obras(fiscal_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_obras_status ON public.obras(status);

CREATE INDEX IF NOT EXISTS idx_obras_empreiteiras_emp ON public.obras_empreiteiras(empreiteira_id);
CREATE INDEX IF NOT EXISTS idx_obras_fiscais_fisc ON public.obras_fiscais(fiscal_id);

CREATE INDEX IF NOT EXISTS idx_relatorios_obra_id ON public.relatorios(obra_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_usuario_id ON public.relatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_hash_integridade ON public.relatorios(hash_integridade);
CREATE INDEX IF NOT EXISTS idx_relatorios_status_created ON public.relatorios(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fotos_relatorio_id ON public.fotos(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_respostas_relatorio_id ON public.respostas(relatorio_id);

-- ============================================================================
-- TRIGGER DE ATUALIZAÇÃO TEMPORAL AUTOMÁTICA (search_path protegido)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_timestamp_usuarios ON public.usuarios;
CREATE TRIGGER set_timestamp_usuarios
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_obras ON public.obras;
CREATE TRIGGER set_timestamp_obras
BEFORE UPDATE ON public.obras
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_configuracoes ON public.configuracoes_sistema;
CREATE TRIGGER set_timestamp_configuracoes
BEFORE UPDATE ON public.configuracoes_sistema
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - HABILITADO EM TODAS AS TABELAS EXPOSTAS
-- ============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras_empreiteiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Policies: usuarios
DROP POLICY IF EXISTS "Usuarios consultam proprio perfil" ON public.usuarios;
CREATE POLICY "Usuarios consultam proprio perfil"
ON public.usuarios FOR SELECT
TO authenticated
USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Usuarios atualizam proprio perfil" ON public.usuarios;
CREATE POLICY "Usuarios atualizam proprio perfil"
ON public.usuarios FOR UPDATE
TO authenticated
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

-- Policies: obras
DROP POLICY IF EXISTS "Fiscais BB possuem acesso total a obras" ON public.obras;
CREATE POLICY "Fiscais BB possuem acesso total a obras"
ON public.obras FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid())
      AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid())
      AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

DROP POLICY IF EXISTS "Empreiteiras visualizam suas N obras vinculadas" ON public.obras;
CREATE POLICY "Empreiteiras visualizam suas N obras vinculadas"
ON public.obras FOR SELECT
TO authenticated
USING (
  empreiteira_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.obras_empreiteiras oe
    WHERE oe.obra_id = public.obras.id
      AND oe.empreiteira_id = (select auth.uid())
      AND oe.ativo = true
  )
);

-- Policies: associativas
DROP POLICY IF EXISTS "Fiscais gerenciam obras_empreiteiras" ON public.obras_empreiteiras;
CREATE POLICY "Fiscais gerenciam obras_empreiteiras"
ON public.obras_empreiteiras FOR ALL
TO authenticated
USING (
  empreiteira_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

DROP POLICY IF EXISTS "Fiscais gerenciam obras_fiscais" ON public.obras_fiscais;
CREATE POLICY "Fiscais gerenciam obras_fiscais"
ON public.obras_fiscais FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

-- Policies: relatorios
DROP POLICY IF EXISTS "Acesso a relatorios por titular ou fiscal" ON public.relatorios;
CREATE POLICY "Acesso a relatorios por titular ou fiscal"
ON public.relatorios FOR SELECT
TO authenticated
USING (
  usuario_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

DROP POLICY IF EXISTS "Empreiteira cria proprio relatorio" ON public.relatorios;
CREATE POLICY "Empreiteira cria proprio relatorio"
ON public.relatorios FOR INSERT
TO authenticated
WITH CHECK (usuario_id = (select auth.uid()));

DROP POLICY IF EXISTS "Atualizacao de relatorio respeitando imutabilidade" ON public.relatorios;
CREATE POLICY "Atualizacao de relatorio respeitando imutabilidade"
ON public.relatorios FOR UPDATE
TO authenticated
USING (
  (usuario_id = (select auth.uid()) AND status = 'EM_ANDAMENTO')
  OR EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
)
WITH CHECK (
  usuario_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

-- Policies: fotos e respostas
DROP POLICY IF EXISTS "Acesso a fotos via relatorio autorizado" ON public.fotos;
CREATE POLICY "Acesso a fotos via relatorio autorizado"
ON public.fotos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.relatorios r
    WHERE r.id = public.fotos.relatorio_id
      AND (
        r.usuario_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.usuarios u
          WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.relatorios r
    WHERE r.id = public.fotos.relatorio_id
      AND r.status = 'EM_ANDAMENTO'
      AND r.usuario_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS "Acesso a respostas via relatorio autorizado" ON public.respostas;
CREATE POLICY "Acesso a respostas via relatorio autorizado"
ON public.respostas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.relatorios r
    WHERE r.id = public.respostas.relatorio_id
      AND (
        r.usuario_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.usuarios u
          WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.relatorios r
    WHERE r.id = public.respostas.relatorio_id
      AND r.status = 'EM_ANDAMENTO'
      AND r.usuario_id = (select auth.uid())
  )
);

-- Policies: configuracoes_sistema
DROP POLICY IF EXISTS "Usuarios autenticados leem configuracoes" ON public.configuracoes_sistema;
CREATE POLICY "Usuarios autenticados leem configuracoes"
ON public.configuracoes_sistema FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Fiscais alteram configuracoes" ON public.configuracoes_sistema;
CREATE POLICY "Fiscais alteram configuracoes"
ON public.configuracoes_sistema FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = (select auth.uid()) AND u.cargo IN ('fiscal', 'engenheiro', 'admin')
  )
);

-- ============================================================================
-- PERFIS INICIAIS SOLICITADOS (IDEMPOTENTE)
-- ============================================================================
INSERT INTO public.usuarios (id, nome, email, senha_hash, cargo, empresa, ativo)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Rodrigo', 'rodrigo@empreiteira.com', '$2b$10$DM91R8a0Oi5lTsKZE1KMgu6MKacGFbBZXxcTaeERg9zx8zsAgYUpu', 'empreiteira', 'Empreiteira Credenciada', true),
  ('22222222-2222-4222-8222-222222222222', 'Mariana', 'mariana@bb.com.br', '$2b$10$DM91R8a0Oi5lTsKZE1KMgu6MKacGFbBZXxcTaeERg9zx8zsAgYUpu', 'fiscal', 'Banco do Brasil', true)
ON CONFLICT (email) DO NOTHING;
