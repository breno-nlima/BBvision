# 🗄️ Supabase & PostgreSQL - BVision

Esta pasta contém toda a estrutura do banco de dados relacional **PostgreSQL** hospedado/gerenciado via **Supabase** para a solução **BVision (Fiscalização de Obras - Banco do Brasil)**.

---

## 📁 Estrutura da Pasta

```text
supabase/
├── migrations/
│   └── 20260925000000_initial_schema.sql  # DDL das tabelas, índices, triggers e RLS
├── seed.sql                               # Carga de dados iniciais (Agências BB, Checklists)
├── config.toml                            # Configurações do Supabase CLI local
└── README.md                              # Documentação e instruções de configuração
```

---

## 🗂️ Modelo de Dados (Tabelas)

1. **`agencias`**: Cadastro de agências e prédios do Banco do Brasil com coordenadas geográficas (`latitude`, `longitude`) e raio de tolerância em metros para validação in-loco (Geofencing).
2. **`vistorias`**: Sessões e ordens de fiscalização de obras, vinculadas a um link único (`token_acesso`) inviolável.
3. **`checklists`**: Questões dinâmicas de conformidade técnica por categoria (Segurança, Elétrica, Acessibilidade, etc.).
4. **`vistoria_itens`**: Respostas dadas em campo para cada item do checklist durante uma vistoria.
5. **`evidencias`**: Registro de fotos e pequenos vídeos com hashes criptográficos anti-adulteração (`hash_sha256`), coordenadas do GPS na hora da captura e metadados EXIF.
6. **`relatorios`**: Relatório final consolidado em PDF, hash de integridade, assinatura digital e status de envio por e-mail.

---

## 🚀 Como Aplicar no Supabase

### Opção 1: Pelo Painel Web do Supabase (Cloud)

1. Acesse o seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor** no menu lateral esquerdo.
3. Abra e execute o script contido em:
   - `supabase/migrations/20260925000000_initial_schema.sql`
4. Em seguida, para popular os dados de teste (agências e itens de checklist), execute o script:
   - `supabase/seed.sql`

---

### Opção 2: Pelo Supabase CLI (Local ou CI/CD)

Caso utilize a ferramenta de linha de comando oficial da Supabase:

1. **Instalar / Iniciar:**
   ```bash
   npx supabase start
   ```

2. **Aplicar as migrações e sementes:**
   ```bash
   npx supabase db reset
   ```

3. **Vincular ao seu projeto Supabase remoto:**
   ```bash
   npx supabase link --project-ref seu-project-ref
   npx supabase db push
   ```

---

## 🔐 Variáveis de Ambiente Necessárias (.env)

No arquivo `.env` do backend (`backend/.env`), adicione:

```env
SUPABASE_URL=https://sua-url-aqui.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJECT-REF].supabase.co:5432/postgres
```
