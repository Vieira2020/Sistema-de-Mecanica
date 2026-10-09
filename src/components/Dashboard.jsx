import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import {
  Wrench,
  Clock,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Hammer,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';

export const Dashboard = ({ onSelectStatusFilter, onNavigateToOS }) => {
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hover popover state (ALTERAÇÃO #9)
  const [hoveredStatus, setHoveredStatus] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [ordList, prtList, vehList, cliList] = await Promise.all([
      db.getOSList(),
      db.getParts(),
      db.getVehicles(),
      db.getClients()
    ]);
    setOrders(ordList || []);
    setParts(prtList || []);
    setVehicles(vehList || []);
    setClients(cliList || []);
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const openOrders = orders.filter((o) => o.status !== 'ENTREGUE');
  const delayedOrders = openOrders.filter((o) => o.previsao_entrega && o.previsao_entrega < todayStr);
  const totalFaturamento = orders.reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0);
  const totalMaoDeObra = orders.reduce((sum, o) => sum + (parseFloat(o.mao_de_obra) || 0), 0);

  const statusSectors = [
    { id: 'EM_MECANICA', title: 'Em Mecânica', color: 'bg-emerald-900 border-emerald-600' },
    { id: 'EM_FUNILARIA', title: 'Em Funilaria', color: 'bg-teal-900 border-teal-600' },
    { id: 'EM_DIAGNOSTICO', title: 'Em Diagnóstico', color: 'bg-cyan-900 border-cyan-600' },
    { id: 'AGUARDANDO_PECAS', title: 'Aguardando Peças', color: 'bg-amber-900 border-amber-600' },
    { id: 'TESTE_QUALIDADE', title: 'Teste / Qualidade', color: 'bg-purple-900 border-purple-600' },
    { id: 'PRONTO_PARA_ENTREGA', title: 'Pronto p/ Entrega', color: 'bg-green-900 border-green-600' },
    { id: 'RECEBIDO', title: 'Recebido', color: 'bg-slate-900 border-slate-600' },
    { id: 'AGUARDANDO_APROVACAO', title: 'Aguardando Aprov.', color: 'bg-orange-900 border-orange-600' },
    { id: 'ENTREGUE', title: 'Entregues', color: 'bg-gray-800 border-gray-600' }
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-700 font-sans">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#125938] border-t-transparent mb-2"></div>
        <p>Carregando dados do Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#032326] text-white p-6 rounded-xl shadow-md border-l-8 border-[#8C4580] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">
            Painel Geral de Gestão — Shibuya Motores
          </h2>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Visão consolidada de serviços de mecânica, funilaria e faturamento.
          </p>
        </div>
        <div className="flex gap-2 font-sans">
          <span className="bg-[#125938] text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border border-emerald-700">
            <ShieldCheck className="w-4 h-4 text-[#8C4580]" />
            Ambiente Seguro Admin
          </span>
        </div>
      </div>

      {/* Primary KPI Cards (ALTERAÇÃO #9: Interactive KPI cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Open OS */}
        <div
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('EM_ABERTO')}
          className="bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-[#308C50] cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-300">OS em Aberto</span>
            <div className="p-2 bg-[#125938] rounded-lg">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{openOrders.length}</p>
          <p className="text-xs text-emerald-300 mt-2 flex items-center gap-1">
            <span>Clique para filtrar serviços ativos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </p>
        </div>

        {/* Delayed OS */}
        <div
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ATRASADOS')}
          className="bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-amber-500 cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-300">OS Atrasadas</span>
            <div className="p-2 bg-amber-950 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-400 font-mono">{delayedOrders.length}</p>
          <p className="text-xs text-amber-200 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Clique para ver atrasados ({delayedOrders.length})</span>
          </p>
        </div>

        {/* Total Revenue */}
        <div
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('TODAS')}
          className="bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-[#8C4580] cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-300">Faturamento Total</span>
            <div className="p-2 bg-[#8C4580]/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#8C4580]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-300 mt-2">
            Mão de obra: R$ {totalMaoDeObra.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Parts Count */}
        <div
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('TODAS')}
          className="bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-emerald-500 cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-300">Catálogo de Peças</span>
            <div className="p-2 bg-[#125938] rounded-lg">
              <Package className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{parts.length}</p>
          <p className="text-xs text-emerald-300 mt-2">
            Itens e estoque cadastrados
          </p>
        </div>
      </div>

      {/* Interactive Vehicles Status Breakdown with HOVER PREVIEWS (ALTERAÇÃO #9) */}
      <div className="bg-[#125938] text-white p-6 rounded-xl shadow-md relative">
        <div className="flex justify-between items-center mb-4 font-sans">
          <div>
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Hammer className="w-5 h-5 text-[#8C4580]" />
              Onde estão os veículos agora? (Acompanhamento em Tempo Real)
            </h3>
            <p className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
              <Info className="w-3.5 h-3.5" />
              Passe o mouse por cima de uma aba para ver as informações mais importantes sem precisar sair da página, ou clique para ir para a lista.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-sans">
          {statusSectors.map((sector) => {
            const sectorOrders = orders.filter((o) => o.status === sector.id);

            return (
              <div
                key={sector.id}
                onMouseEnter={() => setHoveredStatus(sector.id)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => onSelectStatusFilter && onSelectStatusFilter(sector.id)}
                className={`p-3 rounded-lg border text-white cursor-pointer hover:scale-[1.03] transition relative group ${sector.color}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-sans text-gray-200 font-bold">{sector.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <p className="text-2xl font-bold font-mono mt-1">{sectorOrders.length}</p>

                {/* Hover Popover Preview (ALTERAÇÃO #9) */}
                {hoveredStatus === sector.id && (
                  <div className="absolute z-30 bottom-full left-0 mb-2 w-64 bg-[#032326] text-white p-3 rounded-xl shadow-2xl border-2 border-[#8C4580] text-xs space-y-2 pointer-events-none animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-emerald-800 pb-1">
                      <span className="font-bold text-[#8C4580] uppercase tracking-wider">{sector.title}</span>
                      <span className="bg-[#125938] px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {sectorOrders.length} veículo(s)
                      </span>
                    </div>

                    {sectorOrders.length === 0 ? (
                      <p className="text-gray-400 italic text-[11px]">Nenhum veículo nesta etapa atualmente.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {sectorOrders.slice(0, 4).map((os) => {
                          const veh = vehicles.find((v) => v.id === os.veiculo_id);
                          const cli = clients.find((c) => c.id === os.cliente_id);

                          return (
                            <div key={os.id} className="bg-[#125938] p-1.5 rounded border border-emerald-700 text-[11px]">
                              <div className="flex justify-between font-bold">
                                <span>OS #{os.numero}</span>
                                <span className="font-mono text-emerald-200">{veh?.placa || 'PLACA'}</span>
                              </div>
                              <p className="text-gray-200 text-[10px] truncate">{veh?.modelo || 'Modelo N/A'}</p>
                              {cli && <p className="text-gray-300 text-[10px] truncate">Cliente: {cli.nome}</p>}
                            </div>
                          );
                        })}
                        {sectorOrders.length > 4 && (
                          <p className="text-[10px] text-emerald-300 italic text-center">+ mais {sectorOrders.length - 4} veículos</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delayed OS List Alert Section */}
      {delayedOrders.length > 0 && (
        <div className="bg-amber-100 border-l-4 border-amber-600 p-4 rounded-lg shadow text-amber-950 font-sans">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <span>Atenção: Ordens de Serviço com Entrega Atrasada ({delayedOrders.length})</span>
          </div>
          <div className="space-y-2 mt-2">
            {delayedOrders.map((os) => (
              <div
                key={os.id}
                onClick={() => onNavigateToOS && onNavigateToOS(os.id)}
                className="bg-white p-3 rounded border border-amber-300 flex justify-between items-center text-xs cursor-pointer hover:bg-amber-50"
              >
                <div>
                  <span className="font-bold font-mono text-emerald-900">OS #{os.numero}</span>
                  <span className="ml-2 font-semibold">Status: {os.status}</span>
                  <p className="text-gray-600 mt-0.5">Previsão: {os.previsao_entrega}</p>
                </div>
                <span className="text-[#8C4580] font-bold flex items-center gap-1">
                  Ver detalhes <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
