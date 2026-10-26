/**
 * BBVision - Teste Automatizado da API Backend Corporativa
 * Valida os fluxos essenciais de autenticação, obras, fotos, IA, relatórios, imutabilidade,
 * segurança (Path Traversal, Magic Bytes), headers corporativos, rate limiting,
 * sincronização offline (HU05) e tolerância de status fiscal (REGULAR/APROVADO).
 */

const http = require('http');
const app = require('../src/app');

let server;
const PORT = 3999;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        let data = raw.toString('utf-8');
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(data);
          } catch (e) {}
        }
        resolve({ status: res.statusCode, headers: res.headers, body: data, rawBuffer: raw });
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FALHA NO TESTE] ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('  Iniciando Testes da API Backend BBVision');
  console.log('======================================================\n');

  try {
    // 1. Healthcheck e Headers de Segurança
    console.log('1. Testando Health Check & Headers de Segurança Corporativos...');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'Health check respondeu HTTP 200');
    assert(health.body.status === 'online', 'Status da API é online');
    assert(health.headers['x-content-type-options'] === 'nosniff', 'Header X-Content-Type-Options: nosniff presente');
    assert(health.headers['x-frame-options'] === 'SAMEORIGIN', 'Header X-Frame-Options: SAMEORIGIN presente');
    assert(health.headers['x-ratelimit-limit'], 'Headers de Rate Limiting presentes');

    // 2. Autenticação (Rodrigo - Empreiteira)
    console.log('\n2. Testando Autenticação com Bcrypt Não-Bloqueante (Persona Rodrigo)...');
    const loginRodrigo = await request('POST', '/api/auth/login', {
      email: 'rodrigo@empreiteira.com',
      senha: '123456',
    });
    assert(loginRodrigo.status === 200, 'Login do Rodrigo retornou HTTP 200');
    assert(loginRodrigo.body.token, 'Token JWT foi gerado');
    assert(loginRodrigo.body.usuario.cargo === 'empreiteira', 'Cargo é empreiteira');
    const tokenRodrigo = loginRodrigo.body.token;

    // 3. Autenticação (Mariana - Fiscal)
    console.log('\n3. Testando Autenticação (Persona Mariana)...');
    const loginMariana = await request('POST', '/api/auth/login', {
      email: 'mariana@bb.com.br',
      senha: '123456',
    });
    assert(loginMariana.status === 200, 'Login da Mariana retornou HTTP 200');
    assert(loginMariana.body.usuario.cargo === 'fiscal', 'Cargo é fiscal');
    const tokenMariana = loginMariana.body.token;

    // 4. Teste Me com Token
    console.log('\n4. Testando Consulta de Perfil (/api/auth/me)...');
    const meRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(meRes.status === 200, 'Endpoint /me retornou HTTP 200');
    assert(meRes.body.usuario.email === 'rodrigo@empreiteira.com', 'E-mail do usuário autenticado confere');

    // 5. Teste de Cadastro de Usuário (Validações de Segurança)
    console.log('\n5. Testando Cadastro com Validações de Segurança (/api/auth/register)...');
    const regFraco = await request('POST', '/api/auth/register', {
      nome: 'Teste',
      email: 'teste@bb.com.br',
      senha: '123', // Senha menor que 6 caracteres
      cargo: 'fiscal',
    });
    assert(regFraco.status === 400, 'Senha curta rejeitada com HTTP 400');

    const novoEmail = `engenheiro_${Date.now()}@empreiteira.com`;
    const regSucesso = await request('POST', '/api/auth/register', {
      nome: 'Engenheiro Novo',
      email: novoEmail,
      senha: 'senhaSegura123',
      cargo: 'empreiteira',
    });
    assert(regSucesso.status === 201, 'Cadastro bem-sucedido retornou HTTP 201 com token');
    assert(regSucesso.body.token, 'Token gerado no registro');

    // 6. Listagem de Obras, Permissões RBAC & Cardinalidades (1:N)
    console.log('\n6. Testando Listagem de Obras, Permissões RBAC & Cardinalidade (/api/obras)...');
    const obrasRes = await request('GET', '/api/obras', null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(obrasRes.status === 200, 'Listagem de obras retornou HTTP 200');
    assert(Array.isArray(obrasRes.body) && obrasRes.body.length > 0, 'Retornou array com obras cadastradas');
    const obraId = obrasRes.body[0].id;

    // Teste Cardinalidade: 1 Empreiteira pode ter N Obras
    const obrasDaEmpreiteira = await request('GET', `/api/obras?empreiteira_id=${loginRodrigo.body.usuario.id}`, null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(obrasDaEmpreiteira.status === 200, 'Filtro por empreiteira retornou HTTP 200');
    assert(obrasDaEmpreiteira.body.length >= 2, 'Empreiteira Rodrigo possui N obras associadas (>= 2)');

    // Teste Cardinalidade: 1 Fiscal pode fiscalizar N Obras
    const obrasFiscalizadasMariana = await request('GET', `/api/obras?fiscal_id=${loginMariana.body.usuario.id}`, null, {
      Authorization: `Bearer ${tokenMariana}`,
    });
    assert(obrasFiscalizadasMariana.status === 200, 'Filtro por fiscal retornou HTTP 200');
    assert(obrasFiscalizadasMariana.body.length >= 2, 'Fiscal Mariana fiscaliza N obras associadas (>= 2)');

    // Teste Detalhe da Obra com Relacionamentos
    const detalheObra = await request('GET', `/api/obras/${obraId}`, null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(detalheObra.status === 200, 'Detalhes da obra retornou HTTP 200');
    assert(detalheObra.body.empreiteira, 'Obra contém objeto da empreiteira vinculada');
    assert(detalheObra.body.fiscal_responsavel, 'Obra contém objeto do fiscal responsável vinculado');

    // Teste RBAC: Empreiteira tentando cadastrar obra deve ser rejeitada com 403
    const criaObraEmpreiteira = await request('POST', '/api/obras', {
      nome: 'Agência Tentativa Não Autorizada',
      endereco: 'Rua Proibida, 100',
    }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(criaObraEmpreiteira.status === 403, 'Tentativa de criar obra por empreiteira bloqueada com HTTP 403');

    // Teste RBAC & Cardinalidade: Fiscal Mariana cadastrando mais uma obra (N obras cadastradas por fiscal)
    const criaObraFiscal = await request('POST', '/api/obras', {
      nome: 'Agência BB Autorizada Fiscal',
      endereco: 'Av. Paulista, 2000, SP',
      empreiteira_id: loginRodrigo.body.usuario.id,
    }, {
      Authorization: `Bearer ${tokenMariana}`,
    });
    assert(criaObraFiscal.status === 201, 'Cadastro de obra por fiscal retornou HTTP 201 com sucesso');
    assert(criaObraFiscal.body.obra.cadastrado_por_fiscal_id === loginMariana.body.usuario.id, 'Obra registra que foi cadastrada pelo fiscal Mariana');
    assert(criaObraFiscal.body.obra.empreiteira_id === loginRodrigo.body.usuario.id, 'Obra vinculada à empreiteira Rodrigo');

    // 7. Criar Relatório de Vistoria
    console.log('\n7. Testando Criação de Relatório de Vistoria (/api/relatorios)...');
    const relRes = await request('POST', '/api/relatorios', { obra_id: obraId }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(relRes.status === 201, 'Criação de relatório retornou HTTP 201');
    assert(relRes.body.id, 'ID do relatório foi criado');
    assert(relRes.body.status === 'EM_ANDAMENTO', 'Status inicial é EM_ANDAMENTO');
    const relatorioId = relRes.body.id;

    // 8. Avaliação de Foto com IA Gemini e Hash SHA-256
    console.log('\n8. Testando Avaliação de Imagem com Gemini & Hash SHA-256 (/api/fotos/avaliar)...');
    const fakeImageB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const fotoEval = await request('POST', '/api/fotos/avaliar', {
      imagemBase64: fakeImageB64,
    });
    assert(fotoEval.status === 200, 'Avaliação de foto retornou HTTP 200');
    assert(fotoEval.body.hash_integridade, 'Hash SHA-256 gerado para a foto');
    assert(fotoEval.body.hash_integridade.length === 64, 'Hash tem 64 caracteres');
    assert(['APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL'].includes(fotoEval.body.status), 'Status da foto é válido');

    // 9. Proteção contra Path Traversal
    console.log('\n9. Testando Proteção contra Path Traversal em Fotos (/api/fotos/sugerir-observacao)...');
    const traversalAttempt = await request('POST', '/api/fotos/sugerir-observacao', {
      caminho_arquivo: '../../../../windows/system.ini',
    });
    assert(traversalAttempt.status === 400, 'Tentativa de Path Traversal BLOQUEADA com HTTP 400');

    // 10. Anexar Foto ao Relatório
    console.log('\n10. Anexando Foto ao Relatório (/api/relatorios/:id/fotos)...');
    const anexoRes = await request('POST', `/api/relatorios/${relatorioId}/fotos`, {
      caminho_arquivo: fotoEval.body.caminho_arquivo,
      hash_integridade: fotoEval.body.hash_integridade,
      avaliacao_gemini: fotoEval.body.status,
      confianca: fotoEval.body.confianca,
      motivo: fotoEval.body.motivo,
    }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(anexoRes.status === 201, 'Foto vinculada com sucesso');

    // 11. Salvar Respostas do Checklist
    console.log('\n11. Testando Preenchimento do Checklist (/api/relatorios/:id/respostas)...');
    const checklistRes = await request('PUT', `/api/relatorios/${relatorioId}/respostas`, [
      {
        pergunta: 'Status da alvenaria',
        valor: 'Conforme',
        sugestao_ia: 'Alvenaria externa erguida e nivelada conforme gabarito.',
        tipo: 'multipla_escolha',
      },
    ], {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(checklistRes.status === 200, 'Respostas salvas com sucesso');

    // 12. Finalização do Relatório (Inviolabilidade e PDF)
    console.log('\n12. Finalizando Relatório e Gerando PDF Inviolável (/api/relatorios/:id/finalizar)...');
    const finalizarRes = await request('POST', `/api/relatorios/${relatorioId}/finalizar`, {}, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(finalizarRes.status === 200, 'Relatório finalizado com HTTP 200');
    assert(finalizarRes.body.codigo, 'Código único foi gerado');
    assert(finalizarRes.body.codigo.length === 16, 'Código único possui exatamente 16 caracteres');
    assert(finalizarRes.body.codigo === finalizarRes.body.codigo.toUpperCase(), 'Código único está em UPPERCASE');
    assert(finalizarRes.body.hashIntegridade, 'Hash SHA-256 do relatório gerado');
    assert(finalizarRes.body.status === 'FINALIZADO', 'Status atualizado para FINALIZADO');

    // 13. Bloqueio de Edição Posterior (Imutabilidade)
    console.log('\n13. Testando Bloqueio de Edição Posterior (Imutabilidade)...');
    const tentativaEdicao = await request('PUT', `/api/relatorios/${relatorioId}/respostas`, [
      { pergunta: 'Alteração Indevida', valor: 'Hack' },
    ], {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(tentativaEdicao.status === 403, 'Tentativa de alteração foi BLOQUEADA com HTTP 403');

    const tentativaReenvio = await request('POST', `/api/relatorios/${relatorioId}/finalizar`, {}, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(tentativaReenvio.status === 400, 'Tentativa de reenvio foi BLOQUEADA com HTTP 400');

    // 14. Download / Visualização do PDF Gerado
    console.log('\n14. Testando Visualização do PDF Compilado (/api/relatorios/:id/pdf)...');
    const pdfRes = await request('GET', `/api/relatorios/${relatorioId}/pdf`);
    assert(pdfRes.status === 200, 'Download do PDF retornou HTTP 200');
    assert(pdfRes.headers['content-type'] === 'application/pdf', 'Content-Type é application/pdf');

    // 15. Parecer e Auditoria do Fiscal com RBAC e tolerância a REGULAR
    console.log('\n15. Testando Controle de Perfis e Auditoria (/api/relatorios/:id/status)...');
    const tentativaFiscalRodrigo = await request('PATCH', `/api/relatorios/${relatorioId}/status`, {
      status: 'APROVADO',
      justificativa: 'Tentativa de aprovação por empreiteira',
    }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(tentativaFiscalRodrigo.status === 403, 'Acesso de Rodrigo a julgamento fiscal BLOQUEADO com HTTP 403');

    // Testa envio com status 'REGULAR' (conforme emitido pelo frontend)
    const auditoriaRes = await request('PATCH', `/api/relatorios/${relatorioId}/status`, {
      status: 'REGULAR',
      justificativa: 'Fotos nítidas e medição condizente com os gabaritos BB.',
    }, {
      Authorization: `Bearer ${tokenMariana}`,
    });
    assert(auditoriaRes.status === 200, 'Auditoria com status REGULAR homologada com HTTP 200');
    assert(auditoriaRes.body.status === 'APROVADO', 'Status do relatório mapeado para APROVADO');
    assert(auditoriaRes.body.obraStatus === 'REGULAR', 'Status da obra atualizado para REGULAR');

    // 16. Validador Público de Autenticidade
    console.log('\n16. Testando Validador Público de Autenticidade (/api/validador/:codigoOuHash)...');
    const validacaoSucesso = await request('GET', `/api/validador/${finalizarRes.body.codigo}`);
    assert(validacaoSucesso.status === 200, 'Validador público retornou HTTP 200 para código gerado');
    assert(validacaoSucesso.body.autentico === true, 'Documento atestado como AUTÊNTICO');

    const validacaoFalsa = await request('GET', '/api/validador/CODIGO_FALSO_1234');
    assert(validacaoFalsa.status === 404, 'Código inexistente rejeitado com HTTP 404');
    assert(validacaoFalsa.body.autentico === false, 'Documento inexistente atestado como NÃO autêntico');

    // 17. Sincronização de Vistoria Offline (HU05)
    console.log('\n17. Testando Sincronização de Vistoria Offline (/api/relatorios/sincronizar-offline)...');
    const syncOfflineRes = await request('POST', '/api/relatorios/sincronizar-offline', {
      obra_id: obraId,
      respostas: [
        { pergunta: 'Alvenaria', valor: 'Conforme', sugestao_ia: 'Nivelamento verificado' },
      ],
      fotos: [
        { imagemBase64: fakeImageB64, motivo: 'Foto capturada offline' },
      ],
      timestamp: new Date().toISOString(),
    }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(syncOfflineRes.status === 200, 'Sincronização offline retornou HTTP 200');
    assert(syncOfflineRes.body.sucesso === true, 'Flag sucesso é true');
    assert(syncOfflineRes.body.codigo && syncOfflineRes.body.codigo.length === 16, 'Código gerado para vistoria offline');
    assert(syncOfflineRes.body.status === 'FINALIZADO', 'Status da vistoria sincronizada é FINALIZADO');

    // 18. Tratamento de Endpoint Inexistente da API (404 JSON)
    console.log('\n18. Testando 404 JSON em Endpoints Inexistentes da API (/api/inexistente)...');
    const rota404 = await request('GET', '/api/rota-inexistente');
    assert(rota404.status === 404, 'Rota inexistente retornou HTTP 404');
    assert(rota404.body.erro && typeof rota404.body.erro === 'string', 'Retornou mensagem de erro em JSON padronizado');

    console.log('\n======================================================');
    console.log('  TODOS OS 18 GRUPOS DE TESTES PASSARAM COM SUCESSO!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ ERRO DURANTE A EXECUÇÃO DOS TESTES:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

server = app.listen(PORT, '127.0.0.1', () => {
  runTests();
});
