import { createClient } from '@supabase/supabase-js';

// Default project configuration provided for Shibuya Motores
const DEFAULT_SUPABASE_URL = 'https://txiifnwudneznudawglc.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_7ySVIPOaOU3baOz-QyLaog_6EHumShw';

// Helper mapping for status values between frontend (UPPERCASE) and Supabase enum (lowercase)
const STATUS_TO_REMOTE = {
  'RECEBIDO': 'recebido',
  'EM_DIAGNOSTICO': 'em_diagnostico',
  'EM_FUNILARIA': 'em_funilaria',
  'EM_MECANICA': 'em_mecanica',
  'AGUARDANDO_PECA': 'aguardando_pecas',
  'PRONTO': 'pronto_entrega',
  'ENTREGUE': 'entregue'
};

const STATUS_FROM_REMOTE = {
  'recebido': 'RECEBIDO',
  'em_diagnostico': 'EM_DIAGNOSTICO',
  'em_funilaria': 'EM_FUNILARIA',
  'em_mecanica': 'EM_MECANICA',
  'aguardando_pecas': 'AGUARDANDO_PECA',
  'pronto_entrega': 'PRONTO',
  'entregue': 'ENTREGUE'
};

// Keys from localStorage or Vite environment with default fallbacks
const getSupabaseConfig = () => {
  let customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('shibuya_supabase_url') : null;
  let customKey = typeof localStorage !== 'undefined' ? localStorage.getItem('shibuya_supabase_key') : null;

  let url = customUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
  let key = customKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_KEY;

  if (url) {
    url = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  }

  return { url, key, isConfigured: Boolean(url && key) };
};

const config = getSupabaseConfig();

export const supabase = config.isConfigured
  ? createClient(config.url, config.key)
  : null;

export const isSupabaseConnected = () => Boolean(supabase);

export const saveSupabaseConfig = (url, key) => {
  if (typeof localStorage !== 'undefined') {
    if (url) localStorage.setItem('shibuya_supabase_url', url.trim());
    else localStorage.removeItem('shibuya_supabase_url');

    if (key) localStorage.setItem('shibuya_supabase_key', key.trim());
    else localStorage.removeItem('shibuya_supabase_key');
  }

  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('shibuya_supabase_url');
    localStorage.removeItem('shibuya_supabase_key');
  }
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};

// Seed initial data for local storage mode fallback
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

const getLocalData = () => {
  if (typeof localStorage === 'undefined') return INITIAL_SEED;
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
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('shibuya_db', JSON.stringify(data));
  }
};

// DATA ACCESS LAYER
export const db = {
  // CLIENTS
  async getClients() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('clientes').select('*').order('criado_em', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    return getLocalData().clients;
  },

  async addClient(clientData) {
    if (supabase) {
      try {
        const payload = {
          nome: clientData.nome,
          telefone: clientData.telefone,
          cpf: clientData.cpf || null,
          endereco: clientData.endereco || null
        };
        const { data, error } = await supabase.from('clientes').insert([payload]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {}
    }

    const newClient = {
      id: 'cli-' + Date.now(),
      nome: clientData.nome,
      telefone: clientData.telefone,
      cpf: clientData.cpf || null,
      endereco: clientData.endereco || null,
      criado_em: new Date().toISOString()
    };
    const local = getLocalData();
    local.clients.unshift(newClient);
    saveLocalData(local);
    return newClient;
  },

  // VEHICLES
  async getVehicles() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('veiculos').select('*').order('criado_em', { ascending: false });
        if (!error && data) return data;
      } catch (e) {}
    }
    return getLocalData().vehicles;
  },

  async addVehicle(vehicleData) {
    const cleanPlaca = vehicleData.placa ? vehicleData.placa.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    if (supabase) {
      try {
        const payload = {
          cliente_id: vehicleData.cliente_id,
          placa: cleanPlaca,
          modelo: vehicleData.modelo,
          cor: vehicleData.cor,
          ano: vehicleData.ano ? parseInt(vehicleData.ano) : null,
          observacoes: vehicleData.observacoes || ''
        };
        const { data, error } = await supabase.from('veiculos').insert([payload]).select();
        if (!error && data && data.length > 0) return data[0];
      } catch (e) {}
    }

    const newVehicle = {
      id: 'vec-' + Date.now(),
      cliente_id: vehicleData.cliente_id,
      placa: cleanPlaca,
      modelo: vehicleData.modelo,
      cor: vehicleData.cor,
      ano: vehicleData.ano ? parseInt(vehicleData.ano) : null,
      observacoes: vehicleData.observacoes || '',
      criado_em: new Date().toISOString()
    };

    const local = getLocalData();
    local.vehicles.unshift(newVehicle);
    saveLocalData(local);
    return newVehicle;
  },

  // PLATE VERIFICATION
  async getPlateVerifications() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('verificacoes_placa').select('*').order('data_hora', { ascending: false });
        if (!error && data) {
          return data.map(item => ({
            ...item,
            responsavel_id: item.usuario_id || item.responsavel_id,
            status_consulta: item.status_consulta || 'SEM_RESTRICAO'
          }));
        }
      } catch (e) {}
    }
    return getLocalData().plateVerifications;
  },

  async addPlateVerification(verification) {
    if (supabase) {
      try {
        const payload = {
          veiculo_id: verification.veiculo_id,
          os_id: verification.os_id || null,
          usuario_id: verification.responsavel_id || verification.usuario_id,
          observacao: verification.observacao || 'Verificação efetuada.'
        };
        const { data, error } = await supabase.from('verificacoes_placa').insert([payload]).select();
        if (!error && data && data.length > 0) {
          const item = data[0];
          return {
            ...item,
            responsavel_id: item.usuario_id || verification.responsavel_id,
            status_consulta: 'SEM_RESTRICAO'
          };
        }
      } catch (e) {}
    }

    const record = {
      id: 'ver-' + Date.now(),
      veiculo_id: verification.veiculo_id,
      os_id: verification.os_id || null,
      data_hora: new Date().toISOString(),
      responsavel_id: verification.responsavel_id,
      status_consulta: verification.status_consulta || 'SEM_RESTRICAO',
      observacao: verification.observacao || 'Verificação efetuada.'
    };

    const local = getLocalData();
    local.plateVerifications.unshift(record);
    saveLocalData(local);
    return record;
  },

  // PARTS
  async getParts() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('pecas_catalogo').select('*').order('nome', { ascending: true });
        if (!error && data) {
          return data.map(p => ({
            ...p,
            estoque_atual: p.estoque_atual !== undefined ? p.estoque_atual : 10,
            ultima_atualizacao: p.atualizado_em || p.ultima_atualizacao || new Date().toISOString()
          }));
        }
      } catch (e) {}
    }
    return getLocalData().parts;
  },

  async addPart(partData) {
    if (supabase) {
      try {
        const payload = {
          codigo_interno: partData.codigo_interno,
          nome: partData.nome,
          modelo_compativel: partData.modelo_compativel || '',
          preco_min: parseFloat(partData.preco_min || 0),
          preco_max: parseFloat(partData.preco_max || 0),
          preco_medio: parseFloat(partData.preco_medio || 0)
        };
        const { data, error } = await supabase.from('pecas_catalogo').insert([payload]).select();
        if (!error && data && data.length > 0) {
          const item = data[0];
          return {
            ...item,
            estoque_atual: parseInt(partData.estoque_atual || 10),
            ultima_atualizacao: item.atualizado_em || new Date().toISOString()
          };
        }
      } catch (e) {}
    }

    const newPart = {
      id: 'pec-' + Date.now(),
      codigo_interno: partData.codigo_interno,
      nome: partData.nome,
      modelo_compativel: partData.modelo_compativel || '',
      preco_min: parseFloat(partData.preco_min || 0),
      preco_max: parseFloat(partData.preco_max || 0),
      preco_medio: parseFloat(partData.preco_medio || 0),
      estoque_atual: parseInt(partData.estoque_atual || 10),
      ultima_atualizacao: new Date().toISOString()
    };

    const local = getLocalData();
    local.parts.push(newPart);
    saveLocalData(local);
    return newPart;
  },

  async updatePartStock(partId, newStock) {
    const updatedStock = Math.max(0, parseInt(newStock || 0));
    const local = getLocalData();
    const partIndex = local.parts.findIndex(p => p.id === partId);
    if (partIndex !== -1) {
      local.parts[partIndex].estoque_atual = updatedStock;
      local.parts[partIndex].ultima_atualizacao = new Date().toISOString();
      saveLocalData(local);
    }
    return true;
  },

  // ORDERS (OS)
  async getOSList() {
    if (supabase) {
      try {
        const { data: osData, error } = await supabase.from('ordens_servico').select('*').order('criado_em', { ascending: false });
        if (!error && osData) {
          const [pecasRes, attRes] = await Promise.all([
            supabase.from('os_pecas').select('*'),
            supabase.from('os_atualizacoes').select('*').order('criado_em', { ascending: false })
          ]);

          const pecasByOS = {};
          if (pecasRes.data) {
            pecasRes.data.forEach(p => {
              if (!pecasByOS[p.os_id]) pecasByOS[p.os_id] = [];
              pecasByOS[p.os_id].push({
                id: p.id,
                peca_id: p.peca_id,
                quantidade: p.quantidade,
                preco_unitario: p.preco_unitario,
                fornecedor: p.fornecedor || ''
              });
            });
          }

          const timelineByOS = {};
          if (attRes.data) {
            attRes.data.forEach(a => {
              if (!timelineByOS[a.os_id]) timelineByOS[a.os_id] = [];
              timelineByOS[a.os_id].push({
                id: a.id,
                autor_id: a.usuario_id,
                data_hora: a.criado_em,
                status_anterior: STATUS_FROM_REMOTE[a.status_anterior] || a.status_anterior,
                status_novo: STATUS_FROM_REMOTE[a.status_novo] || a.status_novo,
                observacao: a.observacao
              });
            });
          }

          const localOrders = getLocalData().orders;
          const remoteIds = new Set(osData.map(o => o.id));

          const mergedRemote = osData.map(os => {
            const localMatch = localOrders.find(l => l.id === os.id);
            const currentStatus = localMatch ? localMatch.status : (STATUS_FROM_REMOTE[os.status] || os.status);
            const currentTimeline = (localMatch && localMatch.timeline && localMatch.timeline.length > (timelineByOS[os.id] || []).length)
              ? localMatch.timeline
              : (timelineByOS[os.id] || []);
            const currentPecas = (localMatch && localMatch.pecas && localMatch.pecas.length > (pecasByOS[os.id] || []).length)
              ? localMatch.pecas
              : (pecasByOS[os.id] || []);

            const pecasTotal = currentPecas.reduce((sum, p) => sum + (p.quantidade * p.preco_unitario), 0);
            const maoDeObra = (localMatch && localMatch.mao_de_obra !== undefined)
              ? parseFloat(localMatch.mao_de_obra)
              : parseFloat(os.valor_mao_obra || os.mao_de_obra || 0);

            return {
              ...os,
              responsavel_id: os.criado_por,
              tipo_servico: os.tipo_servico || 'MECANICA',
              mao_de_obra: maoDeObra,
              valor_total: (localMatch && localMatch.valor_total) ? localMatch.valor_total : (pecasTotal + maoDeObra),
              status: currentStatus,
              pecas: currentPecas,
              timeline: currentTimeline
            };
          });

          const localOnly = localOrders.filter(l => !remoteIds.has(l.id));
          return [...mergedRemote, ...localOnly];
        }
      } catch (e) {}
    }
    return getLocalData().orders;
  },

  async createOS(osData, user) {
    if (supabase) {
      try {
        const osPayload = {
          cliente_id: osData.cliente_id,
          veiculo_id: osData.veiculo_id,
          valor_mao_obra: parseFloat(osData.mao_de_obra || 0),
          valor_final: parseFloat(osData.mao_de_obra || 0),
          status: STATUS_TO_REMOTE['RECEBIDO'] || 'recebido',
          criado_por: user.id
        };
        if (osData.previsao_entrega) {
          osPayload.previsao_entrega = osData.previsao_entrega;
        }

        const { data: osResult, error: osErr } = await supabase.from('ordens_servico').insert([osPayload]).select();
        if (!osErr && osResult && osResult.length > 0) {
          const newOs = osResult[0];

          const attPayload = {
            os_id: newOs.id,
            usuario_id: user.id,
            status_anterior: null,
            status_novo: STATUS_TO_REMOTE['RECEBIDO'] || 'recebido',
            observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
          };
          const { data: attData } = await supabase.from('os_atualizacoes').insert([attPayload]).select();

          const initialTimeline = attData && attData.length > 0 ? [{
            id: attData[0].id,
            autor_id: user.id,
            data_hora: attData[0].criado_em,
            status_anterior: null,
            status_novo: 'RECEBIDO',
            observacao: attPayload.observacao
          }] : [{
            id: 'att-' + Date.now(),
            autor_id: user.id,
            data_hora: new Date().toISOString(),
            status_anterior: null,
            status_novo: 'RECEBIDO',
            observacao: osData.observacao_inicial || 'OS criada e veículo recebido.'
          }];

          const fullOs = {
            ...newOs,
            responsavel_id: user.id,
            tipo_servico: osData.tipo_servico || 'MECANICA',
            mao_de_obra: parseFloat(newOs.valor_mao_obra || 0),
            valor_total: parseFloat(newOs.valor_final || 0),
            status: 'RECEBIDO',
            pecas: [],
            timeline: initialTimeline
          };

          const local = getLocalData();
          local.orders.unshift(fullOs);
          saveLocalData(local);

          return fullOs;
        }
      } catch (e) {}
    }

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

    local.orders.unshift(newOS);
    saveLocalData(local);
    return newOS;
  },

  async updateOSPrice(osId, newLaborCost, newTotal) {
    const labor = parseFloat(newLaborCost || 0);
    const total = parseFloat(newTotal || 0);

    if (supabase) {
      try {
        await supabase.from('ordens_servico').update({
          valor_mao_obra: labor,
          valor_final: total,
          atualizado_em: new Date().toISOString()
        }).eq('id', osId);
      } catch (e) {}
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    if (osIndex !== -1) {
      local.orders[osIndex].mao_de_obra = labor;
      local.orders[osIndex].valor_total = total;
      local.orders[osIndex].atualizado_em = new Date().toISOString();
      saveLocalData(local);
    }

    const osList = await this.getOSList();
    return osList.find(o => o.id === osId) || null;
  },

  async deleteOS(osId) {
    if (supabase) {
      try {
        await supabase.from('os_pecas').delete().eq('os_id', osId);
        await supabase.from('os_atualizacoes').delete().eq('os_id', osId);
        await supabase.from('ordens_servico').delete().eq('id', osId);
      } catch (e) {}
    }

    const local = getLocalData();
    local.orders = local.orders.filter(o => o.id !== osId);
    saveLocalData(local);
    return true;
  },

  async updateOSStatus(osId, newStatus, observacao, user) {
    if (supabase) {
      const remoteStatus = STATUS_TO_REMOTE[newStatus] || newStatus.toLowerCase();
      const updateData = {
        status: remoteStatus,
        atualizado_em: new Date().toISOString()
      };
      if (newStatus === 'ENTREGUE') {
        updateData.data_entrega = new Date().toISOString();
      }

      await supabase.from('ordens_servico').update(updateData).eq('id', osId);

      const attPayload = {
        os_id: osId,
        usuario_id: user.id,
        status_novo: remoteStatus,
        observacao: observacao || `Status alterado para ${newStatus}`
      };
      await supabase.from('os_atualizacoes').insert([attPayload]);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    let updatedOSItem = null;

    if (osIndex !== -1) {
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
      updatedOSItem = os;
    }

    const osList = await this.getOSList();
    return osList.find(o => o.id === osId) || updatedOSItem;
  },

  async addOSTimelineNote(osId, observacao, user) {
    if (supabase) {
      const attPayload = {
        os_id: osId,
        usuario_id: user.id,
        observacao: observacao
      };
      await supabase.from('os_atualizacoes').insert([attPayload]);
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    let updatedOSItem = null;

    if (osIndex !== -1) {
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
      updatedOSItem = os;
    }

    const osList = await this.getOSList();
    return osList.find(o => o.id === osId) || updatedOSItem;
  },

  async addPartToOS(osId, pecaId, quantidade, precoUnitario, fornecedor, user) {
    const qtyNum = parseFloat(quantidade || 1);

    // Automatically decrement stock in pecas_catalogo / local
    const allParts = await this.getParts();
    const part = allParts.find(p => p.id === pecaId);
    if (part) {
      const newStock = Math.max(0, (part.estoque_atual || 10) - qtyNum);
      await this.updatePartStock(pecaId, newStock);
    }

    if (supabase) {
      try {
        const osPecaPayload = {
          os_id: osId,
          peca_id: pecaId,
          quantidade: qtyNum,
          preco_unitario: parseFloat(precoUnitario),
          fornecedor: fornecedor || ''
        };
        await supabase.from('os_pecas').insert([osPecaPayload]);

        const { data: pecas } = await supabase.from('os_pecas').select('*').eq('os_id', osId);
        const pecasTotal = pecas ? pecas.reduce((sum, p) => sum + (p.quantidade * p.preco_unitario), 0) : 0;

        const { data: osData } = await supabase.from('ordens_servico').select('valor_mao_obra').eq('id', osId).single();
        const maoDeObra = osData ? parseFloat(osData.valor_mao_obra || 0) : 0;
        const novoTotal = pecasTotal + maoDeObra;

        await supabase.from('ordens_servico').update({
          valor_pecas: pecasTotal,
          valor_final: novoTotal,
          atualizado_em: new Date().toISOString()
        }).eq('id', osId);
      } catch (e) {}
    }

    const local = getLocalData();
    const osIndex = local.orders.findIndex(o => o.id === osId);
    let updatedOSItem = null;

    if (osIndex !== -1) {
      const os = local.orders[osIndex];
      if (!os.pecas) os.pecas = [];

      const newOsPeca = {
        id: 'ospec-' + Date.now(),
        peca_id: pecaId,
        quantidade: qtyNum,
        preco_unitario: parseFloat(precoUnitario),
        fornecedor: fornecedor || ''
      };

      os.pecas.push(newOsPeca);

      const pecasTotal = os.pecas.reduce((sum, p) => sum + (p.quantidade * p.preco_unitario), 0);
      os.valor_total = pecasTotal + parseFloat(os.mao_de_obra || 0);
      os.atualizado_em = new Date().toISOString();

      local.orders[osIndex] = os;
      saveLocalData(local);
      updatedOSItem = os;
    }

    const osList = await this.getOSList();
    return osList.find(o => o.id === osId) || updatedOSItem;
  },

  // USER MANAGEMENT
  async getUsers() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('usuarios').select('*').eq('ativo', true);
        if (!error && data && data.length > 0) {
          return data.map(u => ({
            id: u.id,
            nome: u.nome,
            login: u.login,
            senha_hash: u.senha_hash,
            perfil: u.perfil === 'administrador' ? 'ADMIN' : u.perfil === 'mecanico' ? 'MECANICO' : (u.perfil || '').toUpperCase(),
            ativo: u.ativo
          }));
        }
      } catch (e) {}
    }
    return getLocalData().users.filter(u => u.ativo !== false);
  },

  async addUser(userData) {
    const remotePerfil = userData.perfil === 'ADMIN' ? 'administrador' : 'mecanico';
    if (supabase) {
      try {
        const payload = {
          nome: userData.nome,
          login: userData.login,
          senha_hash: userData.senha_hash,
          perfil: remotePerfil,
          ativo: true
        };
        const { data, error } = await supabase.from('usuarios').insert([payload]).select();
        if (!error && data && data.length > 0) {
          const u = data[0];
          return {
            id: u.id,
            nome: u.nome,
            login: u.login,
            senha_hash: u.senha_hash,
            perfil: userData.perfil,
            ativo: true
          };
        }
      } catch (e) {}
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      nome: userData.nome,
      login: userData.login,
      senha_hash: userData.senha_hash,
      perfil: userData.perfil || 'MECANICO',
      ativo: true
    };
    const local = getLocalData();
    local.users.push(newUser);
    saveLocalData(local);
    return newUser;
  },

  async deleteUser(userId) {
    if (supabase) {
      try {
        await supabase.from('usuarios').update({ ativo: false }).eq('id', userId);
      } catch (e) {}
    }

    const local = getLocalData();
    const idx = local.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      local.users[idx].ativo = false;
      saveLocalData(local);
    }
    return true;
  }
};
