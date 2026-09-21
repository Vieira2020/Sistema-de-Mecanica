import React, { useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Calendar, User, Car } from 'lucide-react';

export const OSForm = ({ clients, vehicles, users, onClose, onSuccess, initialVehicle = null, initialClient = null }) => {
  const { user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    cliente_id: initialClient ? initialClient.id : (clients[0]?.id || ''),
    veiculo_id: initialVehicle ? initialVehicle.id : (vehicles[0]?.id || ''),
    responsavel_id: users.find(u => u.perfil === 'MECANICO')?.id || user.id,
    tipo_servico: 'MECANICA',
    previsao_entrega: '',
    mao_de_obra: '0',
    observacao_inicial: 'Veículo recebido na oficina para início de triagem e diagnóstico.'
  });

  const availableVehicles = vehicles.filter(v => v.cliente_id === formData.cliente_id);

  const handleClientChange = (clientId) => {
    const vehs = vehicles.filter(v => v.cliente_id === clientId);
    setFormData(prev => ({
      ...prev,
      cliente_id: clientId,
      veiculo_id: vehs[0]?.id || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.veiculo_id) {
      alert('Selecione o Cliente e o Veículo.');
      return;
    }

    await db.createOS(formData, user);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border-t-8 border-[#125938]">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#8C4580]" />
            Abrir Nova Ordem de Serviço (OS)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Client Selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Cliente / Proprietário *</label>
            <select
              value={formData.cliente_id}
              onChange={(e) => handleClientChange(e.target.value)}
              required
              className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#125938]"
            >
              <option value="">-- Selecione o Cliente --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} {isAdmin && c.cpf ? `(${c.cpf})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Veículo do Cliente *</label>
            <select
              value={formData.veiculo_id}
              onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
              required
              className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#125938]"
            >
              <option value="">-- Selecione o Veículo --</option>
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa} - {v.modelo} ({v.cor})
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">Este cliente não possui veículos cadastrados.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Service Type */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tipo de Serviço *</label>
              <select
                value={formData.tipo_servico}
                onChange={(e) => setFormData({ ...formData, tipo_servico: e.target.value })}
                className="w-full border rounded p-2 bg-gray-50 font-semibold text-[#06402F]"
              >
                <option value="MECANICA">Mecânica</option>
                <option value="FUNILARIA">Funilaria / Lataria</option>
                <option value="AMBOS">Ambos (Mecânica & Funilaria)</option>
              </select>
            </div>

            {/* Responsible Mechanic */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Responsável Técnico *</label>
              <select
                value={formData.responsavel_id}
                onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value })}
                className="w-full border rounded p-2 bg-gray-50"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.perfil})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Delivery Date */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Previsão de Entrega</label>
              <input
                type="date"
                value={formData.previsao_entrega}
                onChange={(e) => setFormData({ ...formData, previsao_entrega: e.target.value })}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
              />
            </div>

            {/* Labor Cost (Admin Only or 0) */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Mão de Obra Inicial (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!isAdmin}
                value={formData.mao_de_obra}
                onChange={(e) => setFormData({ ...formData, mao_de_obra: e.target.value })}
                placeholder="0.00"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938] disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Initial Observation Note */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">Observação Técnica Inicial *</label>
            <textarea
              rows={3}
              value={formData.observacao_inicial}
              onChange={(e) => setFormData({ ...formData, observacao_inicial: e.target.value })}
              required
              className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#125938] hover:bg-[#06402F] text-white rounded font-bold shadow"
            >
              Criar Ordem de Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
