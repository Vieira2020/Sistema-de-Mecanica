import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Clock, Filter, ChevronRight, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { OSForm } from './OSForm';

const STATUS_LABELS = {
  RECEBIDO: 'Recebido',
  EM_DIAGNOSTICO: 'Em Diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  AGUARDANDO_PECAS: 'Aguardando Peças',
  EM_FUNILARIA: 'Em Funilaria',
  EM_MECANICA: 'Em Mecânica',
  TESTE_QUALIDADE: 'Teste / Qualidade',
  PRONTO_PARA_ENTREGA: 'Pronto p/ Entrega',
  ENTREGUE: 'Entregue'
};

const STATUS_COLORS = {
  RECEBIDO: 'bg-slate-800 text-slate-100',
  EM_DIAGNOSTICO: 'bg-cyan-800 text-cyan-100',
  AGUARDANDO_APROVACAO: 'bg-orange-800 text-orange-100',
  AGUARDANDO_PECAS: 'bg-amber-800 text-amber-100',
  EM_FUNILARIA: 'bg-teal-800 text-teal-100',
  EM_MECANICA: 'bg-emerald-800 text-emerald-100',
  TESTE_QUALIDADE: 'bg-purple-800 text-purple-100',
  PRONTO_PARA_ENTREGA: 'bg-green-800 text-green-100',
  ENTREGUE: 'bg-gray-600 text-gray-200'
};

export const OSList = ({ searchTerm, statusFilter, setStatusFilter, onSelectOS }) => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ordList, cliList, vehList, usrList] = await Promise.all([
      db.getOSList(),
      db.getClients(),
      db.getVehicles(),
      db.getUsers()
    ]);
    setOrders(ordList || []);
    setClients(cliList || []);
    setVehicles(vehList || []);
    setUsers(usrList || []);
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering logic
  const term = searchTerm ? searchTerm.toLowerCase().trim() : '';

  const filteredOrders = orders.filter((os) => {
    const veh = vehicles.find((v) => v.id === os.veiculo_id);
    const cli = clients.find((c) => c.id === os.cliente_id);

    // Search term check
    const matchesNumber = String(os.numero).includes(term);
    const matchesPlate = veh?.placa.toLowerCase().includes(term);
    const matchesModel = veh?.modelo.toLowerCase().includes(term);
    const matchesClient = cli?.nome.toLowerCase().includes(term);

    const matchesSearch = !term || matchesNumber || matchesPlate || matchesModel || matchesClient;

    // Status filter check
    if (!matchesSearch) return false;

    if (statusFilter === 'TODAS') return true;
    if (statusFilter === 'EM_ABERTO') return os.status !== 'ENTREGUE';
    if (statusFilter === 'ATRASADOS') return os.status !== 'ENTREGUE' && os.previsao_entrega && os.previsao_entrega < todayStr;
    return os.status === statusFilter;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Carregando Ordens de Serviço...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#032326] text-white p-6 rounded-xl border-l-8 border-[#8C4580] shadow">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#8C4580]" />
            <h2 className="text-xl font-bold font-serif">Gestão de Ordens de Serviço (OS)</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Rastreabilidade e controle de status de atendimento para oficina e funilaria.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#125938] hover:bg-[#06402F] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition border border-emerald-600"
        >
          <Plus className="w-4 h-4" /> Nova Ordem de Serviço
        </button>
      </div>

      {/* Filter Chips */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#8C4580]" /> Filtrar por Status do Atendimento:
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'EM_ABERTO', label: 'Em Aberto' },
            { id: 'TODAS', label: 'Todas as OS' },
            { id: 'ATRASADOS', label: '⚠️ Atrasados' },
            { id: 'RECEBIDO', label: '1. Recebido' },
            { id: 'EM_DIAGNOSTICO', label: '2. Em Diagnóstico' },
            { id: 'AGUARDANDO_APROVACAO', label: '3. Ag. Aprovação' },
            { id: 'AGUARDANDO_PECAS', label: '4. Ag. Peças' },
            { id: 'EM_FUNILARIA', label: '5. Em Funilaria' },
            { id: 'EM_MECANICA', label: '6. Em Mecânica' },
            { id: 'TESTE_QUALIDADE', label: '7. Teste/Qualidade' },
            { id: 'PRONTO_PARA_ENTREGA', label: '8. Pronto p/ Entrega' },
            { id: 'ENTREGUE', label: '9. Entregues' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === f.id
                  ? 'bg-[#032326] text-white shadow font-bold ring-2 ring-[#8C4580]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* OS Cards List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500 text-sm">
            Nenhuma Ordem de Serviço encontrada para os filtros selecionados.
          </div>
        ) : (
          filteredOrders.map((os) => {
            const veh = vehicles.find((v) => v.id === os.veiculo_id);
            const cli = clients.find((c) => c.id === os.cliente_id);
            const resp = users.find((u) => u.id === os.responsavel_id);

            const isDelayed = os.status !== 'ENTREGUE' && os.previsao_entrega && os.previsao_entrega < todayStr;

            return (
              <div
                key={os.id}
                onClick={() => onSelectOS(os.id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 p-4 transition cursor-pointer hover:border-[#125938] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-base text-[#06402F]">OS #{os.numero}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                        STATUS_COLORS[os.status] || 'bg-gray-800 text-white'
                      }`}
                    >
                      {STATUS_LABELS[os.status] || os.status}
                    </span>

                    {isDelayed && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Atrasado
                      </span>
                    )}

                    <span className="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold px-2 py-0.5 rounded">
                      Tipo: {os.tipo_servico}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-700">
                    <div>
                      <span className="text-gray-400 font-sans">Veículo: </span>
                      <span className="font-mono font-bold bg-[#032326] text-white px-1.5 py-0.2 rounded text-[11px]">
                        {veh?.placa || 'PLACA'}
                      </span>{' '}
                      <span className="font-bold">{veh?.modelo || 'Modelo N/A'}</span> ({veh?.cor})
                    </div>

                    {isAdmin && cli && (
                      <div>
                        <span className="text-gray-400">Cliente: </span>
                        <span className="font-semibold text-gray-900">{cli.nome}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-gray-500 pt-1">
                    <span>Resp: <strong className="text-gray-700">{resp?.nome || 'N/A'}</strong></span>
                    <span>Entrada: {new Date(os.data_entrada).toLocaleDateString('pt-BR')}</span>
                    {os.previsao_entrega && <span>Previsão: {os.previsao_entrega}</span>}
                  </div>
                </div>

                {/* Right side values & action */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {isAdmin ? (
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Valor Total</span>
                      <span className="text-base font-bold font-mono text-[#06402F]">
                        R$ {parseFloat(os.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500 italic">Detalhes Técnicos</span>
                  )}

                  <span className="text-xs text-[#8C4580] font-bold flex items-center gap-1 mt-1">
                    Acessar OS <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar OS */}
      {showCreateModal && (
        <OSForm
          clients={clients}
          vehicles={vehicles}
          users={users}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
};
