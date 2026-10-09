import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Wrench, UserPlus, Car, Plus, AlertCircle } from 'lucide-react';

export const OSForm = ({ clients: initialClients = [], vehicles: initialVehicles = [], users = [], onClose, onSuccess, initialVehicle = null, initialClient = null }) => {
  const { user, isAdmin } = useAuth();

  const [clientsList, setClientsList] = useState(initialClients);
  const [vehiclesList, setVehiclesList] = useState(initialVehicles);

  // Toggle inline client / vehicle creation
  const [showInlineClient, setShowInlineClient] = useState(false);
  const [showInlineVehicle, setShowInlineVehicle] = useState(false);

  // New inline client state
  const [newClientData, setNewClientData] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    endereco: ''
  });

  // New inline vehicle state (Alteração #7: Year restriction between 1950 and current year 2026)
  const currentYear = new Date().getFullYear();
  const [newVehicleData, setNewVehicleData] = useState({
    placa: '',
    modelo: '',
    cor: '',
    ano: String(currentYear),
    observacoes: ''
  });

  // Form Reset (Alteração #14: Reset form fields when opening)
  const [formData, setFormData] = useState({
    cliente_id: initialClient ? initialClient.id : (initialClients[0]?.id || ''),
    veiculo_id: initialVehicle ? initialVehicle.id : (initialVehicles[0]?.id || ''),
    responsavel_id: users.find(u => u.perfil === 'MECANICO')?.id || user.id,
    tipo_servico: 'MECANICA',
    previsao_entrega: '',
    mao_de_obra: '0',
    observacao_inicial: 'Veículo recebido na oficina para início de triagem e diagnóstico.'
  });

  useEffect(() => {
    setClientsList(initialClients);
    setVehiclesList(initialVehicles);
  }, [initialClients, initialVehicles]);

  const availableVehicles = vehiclesList.filter(v => v.cliente_id === formData.cliente_id);

  const handleClientChange = (clientId) => {
    const vehs = vehiclesList.filter(v => v.cliente_id === clientId);
    setFormData(prev => ({
      ...prev,
      cliente_id: clientId,
      veiculo_id: vehs[0]?.id || ''
    }));
  };

  // Inline Client Creation (Alteração #3 & #6)
  const handleCreateInlineClient = async (e) => {
    e.preventDefault();
    if (!newClientData.nome || !newClientData.telefone) {
      alert('Preencha Nome e Telefone do cliente.');
      return;
    }
    const created = await db.addClient(newClientData);
    if (created) {
      setClientsList(prev => [created, ...prev]);
      setFormData(prev => ({ ...prev, cliente_id: created.id }));
      setShowInlineClient(false);
      setNewClientData({ nome: '', telefone: '', cpf: '', endereco: '' });
    }
  };

  // Inline Vehicle Creation (Alteração #3, #6, #7)
  const handleCreateInlineVehicle = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id) {
      alert('Selecione ou cadastre um cliente primeiro.');
      return;
    }
    if (!newVehicleData.placa || !newVehicleData.modelo) {
      alert('Preencha Placa e Modelo do veículo.');
      return;
    }

    const yearNum = parseInt(newVehicleData.ano);
    if (yearNum && (yearNum < 1950 || yearNum > currentYear)) {
      alert(`O ano do veículo deve ser entre 1950 e ${currentYear}.`);
      return;
    }

    const created = await db.addVehicle({
      ...newVehicleData,
      cliente_id: formData.cliente_id
    });

    if (created) {
      setVehiclesList(prev => [created, ...prev]);
      setFormData(prev => ({ ...prev, veiculo_id: created.id }));
      setShowInlineVehicle(false);
      setNewVehicleData({ placa: '', modelo: '', cor: '', ano: String(currentYear), observacoes: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.veiculo_id) {
      alert('Selecione um Cliente e um Veículo para a Ordem de Serviço.');
      return;
    }

    await db.createOS(formData, user);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border-t-8 border-[#125938] my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#8C4580]" />
            Nova Ordem de Serviço
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* CLIENT SELECTION & INLINE CREATION */}
          <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-gray-800 flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-[#125938]" /> Cliente / Proprietário *
              </label>
              <button
                type="button"
                onClick={() => setShowInlineClient(!showInlineClient)}
                className="text-xs text-[#8C4580] hover:text-[#06402F] font-bold flex items-center gap-1 underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {showInlineClient ? 'Selecionar Existente' : 'Cadastrar Novo Cliente'}
              </button>
            </div>

            {showInlineClient ? (
              <div className="bg-white p-3 rounded border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nome Completo *"
                    value={newClientData.nome}
                    onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
                    className="border rounded p-2 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Telefone *"
                    value={newClientData.telefone}
                    onChange={(e) => setNewClientData({ ...newClientData, telefone: e.target.value })}
                    className="border rounded p-2 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="CPF / CNPJ"
                    value={newClientData.cpf}
                    onChange={(e) => setNewClientData({ ...newClientData, cpf: e.target.value })}
                    className="border rounded p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Endereço Completo"
                    value={newClientData.endereco}
                    onChange={(e) => setNewClientData({ ...newClientData, endereco: e.target.value })}
                    className="border rounded p-2 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateInlineClient}
                  className="w-full bg-[#125938] hover:bg-[#06402F] text-white py-1.5 rounded font-bold"
                >
                  Salvar e Selecionar Cliente
                </button>
              </div>
            ) : (
              <select
                value={formData.cliente_id}
                onChange={(e) => handleClientChange(e.target.value)}
                required
                className="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-[#125938]"
              >
                <option value="">-- Selecione o Cliente --</option>
                {clientsList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nome} {c.cpf ? `(${c.cpf})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* VEHICLE SELECTION & INLINE CREATION */}
          <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-gray-800 flex items-center gap-1">
                <Car className="w-4 h-4 text-[#125938]" /> Veículo do Cliente *
              </label>
              <button
                type="button"
                onClick={() => setShowInlineVehicle(!showInlineVehicle)}
                className="text-xs text-[#8C4580] hover:text-[#06402F] font-bold flex items-center gap-1 underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {showInlineVehicle ? 'Selecionar Existente' : 'Cadastrar Novo Veículo'}
              </button>
            </div>

            {showInlineVehicle ? (
              <div className="bg-white p-3 rounded border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Placa (Ex: ABC1D23) *"
                    value={newVehicleData.placa}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, placa: e.target.value.toUpperCase() })}
                    className="border rounded p-2 text-xs font-mono font-bold"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Modelo (Ex: Gol 1.0) *"
                    value={newVehicleData.modelo}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, modelo: e.target.value })}
                    className="border rounded p-2 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Cor"
                    value={newVehicleData.cor}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, cor: e.target.value })}
                    className="border rounded p-2 text-xs"
                  />
                  <input
                    type="number"
                    min="1950"
                    max={currentYear}
                    placeholder={`Ano (1950 - ${currentYear})`}
                    value={newVehicleData.ano}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, ano: e.target.value })}
                    className="border rounded p-2 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateInlineVehicle}
                  className="w-full bg-[#125938] hover:bg-[#06402F] text-white py-1.5 rounded font-bold"
                >
                  Salvar e Selecionar Veículo
                </button>
              </div>
            ) : (
              <>
                <select
                  value={formData.veiculo_id}
                  onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                  required
                  className="w-full border rounded p-2 bg-white focus:ring-2 focus:ring-[#125938]"
                >
                  <option value="">-- Selecione o Veículo --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} ({v.cor})
                    </option>
                  ))}
                </select>
                {availableVehicles.length === 0 && (
                  <p className="text-[11px] text-amber-700 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Nenhum veículo cadastrado para este cliente. Clique acima para cadastrar um.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
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
            <div>
              <label className="block font-bold text-gray-700 mb-1">Previsão de Entrega</label>
              <input
                type="date"
                value={formData.previsao_entrega}
                onChange={(e) => setFormData({ ...formData, previsao_entrega: e.target.value })}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
              />
            </div>

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

          <div>
            <label className="block font-bold text-gray-700 mb-1">Observação Técnica Inicial *</label>
            <textarea
              rows={2}
              value={formData.observacao_inicial}
              onChange={(e) => setFormData({ ...formData, observacao_inicial: e.target.value })}
              required
              className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
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
