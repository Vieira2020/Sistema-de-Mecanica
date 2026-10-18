import React, { useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Wrench, UserPlus, Car, Calendar, User, ShieldCheck } from 'lucide-react';

export const OSForm = ({ clients, vehicles, users, onClose, onSuccess, initialVehicle = null, initialClient = null }) => {
  const { user, isAdmin } = useAuth();
  const currentYear = 2026;

  // Toggle for creating new client/vehicle inline vs selecting existing
  const [isNewClient, setIsNewClient] = useState(false);
  const [isNewVehicle, setIsNewVehicle] = useState(false);

  // Form states with complete reset on initialization (Alteração #14)
  const [formData, setFormData] = useState({
    cliente_id: initialClient ? initialClient.id : (clients[0]?.id || ''),
    veiculo_id: initialVehicle ? initialVehicle.id : (vehicles[0]?.id || ''),
    responsavel_id: users.find(u => u.perfil === 'MECANICO' || u.perfil === 'FUNILEIRO')?.id || user.id,
    tipo_servico: 'MECANICA',
    previsao_entrega: '',
    mao_de_obra: '0',
    observacao_inicial: 'Veículo recebido na oficina para triagem e diagnóstico.'
  });

  // Inline client creation inputs
  const [newClientData, setNewClientData] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    endereco: ''
  });

  // Inline vehicle creation inputs
  const [newVehicleData, setNewVehicleData] = useState({
    placa: '',
    modelo: '',
    cor: '',
    ano: currentYear,
    observacoes: ''
  });

  const availableVehicles = vehicles.filter(v => v.cliente_id === formData.cliente_id);

  const handleClientSelectChange = (clientId) => {
    const vehs = vehicles.filter(v => v.cliente_id === clientId);
    setFormData(prev => ({
      ...prev,
      cliente_id: clientId,
      veiculo_id: vehs[0]?.id || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let targetClientId = formData.cliente_id;
    let targetVehicleId = formData.veiculo_id;

    // 1. Create client inline if selected (Alteração #3 & #6)
    if (isNewClient) {
      if (!newClientData.nome.trim() || !newClientData.telefone.trim()) {
        alert('Por favor, informe o nome e telefone do novo cliente.');
        return;
      }
      const createdClient = await db.addClient(newClientData);
      targetClientId = createdClient.id;
    }

    // 2. Create vehicle inline if selected (Alteração #3, #6, #7)
    if (isNewVehicle || isNewClient) {
      if (!newVehicleData.placa.trim() || !newVehicleData.modelo.trim()) {
        alert('Por favor, informe a placa e o modelo do veículo.');
        return;
      }

      // Validate vehicle year limits: >= 1950 and <= 2026 (Alteração #7)
      const vehYear = parseInt(newVehicleData.ano);
      if (isNaN(vehYear) || vehYear < 1950 || vehYear > currentYear) {
        alert(`O ano do carro deve estar entre 1950 e o ano atual (${currentYear}).`);
        return;
      }

      const createdVehicle = await db.addVehicle({
        ...newVehicleData,
        cliente_id: targetClientId
      });
      targetVehicleId = createdVehicle.id;
    }

    if (!targetClientId || !targetVehicleId) {
      alert('Selecione ou cadastre o Cliente e o Veículo.');
      return;
    }

    // 3. Create OS
    await db.createOS({
      ...formData,
      cliente_id: targetClientId,
      veiculo_id: targetVehicleId
    }, user);

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4 border-t-8 border-[#125938] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#8C4580]" />
            Abrir Nova Ordem de Serviço
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* CLIENT SECTION */}
          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-[#06402F] text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#8C4580]" />
                Informações do Cliente / Proprietário
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewClient(!isNewClient);
                  if (!isNewClient) setIsNewVehicle(true);
                }}
                className="text-[#8C4580] font-bold text-xs underline hover:text-[#6b3361]"
              >
                {isNewClient ? '← Selecionar Cliente Existente' : '+ Cadastrar Novo Cliente'}
              </button>
            </div>

            {isNewClient ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Roberto Silva"
                    value={newClientData.nome}
                    onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-8888"
                    value={newClientData.telefone}
                    onChange={(e) => setNewClientData({ ...newClientData, telefone: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="123.456.789-00"
                    value={newClientData.cpf}
                    onChange={(e) => setNewClientData({ ...newClientData, cpf: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    placeholder="Rua, Número - Bairro"
                    value={newClientData.endereco}
                    onChange={(e) => setNewClientData({ ...newClientData, endereco: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => handleClientSelectChange(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-white font-semibold text-gray-800 focus:ring-2 focus:ring-[#125938]"
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.telefone ? `(${c.telefone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* VEHICLE SECTION */}
          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-[#06402F] text-sm flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#8C4580]" />
                Informações do Veículo
              </label>
              {!isNewClient && (
                <button
                  type="button"
                  onClick={() => setIsNewVehicle(!isNewVehicle)}
                  className="text-[#8C4580] font-bold text-xs underline hover:text-[#6b3361]"
                >
                  {isNewVehicle ? '← Selecionar Veículo Existente' : '+ Cadastrar Novo Veículo'}
                </button>
              )}
            </div>

            {isNewVehicle || isNewClient ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    placeholder="ABC1D23"
                    value={newVehicleData.placa}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, placa: e.target.value.toUpperCase() })}
                    className="w-full border rounded p-2 font-mono font-bold uppercase focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marca / Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: VW Gol 1.6"
                    value={newVehicleData.modelo}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, modelo: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Prata / Preto"
                    value={newVehicleData.cor}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, cor: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ano do Carro (1950 - {currentYear}) *</label>
                  <input
                    type="number"
                    min="1950"
                    max={currentYear}
                    required
                    value={newVehicleData.ano}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, ano: e.target.value })}
                    className="w-full border rounded p-2 font-mono focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Observações do Veículo</label>
                  <input
                    type="text"
                    placeholder="Avarias, barulhos ou riscos aparentes"
                    value={newVehicleData.observacoes}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, observacoes: e.target.value })}
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <select
                  value={formData.veiculo_id}
                  onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                  required
                  className="w-full border rounded p-2 bg-white font-semibold text-gray-800 focus:ring-2 focus:ring-[#125938]"
                >
                  <option value="">-- Selecione o Veículo --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} ({v.cor})
                    </option>
                  ))}
                </select>
                {availableVehicles.length === 0 && (
                  <p className="text-[11px] text-amber-700 mt-1 font-semibold">
                    Este cliente não possui veículos cadastrados. Clique em "+ Cadastrar Novo Veículo" acima.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SERVICE DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                className="w-full border rounded p-2 bg-gray-50 font-semibold text-gray-800"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.perfil})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938] disabled:bg-gray-100 font-mono font-bold text-[#06402F]"
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
