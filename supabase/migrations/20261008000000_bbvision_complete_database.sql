-- ==============================================================================
-- BBVision - Banco do Brasil | Residência em Software & IA (TakeOff / Porto Digital)
-- Migração Definitiva de Banco de Dados PostgreSQL (Supabase)
-- Arquitetura Oficial: Seção 7 do Documento de Entrega TakeOff
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSÕES DO POSTGRESQL
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABELA DE USUÁRIOS (Seção 7.1)
-- Representa os atores do sistema: Rodrigo (Empreiteira) e Mariana (Fiscal BB)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL CHECK (cargo IN ('empreiteira', 'fiscal', 'engenheiro', 'administrador')),
    telefone VARCHAR(30),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE OBRAS (Seção 7.1)
-- Obras monitoradas com suporte a Geofencing (raio GPS in-loco)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    cidade VARCHAR(100),
    uf VARCHAR(2),
    responsavel VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REGULAR' CHECK (status IN ('REGULAR', 'PENDENTE_AJUSTE')),
    latitude DOUBLE PRECISION,                -- Coordenada de referência da unidade BB
    longitude DOUBLE PRECISION,               -- Coordenada de referência da unidade BB
    raio_tolerancia_metros INTEGER NOT NULL DEFAULT 100, -- Raio para validação de presença física
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. MODELO DE CHECKLIST DINÂMICO NORMATIVO (HU04)
-- Itens normativos padronizados de verificação para fiscalização de obras
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checklists_modelo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL CHECK (categoria IN ('Segurança', 'Elétrica', 'Alvenaria', 'Acessibilidade', 'Acabamento', 'Hidráulica', 'Estrutura', 'Geral')),
    descricao TEXT,
    tipo_campo VARCHAR(50) NOT NULL DEFAULT 'multipla_escolha' CHECK (tipo_campo IN ('texto', 'multipla_escolha', 'booleano', 'numero')),
    opcoes_resposta JSONB DEFAULT '["Conforme", "Não Conforme", "Não se aplica"]'::jsonb,
    obrigatorio BOOLEAN NOT NULL DEFAULT true,
    exige_foto BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE RELATÓRIOS (Seção 7.1)
-- Registro central de cada vistoria in-loco com carimbo criptográfico
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    codigo_unico VARCHAR(50) UNIQUE,          -- 16 caracteres hexadecimais uppercase invioláveis
    data TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('EM_ANDAMENTO', 'FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE')),
    justificativa TEXT,                       -- Parecer técnico conclusivo do fiscal Mariana
    hash_integridade VARCHAR(64),             -- SHA-256 criptográfico gerado no momento do encerramento
    arquivo_pdf_url TEXT,                     -- Caminho/URL do relatório imutável compilado via PDFKit
    validacao_manual BOOLEAN NOT NULL DEFAULT false, -- Sinalizador de SLA excedido ou modo offline
    fiscal_auditor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    finalizado_em TIMESTAMP WITH TIME ZONE,   -- Carimbo temporal exato de bloqueio de edição
    auditado_em TIMESTAMP WITH TIME ZONE,     -- Carimbo temporal do parecer de auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE FOTOS / EVIDÊNCIAS (Seção 7.1)
-- Registra as capturas ao vivo in-app com seus hashes SHA-256 e análise Gemini
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
    caminho_arquivo TEXT NOT NULL,
    hash_integridade VARCHAR(64) NOT NULL,    -- SHA-256 inviolável gerado a partir do buffer
    avaliacao_gemini VARCHAR(50) CHECK (avaliacao_gemini IN ('APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL')),
    confianca NUMERIC(5, 4) CHECK (confianca >= 0 AND confianca <= 1), -- Limiar padrão: >= 0.75
    motivo TEXT,                              -- Motivo conciso retornado pelo Gemini (Prompt P1)
    latitude_captura DOUBLE PRECISION,
    longitude_captura DOUBLE PRECISION,
    origem_camera_ao_vivo BOOLEAN NOT NULL DEFAULT true, -- Prova de que galeria estava bloqueada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. TABELA DE RESPOSTAS DO CHECKLIST (Seção 7.1)
-- Respostas dos itens com suporte a sugestão IA e revisão humana (Human-in-the-loop)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID NOT NULL REFERENCES public.relatorios(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'texto' CHECK (tipo IN ('texto', 'multipla_escolha', 'booleano', 'numero')),
    sugestao_ia TEXT,                         -- Sugestão técnica originada pelo Prompt P3
    revisado_humano BOOLEAN NOT NULL DEFAULT true, -- Atendimento ao princípio "Revise antes de enviar"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. TABELA DE TRILHA DE AUDITORIA DE IA (Seção 4.1)
-- Requisito: "Toda chamada à IA deve ser registrada no banco com timestamp, modelo e resultado"
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auditoria_ia_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relatorio_id UUID REFERENCES public.relatorios(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    modelo VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash',
    prompt_tipo VARCHAR(50) NOT NULL CHECK (prompt_tipo IN ('P1_QUALIDADE', 'P2_REFERENCIA', 'P3_OBSERVACAO', 'OUTRO')),
    duracao_ms INTEGER NOT NULL,              -- Tempo de resposta do Gemini
    sla_cumprido BOOLEAN NOT NULL,            -- True se duracao_ms <= 15000 (SLA de 15s)
    resultado_status VARCHAR(50) NOT NULL CHECK (resultado_status IN ('APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL', 'SUCESSO', 'ERRO')),
    confianca NUMERIC(5, 4),
    motivo TEXT,
    hash_imagem VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. ÍNDICES DE PERFORMANCE E CONSULTA RÁPIDA
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cargo ON public.usuarios(cargo);

CREATE INDEX IF NOT EXISTS idx_obras_status ON public.obras(status);
CREATE INDEX IF NOT EXISTS idx_obras_nome ON public.obras(nome);

CREATE INDEX IF NOT EXISTS idx_relatorios_obra ON public.relatorios(obra_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_usuario ON public.relatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_codigo ON public.relatorios(codigo_unico);
CREATE INDEX IF NOT EXISTS idx_relatorios_status ON public.relatorios(status);
CREATE INDEX IF NOT EXISTS idx_relatorios_data ON public.relatorios(data DESC);

CREATE INDEX IF NOT EXISTS idx_fotos_relatorio ON public.fotos(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_fotos_hash ON public.fotos(hash_integridade);

CREATE INDEX IF NOT EXISTS idx_respostas_relatorio ON public.respostas(relatorio_id);

CREATE INDEX IF NOT EXISTS idx_auditoria_ia_relatorio ON public.auditoria_ia_logs(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_ia_created ON public.auditoria_ia_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 9. TRIGGERS PARA CONTROLE AUTOMÁTICO DE updated_at
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_updated_at();

DROP TRIGGER IF EXISTS trg_obras_updated_at ON public.obras;
CREATE TRIGGER trg_obras_updated_at
    BEFORE UPDATE ON public.obras
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_updated_at();

DROP TRIGGER IF EXISTS trg_relatorios_updated_at ON public.relatorios;
CREATE TRIGGER trg_relatorios_updated_at
    BEFORE UPDATE ON public.relatorios
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_updated_at();

DROP TRIGGER IF EXISTS trg_respostas_updated_at ON public.respostas;
CREATE TRIGGER trg_respostas_updated_at
    BEFORE UPDATE ON public.respostas
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_updated_at();

-- ------------------------------------------------------------------------------
-- 10. REGRAS DE INVIOLABILIDADE A NÍVEL DE BANCO DE DADOS (IMUTABILIDADE)
-- Garante que um relatório finalizado nunca sofra adulteração física ou lógica
-- ------------------------------------------------------------------------------

-- 10.1 Impede exclusão ou alteração indevida de dados estruturais de relatórios finalizados
CREATE OR REPLACE FUNCTION public.fn_impedir_adulteracao_relatorio()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o relatório já foi finalizado anteriormente
    IF OLD.status IN ('FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE') THEN
        -- Não permite alterar o código único, o hash, a obra ou o autor
        IF NEW.codigo_unico <> OLD.codigo_unico THEN
            RAISE EXCEPTION 'Inviolabilidade violada: Não é permitido alterar o código único de um relatório finalizado.';
        END IF;

        IF NEW.hash_integridade <> OLD.hash_integridade THEN
            RAISE EXCEPTION 'Inviolabilidade violada: O hash SHA-256 de integridade é imutável.';
        END IF;

        IF NEW.obra_id <> OLD.obra_id OR NEW.usuario_id <> OLD.usuario_id THEN
            RAISE EXCEPTION 'Inviolabilidade violada: Obra e Autor não podem ser reatribuídos após finalização.';
        END IF;

        -- Não permite retornar status para EM_ANDAMENTO
        IF NEW.status = 'EM_ANDAMENTO' THEN
            RAISE EXCEPTION 'Inviolabilidade violada: Um relatório finalizado não pode retornar para EM_ANDAMENTO.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bloqueio_relatorio_finalizado ON public.relatorios;
CREATE TRIGGER trg_bloqueio_relatorio_finalizado
    BEFORE UPDATE ON public.relatorios
    FOR EACH ROW EXECUTE FUNCTION public.fn_impedir_adulteracao_relatorio();

-- 10.2 Impede adição, edição ou remoção de fotos em relatório finalizado
CREATE OR REPLACE FUNCTION public.fn_impedir_modificacao_fotos_finalizadas()
RETURNS TRIGGER AS $$
DECLARE
    v_status VARCHAR(50);
    v_rel_id UUID;
BEGIN
    v_rel_id := COALESCE(NEW.relatorio_id, OLD.relatorio_id);
    SELECT status INTO v_status FROM public.relatorios WHERE id = v_rel_id;

    IF v_status IN ('FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE') THEN
        RAISE EXCEPTION 'Inviolabilidade violada: O relatório % já foi finalizado. Inclusão, edição ou exclusão de fotos é estritamente proibida.', v_rel_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bloqueio_fotos_relatorio_finalizado ON public.fotos;
CREATE TRIGGER trg_bloqueio_fotos_relatorio_finalizado
    BEFORE INSERT OR UPDATE OR DELETE ON public.fotos
    FOR EACH ROW EXECUTE FUNCTION public.fn_impedir_modificacao_fotos_finalizadas();

-- 10.3 Impede alteração de respostas de checklist em relatório finalizado
CREATE OR REPLACE FUNCTION public.fn_impedir_modificacao_respostas_finalizadas()
RETURNS TRIGGER AS $$
DECLARE
    v_status VARCHAR(50);
    v_rel_id UUID;
BEGIN
    v_rel_id := COALESCE(NEW.relatorio_id, OLD.relatorio_id);
    SELECT status INTO v_status FROM public.relatorios WHERE id = v_rel_id;

    IF v_status IN ('FINALIZADO', 'APROVADO', 'PENDENTE_AJUSTE') THEN
        RAISE EXCEPTION 'Inviolabilidade violada: O relatório % já foi finalizado. Alterações no checklist estão bloqueadas.', v_rel_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bloqueio_respostas_relatorio_finalizado ON public.respostas;
CREATE TRIGGER trg_bloqueio_respostas_relatorio_finalizado
    BEFORE INSERT OR UPDATE OR DELETE ON public.respostas
    FOR EACH ROW EXECUTE FUNCTION public.fn_impedir_modificacao_respostas_finalizadas();

-- ------------------------------------------------------------------------------
-- 11. FUNÇÕES ARMAZENADAS (STORED PROCEDURES / BUSINESS LOGIC)
-- ------------------------------------------------------------------------------

-- 11.1 Finalização atômica de relatório
CREATE OR REPLACE FUNCTION public.fn_finalizar_relatorio(
    p_relatorio_id UUID,
    p_codigo_unico VARCHAR(50),
    p_hash_integridade VARCHAR(64),
    p_arquivo_pdf_url TEXT,
    p_validacao_manual BOOLEAN DEFAULT false
)
RETURNS public.relatorios AS $$
DECLARE
    v_relatorio public.relatorios;
BEGIN
    SELECT * INTO v_relatorio FROM public.relatorios WHERE id = p_relatorio_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Relatório % não encontrado.', p_relatorio_id;
    END IF;

    IF v_relatorio.status <> 'EM_ANDAMENTO' THEN
        RAISE EXCEPTION 'Relatório % já foi finalizado anteriormente (Status: %).', p_relatorio_id, v_relatorio.status;
    END IF;

    UPDATE public.relatorios
    SET
        codigo_unico = p_codigo_unico,
        hash_integridade = p_hash_integridade,
        arquivo_pdf_url = p_arquivo_pdf_url,
        validacao_manual = p_validacao_manual,
        status = 'FINALIZADO',
        finalizado_em = timezone('utc'::text, now()),
        data = timezone('utc'::text, now())
    WHERE id = p_relatorio_id
    RETURNING * INTO v_relatorio;

    RETURN v_relatorio;
END;
$$ LANGUAGE plpgsql;

-- 11.2 Parecer do fiscal (Mariana) com atualização reflexa do status da obra
CREATE OR REPLACE FUNCTION public.fn_auditar_vistoria(
    p_relatorio_id UUID,
    p_fiscal_id UUID,
    p_status VARCHAR(50),      -- 'APROVADO' ou 'PENDENTE_AJUSTE'
    p_justificativa TEXT
)
RETURNS public.relatorios AS $$
DECLARE
    v_relatorio public.relatorios;
    v_obra_status VARCHAR(50);
BEGIN
    IF p_status NOT IN ('APROVADO', 'PENDENTE_AJUSTE') THEN
        RAISE EXCEPTION 'Status de auditoria inválido: %. Permitidos: APROVADO, PENDENTE_AJUSTE', p_status;
    END IF;

    SELECT * INTO v_relatorio FROM public.relatorios WHERE id = p_relatorio_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Relatório % não encontrado.', p_relatorio_id;
    END IF;

    -- Atualiza relatório
    UPDATE public.relatorios
    SET
        status = p_status,
        justificativa = p_justificativa,
        fiscal_auditor_id = p_fiscal_id,
        auditado_em = timezone('utc'::text, now())
    WHERE id = p_relatorio_id
    RETURNING * INTO v_relatorio;

    -- Atualiza obra vinculada
    v_obra_status := CASE WHEN p_status = 'APROVADO' THEN 'REGULAR' ELSE 'PENDENTE_AJUSTE' END;

    UPDATE public.obras
    SET status = v_obra_status
    WHERE id = v_relatorio.obra_id;

    RETURN v_relatorio;
END;
$$ LANGUAGE plpgsql;

-- 11.3 Cálculo de Geofencing (Haversine) em SQL
CREATE OR REPLACE FUNCTION public.fn_calcular_distancia_metros(
    p_lat1 DOUBLE PRECISION,
    p_lon1 DOUBLE PRECISION,
    p_lat2 DOUBLE PRECISION,
    p_lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    v_r DOUBLE PRECISION := 6371000; -- Raio da Terra em metros
    v_dlat DOUBLE PRECISION;
    v_dlon DOUBLE PRECISION;
    v_a DOUBLE PRECISION;
    v_c DOUBLE PRECISION;
BEGIN
    v_dlat := radians(p_lat2 - p_lat1);
    v_dlon := radians(p_lon2 - p_lon1);
    v_a := sin(v_dlat / 2)^2 + cos(radians(p_lat1)) * cos(radians(p_lat2)) * sin(v_dlon / 2)^2;
    v_c := 2 * atan2(sqrt(v_a), sqrt(1 - v_a));
    RETURN v_r * v_c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ------------------------------------------------------------------------------
-- 12. VIEWS ANALÍTICAS E PAINÉIS DE GESTÃO
-- ------------------------------------------------------------------------------

-- 12.1 Visão Consolidada para Auditoria do Fiscal (Mariana)
CREATE OR REPLACE VIEW public.vw_painel_auditoria AS
SELECT
    r.id AS relatorio_id,
    r.codigo_unico,
    r.data AS data_vistoria,
    r.status AS relatorio_status,
    r.hash_integridade,
    r.arquivo_pdf_url,
    r.validacao_manual,
    r.justificativa,
    o.id AS obra_id,
    o.nome AS obra_nome,
    o.endereco AS obra_endereco,
    o.status AS obra_status,
    u.id AS empreiteira_id,
    u.nome AS empreiteira_nome,
    u.email AS empreiteira_email,
    COUNT(DISTINCT f.id) AS total_fotos,
    COUNT(DISTINCT CASE WHEN f.avaliacao_gemini = 'APROVADO' THEN f.id END) AS fotos_aprovadas_ia,
    ROUND(AVG(f.confianca) * 100, 1) AS media_confianca_ia,
    COUNT(DISTINCT resp.id) AS total_itens_checklist
FROM public.relatorios r
INNER JOIN public.obras o ON o.id = r.obra_id
INNER JOIN public.usuarios u ON u.id = r.usuario_id
LEFT JOIN public.fotos f ON f.relatorio_id = r.id
LEFT JOIN public.respostas resp ON resp.relatorio_id = r.id
GROUP BY r.id, o.id, u.id;

-- 12.2 Métrica de Governança de IA (Banco do Brasil SLA Compliance)
CREATE OR REPLACE VIEW public.vw_governanca_ia AS
SELECT
    modelo,
    prompt_tipo,
    COUNT(*) AS total_chamadas,
    COUNT(CASE WHEN sla_cumprido THEN 1 END) AS total_dentro_sla_15s,
    ROUND((COUNT(CASE WHEN sla_cumprido THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 2) AS percentual_sla_15s,
    ROUND(AVG(duracao_ms), 0) AS latencia_media_ms,
    ROUND(AVG(confianca) * 100, 1) AS media_confianca,
    COUNT(CASE WHEN resultado_status = 'APROVADO' THEN 1 END) AS total_aprovados,
    COUNT(CASE WHEN resultado_status = 'REJEITADO' THEN 1 END) AS total_rejeitados,
    COUNT(CASE WHEN resultado_status = 'VALIDACAO_MANUAL' THEN 1 END) AS total_fallbacks_manual
FROM public.auditoria_ia_logs
GROUP BY modelo, prompt_tipo;

-- ------------------------------------------------------------------------------
-- 13. POLÍTICAS DE ROW LEVEL SECURITY (RLS) - SUPABASE
-- ------------------------------------------------------------------------------
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_ia_logs ENABLE ROW LEVEL SECURITY;

-- 13.1 Acesso de leitura público/autenticado
CREATE POLICY "Permitir leitura de usuários ativos"
    ON public.usuarios FOR SELECT USING (ativo = true);

CREATE POLICY "Permitir leitura de obras"
    ON public.obras FOR SELECT USING (true);

CREATE POLICY "Permitir leitura de modelos de checklist ativos"
    ON public.checklists_modelo FOR SELECT USING (ativo = true);

CREATE POLICY "Permitir leitura de relatórios"
    ON public.relatorios FOR SELECT USING (true);

CREATE POLICY "Permitir leitura de fotos"
    ON public.fotos FOR SELECT USING (true);

CREATE POLICY "Permitir leitura de respostas"
    ON public.respostas FOR SELECT USING (true);

CREATE POLICY "Permitir leitura de logs de auditoria para fiscais"
    ON public.auditoria_ia_logs FOR SELECT USING (true);

-- 13.2 Acesso total para service_role (Backend Node.js)
CREATE POLICY "Service Role acesso total usuarios"
    ON public.usuarios FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role acesso total obras"
    ON public.obras FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role acesso total checklists_modelo"
    ON public.checklists_modelo FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role acesso total relatorios"
    ON public.relatorios FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role acesso total fotos"
    ON public.fotos FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role acesso total respostas"
    ON public.respostas FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service Role acesso total auditoria_ia_logs"
    ON public.auditoria_ia_logs FOR ALL USING (auth.role() = 'service_role');
