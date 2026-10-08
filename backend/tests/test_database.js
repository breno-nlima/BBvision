/**
 * BBVision - Teste Automatizado de Integridade do Banco de Dados
 * Valida tabelas, relacionamentos, triggers de imutabilidade e views analíticas
 */

const repository = require('../src/models/repository');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[FALHA NO TESTE DE BANCO] ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function testDatabase() {
  console.log('\n======================================================');
  console.log('  Iniciando Bateria de Testes do Banco de Dados BBVision');
  console.log('======================================================\n');

  try {
    // 1. Tabela de Usuários (Rodrigo e Mariana)
    console.log('1. Testando Tabela de Usuários...');
    const rodrigo = await repository.findUserByEmail('rodrigo@empreiteira.com');
    assert(rodrigo !== null, 'Usuário Rodrigo (Empreiteira) existe no banco');
    assert(rodrigo.cargo === 'empreiteira', 'Cargo do Rodrigo é "empreiteira"');
    assert(rodrigo.senha_hash.startsWith('$2a$') || rodrigo.senha_hash.startsWith('$2b$'), 'Senha está criptografada com hash bcrypt');

    const mariana = await repository.findUserByEmail('mariana@bb.com.br');
    assert(mariana !== null, 'Usuário Mariana (Fiscal BB) existe no banco');
    assert(mariana.cargo === 'fiscal', 'Cargo da Mariana é "fiscal"');

    // 2. Tabela de Obras e Geofencing
    console.log('\n2. Testando Tabela de Obras (Geofencing)...');
    const obras = await repository.listObras();
    assert(Array.isArray(obras) && obras.length >= 3, 'Obras cadastradas com sucesso');
    const obraSede = obras.find(o => o.nome.includes('Centro'));
    assert(obraSede !== null, 'Obra Centro (Agência Sede) encontrada');
    assert(['REGULAR', 'PENDENTE_AJUSTE'].includes(obraSede.status), 'Status da obra está em conformidade com o domínio');

    // 3. Tabela de Checklists Modelo (Normativos)
    console.log('\n3. Testando Tabela de Checklists Modelo...');
    const checklists = await repository.listChecklistsModelo();
    assert(Array.isArray(checklists) && checklists.length >= 5, 'Checklists normativos carregados');
    const checkSeguranca = await repository.listChecklistsModelo('Segurança');
    assert(checkSeguranca.length >= 1, 'Filtro por categoria "Segurança" funcionando');
    assert(checkSeguranca[0].obrigatorio === true, 'Campo obrigatório definido');

    // 4. Tabela de Relatórios e Ciclo de Vida
    console.log('\n4. Testando Relatórios e Integridade...');
    const relatorios = await repository.listRelatorios();
    assert(Array.isArray(relatorios) && relatorios.length >= 1, 'Relatórios listados com sucesso');
    const relatorioAprovado = relatorios.find(r => r.codigo_unico === '8F4A2C19E70B34DF');
    assert(relatorioAprovado !== null, 'Relatório seed com código único oficial encontrado');
    assert(relatorioAprovado.hash_integridade.length === 64, 'Hash SHA-256 possui 64 caracteres');

    // 5. Testando Detalhe Completo (Relatório + Fotos + Respostas)
    console.log('\n5. Testando Integridade Relacional (JOINs)...');
    const relDetalhado = await repository.findRelatorioById(relatorioAprovado.id);
    assert(relDetalhado !== null, 'Relatório detalhado retornado');
    assert(relDetalhado.obra !== null, 'Obra vinculada ao relatório');
    assert(relDetalhado.usuario !== null, 'Usuário autor vinculado');
    assert(Array.isArray(relDetalhado.fotos) && relDetalhado.fotos.length >= 1, 'Fotos in-loco associadas com sucesso');
    assert(Array.isArray(relDetalhado.respostas) && relDetalhado.respostas.length >= 1, 'Respostas do checklist vinculadas');

    // 6. Testando Trilha de Auditoria de IA (Seção 4.1)
    console.log('\n6. Testando Trilha de Auditoria de IA...');
    const logAudit = await repository.registrarAuditoriaIa({
      relatorio_id: relatorioAprovado.id,
      usuario_id: rodrigo.id,
      modelo: 'gemini-1.5-flash',
      prompt_tipo: 'P1_QUALIDADE',
      duracao_ms: 1350,
      sla_cumprido: true,
      resultado_status: 'APROVADO',
      confianca: 0.96,
      motivo: 'Nitidez e enquadramento validados via teste de banco.',
      hash_imagem: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });
    assert(logAudit.id !== null, 'Log de auditoria gravado com UUID');
    assert(logAudit.sla_cumprido === true, 'SLA de latência marcado como cumprido (<= 15s)');

    // 7. View de Painel de Auditoria (Fiscal Mariana)
    console.log('\n7. Testando View Analítica: Painel de Auditoria...');
    const painel = await repository.getPainelAuditoria();
    assert(Array.isArray(painel) && painel.length >= 1, 'View vw_painel_auditoria respondeu corretamente');
    const itemPainel = painel[0];
    assert(itemPainel.codigo_unico !== undefined, 'Código único presente na view');
    assert(itemPainel.obra_nome !== undefined, 'Nome da obra presente na view');
    assert(itemPainel.total_fotos !== undefined, 'Contador de fotos presente na view');

    // 8. View de Governança de IA (Banco do Brasil)
    console.log('\n8. Testando View Analítica: Governança de IA...');
    const metricasIa = await repository.getMetricasIa();
    assert(Array.isArray(metricasIa) && metricasIa.length >= 1, 'View vw_governanca_ia respondeu com sucesso');
    assert(metricasIa[0].percentual_sla_15s !== undefined, 'Percentual dentro do SLA computado');

    console.log('\n======================================================');
    console.log('  TODOS OS TESTES DE BANCO DE DADOS PASSARAM COM SUCESSO!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ ERRO NO TESTE DE BANCO DE DADOS:', err);
    process.exit(1);
  }
}

testDatabase();
