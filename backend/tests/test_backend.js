/**
 * BBVision - Teste Automatizado de Integração End-to-End da API Backend
 * Valida todos os fluxos e contratos oficiais do Documento de Entrega TakeOff
 */

const http = require('http');
const path = require('path');
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
  console.log('  Iniciando Bateria de Testes do Backend BBVision');
  console.log('======================================================\n');

  try {
    // 1. Healthcheck
    console.log('1. Testando Health Check da API...');
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'Health check respondeu HTTP 200');
    assert(health.body.status === 'online', 'Status da API é online');
    assert(health.body.sistema.includes('BBVision'), 'Nome do sistema está correto');

    // 2. Autenticação (Rodrigo - Empreiteira)
    console.log('\n2. Testando Autenticação (Persona Rodrigo)...');
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

    // 5. Listagem de Obras
    console.log('\n5. Testando Listagem de Obras (/api/obras)...');
    const obrasRes = await request('GET', '/api/obras', null, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(obrasRes.status === 200, 'Listagem de obras retornou HTTP 200');
    assert(Array.isArray(obrasRes.body) && obrasRes.body.length > 0, 'Retornou array com obras cadastradas');
    const obraId = obrasRes.body[0].id;

    // 6. Criar Relatório de Vistoria
    console.log('\n6. Testando Criação de Relatório de Vistoria (/api/relatorios)...');
    const relRes = await request('POST', '/api/relatorios', { obra_id: obraId }, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(relRes.status === 201, 'Criação de relatório retornou HTTP 201');
    assert(relRes.body.id, 'ID do relatório foi criado');
    assert(relRes.body.status === 'EM_ANDAMENTO', 'Status inicial é EM_ANDAMENTO');
    const relatorioId = relRes.body.id;

    // 7. Avaliação de Foto com IA Gemini e Hash SHA-256
    console.log('\n7. Testando Avaliação de Imagem com Gemini & Hash SHA-256 (/api/fotos/avaliar)...');
    // Simula imagem em base64 (pequeno JPEG válido)
    const fakeImageB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const fotoEval = await request('POST', '/api/fotos/avaliar', {
      imagemBase64: fakeImageB64,
    });
    assert(fotoEval.status === 200, 'Avaliação de foto retornou HTTP 200');
    assert(fotoEval.body.hash_integridade, 'Hash SHA-256 gerado para a foto');
    assert(fotoEval.body.hash_integridade.length === 64, 'Hash tem 64 caracteres');
    assert(['APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL'].includes(fotoEval.body.status), 'Status da foto é válido');

    // 8. Anexar Foto ao Relatório
    console.log('\n8. Anexando Foto ao Relatório (/api/relatorios/:id/fotos)...');
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

    // 9. Salvar Respostas do Checklist
    console.log('\n9. Testando Preenchimento do Checklist (/api/relatorios/:id/respostas)...');
    const checklistRes = await request('PUT', `/api/relatorios/${relatorioId}/respostas`, [
      {
        pergunta: 'Status da alvenaria',
        valor: 'Conforme',
        sugestao_ia: 'Alvenaria externa erguida e nivelada conforme gabarito de referência.',
        tipo: 'multipla_escolha',
      },
      {
        pergunta: 'Quadro elétrico e barramento',
        valor: 'Conforme',
        sugestao_ia: 'Instalações elétricas com aterramento visível.',
        tipo: 'multipla_escolha',
      },
    ], {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(checklistRes.status === 200, 'Respostas salvas com sucesso');

    // 10. Finalização do Relatório (Inviolabilidade, PDF e E-mail)
    console.log('\n10. Finalizando Relatório e Gerando PDF Inviolável (/api/relatorios/:id/finalizar)...');
    const finalizarRes = await request('POST', `/api/relatorios/${relatorioId}/finalizar`, {}, {
      Authorization: `Bearer ${tokenRodrigo}`,
    });
    assert(finalizarRes.status === 200, 'Relatório finalizado com HTTP 200');
    assert(finalizarRes.body.codigo, 'Código único foi gerado');
    assert(finalizarRes.body.codigo.length === 16, 'Código único possui exatamente 16 caracteres');
    assert(finalizarRes.body.codigo === finalizarRes.body.codigo.toUpperCase(), 'Código único está em UPPERCASE');
    assert(finalizarRes.body.hashIntegridade, 'Hash SHA-256 do relatório gerado');
    assert(finalizarRes.body.status === 'FINALIZADO', 'Status atualizado para FINALIZADO');

    // 11. Bloqueio de Edição Posterior (Inviolabilidade)
    console.log('\n11. Testando Bloqueio de Edição Posterior (Imutabilidade)...');
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

    // 12. Download / Visualização do PDF Gerado
    console.log('\n12. Testando Visualização do PDF Compilado (/api/relatorios/:id/pdf)...');
    const pdfRes = await request('GET', `/api/relatorios/${relatorioId}/pdf`);
    assert(pdfRes.status === 200, 'Download do PDF retornou HTTP 200');
    assert(pdfRes.headers['content-type'] === 'application/pdf', 'Content-Type é application/pdf');
    assert(pdfRes.rawBuffer.length > 500, `Arquivo PDF compilado com sucesso (${pdfRes.rawBuffer.length} bytes)`);

    // 13. Parecer e Auditoria do Fiscal (Mariana)
    console.log('\n13. Testando Auditoria do Fiscal Mariana (/api/relatorios/:id/status)...');
    const auditoriaRes = await request('PATCH', `/api/relatorios/${relatorioId}/status`, {
      status: 'APROVADO',
      justificativa: 'Fotos nítidas, hashes validados e medição condizente com a medição física.',
    }, {
      Authorization: `Bearer ${tokenMariana}`,
    });
    assert(auditoriaRes.status === 200, 'Auditoria realizada com HTTP 200');
    assert(auditoriaRes.body.status === 'APROVADO', 'Status do relatório é APROVADO');
    assert(auditoriaRes.body.obraStatus === 'REGULAR', 'Status da obra atualizado para REGULAR');

    console.log('\n======================================================');
    console.log('  TODOS OS 13 TESTES DE INTEGRAÇÃO PASSARAM COM SUCESSO!');
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
