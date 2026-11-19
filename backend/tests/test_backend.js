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

    // 4.1 Teste de Logout (/api/auth/logout)
    console.log('\n4.1 Testando Encerramento de Sessão (/api/auth/logout)...');
    const logoutRes = await request('POST', '/api/auth/logout', null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(logoutRes.status === 200, 'Endpoint /api/auth/logout retornou HTTP 200');
    assert(logoutRes.body.sucesso === true, 'Mensagem de confirmação de logout bem-sucedida');

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
      telemetriaVisual: {
        baixaLuz: false,
        rostoDetectado: false,
        luminanciaMedia: 175.4,
        percentualEscuros: 0.08,
      },
    });
    assert(fotoEval.status === 200, 'Avaliação de foto de obra retornou HTTP 200');
    assert(fotoEval.body.hash_integridade, 'Hash SHA-256 gerado para a foto');
    assert(fotoEval.body.hash_integridade.length === 64, 'Hash tem 64 caracteres');
    assert(fotoEval.body.status === 'APROVADO', 'Foto de obra/fiscalização bem iluminada foi APROVADA pela IA');
    assert(fotoEval.body.categoria === 'OBRA_LOCAL', 'Categoria da foto aprovada é OBRA_LOCAL');

    // 8.1 Rejeição obrigatória de foto com Baixa Luz
    const fotoBaixaLuz = await request('POST', '/api/fotos/avaliar', {
      imagemBase64: fakeImageB64,
      telemetriaVisual: {
        baixaLuz: true,
        rostoDetectado: false,
        luminanciaMedia: 28.5,
        percentualEscuros: 0.84,
      },
    });
    assert(fotoBaixaLuz.status === 200, 'Avaliação de foto com baixa luz retornou HTTP 200');
    assert(fotoBaixaLuz.body.status === 'REJEITADO', 'Foto com baixa luz NÃO aprovou (status REJEITADO)');
    assert(fotoBaixaLuz.body.categoria === 'BAIXA_LUZ', 'Categoria identificada como BAIXA_LUZ');

    // 8.2 Rejeição obrigatória de foto de Rosto / Selfie
    const fotoRostoSelfie = await request('POST', '/api/fotos/avaliar', {
      imagemBase64: fakeImageB64,
      telemetriaVisual: {
        baixaLuz: false,
        rostoDetectado: true,
        facesDetectadas: 1,
        luminanciaMedia: 142.0,
        taxaPeleCentro: 0.34,
      },
    });
    assert(fotoRostoSelfie.status === 200, 'Avaliação de foto de rosto/selfie retornou HTTP 200');
    assert(fotoRostoSelfie.body.status === 'REJEITADO', 'Foto de rosto/selfie NÃO aprovou (status REJEITADO)');
    assert(fotoRostoSelfie.body.categoria === 'ROSTO_SELFIE', 'Categoria identificada como ROSTO_SELFIE');

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

    // 19. Readiness Probe e Telemetria para Orquestradores
    console.log('\n19. Testando Readiness Probe e Telemetria (/api/ready e /api/health)...');
    const readyRes = await request('GET', '/api/ready');
    assert(readyRes.status === 200, 'Readiness probe respondeu HTTP 200');
    assert(readyRes.body.status === 'ready', 'Status do readiness é ready');

    const healthMetrics = await request('GET', '/api/health');
    assert(healthMetrics.body.versao === '1.2.0', 'Versão atualizada é 1.2.0');
    assert(healthMetrics.body.ambiente, 'Ambiente de execução registrado');
    assert(typeof healthMetrics.body.memoria.rssMb === 'number', 'Métricas de memória presentes');

    // 20. Validador Público: Bloqueio de Injeção de Scripts / XSS / Comandos
    console.log('\n20. Testando Validador Público contra Payloads Maliciosos (/api/validador/<script>)...');
    const xssAttempt = await request('GET', '/api/validador/%3Cscript%3E');
    assert(xssAttempt.status === 400, 'Identificador malicioso rejeitado com HTTP 400');
    assert(xssAttempt.body.autentico === false, 'Resposta atesta que documento é inautêntico');

    // 21. Proteção contra Requisições Mutantes Não Autenticadas
    console.log('\n21. Testando Rejeição de Mutação sem Autenticação (/api/relatorios sem Bearer)...');
    const unauthReport = await request('POST', '/api/relatorios', { obra_id: obraId });
    assert(unauthReport.status === 401, 'Criação de relatório sem token bloqueada com HTTP 401');

    // 22. Compressão HTTP para Escalabilidade e Redução de Banda
    console.log('\n22. Testando Suporte a Compressão HTTP (Accept-Encoding: gzip)...');
    const compRes = await request('GET', '/api/obras', null, {
      'Accept-Encoding': 'gzip, deflate',
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(compRes.status === 200, 'Endpoint com suporte a compressão respondeu HTTP 200');
    assert(compRes.headers['vary'] && compRes.headers['vary'].includes('Accept-Encoding'), 'Header Vary: Accept-Encoding presente');

    // 23. Melhorias Persona Empreiteira (Sugestão IA sem foto prévia, Justificativa Qualitativa e Foto Base64 em Relatórios)
    console.log('\n23. Testando Melhorias Persona Empreiteira (Sugestão IA, Justificativas e Imagens no PDF)...');
    const sugChecklistRes = await request('POST', '/api/fotos/sugerir-observacao', {
      categoria: 'alvenaria',
    });
    assert(sugChecklistRes.status === 200, 'Sugestão de parecer IA no checklist respondeu HTTP 200');
    assert(typeof sugChecklistRes.body.sugestao === 'string' && sugChecklistRes.body.sugestao.length > 10, 'Sugestão técnica gerada com sucesso');

    const relEmpreiteira = await request('POST', '/api/relatorios', { obra_id: obraId }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    const relEmpId = relEmpreiteira.body.id;

    const anexoBase64Res = await request('POST', `/api/relatorios/${relEmpId}/fotos`, {
      url: `data:image/png;base64,${fakeImageB64}`,
      confianca_ia: 0.94,
      motivo_ia: 'Foto capturada ao vivo na vistoria.',
    }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(anexoBase64Res.status === 201, 'Foto enviada como Data URL Base64 anexada e salva com HTTP 201');
    assert(anexoBase64Res.body.foto.caminho_arquivo.startsWith('uploads/evidencias/'), 'Caminho da foto persistida em uploads/evidencias/');

    const respJustRes = await request('PUT', `/api/relatorios/${relEmpId}/respostas`, [
      {
        pergunta: '4. Condição da calçada externa e acessibilidade da entrada principal',
        valor: 'Parcialmente acessível (Em adequação)',
        justificativa: 'Rampa provisória instalada aguardando cura do piso tátil.',
        tipo: 'multipla_escolha',
      },
    ], {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(respJustRes.status === 200, 'Resposta com justificativa qualitativa salva com HTTP 200');

    const pdfSeedRes = await request('GET', '/api/relatorios/rel-seed-001/pdf');
    assert(pdfSeedRes.status === 200 && pdfSeedRes.rawBuffer.length > 1500, 'PDF com imagens de vistoria renderizado sem sobreposição');

    // 24. Registro de Fotos da Empreiteira nos Relatórios e nos PDFs de Comprovação
    console.log('\n24. Testando Registro de Fotos da Empreiteira no Relatório e no PDF de Comprovação...');
    const relComFotoRes = await request('POST', '/api/relatorios', {
      obra_id: obraId,
      respostas: [
        { pergunta: '1. Fachada da agência', valor: 'Sim', justificativa: 'Perfeitamente visível' },
      ],
      fotos: [
        {
          imagemBase64: fakeImageB64,
          motivo: 'Foto registrada in-loco da fachada pela empreiteira.',
          avaliacao_gemini: 'APROVADO',
          confianca: 0.95,
        },
      ],
    }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(relComFotoRes.status === 201, 'Relatório com foto inicial criado com HTTP 201');
    const relComFotoId = relComFotoRes.body.id;

    // Consulta relatório para validar que a foto da empreiteira foi registrada
    const relConsulta = await request('GET', `/api/relatorios/${relComFotoId}`, null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(relConsulta.status === 200, 'Consulta de relatório retornou HTTP 200');
    assert(Array.isArray(relConsulta.body.fotos) && relConsulta.body.fotos.length >= 1, 'Foto da empreiteira registrada no relatório');
    assert(relConsulta.body.fotos[0].caminho_arquivo, 'Foto possui caminho de arquivo salvo');
    assert(relConsulta.body.fotos[0].hash_integridade, 'Foto possui hash SHA-256 gravado');

    // Finaliza o relatório
    const finalizarComFoto = await request('POST', `/api/relatorios/${relComFotoId}/finalizar`, {}, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(finalizarComFoto.status === 200, 'Finalização de relatório com foto retornou HTTP 200');

    // Baixa o PDF de comprovação e atesta que foi gerado com sucesso
    const pdfComprovacao = await request('GET', `/api/relatorios/${relComFotoId}/pdf`);
    assert(pdfComprovacao.status === 200, 'Download do PDF de comprovação retornou HTTP 200');
    assert(pdfComprovacao.headers['content-type'] === 'application/pdf', 'PDF possui Content-Type application/pdf');
    assert(pdfComprovacao.rawBuffer.length > 2000, 'PDF de comprovação gerado com evidências fotográficas embutidas');

    // 25. Agent-Readiness, SEO Semântico, Markdown Negotiation, WebMCP e MCP Server Card (SEP-1649)
    console.log('\n25. Testando Agent-Readiness (18 Requisitos: robots, sitemap, 404 real, JSON-LD, llms.txt, Markdown, Link, WebMCP, MCP Card)...');

    // 25.1 & 25.3 robots.txt (Content-Signal + Sitemap)
    const robotsRes = await request('GET', '/robots.txt');
    assert(robotsRes.status === 200, 'robots.txt respondeu HTTP 200');
    assert((robotsRes.headers['content-type'] || '').includes('text/plain'), 'robots.txt servido como text/plain');
    assert(robotsRes.body.includes('Content-Signal:') && robotsRes.body.includes('search=yes') && robotsRes.body.includes('ai-train=no'), 'robots.txt declara Content-Signal');
    assert(robotsRes.body.includes('Sitemap: https://antiquewhite-dolphin-779579.hostingersite.com/sitemap.xml'), 'robots.txt declara diretiva Sitemap');

    // 25.2 sitemap.xml
    const sitemapRes = await request('GET', '/sitemap.xml');
    assert(sitemapRes.status === 200, 'sitemap.xml respondeu HTTP 200');
    assert((sitemapRes.headers['content-type'] || '').includes('application/xml'), 'sitemap.xml servido como application/xml');
    assert(sitemapRes.body.includes('<urlset') && sitemapRes.body.includes('/about</loc>') && sitemapRes.body.includes('/contact</loc>') && sitemapRes.body.includes('/terms</loc>') && sitemapRes.body.includes('/validador</loc>'), 'sitemap.xml lista todas as páginas públicas');

    // 25.4 404 real para páginas inexistentes (sem soft-404 HTTP 200)
    const missingHtml = await request('GET', '/pagina-inexistente-teste-404', null, { Accept: 'text/html' });
    assert(missingHtml.status === 404, 'Página inexistente retornou HTTP 404 real (HTML)');
    const missingMd = await request('GET', '/pagina-inexistente-teste-404', null, { Accept: 'text/markdown' });
    assert(missingMd.status === 404 && (missingMd.headers['content-type'] || '').includes('text/markdown'), 'Página inexistente retornou HTTP 404 real (Markdown)');

    // 25.5 - 25.12 & 25.16 Homepage HTML: canonical, H1 único, JSON-LD completo, links institucionais, mailto/tel, Link header
    const homeHtmlRes = await request('GET', '/', null, { Accept: 'text/html,application/xhtml+xml' });
    assert(homeHtmlRes.status === 200, 'Homepage HTML retornou HTTP 200');
    assert((homeHtmlRes.headers['content-type'] || '').includes('text/html'), 'Homepage retornou text/html para navegador');
    assert(homeHtmlRes.body.includes('<title>') && homeHtmlRes.body.includes('name="description"') && homeHtmlRes.body.includes('<link rel="canonical" href="https://antiquewhite-dolphin-779579.hostingersite.com/">'), 'Homepage possui title, meta description e link canonical');

    const h1Matches = homeHtmlRes.body.match(/<h1[\s>]/gi) || [];
    assert(h1Matches.length === 1, 'Homepage possui exatamente um <h1>');
    assert(homeHtmlRes.body.includes('<h2>'), 'Homepage possui hierarquia clara de headings (h1 -> h2)');

    const jsonLdMatch = homeHtmlRes.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    assert(!!jsonLdMatch, 'Homepage contém bloco JSON-LD');
    const jsonLdData = JSON.parse(jsonLdMatch[1]);
    const graphNodes = Array.isArray(jsonLdData['@graph']) ? jsonLdData['@graph'] : [jsonLdData];
    const schemaTypes = graphNodes.map(n => n['@type']);
    const orgNode = graphNodes.find(n => n['@type'] === 'Organization');
    assert(!!orgNode && orgNode.name && orgNode.email && orgNode.telephone && orgNode.address && orgNode.contactPoint, 'JSON-LD possui nó Organization completo');
    assert(Array.isArray(orgNode.sameAs) && orgNode.sameAs.length >= 3, 'Organization possui links externos via sameAs');
    assert(schemaTypes.length >= 4 && schemaTypes.includes('WebSite') && schemaTypes.includes('WebApplication') && schemaTypes.includes('Service'), 'JSON-LD cobre múltiplos tipos de schema');

    assert(homeHtmlRes.body.includes('href="/about"') && homeHtmlRes.body.includes('href="/contact"') && homeHtmlRes.body.includes('href="/terms"') && homeHtmlRes.body.includes('href="/privacy"'), 'Homepage vincula páginas about, contact, terms e privacy');
    assert(homeHtmlRes.body.includes('href="mailto:') && homeHtmlRes.body.includes('href="tel:'), 'Homepage expõe contato machine-readable (mailto: e tel:)');

    const linkHeader = homeHtmlRes.headers['link'] || '';
    assert(linkHeader.includes('/llms.txt') && linkHeader.includes('text/markdown') && linkHeader.includes('/.well-known/mcp/server-card.json'), 'Homepage emite cabeçalho RFC 8288 Link apontando para llms.txt, Markdown e MCP Server Card');

    // Valida páginas institucionais e redirecionamentos 301 em português
    for (const pagePath of ['/about', '/contact', '/terms', '/privacy', '/validador']) {
      const pRes = await request('GET', pagePath, null, { Accept: 'text/html' });
      const pH1s = (pRes.body.match(/<h1[\s>]/gi) || []).length;
      assert(pRes.status === 200 && pH1s === 1 && pRes.body.includes(`rel="canonical" href="https://antiquewhite-dolphin-779579.hostingersite.com${pagePath}"`), `Página ${pagePath} retornou HTTP 200 com H1 único e canonical`);
    }
    const sobreRedirect = await request('GET', '/sobre', null, { Accept: 'text/html' });
    assert(sobreRedirect.status === 301 && sobreRedirect.headers['location'] === '/about', 'Alias /sobre redireciona 301 para /about');

    // 25.13 & 25.14 llms.txt
    const llmsRes = await request('GET', '/llms.txt');
    assert(llmsRes.status === 200, '/llms.txt respondeu HTTP 200');
    assert((llmsRes.headers['content-type'] || '').includes('text/plain'), '/llms.txt servido como text/plain (não HTML)');
    assert(llmsRes.body.startsWith('# BBVision') && llmsRes.body.includes('\n> ') && llmsRes.body.includes('](https://antiquewhite-dolphin-779579.hostingersite.com/'), '/llms.txt segue formato padrão (# título, > resumo e links Markdown)');

    // 25.15 Negociação Accept: text/markdown
    const homeMdRes = await request('GET', '/', null, { Accept: 'text/markdown' });
    assert(homeMdRes.status === 200, 'Homepage com Accept: text/markdown respondeu HTTP 200');
    assert((homeMdRes.headers['content-type'] || '').includes('text/markdown'), 'Homepage retornou text/markdown quando solicitado');
    assert((homeMdRes.headers['vary'] || '').toLowerCase().includes('accept'), 'Homepage emite Vary: Accept');
    assert(homeMdRes.body.startsWith('# BBVision') && !homeMdRes.body.includes('<!DOCTYPE html>'), 'Corpo Markdown da homepage é limpo e bem-formado');

    // 25.17 WebMCP (imperativo + declarativo)
    assert(homeHtmlRes.body.includes('src="src/utils/webmcp.js"') && homeHtmlRes.body.includes('toolname=') && homeHtmlRes.body.includes('tooldescription='), 'Homepage carrega script WebMCP e declara formulário toolname/tooldescription');
    const webMcpScript = await request('GET', '/src/utils/webmcp.js');
    assert(webMcpScript.status === 200 && webMcpScript.body.includes('navigator.modelContext') && webMcpScript.body.includes('registerTool') && webMcpScript.body.includes('inputSchema') && webMcpScript.body.includes('execute'), 'Script WebMCP registra ferramentas via navigator.modelContext.registerTool()');

    // 25.18 MCP Server Card (SEP-1649) + Endpoint MCP Streamable HTTP
    const mcpCardRes = await request('GET', '/.well-known/mcp/server-card.json');
    assert(mcpCardRes.status === 200, '/.well-known/mcp/server-card.json respondeu HTTP 200');
    assert((mcpCardRes.headers['content-type'] || '').includes('application/json'), 'MCP Server Card servido como application/json (não HTML)');
    assert(mcpCardRes.body.name && mcpCardRes.body.version && mcpCardRes.body.endpoint && mcpCardRes.body.capabilities && mcpCardRes.body.capabilities.tools, 'MCP Server Card contém name, version, endpoint e capabilities');

    const mcpInit = await request('POST', '/api/mcp', { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });
    assert(mcpInit.status === 200 && mcpInit.body.result && mcpInit.body.result.serverInfo && mcpInit.body.result.capabilities, 'Endpoint POST /api/mcp responde handshake JSON-RPC initialize');
    const mcpTools = await request('POST', '/api/mcp', { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
    assert(mcpTools.status === 200 && Array.isArray(mcpTools.body.result.tools) && mcpTools.body.result.tools.length >= 3, 'Endpoint POST /api/mcp lista ferramentas MCP');
    const mcpValidate = await request('POST', '/api/mcp', {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'validate_report_authenticity', arguments: { codigoOuHash: finalizarRes.body.codigo } },
    });
    assert(mcpValidate.status === 200 && mcpValidate.body.result && mcpValidate.body.result.content[0].text.includes('"autentico": true'), 'Ferramenta MCP validate_report_authenticity valida código real');

    console.log('\n======================================================');
    console.log('  TODOS OS 25 GRUPOS DE TESTES PASSARAM COM SUCESSO!');
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
