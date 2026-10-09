import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://txiifnwudneznudawglc.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_7ySVIPOaOU3baOz-QyLaog_6EHumShw';

// Keys from localStorage, Vite environment, or hardcoded defaults
const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('shibuya_supabase_url');
  const customKey = localStorage.getItem('shibuya_supabase_key');

  const url = customUrl || import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = customKey || import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

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

// Helper status converters
const mapStatusToApp = (st) => (st ? String(st).toUpperCase() : 'RECEBIDO');
const mapStatusToDb = (st) => (st ? String(st).toLowerCase() : 'recebido');

// Helper profile converters
const mapPerfilToApp = (p) => {
  if (!p) return 'MECANICO';
  const upper = String(p).toUpperCase();
  if (upper === 'ADMINISTRADOR' || upper === 'ADMIN') return 'ADMIN';
  if (upper === 'FUNILEIRO') return 'FUNILEIRO';
  return 'MECANICO';
};

const mapPerfilToDb = (p) => {
  if (!p) return 'mecanico';
  const upper = String(p).toUpperCase();
  if (upper === 'ADMIN') return 'administrador';
  if (upper === 'FUNILEIRO') return 'funileiro';
  return 'mecanico';
};

// Seed initial data for fallback local storage mode
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

// LocalStorage helpers
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

// DATA ACCESS LAYER INTEGRATED WITH SUPABASE & FALLBACK
export const db = {
  // USERS
  async getUsers() {
    if (supabase) {
      const { data, error } = await supabase.from('usuarios').select('*').order('criado_em', { ascending: true });
      if (!error && data) {
        return data.map((u) => ({
          id: u.id,
          nome: u.nome,
          login: u.login,
          senha_hash: u.senha_hash,
          perfil: mapPerfilToApp(u.perfil),
          ativo: u.ativo
        }));
      }
    }
    return getLocalData().users;
  },

  async addUser(userData) {
    const newUserObj = {
      nome: userData.nome,
      login: userData.login.trim().toLowerCase(),
      senha_hash: userData.senha || userData.senha_hash || '123456',
      perfil: mapPerfilToDb(userData.perfil),
      ativo: true
    };

    if (supabase) {
      const { data, error } = await supabase.from('usuarios').insert([newUserObj]).select();
      if (!error && data && data.length > 0) {
        const u = data[0];
        const mapped = {
          id: u.id,
          nome: u.nome,
          login: u.login,
          senha_hash: u.senha_hash,
          perfil: mapPerfilToApp(u.perfil),
          ativo: u.ativo
        };
        const local = getLocalData();
        local.users.push(mapped);
        saveLocalData(local);
        return mapped;
      }
    }

    const local = getLocalData();
    const localUser = {
      id: 'usr-' + Date.now(),
      nome: userData.nome,
      login: userData.login.trim().toLowerCase(),
      senha_hash: userData.senha || userData.senha_hash || '123456',
      perfil: mapPerfilToApp(userData.perfil),
      ativo: true
    };
    local.users.push(localUser);
    saveLocalData(local);
    return localUser;
  },

  async deleteUser(userId) {
    if (supabase) {
      await supabase.from('usuarios').delete().eq('id', userId);
    }
    const local = getLocalData();
    local.users = local.users.filter((u) => u.id !== userId);
    saveLocalData(local);
    return true;
  },

  // CLIENTS
  async getClients() {
    if (supabase) {
      const { data, error } = await supabase.from('clientes').select('*').order('criado_em', { ascending: false });
      if (!error && data) {
        return data.map((c) => ({
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          cpf: c.cpf_cnpj || c.cpf || '',
          endereco: c.endereco || '',
          criado_em: c.criado_em
        }));
      }
    }
    return getLocalData().clients;
  },

  async addClient(clientData) {
    const payload = {
      nome: clientData.nome,
      telefone: clientData.telefone,
      cpf_cnpj: clientData.cpf || clientData.cpf_cnpj || null,
      endereco: clientData.endereco || null
    };

    if (supabase) {
      const { data, error } = await supabase.from('clientes').insert([payload]).select();
      if (!error && data && data.length > 0) {
        const c = data[0];
        const mapped = {
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          cpf: c.cpf_cnpj || '',
          endereco: c.endereco || '',
          criado_em: c.criado_em
        };
        const local = getLocalData();
        local.clients.unshift(mapped);
        saveLocalData(local);
        return mapped;
      }
    }

    const local = getLocalData();
    const newClient = {
      id: 'cli-' + Date.now(),
      nome: clientData.nome,
      telefone: clientData.telefone,
      cpf: clientData.cpf || null,
      endereco: clientData.endereco || null,
      criado_em: new Date().toISOString()
    };
    local.clients.unshift(newClient);
    saveLocalData(local);
    return newClient;
  },

  async updateClient(clientId, clientData) {
    if (supabase) {
      await supabase.from('clientes').update({
        nome: clientData.nome,
        telefone: clientData.telefone,
        cpf_cnpj: clientData.cpf || clientData.cpf_cnpj || null,
        endereco: clientData.endereco || null
      }).eq('id', clientId);
    }
    const local = getLocalData();
    const idx = local.clients.findIndex(c => c.id === clientId);
    if (idx !== -1) {
      local.clients[idx] = { ...local.clients[idx], ...clientData };
      saveLocalData(local);
    }
  },

  // VEHICLES
  async getVehicles() {
    if (supabase) {
      const { data, error } = await supabase.from('veiculos').select('*').order('criado_em', { ascending: false });
      if (!error && data) {
        return data.map((v) => ({
          id: v.id,
          cliente_id: v.cliente_id,
          placa: v.placa,
          modelo: v.modelo,
          cor: v.cor,
          ano: v.ano ? parseInt(v.ano) : null,
          observacoes: v.observacoes || '',
          criado_em: v.criado_em
        }));
      }
    }
    return getLocalData().vehicles;
  },

  async addVehicle(vehicleData) {
    const payload = {
      cliente_id: vehicleData.cliente_id,
      placa: vehicleData.placa ? vehicleData.placa.toUpperCase().replace(/[^A-Z0-9]/g, '') : '',
      modelo: vehicleData.modelo,
      cor: vehicleData.cor,
      ano: vehicleData.ano ? parseInt(vehicleData.ano) : null,
      observacoes: vehicleData.observacoes || ''
    };

    if (supabase) {
      const { data, error } = await supabase.from('veiculos').insert([payload]).select();
      if (!error && data && data.length > 0) {
        const v = data[0];
        const mapped = {
          id: v.id,
          cliente_id: v.cliente_id,
          placa: v.placa,
          modelo: v.modelo,
          cor: v.cor,
          ano: v.ano,
          observacoes: v.observacoes || '',
          criado_em: v.criado_em
        };
        const local = getLocalData();
        local.vehicles.unshift(mapped);
        saveLocalData(local);
        return mapped;
      }
    }

    const local = getLocalData();
    const newVehicle = {
      id: 'vec-' + Date.now(),
      cliente_id: vehicleData.cliente_id,
      placa: payload.placa,
      modelo: vehicleData.modelo,
      cor: vehicleData.cor,
      ano: payload.ano,
      observacoes: vehicleData.observacoes || '',
      criado_em: new Date().toISOString()
    };
    local.vehicles.unshift(newVehicle);
    saveLocalData(local);
    return newVehicle;
  },

  // PLATE VERIFICATION
  async getPlateVerifications() {
    if (supabase) {
      const { data, error } = await supabase.from('verificacoes_placa').select('*').order('data_hora', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalData().plateVerifications;
  },

  async addPlateVerification(verification) {
    const record = {
      veiculo_id: verification.veiculo_id,
      os_id: verification.os_id || null,
      responsavel_id: verification.responsavel_id,
      status_consulta: verification.status_consulta || 'SEM_RESTRICAO',
      observacao: verification.observacao || 'Verificação efetuada.'
    };

    if (supabase) {
      const { data, error } = await supabase.from('verificacoes_placa').insert([record]).select();
      if (!error && data && data.length > 0) return data[0];
    }

    const local = getLocalData();
    const localRecord = {
      id: 'ver-' + Date.now(),
      ...record,
      data_hora: new Date().toISOString()
    };
    local.plateVerifications.unshift(localRecord);
    saveLocalData(local);
    return localRecord;
  },

  // PARTS CATALOG
  async getParts() {
    if (supabase) {
      const { data, error } = await supabase.from('pecas_catalogo').select('*').order('nome', { ascending: true });
      if (!error && data) {
        return data.map((p) => ({
          id: p.id,
          codigo_interno: p.codigo_interno,
          nome: p.nome,
          modelo_compativel: p.modelo_compativel || '',
          preco_min: parseFloat(p.preco_min || 0),
          preco_max: parseFloat(p.preco_max || 0),
          preco_medio: parseFloat(p.preco_medio || 0),
          estoque_atual: parseInt(p.estoque_atual || 0)
        }));
      }
    }
    return getLocalData().parts;
  },

  async addPart(partData) {
    const payload = {
      codigo_interno: partData.codigo_interno,
      nome: partData.nome,
      modelo_compativel: partData.modelo_compativel || '',
      preco_min: parseFloat(partData.preco_min || 0),
      preco_max: parseFloat(partData.preco_max || 0),
      preco_medio: parseFloat(partData.preco_medio || 0),
      estoque_atual: parseInt(partData.estoque_atual || 0)
    };

    if (supabase) {
      const { data, error } = await supabase.from('pecas_catalogo').insert([payload]).select();
      if (!error && data && data.length > 0) {
        const p = data[0];
        const mapped = {
          id: p.id,
          codigo_interno: p.codigo_interno,
          nome: p.nome,
          modelo_compativel: p.modelo_compativel || '',
          preco_min: parseFloat(p.preco_min || 0),
          preco_max: parseFloat(p.preco_max || 0),
          preco_medio: parseFloat(p.preco_medio || 0),
          estoque_atual: parseInt(p.estoque_atual || 0)
        };
        const local = getLocalData();
        local.parts.push(mapped);
        saveLocalData(local);
        return mapped;
      }
    }

    const local = getLocalData();
    const newPart = {
      id: 'pec-' + Date.now(),
      ...payload,
      ultima_atualizacao: new Date().toISOString()
    };
    local.parts.push(newPart);
    saveLocalData(local);
    return newPart;
  },

  async updatePart(partId, partData) {
    const payload = {
      codigo_interno: partData.codigo_interno,
      nome: partData.nome,
      modelo_compativel: partData.modelo_compativel,
      preco_min: parseFloat(partData.preco_min || 0),
      preco_max: parseFloat(partData.preco_max || 0),
      preco_medio: parseFloat(partData.preco_medio || 0),
      estoque_atual: parseInt(partData.estoque_atual || 0)
    };

    if (supabase) {
      await supabase.from('pecas_catalogo').update(payload).eq('id', partId);
    }

    const local = getLocalData();
    const idx = local.parts.findIndex(p => p.id === partId);
    if (idx !== -1) {
      local.parts[idx] = { ...local.parts[idx], ...payload, ultima_atualizacao: new Date().toISOString() };
      saveLocalData(local);
    }
  },

  // ORDERS (OS)
  async getOSList() {
    if (supabase) {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('criado_em', { ascending: false });

      if (!ordersErr && ordersData) {
        const { data: pecasData } = await supabase.from('os_pecas').select('*');
        const { data: updatesData } = await supabase.from('os_atualizacoes').select('*').order('criado_em', { ascending: false });

        return ordersData.map((o) => {
          const osPecas = pecasData
            ? pecasData.filter((p) => p.os_id === o.id).map((p) => ({
                id: p.id,
                peca_id: p.peca_id,
                quantidade: parseFloat(p.quantidade || 0),
                preco_unitario: parseFloat(p.preco_unitario || 0),
                fornecedor: p.fornecedor || ''
              }))
            : [];

          const osTimeline = updatesData
            ? updatesData.filter((u) => u.os_id === o.id).map((u) => ({
                id: u.id,
                autor_id: u.usuario_id || u.autor_id,
                data_hora: u.criado_em || u.data_hora,
                status_anterior: u.status_anterior ? mapStatusToApp(u.status_anterior) : null,
                status_novo: u.status_novo ? mapStatusToApp(u.status_novo) : null,
                observacao: u.observacao || ''
              }))
            : [];

          return {
            id: o.id,
            numero: o.numero,
            cliente_id: o.cliente_id,
            veiculo_id: o.veiculo_id,
            responsavel_id: o.responsavel_id || o.criado_por,
            tipo_servico: o.tipo_servico || 'MECANICA',
            data_entrada: o.data_entrada || o.criado_em,
            previsao_entrega: o.previsao_entrega || null,
            mao_de_obra: parseFloat(o.valor_mao_obra || 0),
            valor_total: parseFloat(o.valor_final || o.subtotal || o.valor_mao_obra || 0),
            status: mapStatusToApp(o.status),
            criado_por: o.criado_por,
            criado_em: o.criado_em,
            atualizado_em: o.atualizado_em,
            pecas: osPecas,
            timeline: osTimeline
          };
        });
      }
    }
    return getLocalData().orders;
  },

  async createOS(osData, user) {
    const maoDeObra = parseFloat(osData.mao_de_obra || 0);

    const payload = {
      cliente_id: osData.cliente_id,
      veiculo_id: osData.veiculo_id,
      criado_por: user.id,
      tipo_servico: osData.tipo_servico || 'MECANICA',
      previsao_entrega: osData.previsao_entrega || null,
      valor_mao_obra: maoDeObra,
      subtotal: maoDeObra,
      valor_final: maoDeObra,
      status: 'recebido'
    };

    if (supabase) {
      const { data, error } = await supabase.from('ordens_servico').insert([payload]).select();
      if (!error && data && data.length > 0) {
        const newOS = data[0];

        // Insert initial timeline entry
        await supabase.from('os_atualizacoes').insert([
          {
            os_id: newOS.id,
            usuario_id: user.id,
            tipo: 'mudanca_status',
            status_anterior: null,
            status_novo: 'recebido',
            observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
          }
        ]);

        const mappedOS = {
          id: newOS.id,
          numero: newOS.numero,
          cliente_id: newOS.cliente_id,
          veiculo_id: newOS.veiculo_id,
          responsavel_id: osData.responsavel_id || user.id,
          tipo_servico: osData.tipo_servico || 'MECANICA',
          data_entrada: newOS.data_entrada || new Date().toISOString(),
          previsao_entrega: newOS.previsao_entrega || null,
          mao_de_obra: maoDeObra,
          valor_total: maoDeObra,
          status: 'RECEBIDO',
          criado_por: user.id,
          criado_em: newOS.criado_em,
          atualizado_em: newOS.atualizado_em,
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

        const local = getLocalData();
        local.orders.unshift(mappedOS);
        saveLocalData(local);
        return mappedOS;
      }
    }

    const local = getLocalData();
    const nextNum = local.orders.length > 0 ? Math.max(...local.orders.map((o) => o.numero || 1000)) + 1 : 1001;

    const localOS = {
      id: 'os-' + Date.now(),
      numero: nextNum,
      cliente_id: osData.cliente_id,
      veiculo_id: osData.veiculo_id,
      responsavel_id: osData.responsavel_id || user.id,
      tipo_servico: osData.tipo_servico || 'MECANICA',
      data_entrada: new Date().toISOString(),
      previsao_entrega: osData.previsao_entrega || null,
      mao_de_obra: maoDeObra,
      valor_total: maoDeObra,
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

    local.orders.unshift(localOS);
    saveLocalData(local);
    return localOS;
  },

  async updateOSDetails(osId, updateData, user) {
    if (supabase) {
      const updatePayload = {};
      if (updateData.mao_de_obra !== undefined) {
        updatePayload.valor_mao_obra = parseFloat(updateData.mao_de_obra);
      }
      if (updateData.valor_total !== undefined) {
        updatePayload.valor_final = parseFloat(updateData.valor_total);
        updatePayload.subtotal = parseFloat(updateData.valor_total);
      }
      if (updateData.tipo_servico) {
        updatePayload.tipo_servico = updateData.tipo_servico;
      }
      if (updateData.previsao_entrega) {
        updatePayload.previsao_entrega = updateData.previsao_entrega;
      }

      await supabase.from('ordens_servico').update(updatePayload).eq('id', osId);

      if (updateData.note) {
        await supabase.from('os_atualizacoes').insert([
          {
            os_id: osId,
            usuario_id: user.id,
            tipo: 'observacao',
            observacao: updateData.note
          }
        ]);
      }
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex((o) => o.id === osId);
    if (osIndex !== -1) {
      const os = local.orders[osIndex];
      if (updateData.mao_de_obra !== undefined) os.mao_de_obra = parseFloat(updateData.mao_de_obra);
      if (updateData.valor_total !== undefined) os.valor_total = parseFloat(updateData.valor_total);
      if (updateData.tipo_servico) os.tipo_servico = updateData.tipo_servico;
      if (updateData.previsao_entrega) os.previsao_entrega = updateData.previsao_entrega;
      os.atualizado_em = new Date().toISOString();

      if (updateData.note) {
        if (!os.timeline) os.timeline = [];
        os.timeline.unshift({
          id: 'att-' + Date.now(),
          autor_id: user.id,
          data_hora: new Date().toISOString(),
          status_anterior: os.status,
          status_novo: os.status,
          observacao: updateData.note
        });
      }

      local.orders[osIndex] = os;
      saveLocalData(local);
      return os;
    }
    return null;
  },

  async updateOSStatus(osId, newStatus, observacao, user) {
    const dbStatus = mapStatusToDb(newStatus);

    if (supabase) {
      const updateData = {
        status: dbStatus,
        atualizado_em: new Date().toISOString()
      };
      if (newStatus === 'ENTREGUE') {
        updateData.data_entrega = new Date().toISOString().split('T')[0];
      }

      await supabase.from('ordens_servico').update(updateData).eq('id', osId);

      await supabase.from('os_atualizacoes').insert([
        {
          os_id: osId,
          usuario_id: user.id,
          tipo: 'mudanca_status',
          status_anterior: mapStatusToDb(newStatus),
          status_novo: dbStatus,
          observacao: observacao || `Status alterado para ${newStatus}`
        }
      ]);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex((o) => o.id === osId);
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
    if (supabase) {
      await supabase.from('os_atualizacoes').insert([
        {
          os_id: osId,
          usuario_id: user.id,
          tipo: 'observacao',
          observacao: observacao
        }
      ]);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex((o) => o.id === osId);
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
    const qtdNum = parseFloat(quantidade);
    const precoNum = parseFloat(precoUnitario);
    const valorTotalPart = qtdNum * precoNum;

    // Deduct stock in catalog (ALTERAÇÃO #4)
    const parts = await this.getParts();
    const targetPart = parts.find((p) => p.id === pecaId);
    if (targetPart) {
      const newStock = Math.max(0, parseInt(targetPart.estoque_atual || 0) - qtdNum);
      await this.updatePart(pecaId, { ...targetPart, estoque_atual: newStock });
    }

    if (supabase) {
      await supabase.from('os_pecas').insert([
        {
          os_id: osId,
          peca_id: pecaId,
          descricao: targetPart ? targetPart.nome : 'Peça',
          quantidade: qtdNum,
          preco_unitario: precoNum,
          fornecedor: fornecedor || '',
          valor_total: valorTotalPart
        }
      ]);

      // Fetch current OS to update subtotal/valor_final
      const { data: currentOSData } = await supabase.from('ordens_servico').select('valor_mao_obra, valor_pecas').eq('id', osId).single();
      const currentMaoObra = currentOSData ? parseFloat(currentOSData.valor_mao_obra || 0) : 0;
      const currentValorPecas = currentOSData ? parseFloat(currentOSData.valor_pecas || 0) + valorTotalPart : valorTotalPart;
      const newTotal = currentMaoObra + currentValorPecas;

      await supabase.from('ordens_servico').update({
        valor_pecas: currentValorPecas,
        subtotal: newTotal,
        valor_final: newTotal,
        atualizado_em: new Date().toISOString()
      }).eq('id', osId);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex((o) => o.id === osId);
    if (osIndex !== -1) {
      const os = local.orders[osIndex];
      if (!os.pecas) os.pecas = [];

      os.pecas.push({
        id: 'ospec-' + Date.now(),
        peca_id: pecaId,
        quantidade: qtdNum,
        preco_unitario: precoNum,
        fornecedor: fornecedor || ''
      });

      const pecasTotal = os.pecas.reduce((sum, p) => sum + p.quantidade * p.preco_unitario, 0);
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
      await supabase.from('os_atualizacoes').delete().eq('os_id', osId);
      await supabase.from('os_pecas').delete().eq('os_id', osId);
      await supabase.from('ordens_servico').delete().eq('id', osId);
    }

    const local = getLocalData();
    local.orders = local.orders.filter((o) => o.id !== osId);
    saveLocalData(local);
    return true;
  }
};
