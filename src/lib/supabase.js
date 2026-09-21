import { createClient } from '@supabase/supabase-js';

// Keys from localStorage or Vite environment
const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('shibuya_supabase_url');
  const customKey = localStorage.getItem('shibuya_supabase_key');

  const url = customUrl || import.meta.env?.VITE_SUPABASE_URL || '';
  const key = customKey || import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  return { url, key, isConfigured: Boolean(url && key) };
};

const config = getSupabaseConfig();

export const supabase = config.isConfigured
  ? createClient(config.url, config.key)
  : null;

export const isSupabaseConnected = () => Boolean(supabase);

export const saveSupabaseConfig = (url, key) => {
  if (url) localStorage.setItem('shibuya_supabase_url', url);
  else localStorage.removeItem('shibuya_supabase_url');

  if (key) localStorage.setItem('shibuya_supabase_key', key);
  else localStorage.removeItem('shibuya_supabase_key');

  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('shibuya_supabase_url');
  localStorage.removeItem('shibuya_supabase_key');
  window.location.reload();
};

// Seed initial data for local storage mode
const INITIAL_SEED = {
  users: [
    { id: 'usr-1', nome: 'Dono Shibuya (Admin)', login: 'admin', senha_hash: 'admin123', perfil: 'ADMIN', ativo: true },
    { id: 'usr-2', nome: 'Carlos Mecânico', login: 'mecanico', senha_hash: 'mecanico123', perfil: 'MECANICO', ativo: true },
    { id: 'usr-3', nome: 'Roberto Funileiro', login: 'funileiro', senha_hash: 'mecanico123', perfil: 'MECANICO', ativo: true }
  ],
  clients: [
    { id: 'cli-1', nome: 'João Silva', telefone: '(11) 98765-4321', cpf: '123.456.789-00', endereco: 'Rua das Flores, 123 - Bragança Paulista, SP', criado_em: new Date().toISOString() },
    { id: 'cli-2', nome: 'Maria Oliveira', telefone: '(11) 91234-5678', cpf: '987.654.321-11', endereco: 'Av. São Paulo, 450 - Bragança Paulista, SP', criado_em: new Date().toISOString() },
    { id: 'cli-3', nome: 'Empresa Transportes SP', telefone: '(11) 3344-5566', cpf: '12.345.678/0001-99', endereco: 'Rod. Fernão Dias, Km 22 - Bragança Paulista, SP', criado_em: new Date().toISOString() }
  ],
  vehicles: [
    { id: 'vec-1', cliente_id: 'cli-1', placa: 'ABC1D23', modelo: 'Volkswagen Gol 1.6', cor: 'Prata', ano: 2020, observacoes: 'Colisão na lateral direita e barulho no motor', criado_em: new Date().toISOString() },
    { id: 'vec-2', cliente_id: 'cli-2', placa: 'XYZ9876', modelo: 'Honda Civic 2.0', cor: 'Preto', ano: 2018, observacoes: 'Revisão de suspensão e pintura do para-choque', criado_em: new Date().toISOString() },
    { id: 'vec-3', cliente_id: 'cli-3', placa: 'FUT2025', modelo: 'Fiat Strada 1.4', cor: 'Branca', ano: 2022, observacoes: 'Manutenção de frota', criado_em: new Date().toISOString() }
  ],
  plateVerifications: [
    { id: 'ver-1', veiculo_id: 'vec-1', os_id: 'os-1', data_hora: new Date(Date.now() - 86400000 * 3).toISOString(), responsavel_id: 'usr-1', status_consulta: 'SEM_RESTRICAO', observacao: 'Consulta efetuada na base pública. Veículo sem restrição policial ou de receptação.' },
    { id: 'ver-2', veiculo_id: 'vec-2', os_id: 'os-2', data_hora: new Date(Date.now() - 86400000 * 1).toISOString(), responsavel_id: 'usr-1', status_consulta: 'SEM_RESTRICAO', observacao: 'Consulta limpa, liberado para orçamento.' }
  ],
  parts: [
    { id: 'pec-1', codigo_interno: 'PEC-001', nome: 'Amortecedor Dianteiro', modelo_compativel: 'Gol / Fox / Voyage', preco_min: 250, preco_max: 380, preco_medio: 310, estoque_atual: 8, ultima_atualizacao: new Date().toISOString() },
    { id: 'pec-2', codigo_interno: 'PEC-002', nome: 'Tinta Automotiva Prata 900ml', modelo_compativel: 'Universal', preco_min: 120, preco_max: 180, preco_medio: 150, estoque_atual: 5, ultima_atualizacao: new Date().toISOString() },
    { id: 'pec-3', codigo_interno: 'PEC-003', nome: 'Pastilha de Freio Dianteira', modelo_compativel: 'Honda Civic / Fit', preco_min: 180, preco_max: 260, preco_medio: 220, estoque_atual: 12, ultima_atualizacao: new Date().toISOString() },
    { id: 'pec-4', codigo_interno: 'PEC-004', nome: 'Filtro de Óleo do Motor', modelo_compativel: 'Fiat Strada / Palio', preco_min: 35, preco_max: 60, preco_medio: 45, estoque_atual: 20, ultima_atualizacao: new Date().toISOString() }
  ],
  orders: [
    {
      id: 'os-1',
      numero: 1001,
      cliente_id: 'cli-1',
      veiculo_id: 'vec-1',
      responsavel_id: 'usr-2',
      tipo_servico: 'AMBOS',
      data_entrada: new Date(Date.now() - 86400000 * 3).toISOString(),
      previsao_entrega: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      mao_de_obra: 800,
      valor_total: 1260,
      status: 'EM_MECANICA',
      criado_por: 'usr-1',
      criado_em: new Date(Date.now() - 86400000 * 3).toISOString(),
      atualizado_em: new Date(Date.now() - 3600000 * 2).toISOString(),
      pecas: [
        { id: 'ospec-1', peca_id: 'pec-1', quantidade: 1, preco_unitario: 310, fornecedor: 'Auto Peças Bragança' },
        { id: 'ospec-2', peca_id: 'pec-2', quantidade: 1, preco_unitario: 150, fornecedor: 'Tintas SP' }
      ],
      timeline: [
        { id: 'att-1', autor_id: 'usr-1', data_hora: new Date(Date.now() - 86400000 * 3).toISOString(), status_anterior: null, status_novo: 'RECEBIDO', observacao: 'Veículo recebido na oficina. Verificação de placa concluída sem restrições.' },
        { id: 'att-2', autor_id: 'usr-2', data_hora: new Date(Date.now() - 86400000 * 2).toISOString(), status_anterior: 'RECEBIDO', status_novo: 'EM_DIAGNOSTICO', observacao: 'Diagnóstico iniciado: alinhamento de lataria e substituição de amortecedor danificado.' },
        { id: 'att-3', autor_id: 'usr-1', data_hora: new Date(Date.now() - 86400000 * 1).toISOString(), status_anterior: 'EM_DIAGNOSTICO', status_novo: 'EM_FUNILARIA', observacao: 'Reparo de funilaria na porta do passageiro concluído. Transferido para mecânica.' },
        { id: 'att-4', autor_id: 'usr-2', data_hora: new Date(Date.now() - 3600000 * 2).toISOString(), status_anterior: 'EM_FUNILARIA', status_novo: 'EM_MECANICA', observacao: 'Desmontagem da suspensão dianteira iniciada. Amortecedor removido.' }
      ]
    },
    {
      id: 'os-2',
      numero: 1002,
      cliente_id: 'cli-2',
      veiculo_id: 'vec-2',
      responsavel_id: 'usr-3',
      tipo_servico: 'FUNILARIA',
      data_entrada: new Date(Date.now() - 86400000 * 1).toISOString(),
      previsao_entrega: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      mao_de_obra: 500,
      valor_total: 720,
      status: 'EM_FUNILARIA',
      criado_por: 'usr-1',
      criado_em: new Date(Date.now() - 86400000 * 1).toISOString(),
      atualizado_em: new Date(Date.now() - 3600000 * 5).toISOString(),
      pecas: [
        { id: 'ospec-3', peca_id: 'pec-3', quantidade: 1, preco_unitario: 220, fornecedor: 'Honda Peças' }
      ],
      timeline: [
        { id: 'att-5', autor_id: 'usr-1', data_hora: new Date(Date.now() - 86400000 * 1).toISOString(), status_anterior: null, status_novo: 'RECEBIDO', observacao: 'Recebido para serviço de lataria e troca de pastilha.' },
        { id: 'att-6', autor_id: 'usr-3', data_hora: new Date(Date.now() - 3600000 * 5).toISOString(), status_anterior: 'RECEBIDO', status_novo: 'EM_FUNILARIA', observacao: 'Aplicação de primer no para-choque.' }
      ]
    }
  ]
};

// Initialize LocalStorage if empty
const getLocalData = () => {
  const data = localStorage.getItem('shibuya_db');
  if (!data) {
    localStorage.setItem('shibuya_db', JSON.stringify(INITIAL_SEED));
    return INITIAL_SEED;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem('shibuya_db', JSON.stringify(INITIAL_SEED));
    return INITIAL_SEED;
  }
};

const saveLocalData = (data) => {
  localStorage.setItem('shibuya_db', JSON.stringify(data));
};

// DATA ACCESS LAYER
export const db = {
  // CLIENTS
  async getClients() {
    if (supabase) {
      const { data, error } = await supabase.from('cliente').select('*').order('criado_em', { ascending: false });
      if (!error) return data;
    }
    return getLocalData().clients;
  },

  async addClient(clientData) {
    const newClient = {
      id: 'cli-' + Date.now(),
      nome: clientData.nome,
      telefone: clientData.telefone,
      cpf: clientData.cpf || null,
      endereco: clientData.endereco || null,
      criado_em: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('cliente').insert([newClient]).select();
      if (!error && data) return data[0];
    }

    const local = getLocalData();
    local.clients.unshift(newClient);
    saveLocalData(local);
    return newClient;
  },

  // VEHICLES
  async getVehicles() {
    if (supabase) {
      const { data, error } = await supabase.from('veiculo').select('*').order('criado_em', { ascending: false });
      if (!error) return data;
    }
    return getLocalData().vehicles;
  },

  async addVehicle(vehicleData) {
    const newVehicle = {
      id: 'vec-' + Date.now(),
      cliente_id: vehicleData.cliente_id,
      placa: vehicleData.placa.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      modelo: vehicleData.modelo,
      cor: vehicleData.cor,
      ano: vehicleData.ano ? parseInt(vehicleData.ano) : null,
      observacoes: vehicleData.observacoes || '',
      criado_em: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('veiculo').insert([newVehicle]).select();
      if (!error && data) return data[0];
    }

    const local = getLocalData();
    local.vehicles.unshift(newVehicle);
    saveLocalData(local);
    return newVehicle;
  },

  // PLATE VERIFICATION
  async getPlateVerifications() {
    if (supabase) {
      const { data, error } = await supabase.from('verificacao_placa').select('*').order('data_hora', { ascending: false });
      if (!error) return data;
    }
    return getLocalData().plateVerifications;
  },

  async addPlateVerification(verification) {
    const record = {
      id: 'ver-' + Date.now(),
      veiculo_id: verification.veiculo_id,
      os_id: verification.os_id || null,
      data_hora: new Date().toISOString(),
      responsavel_id: verification.responsavel_id,
      status_consulta: verification.status_consulta || 'SEM_RESTRICAO',
      observacao: verification.observacao || 'Verificação efetuada.'
    };

    if (supabase) {
      const { data, error } = await supabase.from('verificacao_placa').insert([record]).select();
      if (!error && data) return data[0];
    }

    const local = getLocalData();
    local.plateVerifications.unshift(record);
    saveLocalData(local);
    return record;
  },

  // PARTS
  async getParts() {
    if (supabase) {
      const { data, error } = await supabase.from('peca').select('*').order('nome', { ascending: true });
      if (!error) return data;
    }
    return getLocalData().parts;
  },

  async addPart(partData) {
    const newPart = {
      id: 'pec-' + Date.now(),
      codigo_interno: partData.codigo_interno,
      nome: partData.nome,
      modelo_compativel: partData.modelo_compativel || '',
      preco_min: parseFloat(partData.preco_min || 0),
      preco_max: parseFloat(partData.preco_max || 0),
      preco_medio: parseFloat(partData.preco_medio || 0),
      estoque_atual: parseInt(partData.estoque_atual || 0),
      ultima_atualizacao: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('peca').insert([newPart]).select();
      if (!error && data) return data[0];
    }

    const local = getLocalData();
    local.parts.push(newPart);
    saveLocalData(local);
    return newPart;
  },

  // ORDERS (OS)
  async getOSList() {
    if (supabase) {
      const { data, error } = await supabase.from('ordem_servico').select('*').order('criado_em', { ascending: false });
      if (!error) return data;
    }
    return getLocalData().orders;
  },

  async createOS(osData, user) {
    const local = getLocalData();
    const nextNum = local.orders.length > 0 ? Math.max(...local.orders.map(o => o.numero || 1000)) + 1 : 1001;

    const newOS = {
      id: 'os-' + Date.now(),
      numero: nextNum,
      cliente_id: osData.cliente_id,
      veiculo_id: osData.veiculo_id,
      responsavel_id: osData.responsavel_id || user.id,
      tipo_servico: osData.tipo_servico || 'MECANICA',
      data_entrada: new Date().toISOString(),
      previsao_entrega: osData.previsao_entrega || null,
      mao_de_obra: parseFloat(osData.mao_de_obra || 0),
      valor_total: parseFloat(osData.mao_de_obra || 0),
      status: 'RECEBIDO',
      criado_por: user.id,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      pecas: [],
      timeline: [
        {
          id: 'att-' + Date.now(),
          autor_id: user.id,
          data_hora: new Date().toISOString(),
          status_anterior: null,
          status_novo: 'RECEBIDO',
          observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
        }
      ]
    };

    if (supabase) {
      const { data, error } = await supabase.from('ordem_servico').insert([newOS]).select();
      if (!error && data) return data[0];
    }

    local.orders.unshift(newOS);
    saveLocalData(local);
    return newOS;
  },

  async updateOSStatus(osId, newStatus, observacao, user) {
    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex === -1) return null;

    const os = local.orders[osIndex];
    const prevStatus = os.status;
    os.status = newStatus;
    os.atualizado_em = new Date().toISOString();

    if (newStatus === 'ENTREGUE') {
      os.entregue_em = new Date().toISOString();
    }

    const timelineEntry = {
      id: 'att-' + Date.now(),
      autor_id: user.id,
      data_hora: new Date().toISOString(),
      status_anterior: prevStatus,
      status_novo: newStatus,
      observacao: observacao || `Status alterado de ${prevStatus} para ${newStatus}`
    };

    if (!os.timeline) os.timeline = [];
    os.timeline.unshift(timelineEntry);

    local.orders[osIndex] = os;
    saveLocalData(local);
    return os;
  },

  async addOSTimelineNote(osId, observacao, user) {
    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex === -1) return null;

    const os = local.orders[osIndex];
    const timelineEntry = {
      id: 'att-' + Date.now(),
      autor_id: user.id,
      data_hora: new Date().toISOString(),
      status_anterior: os.status,
      status_novo: os.status,
      observacao: observacao
    };

    if (!os.timeline) os.timeline = [];
    os.timeline.unshift(timelineEntry);
    os.atualizado_em = new Date().toISOString();

    local.orders[osIndex] = os;
    saveLocalData(local);
    return os;
  },

  async addPartToOS(osId, pecaId, quantidade, precoUnitario, fornecedor, user) {
    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex === -1) return null;

    const os = local.orders[osIndex];
    if (!os.pecas) os.pecas = [];

    const newOsPeca = {
      id: 'ospec-' + Date.now(),
      peca_id: pecaId,
      quantidade: parseFloat(quantidade),
      preco_unitario: parseFloat(precoUnitario),
      fornecedor: fornecedor || ''
    };

    os.pecas.push(newOsPeca);

    // Recalculate Total
    const pecasTotal = os.pecas.reduce((sum, p) => sum + (p.quantidade * p.preco_unitario), 0);
    os.valor_total = pecasTotal + parseFloat(os.mao_de_obra || 0);
    os.atualizado_em = new Date().toISOString();

    local.orders[osIndex] = os;
    saveLocalData(local);
    return os;
  },

  async getUsers() {
    return getLocalData().users;
  }
};
