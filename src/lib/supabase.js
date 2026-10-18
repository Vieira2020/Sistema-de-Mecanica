import { createClient } from '@supabase/supabase-js';

// Default essential credentials provided for Shibuya Motores Supabase DB
const DEFAULT_SUPABASE_URL = 'https://txiifnwudneznudawglc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7ySVIPOaOU3baOz-QyLaog_6EHumShw';

// Keys from localStorage or Vite environment or fallback to defaults
const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('shibuya_supabase_url');
  const customKey = localStorage.getItem('shibuya_supabase_key');

  const url = customUrl || import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = customKey || import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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

// Local storage seed for offline/fallback mode
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
    }
  ]
};

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

// Helper: Normalize profile string
const mapPerfilFromDb = (p) => {
  if (!p) return 'MECANICO';
  const val = String(p).toUpperCase();
  if (val === 'ADMINISTRADOR' || val === 'ADMIN') return 'ADMIN';
  if (val === 'FUNILEIRO') return 'FUNILEIRO';
  return 'MECANICO';
};

const mapPerfilToDb = (p) => {
  if (p === 'ADMIN') return 'administrador';
  if (p === 'FUNILEIRO') return 'funileiro';
  return 'mecanico';
};

// Helper: Normalize OS status strings
const mapStatusFromDb = (s) => {
  if (!s) return 'RECEBIDO';
  return String(s).toUpperCase();
};

const mapStatusToDb = (s) => {
  if (!s) return 'recebido';
  return String(s).toLowerCase();
};

// Local storage parts stock map for persistent stock management
const getLocalPartStockMap = () => {
  try {
    const raw = localStorage.getItem('shibuya_part_stocks');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const setLocalPartStockMap = (map) => {
  localStorage.setItem('shibuya_part_stocks', JSON.stringify(map));
};

export const db = {
  // USERS
  async getUsers() {
    if (supabase) {
      const { data, error } = await supabase.from('usuarios').select('*').order('nome', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(u => ({
          ...u,
          perfil: mapPerfilFromDb(u.perfil)
        }));
      }
    }
    return getLocalData().users;
  },

  async addUser(userData) {
    const newDbUser = {
      nome: userData.nome,
      login: userData.login,
      senha_hash: userData.senha || userData.senha_hash || '123456',
      perfil: mapPerfilToDb(userData.perfil),
      ativo: userData.ativo !== undefined ? userData.ativo : true
    };

    if (supabase) {
      const { data, error } = await supabase.from('usuarios').insert([newDbUser]).select();
      if (!error && data && data[0]) {
        return {
          ...data[0],
          perfil: mapPerfilFromDb(data[0].perfil)
        };
      }
    }

    const local = getLocalData();
    const newUser = {
      id: 'usr-' + Date.now(),
      nome: userData.nome,
      login: userData.login,
      senha_hash: userData.senha || '123456',
      perfil: userData.perfil || 'MECANICO',
      ativo: true
    };
    local.users.push(newUser);
    saveLocalData(local);
    return newUser;
  },

  async deleteUser(userId) {
    if (supabase) {
      const { error } = await supabase.from('usuarios').delete().eq('id', userId);
      if (!error) return true;
    }

    const local = getLocalData();
    local.users = local.users.filter(u => u.id !== userId);
    saveLocalData(local);
    return true;
  },

  // CLIENTS
  async getClients() {
    if (supabase) {
      const { data, error } = await supabase.from('clientes').select('*').order('criado_em', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalData().clients;
  },

  async addClient(clientData) {
    const newClientObj = {
      nome: clientData.nome,
      telefone: clientData.telefone,
      cpf: clientData.cpf || null,
      endereco: clientData.endereco || null
    };

    if (supabase) {
      const { data, error } = await supabase.from('clientes').insert([newClientObj]).select();
      if (!error && data && data[0]) return data[0];
    }

    const local = getLocalData();
    const localClient = {
      id: 'cli-' + Date.now(),
      ...newClientObj,
      criado_em: new Date().toISOString()
    };
    local.clients.unshift(localClient);
    saveLocalData(local);
    return localClient;
  },

  // VEHICLES
  async getVehicles() {
    if (supabase) {
      const { data, error } = await supabase.from('veiculos').select('*').order('criado_em', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalData().vehicles;
  },

  async addVehicle(vehicleData) {
    const formattedPlate = (vehicleData.placa || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newVehObj = {
      cliente_id: vehicleData.cliente_id,
      placa: formattedPlate,
      modelo: vehicleData.modelo,
      cor: vehicleData.cor,
      ano: vehicleData.ano ? parseInt(vehicleData.ano) : null,
      observacoes: vehicleData.observacoes || ''
    };

    if (supabase) {
      const { data, error } = await supabase.from('veiculos').insert([newVehObj]).select();
      if (!error && data && data[0]) return data[0];
    }

    const local = getLocalData();
    const localVeh = {
      id: 'vec-' + Date.now(),
      ...newVehObj,
      criado_em: new Date().toISOString()
    };
    local.vehicles.unshift(localVeh);
    saveLocalData(local);
    return localVeh;
  },

  // PLATE VERIFICATION
  async getPlateVerifications() {
    if (supabase) {
      const { data, error } = await supabase.from('verificacoes_placa').select('*').order('data_hora', { ascending: false });
      if (!error && data) {
        return data.map(v => ({
          ...v,
          responsavel_id: v.usuario_id || v.responsavel_id,
          status_consulta: v.observacao ? 'SEM_RESTRICAO' : 'SEM_RESTRICAO'
        }));
      }
    }
    return getLocalData().plateVerifications;
  },

  async addPlateVerification(verification) {
    const record = {
      veiculo_id: verification.veiculo_id,
      os_id: verification.os_id || null,
      usuario_id: verification.responsavel_id || verification.usuario_id,
      data_hora: new Date().toISOString(),
      observacao: verification.observacao || 'Verificação efetuada.'
    };

    if (supabase) {
      const { data, error } = await supabase.from('verificacoes_placa').insert([record]).select();
      if (!error && data && data[0]) {
        return {
          ...data[0],
          responsavel_id: data[0].usuario_id,
          status_consulta: 'SEM_RESTRICAO'
        };
      }
    }

    const local = getLocalData();
    const localRecord = {
      id: 'ver-' + Date.now(),
      ...record,
      responsavel_id: verification.responsavel_id,
      status_consulta: verification.status_consulta || 'SEM_RESTRICAO'
    };
    local.plateVerifications.unshift(localRecord);
    saveLocalData(local);
    return localRecord;
  },

  // PARTS
  async getParts() {
    const stockMap = getLocalPartStockMap();

    if (supabase) {
      const { data, error } = await supabase.from('pecas_catalogo').select('*').order('nome', { ascending: true });
      if (!error && data) {
        return data.map(p => ({
          ...p,
          estoque_atual: stockMap[p.id] !== undefined ? stockMap[p.id] : (p.estoque_atual !== undefined ? p.estoque_atual : 10)
        }));
      }
    }

    const local = getLocalData();
    return local.parts.map(p => ({
      ...p,
      estoque_atual: stockMap[p.id] !== undefined ? stockMap[p.id] : (p.estoque_atual !== undefined ? p.estoque_atual : 10)
    }));
  },

  async addPart(partData) {
    const stockMap = getLocalPartStockMap();
    const stockVal = parseInt(partData.estoque_atual || 0);

    const newPartObj = {
      codigo_interno: partData.codigo_interno,
      nome: partData.nome,
      modelo_compativel: partData.modelo_compativel || '',
      preco_min: parseFloat(partData.preco_min || 0),
      preco_max: parseFloat(partData.preco_max || 0),
      preco_medio: parseFloat(partData.preco_medio || 0),
      atualizado_em: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('pecas_catalogo').insert([newPartObj]).select();
      if (!error && data && data[0]) {
        stockMap[data[0].id] = stockVal;
        setLocalPartStockMap(stockMap);
        return {
          ...data[0],
          estoque_atual: stockVal
        };
      }
    }

    const local = getLocalData();
    const localPart = {
      id: 'pec-' + Date.now(),
      ...newPartObj,
      estoque_atual: stockVal,
      ultima_atualizacao: new Date().toISOString()
    };
    stockMap[localPart.id] = stockVal;
    setLocalPartStockMap(stockMap);

    local.parts.push(localPart);
    saveLocalData(local);
    return localPart;
  },

  async updatePartStock(partId, newStock) {
    const stockMap = getLocalPartStockMap();
    stockMap[partId] = Math.max(0, parseInt(newStock || 0));
    setLocalPartStockMap(stockMap);

    const local = getLocalData();
    const idx = local.parts.findIndex(p => p.id === partId);
    if (idx !== -1) {
      local.parts[idx].estoque_atual = stockMap[partId];
      saveLocalData(local);
    }
    return true;
  },

  async updatePart(partId, partData) {
    const stockMap = getLocalPartStockMap();
    if (partData.estoque_atual !== undefined) {
      stockMap[partId] = Math.max(0, parseInt(partData.estoque_atual));
      setLocalPartStockMap(stockMap);
    }

    const updateObj = {
      codigo_interno: partData.codigo_interno,
      nome: partData.nome,
      modelo_compativel: partData.modelo_compativel || '',
      preco_min: parseFloat(partData.preco_min || 0),
      preco_max: parseFloat(partData.preco_max || 0),
      preco_medio: parseFloat(partData.preco_medio || 0),
      atualizado_em: new Date().toISOString()
    };

    if (supabase) {
      await supabase.from('pecas_catalogo').update(updateObj).eq('id', partId);
    }

    const local = getLocalData();
    const idx = local.parts.findIndex(p => p.id === partId);
    if (idx !== -1) {
      local.parts[idx] = { ...local.parts[idx], ...updateObj, estoque_atual: stockMap[partId] };
      saveLocalData(local);
    }
    return true;
  },

  // ORDERS (OS)
  async getOSList() {
    if (supabase) {
      const { data: osData, error: osErr } = await supabase.from('ordens_servico').select('*').order('criado_em', { ascending: false });
      if (!osErr && osData) {
        const { data: pecasData } = await supabase.from('os_pecas').select('*');
        const { data: timelineData } = await supabase.from('os_atualizacoes').select('*').order('criado_em', { ascending: false });

        return osData.map(os => {
          const osPecas = (pecasData || []).filter(p => p.os_id === os.id).map(p => ({
            id: p.id,
            peca_id: p.peca_id,
            quantidade: parseFloat(p.quantidade || 1),
            preco_unitario: parseFloat(p.preco_unitario || 0),
            fornecedor: p.fornecedor || ''
          }));

          const osTimeline = (timelineData || []).filter(t => t.os_id === os.id).map(t => ({
            id: t.id,
            autor_id: t.usuario_id,
            data_hora: t.criado_em,
            status_anterior: mapStatusFromDb(t.status_anterior),
            status_novo: mapStatusFromDb(t.status_novo),
            observacao: t.observacao || ''
          }));

          return {
            ...os,
            status: mapStatusFromDb(os.status),
            mao_de_obra: parseFloat(os.valor_mao_obra || os.mao_de_obra || 0),
            valor_total: parseFloat(os.subtotal || os.valor_total || (parseFloat(os.valor_mao_obra || 0) + parseFloat(os.valor_pecas || 0))),
            responsavel_id: os.criado_por,
            pecas: osPecas,
            timeline: osTimeline
          };
        });
      }
    }
    return getLocalData().orders;
  },

  async createOS(osData, user) {
    const local = getLocalData();
    const nextNum = Math.floor(1000 + Math.random() * 9000);

    const osObj = {
      numero: nextNum,
      cliente_id: osData.cliente_id,
      veiculo_id: osData.veiculo_id,
      data_entrada: new Date().toISOString(),
      previsao_entrega: osData.previsao_entrega || null,
      status: mapStatusToDb(osData.status || 'RECEBIDO'),
      valor_mao_obra: parseFloat(osData.mao_de_obra || 0),
      valor_pecas: 0,
      subtotal: parseFloat(osData.mao_de_obra || 0),
      criado_por: user?.id || '40c4b8c5-d36d-406b-919f-5a28aedf6cd1'
    };

    if (supabase) {
      const { data, error } = await supabase.from('ordens_servico').insert([osObj]).select();
      if (!error && data && data[0]) {
        const createdOS = data[0];

        // Add initial timeline
        await supabase.from('os_atualizacoes').insert([{
          os_id: createdOS.id,
          usuario_id: user?.id || '40c4b8c5-d36d-406b-919f-5a28aedf6cd1',
          tipo: 'mudanca_status',
          status_anterior: null,
          status_novo: 'recebido',
          observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
        }]);

        return {
          ...createdOS,
          status: 'RECEBIDO',
          mao_de_obra: parseFloat(createdOS.valor_mao_obra || 0),
          valor_total: parseFloat(createdOS.subtotal || 0),
          responsavel_id: createdOS.criado_por,
          pecas: [],
          timeline: [{
            id: 'att-' + Date.now(),
            autor_id: user?.id,
            data_hora: new Date().toISOString(),
            status_anterior: null,
            status_novo: 'RECEBIDO',
            observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
          }]
        };
      }
    }

    const localOS = {
      id: 'os-' + Date.now(),
      numero: nextNum,
      cliente_id: osData.cliente_id,
      veiculo_id: osData.veiculo_id,
      responsavel_id: osData.responsavel_id || user?.id,
      tipo_servico: osData.tipo_servico || 'MECANICA',
      data_entrada: new Date().toISOString(),
      previsao_entrega: osData.previsao_entrega || null,
      mao_de_obra: parseFloat(osData.mao_de_obra || 0),
      valor_total: parseFloat(osData.mao_de_obra || 0),
      status: 'RECEBIDO',
      criado_por: user?.id,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      pecas: [],
      timeline: [
        {
          id: 'att-' + Date.now(),
          autor_id: user?.id,
          data_hora: new Date().toISOString(),
          status_anterior: null,
          status_novo: 'RECEBIDO',
          observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
        }
      ]
    };

    local.orders.unshift(localOS);
    saveLocalData(local);
    return localOS;
  },

  async updateOSDetails(osId, updateFields) {
    if (supabase) {
      const fields = {};
      if (updateFields.mao_de_obra !== undefined) fields.valor_mao_obra = parseFloat(updateFields.mao_de_obra);
      if (updateFields.valor_total !== undefined) fields.subtotal = parseFloat(updateFields.valor_total);
      if (updateFields.previsao_entrega !== undefined) fields.previsao_entrega = updateFields.previsao_entrega;

      await supabase.from('ordens_servico').update({ ...fields, atualizado_em: new Date().toISOString() }).eq('id', osId);
    }

    const local = getLocalData();
    const idx = local.orders.findIndex(o => o.id === osId);
    if (idx !== -1) {
      if (updateFields.mao_de_obra !== undefined) local.orders[idx].mao_de_obra = parseFloat(updateFields.mao_de_obra);
      if (updateFields.valor_total !== undefined) local.orders[idx].valor_total = parseFloat(updateFields.valor_total);
      if (updateFields.previsao_entrega !== undefined) local.orders[idx].previsao_entrega = updateFields.previsao_entrega;
      saveLocalData(local);
    }
    return true;
  },

  async updateOSStatus(osId, newStatus, observacao, user) {
    const dbStatus = mapStatusToDb(newStatus);

    if (supabase) {
      const { data: currentOS } = await supabase.from('ordens_servico').select('status').eq('id', osId).single();
      const prevStatusDb = currentOS?.status || null;

      await supabase.from('ordens_servico').update({
        status: dbStatus,
        atualizado_em: new Date().toISOString()
      }).eq('id', osId);

      await supabase.from('os_atualizacoes').insert([{
        os_id: osId,
        usuario_id: user?.id || '40c4b8c5-d36d-406b-919f-5a28aedf6cd1',
        tipo: 'mudanca_status',
        status_anterior: prevStatusDb,
        status_novo: dbStatus,
        observacao: observacao || `Status alterado de ${mapStatusFromDb(prevStatusDb)} para ${newStatus}`
      }]);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex !== -1) {
      const os = local.orders[osIndex];
      const prevStatus = os.status;
      os.status = newStatus;
      os.atualizado_em = new Date().toISOString();

      const timelineEntry = {
        id: 'att-' + Date.now(),
        autor_id: user?.id,
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
    }
    return null;
  },

  async addOSTimelineNote(osId, observacao, user) {
    if (supabase) {
      const { data: currentOS } = await supabase.from('ordens_servico').select('status').eq('id', osId).single();
      const statusDb = currentOS?.status || 'recebido';

      await supabase.from('os_atualizacoes').insert([{
        os_id: osId,
        usuario_id: user?.id || '40c4b8c5-d36d-406b-919f-5a28aedf6cd1',
        tipo: 'mudanca_status',
        status_anterior: statusDb,
        status_novo: statusDb,
        observacao: observacao
      }]);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex !== -1) {
      const os = local.orders[osIndex];
      const timelineEntry = {
        id: 'att-' + Date.now(),
        autor_id: user?.id,
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
    }
    return null;
  },

  async addPartToOS(osId, pecaId, quantidade, precoUnitario, fornecedor, user) {
    const qty = parseFloat(quantidade || 1);
    const unitPrice = parseFloat(precoUnitario || 0);
    const totalPartVal = qty * unitPrice;

    // Deduct stock quantity automatically (Alteração #4)
    const currentParts = await this.getParts();
    const matchedPart = currentParts.find(p => p.id === pecaId);
    if (matchedPart) {
      const newStock = Math.max(0, (matchedPart.estoque_atual || 0) - qty);
      await this.updatePartStock(pecaId, newStock);
    }

    if (supabase) {
      await supabase.from('os_pecas').insert([{
        os_id: osId,
        peca_id: pecaId,
        descricao: matchedPart?.nome || 'Peça Utilizada',
        quantidade: qty,
        preco_unitario: unitPrice,
        fornecedor: fornecedor || '',
        peca_do_cliente: false,
        valor_total: totalPartVal
      }]);

      // Recalculate OS values in Supabase
      const { data: allPecas } = await supabase.from('os_pecas').select('valor_total').eq('os_id', osId);
      const pecasSum = (allPecas || []).reduce((acc, curr) => acc + (parseFloat(curr.valor_total) || 0), 0);

      const { data: osRecord } = await supabase.from('ordens_servico').select('valor_mao_obra').eq('id', osId).single();
      const maoObra = parseFloat(osRecord?.valor_mao_obra || 0);
      const newSubtotal = maoObra + pecasSum;

      await supabase.from('ordens_servico').update({
        valor_pecas: pecasSum,
        subtotal: newSubtotal,
        atualizado_em: new Date().toISOString()
      }).eq('id', osId);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex !== -1) {
      const os = local.orders[osIndex];
      if (!os.pecas) os.pecas = [];

      const newOsPeca = {
        id: 'ospec-' + Date.now(),
        peca_id: pecaId,
        quantidade: qty,
        preco_unitario: unitPrice,
        fornecedor: fornecedor || ''
      };

      os.pecas.push(newOsPeca);

      const pecasTotal = os.pecas.reduce((sum, p) => sum + (p.quantidade * p.preco_unitario), 0);
      os.valor_total = pecasTotal + parseFloat(os.mao_de_obra || 0);
      os.atualizado_em = new Date().toISOString();

      local.orders[osIndex] = os;
      saveLocalData(local);
      return os;
    }

    return null;
  },

  async deleteOS(osId) {
    if (supabase) {
      await supabase.from('os_pecas').delete().eq('os_id', osId);
      await supabase.from('os_atualizacoes').delete().eq('os_id', osId);
      await supabase.from('verificacoes_placa').delete().eq('os_id', osId);
      const { error } = await supabase.from('ordens_servico').delete().eq('id', osId);
      if (!error) return true;
    }

    const local = getLocalData();
    local.orders = local.orders.filter(o => o.id !== osId);
    saveLocalData(local);
    return true;
  }
};
