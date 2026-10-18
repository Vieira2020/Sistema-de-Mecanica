import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { Wrench, Clock, DollarSign, Package, AlertTriangle, ChevronRight, Hammer, ShieldCheck, Users, UserPlus } from 'lucide-react';

export const Dashboard = ({ onSelectStatusFilter, onNavigateToOS, onNavigateToTab }) => {
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [ordList, prtList, vehList] = await Promise.all([
      db.getOSList(),
      db.getParts(),
      db.getVehicles()
    ]);
    setOrders(ordList || []);
    setParts(prtList || []);
    setVehicles(vehList || []);
    setLoading(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const openOrders = orders.filter((o) => o.status !== 'ENTREGUE');
  const delayedOrders = openOrders.filter((o) => o.previsao_entrega && o.previsao_entrega < todayStr);
  const totalFaturamento = orders.reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0);
  const totalMaoDeObra = orders.reduce((sum, o) => sum + (parseFloat(o.mao_de_obra) || 0), 0);

  const statusCounts = {
    RECEBIDO: orders.filter((o) => o.status === 'RECEBIDO').length,
    EM_DIAGNOSTICO: orders.filter((o) => o.status === 'EM_DIAGNOSTICO').length,
    AGUARDANDO_APROVACAO: orders.filter((o) => o.status === 'AGUARDANDO_APROVACAO').length,
    AGUARDANDO_PECAS: orders.filter((o) => o.status === 'AGUARDANDO_PECAS').length,
    EM_FUNILARIA: orders.filter((o) => o.status === 'EM_FUNILARIA').length,
    EM_MECANICA: orders.filter((o) => o.status === 'EM_MECANICA').length,
    TESTE_QUALIDADE: orders.filter((o) => o.status === 'TESTE_QUALIDADE').length,
    PRONTO_PARA_ENTREGA: orders.filter((o) => o.status === 'PRONTO_PARA_ENTREGA').length,
    ENTREGUE: orders.filter((o) => o.status === 'ENTREGUE').length
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-700">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#125938] border-t-transparent mb-2"></div>
        <p>Carregando dados do Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Admin Shortcut Center (Alteração #5) */}
      <div className="bg-[#032326] text-white p-6 rounded-xl shadow-md border-l-8 border-[#8C4580] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">
            Painel Geral de Gestão — Shibuya Motores
          </h2>
          <p className="text-sm text-gray-300 font-sans mt-1">
            Visão consolidada de serviços de mecânica, funilaria e faturamento.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('users')}
            className="bg-[#8C4580] hover:bg-[#6b3361] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar / Gerenciar Usuários
          </button>
          <span className="bg-[#125938] text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border border-emerald-700">
            <ShieldCheck className="w-4 h-4 text-[#8C4580]" />
            Atalhos Administrativos Protegidos
          </span>
        </div>
      </div>

      {/* Primary KPI Cards with Hover Previews (Alteração #9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open OS */}
        <div
          onClick={() => onNavigateToOS && onNavigateToOS()}
          className="relative group bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-[#308C50] cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-sans tracking-wider text-gray-300">OS em Aberto</span>
            <div className="p-2 bg-[#125938] rounded-lg">
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{openOrders.length}</p>
          <p className="text-xs text-gray-300 mt-2 flex items-center gap-1">
            <span>Serviços em andamento na oficina</span>
          </p>

          {/* Hover Tooltip/Preview (Alteração #9) */}
          <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 border border-emerald-700">
            <p className="font-bold border-b border-gray-700 pb-1 mb-1 text-emerald-400">Resumo de OS em Aberto</p>
            <p>Mecânica: <span className="font-mono font-bold text-white">{statusCounts.EM_MECANICA}</span></p>
            <p>Funilaria: <span className="font-mono font-bold text-white">{statusCounts.EM_FUNILARIA}</span></p>
            <p>Aguardando Peças: <span className="font-mono font-bold text-amber-300">{statusCounts.AGUARDANDO_PECAS}</span></p>
          </div>
        </div>

        {/* Delayed OS */}
        <div
          onClick={() => onSelectStatusFilter && onSelectStatusFilter('ATRASADOS')}
          className="relative group bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-amber-500 cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-sans tracking-wider text-gray-300">OS Atrasadas</span>
            <div className="p-2 bg-amber-950 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-400 font-mono">{delayedOrders.length}</p>
          <p className="text-xs text-amber-200 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Ultrapassaram a previsão de entrega</span>
          </p>

          {/* Hover Tooltip/Preview (Alteração #9) */}
          <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 border border-amber-500">
            <p className="font-bold border-b border-gray-700 pb-1 mb-1 text-amber-400">Próximos Vencimentos</p>
            {delayedOrders.length === 0 ? (
              <p className="text-emerald-400">Nenhuma OS em atraso!</p>
            ) : (
              delayedOrders.slice(0, 3).map(o => (
                <p key={o.id} className="truncate">
                  <span className="font-mono font-bold text-amber-300">OS #{o.numero}:</span> {o.previsao_entrega}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="relative group bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-[#8C4580]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-sans tracking-wider text-gray-300">Faturamento Total</span>
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

          {/* Hover Tooltip/Preview (Alteração #9) */}
          <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 border border-[#8C4580]">
            <p className="font-bold border-b border-gray-700 pb-1 mb-1 text-[#8C4580]">Composição Financeira</p>
            <p>Mão de Obra Total: <span className="font-mono font-bold text-emerald-400">R$ {totalMaoDeObra.toFixed(2)}</span></p>
            <p>Peças Utilizadas: <span className="font-mono font-bold text-purple-300">R$ {(totalFaturamento - totalMaoDeObra).toFixed(2)}</span></p>
          </div>
        </div>

        {/* Parts Count */}
        <div className="relative group bg-[#032326] text-white p-5 rounded-xl shadow-md border-t-4 border-emerald-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-sans tracking-wider text-gray-300">Catálogo de Peças</span>
            <div className="p-2 bg-[#125938] rounded-lg">
              <Package className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{parts.length}</p>
          <p className="text-xs text-emerald-300 mt-2">
            Itens cadastrados no sistema
          </p>

          {/* Hover Tooltip/Preview (Alteração #9) */}
          <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-30 border border-emerald-500">
            <p className="font-bold border-b border-gray-700 pb-1 mb-1 text-emerald-400">Amostra do Catálogo</p>
            {parts.slice(0, 3).map(p => (
              <p key={p.id} className="truncate">
                <span className="font-mono text-gray-400">{p.codigo_interno}:</span> {p.nome} ({p.estoque_atual} un)
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles Status Quick Breakdown */}
      <div className="bg-[#125938] text-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Hammer className="w-5 h-5 text-[#8C4580]" />
              Onde estão os veículos agora? (Acompanhamento em Tempo Real)
            </h3>
            <p className="text-xs text-emerald-100">
              Passe o mouse para preview rápido ou clique em um setor para filtrar as Ordens de Serviço.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'EM_MECANICA', title: 'Em Mecânica', count: statusCounts.EM_MECANICA, color: 'bg-emerald-900 border-emerald-600' },
            { id: 'EM_FUNILARIA', title: 'Em Funilaria', count: statusCounts.EM_FUNILARIA, color: 'bg-teal-900 border-teal-600' },
            { id: 'EM_DIAGNOSTICO', title: 'Em Diagnóstico', count: statusCounts.EM_DIAGNOSTICO, color: 'bg-cyan-900 border-cyan-600' },
            { id: 'AGUARDANDO_PECAS', title: 'Aguardando Peças', count: statusCounts.AGUARDANDO_PECAS, color: 'bg-amber-900 border-amber-600' },
            { id: 'TESTE_QUALIDADE', title: 'Teste / Qualidade', count: statusCounts.TESTE_QUALIDADE, color: 'bg-purple-900 border-purple-600' },
            { id: 'PRONTO_PARA_ENTREGA', title: 'Pronto p/ Entrega', count: statusCounts.PRONTO_PARA_ENTREGA, color: 'bg-green-900 border-green-600' },
            { id: 'RECEBIDO', title: 'Recebido', count: statusCounts.RECEBIDO, color: 'bg-slate-900 border-slate-600' },
            { id: 'AGUARDANDO_APROVACAO', title: 'Aguardando Aprov.', count: statusCounts.AGUARDANDO_APROVACAO, color: 'bg-orange-900 border-orange-600' },
            { id: 'ENTREGUE', title: 'Entregues', count: statusCounts.ENTREGUE, color: 'bg-gray-800 border-gray-600' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectStatusFilter && onSelectStatusFilter(item.id)}
              className={`relative group p-3 rounded-lg border text-white cursor-pointer hover:opacity-90 transition ${item.color}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-sans text-gray-200">{item.title}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold font-mono mt-1">{item.count}</p>

              {/* Hover Tooltip for each status stage (Alteração #9) */}
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-56 bg-gray-900 text-white text-xs p-2.5 rounded shadow-xl z-30 border border-gray-700">
                <p className="font-bold text-emerald-400 mb-1">{item.title} ({item.count} veículos)</p>
                {orders.filter(o => o.status === item.id).length === 0 ? (
                  <p className="text-gray-400 text-[11px]">Nenhum veículo nesta etapa.</p>
                ) : (
                  orders.filter(o => o.status === item.id).slice(0, 3).map(o => (
                    <p key={o.id} className="text-[11px] truncate">
                      • OS #{o.numero}
                    </p>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delayed OS List Alert Section */}
      {delayedOrders.length > 0 && (
        <div className="bg-amber-100 border-l-4 border-amber-600 p-4 rounded-lg shadow text-amber-950">
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
