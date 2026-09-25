-- ==============================================================================
-- BVision - Banco do Brasil | Solução de Engenharia para Fiscalização de Obras
-- Migração Inicial de Banco de Dados PostgreSQL (Supabase)
-- ==============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE AGÊNCIAS DO BANCO DO BRASIL
-- Armazena os dados das agências/prédios e coordenadas para Geofencing (raio GPS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_agencia VARCHAR(20) NOT NULL UNIQUE,       -- Ex: "1234-5" ou prefixo BB
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,               -- Coordenada de referência
    longitude DOUBLE PRECISION NOT NULL,              -- Coordenada de referência
    raio_tolerancia_metros INTEGER NOT NULL DEFAULT 100, -- Raio para validação de presença in-loco
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE VISTORIAS
-- Representa a ordem ou sessão de fiscalização técnica da obra
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vistorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agencia_id UUID NOT NULL REFERENCES public.agencias(id) ON DELETE RESTRICT,
    engenheiro_responsavel_id UUID,                   -- ID do usuário no Supabase Auth
    fiscal_nome VARCHAR(255),                         -- Nome do fiscal em campo (terceiro/empreiteira)
    fiscal_cpf VARCHAR(14),
    token_acesso UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE, -- Link único inviolável
    token_utilizado BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    data_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
    inicio_vistoria TIMESTAMP WITH TIME ZONE,
    fim_vistoria TIMESTAMP WITH TIME ZONE,
    duracao_minutos INTEGER,
    observacoes_gerais TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. MODELO / ITENS DO CHECKLIST DINÂMICO
-- Questões normativas que devem ser checadas durante a vistoria
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,                  -- Ex: 'Segurança', 'Elétrica', 'Alvenaria', 'Acessibilidade'
    descricao TEXT,
    obrigatorio BOOLEAN NOT NULL DEFAULT true,
    exige_foto BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. RESPOSTAS DO CHECKLIST DA VISTORIA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vistoria_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vistoria_id UUID NOT NULL REFERENCES public.vistorias(id) ON DELETE CASCADE,
    checklist_id UUID NOT NULL REFERENCES public.checklists(id) ON DELETE RESTRICT,
    status_conformidade VARCHAR(30) NOT NULL CHECK (status_conformidade IN ('conforme', 'nao_conforme', 'nao_se_aplica')),
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_vistoria_item UNIQUE(vistoria_id, checklist_id)
);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE EVIDÊNCIAS (FOTOS / VÍDEOS COM METADADOS INVIOLÁVEIS)
-- Registra metadados e hashes anti-adulteração de capturas in-loco
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vistoria_id UUID NOT NULL REFERENCES public.vistorias(id) ON DELETE CASCADE,
    vistoria_item_id UUID REFERENCES public.vistoria_itens(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'foto' CHECK (tipo IN ('foto', 'video')),
    arquivo_url TEXT NOT NULL,                        -- Caminho no Supabase Storage ou servidor
    hash_sha256 VARCHAR(64) NOT NULL,                 -- Hash criptográfico de inviolabilidade
    latitude_captura DOUBLE PRECISION NOT NULL,
    longitude_captura DOUBLE PRECISION NOT NULL,
    acuracia_gps_metros NUMERIC(8, 2),
    distancia_agencia_metros NUMERIC(10, 2),          -- Distância calculada em relação à agência
    gps_valido BOOLEAN NOT NULL DEFAULT true,         -- Flag de validação do raio de tolerância
    timestamp_captura TIMESTAMP WITH TIME ZONE NOT NULL,
    metadados_exif JSONB DEFAULT '{}'::jsonb,         -- Dispositivo, modelo, orientação, resolução
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. TABELA DE RELATÓRIOS E AUDITORIA
-- Relatórios consolidados, assinaturas e rastreabilidade
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vistoria_id UUID NOT NULL REFERENCES public.vistorias(id) ON DELETE CASCADE UNIQUE,
    arquivo_pdf_url TEXT NOT NULL,
    hash_pdf_sha256 VARCHAR(64) NOT NULL,
    assinatura_digital_url TEXT,                      -- Imagem/Canvas da assinatura
    assinado_por VARCHAR(255),
    assinado_em TIMESTAMP WITH TIME ZONE,
    enviado_email BOOLEAN NOT NULL DEFAULT false,
    enviado_em TIMESTAMP WITH TIME ZONE,
    destinatarios_email TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- ÍNDICES PARA ALTA PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agencias_codigo ON public.agencias(codigo_agencia);
CREATE INDEX IF NOT EXISTS idx_vistorias_agencia_id ON public.vistorias(agencia_id);
CREATE INDEX IF NOT EXISTS idx_vistorias_token ON public.vistorias(token_acesso);
CREATE INDEX IF NOT EXISTS idx_vistorias_status ON public.vistorias(status);
CREATE INDEX IF NOT EXISTS idx_vistoria_itens_vistoria ON public.vistoria_itens(vistoria_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_vistoria ON public.evidencias(vistoria_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_hash ON public.evidencias(hash_sha256);

-- ------------------------------------------------------------------------------
-- TRIGGER PARA ATUALIZAR AUTOMATICAMENTE updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agencias_updated_at
    BEFORE UPDATE ON public.agencias
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_vistorias_updated_at
    BEFORE UPDATE ON public.vistorias
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_vistoria_itens_updated_at
    BEFORE UPDATE ON public.vistoria_itens
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - SUPABASE
-- ------------------------------------------------------------------------------
ALTER TABLE public.agencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistoria_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura de checklist e acesso via token de vistoria
CREATE POLICY "Permitir leitura de checklists"
    ON public.checklists FOR SELECT
    USING (ativo = true);

CREATE POLICY "Permitir leitura de agências ativas"
    ON public.agencias FOR SELECT
    USING (ativo = true);

-- Políticas padrão para operações autenticadas (Engenheiros / Backend via Service Role)
CREATE POLICY "Acesso total para service_role"
    ON public.agencias FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total para vistorias via service_role"
    ON public.vistorias FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total para vistoria_itens via service_role"
    ON public.vistoria_itens FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total para evidencias via service_role"
    ON public.evidencias FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Acesso total para relatorios via service_role"
    ON public.relatorios FOR ALL
    USING (auth.role() = 'service_role');
