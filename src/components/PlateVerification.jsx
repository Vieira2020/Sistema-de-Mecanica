import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, Plus, CheckCircle, Search, AlertCircle, FileText } from 'lucide-react';

export const PlateVerification = () => {
  const { user, isAdmin } = useAuth();
  const [verifications, setVerifications] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    veiculo_id: '',
    status_consulta: 'SEM_RESTRICAO',
    observacao: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [vers, vehs, clis] = await Promise.all([
      db.getPlateVerifications(),
      db.getVehicles(),
      db.getClients()
    ]);
    setVerifications(vers || []);
    setVehicles(vehs || []);
    setClients(clis || []);
    setLoading(false);
  };

  const handleCreateVerification = async (e) => {
    e.preventDefault();
    if (!formData.veiculo_id) {
      alert('Selecione um veículo.');
      return;
    }

    await db.addPlateVerification({
      ...formData,
      responsavel_id: user.id
    });

    setShowModal(false);
    setFormData({ veiculo_id: '', status_consulta: 'SEM_RESTRICAO', observacao: '' });
    loadData();
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg text-red-900">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="font-bold text-lg">Acesso Restrito ao Administrador</h3>
            <p className="text-sm">
              O módulo de auditoria e verificação formal de placas (RF-007) é visível apenas para o perfil Administrador para garantir a segurança jurídica da oficina.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#032326] text-white p-6 rounded-xl border-l-8 border-amber-500 shadow">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold font-serif">Verificação e Auditoria de Placas (RF-007)</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Registro prévio obrigatório de consulta de placa para prevenção de receptação e riscos legais na oficina.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#8C4580] hover:bg-[#723668] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          Nova Verificação de Placa
        </button>
      </div>

      {/* Info Notice */}
      <div className="bg-[#125938] text-white p-4 rounded-lg flex items-start gap-3 border border-emerald-700">
        <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-emerald-200">Trilha de Auditoria Interna Legal:</p>
          <p>
            Antes de autorizar qualquer Ordem de Serviço, a placa do veículo deve ser verificada e registrada com data, responsável e observação da consulta efetuada nas bases públicas/policiais.
          </p>
        </div>
      </div>

      {/* Verification History Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="p-4 bg-[#06402F] text-white flex justify-between items-center">
          <h3 className="font-bold font-serif text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8C4580]" />
            Histórico Registrado de Consultas ({verifications.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando histórico...</div>
        ) : verifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Nenhuma verificação de placa registrada ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-bold border-b uppercase">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Veículo / Placa</th>
                  <th className="p-3">Proprietário</th>
                  <th className="p-3">Status Consulta</th>
                  <th className="p-3">Observações da Verificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {verifications.map((ver) => {
                  const veh = vehicles.find((v) => v.id === ver.veiculo_id);
                  const cli = veh ? clients.find((c) => c.id === veh.cliente_id) : null;
                  const dt = new Date(ver.data_hora).toLocaleString('pt-BR');

                  return (
                    <tr key={ver.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-600 whitespace-nowrap">{dt}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold bg-[#032326] text-white px-2 py-0.5 rounded mr-1">
                          {veh?.placa || 'PLACA N/A'}
                        </span>
                        <span className="text-gray-800 font-semibold">{veh?.modelo}</span>
                      </td>
                      <td className="p-3 text-gray-700">{cli?.nome || 'Cliente N/A'}</td>
                      <td className="p-3">
                        {ver.status_consulta === 'SEM_RESTRICAO' ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Sem Restrição
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Em Análise
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600 italic">{ver.observacao || 'Sem observações'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova Verificação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border-t-8 border-[#8C4580]">
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Registrar Verificação de Placa
            </h3>

            <form onSubmit={handleCreateVerification} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Selecione o Veículo *</label>
                <select
                  value={formData.veiculo_id}
                  onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                  required
                  className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#8C4580]"
                >
                  <option value="">-- Selecione o Veículo --</option>
                  {vehicles.map((v) => {
                    const c = clients.find((cli) => cli.id === v.cliente_id);
                    return (
                      <option key={v.id} value={v.id}>
                        {v.placa} - {v.modelo} ({c ? c.nome : 'Cliente'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Resultado da Consulta *</label>
                <select
                  value={formData.status_consulta}
                  onChange={(e) => setFormData({ ...formData, status_consulta: e.target.value })}
                  className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#8C4580]"
                >
                  <option value="SEM_RESTRICAO">Sem Restrição (Aprovado)</option>
                  <option value="EM_ANALISE">Aguardando Documentação / Em Análise</option>
                  <option value="RESTRICAO_IDENTIFICADA">Restrição Identificada (ALERTA)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detalhes / Observações da Verificação *</label>
                <textarea
                  rows={3}
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  placeholder="Ex: Consulta realizada no sistema público de placas. Nenhuma restrição de furto/roubo encontrada."
                  required
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#125938] hover:bg-[#06402F] text-white rounded font-bold shadow"
                >
                  Salvar Registro de Auditoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
