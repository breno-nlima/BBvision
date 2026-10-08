-- ==============================================================================
-- BBVision - Banco do Brasil | Documento de Entrega Oficial TakeOff
-- Migração PostgreSQL (Supabase) - Modelagem da Seção 7 do Documento de Entrega
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (Seção 7.1)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL CHECK (cargo IN ('empreiteira', 'fiscal', 'engenheiro', 'administrador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE OBRAS (Seção 7.1)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REGULAR' CHECK (status IN ('REGULAR', 'PENDENTE_AJUSTE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE RELATÓRIOS (Seção 7.1)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    codigo_unico VARCHAR(50) UNIQUE, -- 16 caracteres hex uppercase
    data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE')),
    justificativa TEXT,              -- Parecer técnico do fiscal na auditoria
    hash_integridade VARCHAR(64),    -- SHA-256 do relatório compilado
    arquivo_pdf_url TEXT,            -- Caminho / URL do PDF gerado inviolável
    validacao_manual BOOLEAN NOT NULL DEFAULT false, -- Sinalizador de fallback de IA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE FOTOS (Seção 7.1)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
    caminho_arquivo TEXT NOT NULL,
    hash_integridade VARCHAR(64) NOT NULL, -- SHA-256 inviolável da imagem
    avaliacao_gemini VARCHAR(50) CHECK (avaliacao_gemini IN ('APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL')),
    confianca NUMERIC(5, 4),               -- Confiança numérica entre 0.0000 e 1.0000
    motivo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE RESPOSTAS DO CHECKLIST (Seção 7.1)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'multipla_escolha', 'booleano')),
    sugestao_ia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- ÍNDICES PARA ALTA PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_relatorios_obra_id ON public.relatorios(obra_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_usuario_id ON public.relatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_codigo_unico ON public.relatorios(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_relatorios_status ON public.relatorios(status);
CREATE INDEX IF NOT EXISTS idx_fotos_relatorio_id ON public.fotos(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_fotos_hash ON public.fotos(hash_integridade);
CREATE INDEX IF NOT EXISTS idx_respostas_relatorio_id ON public.respostas(relatorio_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de obras para autenticados"
    ON public.obras FOR SELECT
    USING (true);

CREATE POLICY "Acesso total de backend via service_role"
    ON public.usuarios FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total de obras via service_role"
    ON public.obras FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total de relatorios via service_role"
    ON public.relatorios FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total de fotos via service_role"
    ON public.fotos FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total de respostas via service_role"
    ON public.respostas FOR ALL
    USING (auth.role() = 'service_role');
