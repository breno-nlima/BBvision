/**
 * BBVision - Suite Completa de Testes Automatizados (Produção)
 * Executa contra uma base 100% limpa e isolada (sem dados de exemplo/seed),
 * validando todos os fluxos de ponta a ponta:
 * - Healthcheck, Readiness, Headers OWASP, Compressão e Rate Limit
 * - Cadastro, Login, Perfil, Troca de Senha, Listagem de Empreiteiras e Logout
 * - Obras CRUD, RBAC, Cardinalidade 1:N, Checklist customizado e Isolamento entre Empreiteiras
 * - Visão Computacional IA, Auth obrigatória, Magic Bytes, Path Traversal e Sugestão Contextual
 * - Relatórios, IDOR, Assinatura Digital PNG, Validação de Senha na Assinatura, Deduplicação, Imutabilidade e PDFKit
 * - Auditoria Fiscal (Painel, APROVAR/REGULAR, PENDENTE_AJUSTE, Recompilação PDF)
 * - Validador Público (Código e SHA-256, sem vazamento de assinatura, anti-XSS)
 * - Sincronização Offline (HU05)
 * - Persistência Real em Disco (reloadFromDisk)
 * - 18 Requisitos Agent-Readiness + MCP Server Card + Streamable HTTP MCP
 */

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Isola completamente o armazenamento dos testes em arquivo temporário
process.env.NODE_ENV = 'test';
const TMP_STORE_PATH = path.join(os.tmpdir(), `bbvision_test_store_${Date.now()}_${process.pid}.json`);
process.env.DATA_STORE_PATH = TMP_STORE_PATH;

const app = require('../src/app');
const dataStore = require('../src/repositories/dataStore');
const { resolveSafePath } = require('../src/utils/securityUtils');
const { UPLOAD_ROOT } = require('../src/middlewares/uploadMiddleware');

const EVIDENCIAS_DIR = path.resolve(__dirname, '..', 'uploads', 'evidencias');
const RELATORIOS_DIR = path.resolve(__dirname, '..', 'uploads', 'relatorios');

// Snapshot inicial dos arquivos de upload para limpeza cirúrgica pós-teste
function snapshotFiles(dir) {
  if (!fs.existsSync(dir)) return new Set();
  return new Set(fs.readdirSync(dir));
}
const initialEvidencias = snapshotFiles(EVIDENCIAS_DIR);
const initialRelatorios = snapshotFiles(RELATORIOS_DIR);

let server;
const PORT = 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// PNG 1x1 válido (Magic Bytes reais 89 50 4E 47)
const VALID_PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

function request(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlPath, BASE_URL);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        let data = raw.toString('utf-8');
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(data);
          } catch (_) {}
        }
        resolve({ status: res.statusCode, headers: res.headers, body: data, rawBuffer: raw });
      });
    });

    req.on('error', err => reject(err));

    if (body !== null && body !== undefined) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

let assertionsPassed = 0;
function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FALHA NO TESTE] ${message}`);
  }
  assertionsPassed++;
  console.log(`  ✓ ${message}`);
}

function cleanupTestArtifacts() {
  try {
    if (fs.existsSync(TMP_STORE_PATH)) fs.unlinkSync(TMP_STORE_PATH);
    if (fs.existsSync(`${TMP_STORE_PATH}.tmp`)) fs.unlinkSync(`${TMP_STORE_PATH}.tmp`);
  } catch (_) {}

  for (const [dir, initialSet] of [
    [EVIDENCIAS_DIR, initialEvidencias],
    [RELATORIOS_DIR, initialRelatorios],
  ]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!initialSet.has(file) && file !== '.gitkeep') {
        try {
          fs.unlinkSync(path.join(dir, file));
        } catch (_) {}
      }
    }
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  Suite de Testes E2E de Produção — BBVision');
  console.log('======================================================\n');

  try {
    dataStore.resetForTesting();

    // ------------------------------------------------------------------------
    // 1. HEALTHCHECK, READINESS, HEADERS OWASP E BASE 100% LIMPA
    // ------------------------------------------------------------------------
    console.log('1. Health Check, Readiness, Headers OWASP & Base Limpa...');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'Health check respondeu HTTP 200');
    assert(health.body.status === 'online', 'Status da API é online');
    assert(health.body.versao === '1.2.0', 'Versão reportada é 1.2.0');
    assert(typeof health.body.memoria?.rssMb === 'number', 'Telemetria de memória presente');
    assert(health.headers['x-content-type-options'] === 'nosniff', 'Header X-Content-Type-Options: nosniff presente');
    assert(health.headers['x-frame-options'] === 'SAMEORIGIN', 'Header X-Frame-Options: SAMEORIGIN presente');
    assert(Boolean(health.headers['x-ratelimit-limit']), 'Headers de Rate Limiting presentes');

    const readyRes = await request('GET', '/api/ready');
    assert(readyRes.status === 200 && readyRes.body.status === 'ready', 'Readiness probe respondeu ready');

    // Verifica que os dois perfis solicitados (Empreiteira e Fiscal) estão ativos e autenticáveis
    const loginRodrigo = await request('POST', '/api/auth/login', {
      email: 'rodrigo@empreiteira.com',
      senha: '123456',
    });
    assert(
      loginRodrigo.status === 200 && Boolean(loginRodrigo.body.token) && loginRodrigo.body.usuario.cargo === 'empreiteira',
      'Perfil rodrigo@empreiteira.com (Empreiteira) autentica com sucesso'
    );

    const loginMariana = await request('POST', '/api/auth/login', {
      email: 'mariana@bb.com.br',
      senha: '123456',
    });
    assert(
      loginMariana.status === 200 && Boolean(loginMariana.body.token) && loginMariana.body.usuario.cargo === 'fiscal',
      'Perfil mariana@bb.com.br (Fiscal de Obra) autentica com sucesso'
    );

    // ------------------------------------------------------------------------
    // 2. REGISTRO, LOGIN, PERFIL, TROCA DE SENHA, EMPREITEIRAS E LOGOUT
    // ------------------------------------------------------------------------
    console.log('\n2. Autenticação, Gestão de Perfil, Alteração de Senha e Empreiteiras...');
    const regFraco = await request('POST', '/api/auth/register', {
      nome: 'Teste',
      email: 'invalido@teste.local',
      senha: '123',
      cargo: 'fiscal',
    });
    assert(regFraco.status === 400, 'Senha curta (< 6) rejeitada com HTTP 400');

    const regEmailInvalido = await request('POST', '/api/auth/register', {
      nome: 'Teste',
      email: 'nao-e-email',
      senha: 'SenhaForte!1',
      cargo: 'fiscal',
    });
    assert(regEmailInvalido.status === 400, 'E-mail inválido rejeitado com HTTP 400');

    const regFiscal = await request('POST', '/api/auth/register', {
      nome: 'Eng. Fiscal Auditor',
      email: 'fiscal.auditor@bbvision.local',
      senha: 'FiscalPass@2026',
      cargo: 'fiscal',
      empresa: 'Superintendência de Engenharia',
      registro_profissional: 'CREA-PE 99001',
    });
    assert(regFiscal.status === 201 && Boolean(regFiscal.body.token), 'Cadastro de Fiscal retornou HTTP 201 + JWT');
    assert(regFiscal.body.usuario.cargo === 'fiscal' && !regFiscal.body.usuario.senha_hash, 'Cargo fiscal e senha_hash não exposto');
    const tokenFiscal = regFiscal.body.token;
    const fiscalId = regFiscal.body.usuario.id;

    const regDup = await request('POST', '/api/auth/register', {
      nome: 'Duplicado',
      email: 'fiscal.auditor@bbvision.local',
      senha: 'OutraSenha@2026',
      cargo: 'fiscal',
    });
    assert(regDup.status === 409, 'E-mail duplicado rejeitado com HTTP 409');

    const regEmp1 = await request('POST', '/api/auth/register', {
      nome: 'Responsável Empreiteira Um',
      email: 'emp1@construtora.local',
      senha: 'Emp1Pass@2026',
      cargo: 'empreiteira',
      empresa: 'Construtora Alfa Ltda',
      registro_profissional: 'CREA-SP 11223',
    });
    assert(regEmp1.status === 201 && Boolean(regEmp1.body.token), 'Cadastro de Empreiteira 1 retornou HTTP 201 + JWT');
    let tokenEmp1 = regEmp1.body.token;
    const emp1Id = regEmp1.body.usuario.id;

    const regEmp2 = await request('POST', '/api/auth/register', {
      nome: 'Responsável Empreiteira Dois',
      email: 'emp2@construtora.local',
      senha: 'Emp2Pass@2026',
      cargo: 'empreiteira',
      empresa: 'Construtora Beta Ltda',
    });
    assert(regEmp2.status === 201 && Boolean(regEmp2.body.token), 'Cadastro de Empreiteira 2 retornou HTTP 201 + JWT');
    const tokenEmp2 = regEmp2.body.token;

    // Login, /me, PATCH /me e PATCH /senha
    const loginErrado = await request('POST', '/api/auth/login', {
      email: 'emp1@construtora.local',
      senha: 'SenhaErrada',
    });
    assert(loginErrado.status === 401, 'Login com senha incorreta rejeitado com HTTP 401');

    const meRes = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${tokenEmp1}` });
    assert(meRes.status === 200 && meRes.body.usuario.id === emp1Id, 'GET /api/auth/me retorna perfil autenticado');

    const patchPerfil = await request(
      'PATCH',
      '/api/auth/me',
      { nome: 'Responsável Empreiteira Um Atualizado', empresa: 'Construtora Alfa Engenharia' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      patchPerfil.status === 200 && patchPerfil.body.usuario.nome === 'Responsável Empreiteira Um Atualizado',
      'PATCH /api/auth/me atualizou dados cadastrais'
    );

    const patchSenhaErrada = await request(
      'PATCH',
      '/api/auth/senha',
      { senhaAtual: 'errada', novaSenha: 'NovaEmp1Pass@2026' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(patchSenhaErrada.status === 401, 'PATCH /api/auth/senha rejeita senha atual incorreta com HTTP 401');

    const patchSenhaOk = await request(
      'PATCH',
      '/api/auth/senha',
      { senhaAtual: 'Emp1Pass@2026', novaSenha: 'NovaEmp1Pass@2026' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(patchSenhaOk.status === 200 && patchSenhaOk.body.sucesso === true, 'PATCH /api/auth/senha atualizou a senha');

    const loginSenhaNova = await request('POST', '/api/auth/login', {
      email: 'emp1@construtora.local',
      senha: 'NovaEmp1Pass@2026',
    });
    assert(loginSenhaNova.status === 200 && Boolean(loginSenhaNova.body.token), 'Login com nova senha retornou HTTP 200');
    tokenEmp1 = loginSenhaNova.body.token;

    const empListForbidden = await request('GET', '/api/auth/empreiteiras', null, { Authorization: `Bearer ${tokenEmp1}` });
    assert(empListForbidden.status === 403, 'Empreiteira bloqueada em GET /api/auth/empreiteiras (HTTP 403)');

    const empListFiscal = await request('GET', '/api/auth/empreiteiras', null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(
      empListFiscal.status === 200 &&
        Array.isArray(empListFiscal.body) &&
        empListFiscal.body.length === 3 &&
        empListFiscal.body.some(u => u.email === 'rodrigo@empreiteira.com'),
      'Fiscal lista todas as empreiteiras reais cadastradas (incluindo rodrigo@empreiteira.com)'
    );

    const logoutRes = await request('POST', '/api/auth/logout', null, { Authorization: `Bearer ${tokenEmp2}` });
    assert(logoutRes.status === 200 && logoutRes.body.sucesso === true, 'POST /api/auth/logout retornou sucesso');

    // ------------------------------------------------------------------------
    // 3. OBRAS CRUD, RBAC, CHECKLIST CUSTOMIZADO E ISOLAMENTO ENTRE EMPREITEIRAS
    // ------------------------------------------------------------------------
    console.log('\n3. Obras CRUD, RBAC, Cardinalidade 1:N e Isolamento entre Empreiteiras...');
    const obrasUnauth = await request('GET', '/api/obras');
    assert(obrasUnauth.status === 401, 'GET /api/obras sem token bloqueado com HTTP 401');

    const obrasVazias = await request('GET', '/api/obras', null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(obrasVazias.status === 200 && obrasVazias.body.length === 0, 'Catálogo inicia vazio (sem obras de exemplo)');

    const criaObraEmpForbidden = await request(
      'POST',
      '/api/obras',
      { nome: 'Obra Não Autorizada', endereco: 'Rua X, 1' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(criaObraEmpForbidden.status === 403, 'Empreiteira bloqueada ao tentar cadastrar obra (HTTP 403)');

    const criaObra1 = await request(
      'POST',
      '/api/obras',
      {
        nome: 'Agência Unidade Central',
        endereco: 'Av. Rio Branco, 500 - Centro, Recife/PE',
        tipo: 'Reforma e Modernização de Agência',
        empreiteira_id: emp1Id,
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(criaObra1.status === 201 && Boolean(criaObra1.body.obra?.id), 'Fiscal cadastrou Obra 1 com HTTP 201');
    assert(criaObra1.body.obra.cadastrado_por_fiscal_id === fiscalId, 'Obra registra cadastrado_por_fiscal_id');
    assert(criaObra1.body.obra.empreiteira_id === emp1Id, 'Obra vinculada à Empreiteira 1');
    const obra1Id = criaObra1.body.obra.id;

    const criaObra2 = await request(
      'POST',
      '/api/obras',
      {
        nome: 'Agência Unidade Norte',
        endereco: 'Av. Norte, 1200 - Recife/PE',
        empreiteira_id: emp1Id,
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(criaObra2.status === 201, 'Fiscal cadastrou Obra 2 para a mesma empreiteira (1:N)');
    const obra2Id = criaObra2.body.obra.id;

    const criaObra3 = await request(
      'POST',
      '/api/obras',
      {
        nome: 'Obra Temporária Exclusão',
        endereco: 'Rua Teste, 99',
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(criaObra3.status === 201, 'Fiscal cadastrou Obra 3 sem empreiteira definida');
    const obra3Id = criaObra3.body.obra.id;

    // Atribuição por e-mail da empreiteira (validação e visibilidade para a empreiteira atribuída)
    const criaObraEmailInvalido = await request(
      'POST',
      '/api/obras',
      {
        nome: 'Obra Email Inexistente',
        endereco: 'Rua Teste, 100',
        empreiteira_email: 'naoexiste@empreiteira.local',
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(criaObraEmailInvalido.status === 400, 'E-mail de empreiteira inexistente rejeitado com HTTP 400');

    const criaObraEmailFiscal = await request(
      'POST',
      '/api/obras',
      {
        nome: 'Obra Email De Fiscal',
        endereco: 'Rua Teste, 101',
        empreiteira_email: 'fiscal.auditor@bbvision.local',
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(criaObraEmailFiscal.status === 400, 'E-mail de perfil fiscal rejeitado para atribuição de empreiteira (HTTP 400)');

    const criaObraPorEmail = await request(
      'POST',
      '/api/obras',
      {
        nome: 'Agência Atribuída por E-mail',
        endereco: 'Av. Boa Viagem, 900 - Recife/PE',
        empreiteira_email: 'EMP2@CONSTRUTORA.LOCAL',
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(
      criaObraPorEmail.status === 201 &&
        criaObraPorEmail.body.obra?.empreiteira_id === regEmp2.body.usuario.id &&
        criaObraPorEmail.body.obra?.empreiteira_email === 'emp2@construtora.local',
      'Fiscal cadastrou obra atribuindo por e-mail da Empreiteira 2 (case-insensitive)'
    );
    const obraEmailId = criaObraPorEmail.body.obra.id;

    const obrasEmp2ComAtribuida = await request('GET', '/api/obras', null, { Authorization: `Bearer ${tokenEmp2}` });
    assert(
      obrasEmp2ComAtribuida.status === 200 &&
        obrasEmp2ComAtribuida.body.length === 1 &&
        obrasEmp2ComAtribuida.body[0].id === obraEmailId &&
        obrasEmp2ComAtribuida.body[0].empreiteira_email === 'emp2@construtora.local',
      'Empreiteira 2 visualiza imediatamente a obra atribuída pelo fiscal via e-mail'
    );

    const detalheObraEmailEmp2 = await request('GET', `/api/obras/${obraEmailId}`, null, { Authorization: `Bearer ${tokenEmp2}` });
    assert(detalheObraEmailEmp2.status === 200 && detalheObraEmailEmp2.body.id === obraEmailId, 'Empreiteira 2 acessa os detalhes da obra atribuída por e-mail');

    // Remove a obra de teste por e-mail para não alterar contagem das seções subsequentes
    const delObraEmail = await request('DELETE', `/api/obras/${obraEmailId}`, null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(delObraEmail.status === 200 && delObraEmail.body.sucesso === true, 'Limpeza da obra de teste por e-mail concluída');

    const obrasEmp1 = await request('GET', '/api/obras', null, { Authorization: `Bearer ${tokenEmp1}` });
    assert(obrasEmp1.status === 200 && obrasEmp1.body.length === 2, 'Empreiteira 1 enxerga exatamente suas 2 obras (1:N)');

    const obrasEmp2 = await request('GET', '/api/obras', null, { Authorization: `Bearer ${tokenEmp2}` });
    assert(obrasEmp2.status === 200 && obrasEmp2.body.length === 0, 'Isolamento: Empreiteira 2 não enxerga obras da Empreiteira 1');

    const detalheObra1Emp2 = await request('GET', `/api/obras/${obra1Id}`, null, { Authorization: `Bearer ${tokenEmp2}` });
    assert(detalheObra1Emp2.status === 403, 'Isolamento: Empreiteira 2 bloqueada no detalhe da Obra 1 (HTTP 403)');

    const detalheObra1Emp1 = await request('GET', `/api/obras/${obra1Id}`, null, { Authorization: `Bearer ${tokenEmp1}` });
    assert(
      detalheObra1Emp1.status === 200 && detalheObra1Emp1.body.empreiteira?.id === emp1Id && detalheObra1Emp1.body.fiscal_responsavel?.id === fiscalId,
      'Detalhe da Obra 1 retorna relacionamentos reais de empreiteira e fiscal'
    );

    const editObraEmpForbidden = await request(
      'PATCH',
      `/api/obras/${obra2Id}`,
      { nome: 'Tentativa Hack' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(editObraEmpForbidden.status === 403, 'Empreiteira bloqueada ao tentar editar obra (HTTP 403)');

    const editObraFiscal = await request(
      'PATCH',
      `/api/obras/${obra2Id}`,
      { nome: 'Agência Unidade Norte Renovada', tipo: 'Adequação de Acessibilidade (NBR 9050)' },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(
      editObraFiscal.status === 200 && editObraFiscal.body.obra.nome === 'Agência Unidade Norte Renovada',
      'Fiscal editou Obra 2 com sucesso'
    );

    const checklistCustom = await request(
      'PUT',
      `/api/obras/${obra1Id}/checklist`,
      {
        perguntas: [
          {
            id: 'q_custom_1',
            numero: 1,
            tipo: 'multipla_escolha',
            tipoLabel: 'Múltipla Escolha',
            titulo: '1. Fachada está conforme projeto executivo?',
            chaveResposta: 'q_custom_1',
            opcoes: [
              { valor: 'Sim', label: 'Sim', tag: 'Conforme', classeTag: 'tag-conforme' },
              { valor: 'Não', label: 'Não', tag: 'Não Conforme', classeTag: 'tag-erro' },
            ],
          },
        ],
      },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(checklistCustom.status === 200 && checklistCustom.body.perguntas.length === 1, 'Checklist personalizado da obra salvo com sucesso');

    const delObra3 = await request('DELETE', `/api/obras/${obra3Id}`, null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(delObra3.status === 200 && delObra3.body.sucesso === true, 'Fiscal excluiu Obra 3 sem relatórios vinculados');

    const getObra3AfterDel = await request('GET', `/api/obras/${obra3Id}`, null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(getObra3AfterDel.status === 404, 'Obra excluída retorna HTTP 404');

    // ------------------------------------------------------------------------
    // 4. FOTOS, VISÃO COMPUTACIONAL IA, AUTH, MAGIC BYTES E PATH TRAVERSAL
    // ------------------------------------------------------------------------
    console.log('\n4. Fotos, Visão Computacional IA, Magic Bytes e Path Traversal...');
    const fotoUnauth = await request('POST', '/api/fotos/avaliar', { imagemBase64: VALID_PNG_B64 });
    assert(fotoUnauth.status === 401, 'POST /api/fotos/avaliar sem autenticação bloqueado com HTTP 401');

    const sugUnauth = await request('POST', '/api/fotos/sugerir-observacao', { categoria: 'alvenaria' });
    assert(sugUnauth.status === 401, 'POST /api/fotos/sugerir-observacao sem autenticação bloqueado com HTTP 401');

    const fakeMagicBytes = Buffer.from('ESTOU_FINGINDO_SER_IMAGEM_TXT').toString('base64');
    const fotoInvalida = await request(
      'POST',
      '/api/fotos/avaliar',
      { imagemBase64: fakeMagicBytes },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(fotoInvalida.status === 400, 'Arquivo não-imagem (Magic Bytes inválidos) bloqueado com HTTP 400');

    const fotoOk = await request(
      'POST',
      '/api/fotos/avaliar',
      {
        imagemBase64: VALID_PNG_B64,
        telemetriaVisual: {
          baixaLuz: false,
          pessoaNoCentro: false,
          contextoConstrucao: true,
          foraDeContexto: false,
          luminanciaMedia: 170.5,
        },
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      fotoOk.status === 200 && fotoOk.body.status === 'APROVADO' && fotoOk.body.categoria === 'OBRA_LOCAL',
      'Foto válida de construção aprovada pela IA'
    );
    assert(fotoOk.body.hash_integridade && fotoOk.body.hash_integridade.length === 64, 'Hash SHA-256 real gerado para a foto');

    const fotoBaixaLuz = await request(
      'POST',
      '/api/fotos/avaliar',
      { imagemBase64: VALID_PNG_B64, telemetriaVisual: { baixaLuz: true, luminanciaMedia: 24 } },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(fotoBaixaLuz.status === 200 && fotoBaixaLuz.body.status === 'REJEITADO' && fotoBaixaLuz.body.categoria === 'BAIXA_LUZ', 'Baixa luz rejeitada');

    const fotoSelfieLat = await request(
      'POST',
      '/api/fotos/avaliar',
      {
        imagemBase64: VALID_PNG_B64,
        telemetriaVisual: {
          baixaLuz: false,
          isSelfieCamera: true,
          selfieLateral: true,
          pessoaNoCentro: false,
          contextoConstrucao: true,
          foraDeContexto: false,
          luminanciaMedia: 160,
        },
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(fotoSelfieLat.status === 200 && fotoSelfieLat.body.status === 'APROVADO', 'Selfie com pessoa fora do centro aprovada');

    const fotoPessoaCentro = await request(
      'POST',
      '/api/fotos/avaliar',
      { imagemBase64: VALID_PNG_B64, telemetriaVisual: { baixaLuz: false, pessoaNoCentro: true, facesNoCentro: 1 } },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      fotoPessoaCentro.status === 200 && fotoPessoaCentro.body.status === 'REJEITADO' && fotoPessoaCentro.body.categoria === 'PESSOA_NO_CENTRO',
      'Pessoa ocupando o centro rejeitada'
    );

    const fotoForaContexto = await request(
      'POST',
      '/api/fotos/avaliar',
      { imagemBase64: VALID_PNG_B64, telemetriaVisual: { baixaLuz: false, pessoaNoCentro: false, foraDeContexto: true, contextoConstrucao: false } },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      fotoForaContexto.status === 200 && fotoForaContexto.body.status === 'REJEITADO' && fotoForaContexto.body.categoria === 'FORA_DE_CONTEXTO',
      'Cena fora de contexto de obra/construção rejeitada'
    );

    const traversalSug = await request(
      'POST',
      '/api/fotos/sugerir-observacao',
      { caminho_arquivo: '../../../../windows/system.ini' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(traversalSug.status === 400, 'Path Traversal em /api/fotos/sugerir-observacao bloqueado com HTTP 400');

    const sugContextual = await request(
      'POST',
      '/api/fotos/sugerir-observacao',
      {
        categoria: 'geral',
        contextoRespostas: { sinalizacao: 'Sim', limpeza: '5/5', cameras: 4 },
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      sugContextual.status === 200 && typeof sugContextual.body.sugestao === 'string' && sugContextual.body.sugestao.length > 15,
      'Sugestão contextual de observação retornada com sucesso'
    );

    // ------------------------------------------------------------------------
    // 5. RELATÓRIOS, IDOR, ASSINATURA DIGITAL, SENHA, DEDUPLICAÇÃO E IMUTABILIDADE
    // ------------------------------------------------------------------------
    console.log('\n5. Relatórios, IDOR, Assinatura Real, Validação de Senha, Deduplicação e PDF...');
    const relUnauth = await request('POST', '/api/relatorios', { obra_id: obra1Id });
    assert(relUnauth.status === 401, 'POST /api/relatorios sem token bloqueado com HTTP 401');

    const relOutraEmp = await request(
      'POST',
      '/api/relatorios',
      { obra_id: obra1Id },
      { Authorization: `Bearer ${tokenEmp2}` }
    );
    assert(relOutraEmp.status === 403, 'IDOR: Empreiteira 2 bloqueada ao criar relatório na obra da Empreiteira 1');

    const rel1 = await request(
      'POST',
      '/api/relatorios',
      {
        obra_id: obra1Id,
        tipo_local: 'Agência Bancária',
        localizacao_texto: 'Av. Rio Branco, 500 - Recife/PE',
        latitude: -8.06316,
        longitude: -34.87113,
        precisao_gps: 12,
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(rel1.status === 201 && rel1.body.status === 'EM_ANDAMENTO', 'Relatório 1 criado com GPS e tipo_local');
    const rel1Id = rel1.body.id;

    // PDF de rascunho EM_ANDAMENTO protegido contra acesso público
    const draftPdfUnauth = await request('GET', `/api/relatorios/${rel1Id}/pdf`);
    assert(draftPdfUnauth.status === 401, 'PDF de relatório EM_ANDAMENTO bloqueado sem autenticação (HTTP 401)');

    // IDOR em GET, PUT respostas, POST fotos e POST finalizar
    assert(
      (await request('GET', `/api/relatorios/${rel1Id}`, null, { Authorization: `Bearer ${tokenEmp2}` })).status === 403,
      'IDOR: Empreiteira 2 bloqueada em GET /api/relatorios/:id'
    );
    assert(
      (
        await request('PUT', `/api/relatorios/${rel1Id}/respostas`, [{ pergunta: 'Hack', valor: 'X' }], {
          Authorization: `Bearer ${tokenEmp2}`,
        })
      ).status === 403,
      'IDOR: Empreiteira 2 bloqueada em PUT /respostas'
    );
    assert(
      (
        await request(
          'POST',
          `/api/relatorios/${rel1Id}/fotos`,
          { caminho_arquivo: '../../../Windows/win.ini', hash_integridade: 'a'.repeat(64) },
          { Authorization: `Bearer ${tokenEmp1}` }
        )
      ).status === 400,
      'Path Traversal em POST /relatorios/:id/fotos bloqueado com HTTP 400'
    );

    const saveResp = await request(
      'PUT',
      `/api/relatorios/${rel1Id}/respostas`,
      [
        {
          pergunta: '1. Fachada está conforme projeto executivo?',
          valor: 'Parcial',
          justificativa: 'Tapume lateral em fase de desmontagem programada.',
          tipo: 'multipla_escolha',
        },
        {
          pergunta: '2. Itens confirmados no Checklist de Verificação',
          valor: 'A estrutura está conforme o projeto?; O local está pronto para registro fotográfico in-loco?',
          tipo: 'multipla_escolha',
        },
      ],
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(saveResp.status === 200 && saveResp.body.respostas.length === 2, 'Respostas com justificativa salvas com HTTP 200');

    const attachFoto = await request(
      'POST',
      `/api/relatorios/${rel1Id}/fotos`,
      {
        imagemBase64: `data:image/png;base64,${VALID_PNG_B64}`,
        motivo: 'Evidência in-loco da fachada principal.',
        avaliacao_gemini: 'APROVADO',
        confianca: 0.96,
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      attachFoto.status === 201 && attachFoto.body.foto.caminho_arquivo.startsWith('uploads/evidencias/'),
      'Foto anexada e salva no disco com HTTP 201'
    );
    const hashFoto1 = attachFoto.body.foto.hash_integridade;

    // Finalização com senha de confirmação incorreta deve falhar (401)
    const finSenhaErrada = await request(
      'POST',
      `/api/relatorios/${rel1Id}/finalizar`,
      { senha_confirmacao: 'SenhaIncorreta!' },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(finSenhaErrada.status === 401, 'Finalização com senha incorreta bloqueada com HTTP 401');

    // Finalização oficial com senha correta, assinatura PNG e foto duplicada (testando deduplicação)
    const finOk = await request(
      'POST',
      `/api/relatorios/${rel1Id}/finalizar`,
      {
        senha_confirmacao: 'NovaEmp1Pass@2026',
        assinatura_base64: `data:image/png;base64,${VALID_PNG_B64}`,
        tipo_local: 'Agência Bancária',
        localizacao_texto: 'Av. Rio Branco, 500 - Recife/PE (-8.06316, -34.87113)',
        latitude: -8.06316,
        longitude: -34.87113,
        precisao_gps: 10,
        fotos: [{ imagemBase64: VALID_PNG_B64, hash_integridade: hashFoto1, motivo: 'Foto duplicada na finalização' }],
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(finOk.status === 200 && finOk.body.status === 'FINALIZADO', 'Finalização oficial retornou HTTP 200 FINALIZADO');
    assert(finOk.body.codigo && /^[0-9A-F]{16}$/.test(finOk.body.codigo), 'Código único gerado tem 16 chars hex UPPERCASE');
    assert(
      finOk.body.hashIntegridade && finOk.body.hashIntegridade.length === 64 && finOk.body.hashIntegridade !== EMPTY_SHA256,
      'Hash SHA-256 real gerado (diferente de hash de string vazia)'
    );

    const rel1Detalhe = await request('GET', `/api/relatorios/${rel1Id}`, null, { Authorization: `Bearer ${tokenEmp1}` });
    assert(rel1Detalhe.body.fotos.length === 1, 'Deduplicação manteve exatamente 1 foto no relatório');
    assert(Boolean(rel1Detalhe.body.assinatura_base64), 'Assinatura digital PNG persistida no relatório');

    // Imutabilidade pós-finalização
    assert(
      (await request('PUT', `/api/relatorios/${rel1Id}/respostas`, [{ pergunta: 'Edit', valor: 'Hack' }], { Authorization: `Bearer ${tokenEmp1}` }))
        .status === 403,
      'Imutabilidade: alteração de respostas pós-finalização bloqueada (HTTP 403)'
    );
    assert(
      (await request('POST', `/api/relatorios/${rel1Id}/finalizar`, {}, { Authorization: `Bearer ${tokenEmp1}` })).status === 400,
      'Imutabilidade: reenvio de finalização bloqueado (HTTP 400)'
    );

    // Integridade referencial: não pode excluir obra com relatório vinculado
    const delObra1Bloq = await request('DELETE', `/api/obras/${obra1Id}`, null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(delObra1Bloq.status === 409, 'Exclusão de obra com relatórios vinculados bloqueada com HTTP 409');

    // Download público (Fé Pública) do PDF finalizado
    const pdfFinal = await request('GET', `/api/relatorios/${rel1Id}/pdf`);
    assert(
      pdfFinal.status === 200 && pdfFinal.headers['content-type'] === 'application/pdf' && pdfFinal.rawBuffer.length > 2000,
      'PDF oficial com evidência e assinatura gerado e baixado (> 2KB)'
    );

    // ------------------------------------------------------------------------
    // 6. AUDITORIA FISCAL, PAINEL RESUMO E RECOMPILAÇÃO DO PDF
    // ------------------------------------------------------------------------
    console.log('\n6. Auditoria Fiscal, Painel Resumo e Recompilação do PDF...');
    assert(
      (await request('GET', '/api/relatorios/painel/resumo', null, { Authorization: `Bearer ${tokenEmp1}` })).status === 403,
      'Empreiteira bloqueada em GET /api/relatorios/painel/resumo (HTTP 403)'
    );
    const painelFiscal = await request('GET', '/api/relatorios/painel/resumo', null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(
      painelFiscal.status === 200 &&
        painelFiscal.body.totalRelatorios === 1 &&
        painelFiscal.body.finalizados === 1 &&
        painelFiscal.body.obrasAtivas === 2,
      'Painel resumo do fiscal contabiliza corretamente os relatórios e obras reais'
    );

    // Empreiteira bloqueada ao tentar julgar relatório
    assert(
      (
        await request(
          'PATCH',
          `/api/relatorios/${rel1Id}/status`,
          { status: 'REGULAR', justificativa: 'Autoaprovação' },
          { Authorization: `Bearer ${tokenEmp1}` }
        )
      ).status === 403,
      'Empreiteira bloqueada em PATCH /api/relatorios/:id/status (HTTP 403)'
    );

    // Fiscal aprova com REGULAR -> mapeado para APROVADO
    const julgaAprovar = await request(
      'PATCH',
      `/api/relatorios/${rel1Id}/status`,
      { status: 'REGULAR', justificativa: 'Evidências conformes e medição homologada.' },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(
      julgaAprovar.status === 200 && julgaAprovar.body.status === 'APROVADO' && julgaAprovar.body.obraStatus === 'REGULAR',
      'Fiscal homologou relatório (REGULAR -> APROVADO)'
    );

    // Segundo relatório para testar julgamento prematuro (EM_ANDAMENTO) e PENDENTE_AJUSTE
    const rel2 = await request('POST', '/api/relatorios', { obra_id: obra2Id }, { Authorization: `Bearer ${tokenEmp1}` });
    const rel2Id = rel2.body.id;

    const julgaPrematuro = await request(
      'PATCH',
      `/api/relatorios/${rel2Id}/status`,
      { status: 'REGULAR', justificativa: 'Prematuro' },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(julgaPrematuro.status === 400, 'Julgamento em relatório EM_ANDAMENTO bloqueado com HTTP 400');

    await request(
      'POST',
      `/api/relatorios/${rel2Id}/finalizar`,
      {
        senha_confirmacao: 'NovaEmp1Pass@2026',
        assinatura_base64: `data:image/png;base64,${VALID_PNG_B64}`,
        validacao_manual: true,
        motivo_validacao_manual: 'Oscilação de sinal no canteiro',
        fotos: [{ imagemBase64: VALID_PNG_B64, motivo: 'Foto em modo manual', avaliacao_gemini: 'VALIDACAO_MANUAL' }],
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );

    const julgaReprovar = await request(
      'PATCH',
      `/api/relatorios/${rel2Id}/status`,
      { status: 'PENDENTE_AJUSTE', justificativa: 'Corrigir rampa de acesso conforme NBR 9050.' },
      { Authorization: `Bearer ${tokenFiscal}` }
    );
    assert(
      julgaReprovar.status === 200 && julgaReprovar.body.status === 'PENDENTE_AJUSTE' && julgaReprovar.body.obraStatus === 'PENDENTE_AJUSTE',
      'Fiscal solicitou ajuste (PENDENTE_AJUSTE) com sucesso'
    );

    const pdfRecompilado = await request('GET', `/api/relatorios/${rel2Id}/pdf`);
    assert(
      pdfRecompilado.status === 200 && pdfRecompilado.headers['content-type'] === 'application/pdf' && pdfRecompilado.rawBuffer.length > 2000,
      'PDF recompilado após parecer PENDENTE_AJUSTE e validação manual'
    );

    // ------------------------------------------------------------------------
    // 7. VALIDADOR PÚBLICO (CÓDIGO + SHA-256 + PRIVACIDADE + ANTI-XSS)
    // ------------------------------------------------------------------------
    console.log('\n7. Validador Público de Fé Pública e Proteção Anti-XSS...');
    const valByCode = await request('GET', `/api/validador/${finOk.body.codigo}`);
    assert(valByCode.status === 200 && valByCode.body.autentico === true, 'Validador atesta relatório por Código Único');
    assert(valByCode.body.relatorio.assinatura_base64 === undefined, 'Validador público não expõe assinatura_base64 bruta');

    const valByHash = await request('GET', `/api/validador/${finOk.body.hashIntegridade}`);
    assert(valByHash.status === 200 && valByHash.body.autentico === true, 'Validador atesta relatório por Hash SHA-256');

    const valFake = await request('GET', '/api/validador/CODIGO_INEXISTENTE');
    assert(valFake.status === 404 && valFake.body.autentico === false, 'Código inexistente retorna HTTP 404');

    const valXss = await request('GET', '/api/validador/%3Cscript%3E');
    assert(valXss.status === 400 && valXss.body.autentico === false, 'Payload XSS rejeitado com HTTP 400');

    // ------------------------------------------------------------------------
    // 8. SINCRONIZAÇÃO OFFLINE (HU05)
    // ------------------------------------------------------------------------
    console.log('\n8. Sincronização de Vistoria Offline (HU05)...');
    const syncRes = await request(
      'POST',
      '/api/relatorios/sincronizar-offline',
      {
        obra_id: obra1Id,
        tipo_local: 'Fachada Externa',
        localizacao_texto: 'GPS Offline (-8.06316, -34.87113)',
        latitude: -8.06316,
        longitude: -34.87113,
        assinatura_base64: `data:image/png;base64,${VALID_PNG_B64}`,
        validacao_manual: true,
        respostas: [{ pergunta: 'Alvenaria', valor: 'Conforme' }],
        fotos: [{ imagemBase64: VALID_PNG_B64, motivo: 'Foto offline' }],
        timestamp: new Date().toISOString(),
      },
      { Authorization: `Bearer ${tokenEmp1}` }
    );
    assert(
      syncRes.status === 200 && syncRes.body.sucesso === true && /^[0-9A-F]{16}$/.test(syncRes.body.codigo) && syncRes.body.status === 'FINALIZADO',
      'Vistoria offline sincronizada e selada com código de 16 caracteres'
    );

    // ------------------------------------------------------------------------
    // 9. PERSISTÊNCIA EM DISCO (SIMULAÇÃO DE REINÍCIO DO SERVIDOR)
    // ------------------------------------------------------------------------
    console.log('\n9. Verificando Persistência Real em Disco (Simulação de Restart)...');
    assert(fs.existsSync(TMP_STORE_PATH), 'Arquivo de persistência JSON gravado em disco');
    dataStore.reloadFromDisk();
    const obrasPosRestart = await request('GET', '/api/obras', null, { Authorization: `Bearer ${tokenFiscal}` });
    const relsPosRestart = await request('GET', '/api/relatorios', null, { Authorization: `Bearer ${tokenFiscal}` });
    assert(obrasPosRestart.status === 200 && obrasPosRestart.body.length === 2, 'Obras sobreviveram ao reloadFromDisk()');
    assert(relsPosRestart.status === 200 && relsPosRestart.body.length === 3, 'Relatórios sobreviveram ao reloadFromDisk()');

    // ------------------------------------------------------------------------
    // 10. SEGURANÇA CWE-22, 404 JSON E COMPRESSÃO HTTP
    // ------------------------------------------------------------------------
    console.log('\n10. Segurança CWE-22, 404 JSON e Compressão HTTP...');
    assert(resolveSafePath('../uploads_secret/vazamento.png', UPLOAD_ROOT) === null, 'resolveSafePath bloqueia diretório irmão (CWE-22)');

    const api404 = await request('GET', '/api/endpoint-inexistente');
    assert(api404.status === 404 && typeof api404.body.erro === 'string', 'Endpoint inexistente da API retorna HTTP 404 JSON');

    const compRes = await request('GET', '/api/obras', null, {
      'Accept-Encoding': 'gzip, deflate',
      Authorization: `Bearer ${tokenFiscal}`,
    });
    assert(compRes.status === 200 && compRes.headers['vary']?.includes('Accept-Encoding'), 'Suporte a compressão HTTP ativo');

    // ------------------------------------------------------------------------
    // 11. AGENT-READINESS (18 REQUISITOS) + MCP STREAMABLE HTTP
    // ------------------------------------------------------------------------
    console.log('\n11. Agent-Readiness (18 Requisitos) & Servidor MCP...');
    const robotsRes = await request('GET', '/robots.txt');
    assert(
      robotsRes.status === 200 &&
        (robotsRes.headers['content-type'] || '').includes('text/plain') &&
        robotsRes.body.includes('Content-Signal:') &&
        robotsRes.body.includes('Sitemap: https://antiquewhite-dolphin-779579.hostingersite.com/sitemap.xml'),
      'robots.txt declara Content-Signal e Sitemap'
    );

    const sitemapRes = await request('GET', '/sitemap.xml');
    assert(
      sitemapRes.status === 200 &&
        (sitemapRes.headers['content-type'] || '').includes('application/xml') &&
        sitemapRes.body.includes('<urlset') &&
        sitemapRes.body.includes('/about</loc>') &&
        sitemapRes.body.includes('/validador</loc>'),
      'sitemap.xml válido lista páginas públicas'
    );

    const missingHtml = await request('GET', '/pagina-inexistente-404', null, { Accept: 'text/html' });
    assert(missingHtml.status === 404, 'Página inexistente retorna HTTP 404 real (HTML)');
    const missingMd = await request('GET', '/pagina-inexistente-404', null, { Accept: 'text/markdown' });
    assert(missingMd.status === 404 && (missingMd.headers['content-type'] || '').includes('text/markdown'), 'Página inexistente retorna HTTP 404 real (Markdown)');

    const homeHtml = await request('GET', '/', null, { Accept: 'text/html,application/xhtml+xml' });
    assert(homeHtml.status === 200 && (homeHtml.headers['content-type'] || '').includes('text/html'), 'Homepage HTML respondeu 200');
    assert(
      homeHtml.body.includes('<title>') &&
        homeHtml.body.includes('name="description"') &&
        homeHtml.body.includes('<link rel="canonical" href="https://antiquewhite-dolphin-779579.hostingersite.com/">'),
      'Homepage possui title, description e canonical'
    );
    assert((homeHtml.body.match(/<h1[\s>]/gi) || []).length === 1 && homeHtml.body.includes('<h2>'), 'Homepage possui H1 único e hierarquia H2');

    const jsonLdMatch = homeHtml.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert(Boolean(jsonLdMatch), 'Homepage contém JSON-LD');
    const jsonLd = JSON.parse(jsonLdMatch[1]);
    const nodes = Array.isArray(jsonLd['@graph']) ? jsonLd['@graph'] : [jsonLd];
    const orgNode = nodes.find(n => n['@type'] === 'Organization');
    assert(Boolean(orgNode && orgNode.email && orgNode.telephone && orgNode.sameAs?.length >= 3), 'JSON-LD Organization completo com sameAs');
    assert(nodes.length >= 4, 'JSON-LD declara múltiplos tipos de schema');

    assert(
      homeHtml.body.includes('href="/about"') &&
        homeHtml.body.includes('href="/contact"') &&
        homeHtml.body.includes('href="/terms"') &&
        homeHtml.body.includes('href="/privacy"') &&
        homeHtml.body.includes('href="mailto:') &&
        homeHtml.body.includes('href="tel:'),
      'Homepage vincula about, contact, terms, privacy e contatos machine-readable'
    );

    const linkHdr = homeHtml.headers['link'] || '';
    assert(
      linkHdr.includes('/llms.txt') && linkHdr.includes('text/markdown') && linkHdr.includes('/.well-known/mcp/server-card.json'),
      'Cabeçalho RFC 8288 Link completo na homepage'
    );

    for (const p of ['/about', '/contact', '/terms', '/privacy', '/validador']) {
      const r = await request('GET', p, null, { Accept: 'text/html' });
      assert(r.status === 200 && (r.body.match(/<h1[\s>]/gi) || []).length === 1, `Página pública ${p} respondeu 200 com H1 único`);
    }
    const redirSobre = await request('GET', '/sobre', null, { Accept: 'text/html' });
    assert(redirSobre.status === 301 && redirSobre.headers['location'] === '/about', 'Alias /sobre redireciona 301 para /about');

    const llmsRes = await request('GET', '/llms.txt');
    assert(
      llmsRes.status === 200 && (llmsRes.headers['content-type'] || '').includes('text/plain') && llmsRes.body.startsWith('# BBVision'),
      '/llms.txt bem-formado servido como text/plain'
    );

    const homeMd = await request('GET', '/', null, { Accept: 'text/markdown' });
    assert(
      homeMd.status === 200 &&
        (homeMd.headers['content-type'] || '').includes('text/markdown') &&
        (homeMd.headers['vary'] || '').toLowerCase().includes('accept') &&
        homeMd.body.startsWith('# BBVision'),
      'Negociação Accept: text/markdown operacional'
    );

    const webMcp = await request('GET', '/src/utils/webmcp.js');
    assert(webMcp.status === 200 && webMcp.body.includes('navigator.modelContext') && webMcp.body.includes('registerTool'), 'WebMCP disponível e estruturado');

    const mcpCard = await request('GET', '/.well-known/mcp/server-card.json');
    assert(
      mcpCard.status === 200 && (mcpCard.headers['content-type'] || '').includes('application/json') && mcpCard.body.endpoint && mcpCard.body.capabilities?.tools,
      'MCP Server Card SEP-1649 publicado em JSON'
    );

    const mcpInit = await request('POST', '/api/mcp', { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    assert(mcpInit.status === 200 && Boolean(mcpInit.body.result?.serverInfo), 'MCP initialize JSON-RPC operacional');

    const mcpTools = await request('POST', '/api/mcp', { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
    assert(mcpTools.status === 200 && mcpTools.body.result?.tools?.length >= 3, 'MCP tools/list operacional');

    const mcpCall = await request('POST', '/api/mcp', {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'validate_report_authenticity', arguments: { codigoOuHash: finOk.body.codigo } },
    });
    assert(
      mcpCall.status === 200 && mcpCall.body.result?.content?.[0]?.text.includes('"autentico": true'),
      'MCP validate_report_authenticity validou relatório real'
    );

    console.log('\n======================================================');
    console.log(`  SUCESSO TOTAL: ${assertionsPassed} verificações aprovadas!`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:', err);
    process.exitCode = 1;
  } finally {
    cleanupTestArtifacts();
    if (server) server.close();
  }
}

server = app.listen(PORT, '127.0.0.1', () => {
  runTests();
});
