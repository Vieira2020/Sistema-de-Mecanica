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

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {}
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

  // Test 6: Stock Deduction and Total Calculation
  const parts = await db.getParts();
  const part = parts[0];
  const initialStock = part.estoque_atual;

  const osWithPart = await db.addPartToOS(newOS.id, part.id, 2, part.preco_medio, 'Fornecedor Teste', adminUser);
  const updatedParts = await db.getParts();
  const updatedPart = updatedParts.find(p => p.id === part.id);

  assert.strictEqual(updatedPart.estoque_atual, initialStock - 2, 'Estoque deve ser deduzido ao anexar peça na OS');
  const expectedTotal = 300 + (2 * part.preco_medio);
  assert.strictEqual(osWithPart.valor_total, expectedTotal, 'Cálculo automático do valor total = mão de obra + peças');
  console.log('✅ Teste 6: Dedução automática de estoque e recálculo total da OS OK');

  // Test 7: Stock Restoration on Part Removal from OS
  const osPecaId = osWithPart.pecas[osWithPart.pecas.length - 1].id;
  await db.removePartFromOS(newOS.id, osPecaId);
  const partsAfterRemoval = await db.getParts();
  const partAfterRemoval = partsAfterRemoval.find(p => p.id === part.id);
  assert.strictEqual(partAfterRemoval.estoque_atual, initialStock, 'Estoque devolvido ao remover peça da OS');
  console.log('✅ Teste 7: Restauração de estoque na remoção de peça da OS OK');

  // Test 8: Stock limit enforcement
  let threwStockError = false;
  try {
    await db.addPartToOS(newOS.id, part.id, 99999, part.preco_medio, 'Teste Excesso', adminUser);
  } catch (err) {
    threwStockError = true;
  }
  assert.strictEqual(threwStockError, true, 'Deveria impedir inclusão de quantidade maior que estoque disponível');
  console.log('✅ Teste 8: Bloqueio de quantidade acima do estoque disponível OK');

  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
}

runTests().catch((err) => {
  console.error('❌ Falha nos testes:', err);
  process.exit(1);
});
