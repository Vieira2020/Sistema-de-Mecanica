import assert from 'node:assert';

// Mock localStorage for Node.js environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

// Import database layer
const { db } = await import('../src/lib/supabase.js');

async function runTests() {
  console.log('🧪 Iniciando suíte de testes de validação...');

  // Test 1: Fetch initial seed users
  const users = await db.getUsers();
  assert.strictEqual(users.length >= 2, true, 'Deveria conter pelo menos admin e mecânico');
  console.log('✅ Teste 1: Usuários do sistema verificados');

  // Test 2: Admin login vs Mechanic role
  const adminUser = users.find(u => u.perfil === 'ADMIN');
  const mecUser = users.find(u => u.perfil === 'MECANICO');
  assert.strictEqual(adminUser.perfil, 'ADMIN', 'Perfil do administrador');
  assert.strictEqual(mecUser.perfil, 'MECANICO', 'Perfil do mecânico');
  console.log('✅ Teste 2: Perfis RBAC (Admin e Mecânico) validados');

  // Test 3: Fetch Clients & Vehicles
  const clients = await db.getClients();
  const vehicles = await db.getVehicles();
  assert.strictEqual(clients.length >= 1, true, 'Clientes carregados');
  assert.strictEqual(vehicles.length >= 1, true, 'Veículos carregados');
  console.log('✅ Teste 3: Entidades de Clientes e Veículos OK');

  // Test 4: Create new OS
  const newOS = await db.createOS({
    cliente_id: clients[0].id,
    veiculo_id: vehicles[0].id,
    tipo_servico: 'AMBOS',
    mao_de_obra: '300.00',
    observacao_inicial: 'Teste de criação de OS'
  }, adminUser);

  assert.strictEqual(newOS.status, 'RECEBIDO', 'Novo status inicial deve ser RECEBIDO');
  assert.strictEqual(newOS.mao_de_obra, 300, 'Valor da mão de obra gravado');
  console.log('✅ Teste 4: Criação de OS com status RECEBIDO bem-sucedida');

  // Test 5: Status Transition with timeline logging
  const updatedOS = await db.updateOSStatus(newOS.id, 'EM_FUNILARIA', 'Encaminhado para funilaria', mecUser);
  assert.strictEqual(updatedOS.status, 'EM_FUNILARIA', 'Status deve mudar para EM_FUNILARIA');
  assert.strictEqual(updatedOS.timeline.length >= 2, true, 'Histórico deve registrar cada transição');
  console.log('✅ Teste 5: Transição de status e timeline imutável OK');

  // Test 6: Adding parts to OS and recalculating total
  const parts = await db.getParts();
  assert.strictEqual(parts.length >= 1, true, 'Catálogo de peças carregado');

  const part = parts[0];
  const osWithPart = await db.addPartToOS(newOS.id, part.id, 2, part.preco_medio, 'Fornecedor Teste', adminUser);
  const expectedTotal = 300 + (2 * part.preco_medio);
  assert.strictEqual(osWithPart.valor_total, expectedTotal, 'Cálculo automático do valor total = mão de obra + peças');
  console.log('✅ Teste 6: Recálculo automático do valor total da OS OK');

  // Test 7: Adding plate verification audit record
  const verification = await db.addPlateVerification({
    veiculo_id: vehicles[0].id,
    responsavel_id: adminUser.id,
    status_consulta: 'SEM_RESTRICAO',
    observacao: 'Consulta policial sem restrições'
  });
  assert.strictEqual(verification.status_consulta, 'SEM_RESTRICAO', 'Verificação de placa gravada para auditoria');
  console.log('✅ Teste 7: Auditoria de Verificação de Placa (RF-007) OK');

  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});
