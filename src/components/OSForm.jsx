import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, UserPlus, Car, Calendar, DollarSign, FileText } from 'lucide-react';

export const OSForm = ({ clients, vehicles, users, onClose, onSuccess, initialVehicle = null, initialClient = null }) => {
  const { user, isAdmin } = useAuth();

  // Mode state: 'existing' vs 'new_inline'
  const [createMode, setCreateMode] = useState('existing');

  // Existing selection state
  const [selectedClientId, setSelectedClientId] = useState(initialClient ? initialClient.id : (clients[0]?.id || ''));
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicle ? initialVehicle.id : '');

  // Inline new client & vehicle state (ALTERAÇÃO #3 & #6, ALTERAÇÃO #14: cleanly reset)
  const [inlineClient, setInlineClient] = useState({
    nome: '',
    telefone: '',
    cpf: ''
  });

  const [inlineVehicle, setInlineVehicle] = useState({
    placa: '',
    modelo: '',
    cor: '',
    ano: '2022',
    observacoes: ''
  });

  // Common OS state
  const [serviceData, setServiceData] = useState({
    responsavel_id: users.find((u) => u.perfil === 'MECANICO')?.id || user.id,
    tipo_servico: 'MECANICA',
    previsao_entrega: '',
    mao_de_obra: '0',
    observacao_inicial: 'Veículo recebido na oficina para triagem e diagnóstico.'
  });

  // Ensure initial vehicle is set when clients/vehicles load
  useEffect(() => {
    if (selectedClientId && !selectedVehicleId) {
      const available = vehicles.filter((v) => v.cliente_id === selectedClientId);
      if (available.length > 0) {
        setSelectedVehicleId(available[0].id);
      }
    }
  }, [selectedClientId, vehicles]);

  const handleClientSelectChange = (clientId) => {
    setSelectedClientId(clientId);
    const available = vehicles.filter((v) => v.cliente_id === clientId);
    setSelectedVehicleId(available[0]?.id || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let targetClientId = selectedClientId;
    let targetVehicleId = selectedVehicleId;

    if (createMode === 'new_inline') {
      if (!inlineClient.nome || !inlineClient.telefone) {
        alert('Por favor, preencha o Nome e Telefone do novo cliente.');
        return;
      }
      if (!inlineVehicle.placa || !inlineVehicle.modelo || !inlineVehicle.cor) {
        alert('Por favor, preencha a Placa, Modelo e Cor do veículo.');
        return;
      }

      // Year check (ALTERAÇÃO #7: 1950 to 2026)
      const vehYear = parseInt(inlineVehicle.ano);
      if (isNaN(vehYear) || vehYear < 1950 || vehYear > 2026) {
        alert('O ano do veículo deve ser entre 1950 e 2026.');
        return;
      }

      // Create client
      const newCli = await db.addClient(inlineClient);
      targetClientId = newCli.id;

      // Create vehicle
      const newVeh = await db.addVehicle({
        ...inlineVehicle,
        cliente_id: targetClientId
      });
      targetVehicleId = newVeh.id;
    }

    if (!targetClientId || !targetVehicleId) {
      alert('Selecione ou cadastre o Cliente e o Veículo.');
      return;
    }

    await db.createOS(
      {
        cliente_id: targetClientId,
        veiculo_id: targetVehicleId,
        responsavel_id: serviceData.responsavel_id,
        tipo_servico: serviceData.tipo_servico,
        previsao_entrega: serviceData.previsao_entrega,
        mao_de_obra: serviceData.mao_de_obra,
        observacao_inicial: serviceData.observacao_inicial
      },
      user
    );

    onSuccess();
    onClose();
  };

  const availableVehicles = vehicles.filter((v) => v.cliente_id === selectedClientId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 font-serif">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border-t-8 border-[#125938] max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold text-[#06402F] flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#8C4580]" />
            Abrir Nova Ordem de Serviço
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            ✕
          </button>
        </div>

        {/* Mode Selector Toggle (ALTERAÇÃO #3) */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg text-xs font-sans">
          <button
            type="button"
            onClick={() => setCreateMode('existing')}
            className={`flex-1 py-1.5 px-3 rounded-md font-bold transition ${
              createMode === 'existing'
                ? 'bg-[#125938] text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cliente / Veículo Existente
          </button>
          <button
            type="button"
            onClick={() => setCreateMode('new_inline')}
            className={`flex-1 py-1.5 px-3 rounded-md font-bold transition ${
              createMode === 'new_inline'
                ? 'bg-[#8C4580] text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            + Cadastrar Cliente & Veículo Junto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
          {createMode === 'existing' ? (
            <>
              {/* Existing Client Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cliente / Proprietário *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelectChange(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#125938]"
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.cpf ? `(${c.cpf})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Existing Vehicle Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Veículo do Cliente *</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#125938]"
                >
                  <option value="">-- Selecione o Veículo --</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.placa} - {v.modelo} ({v.cor})
                    </option>
                  ))}
                </select>
                {availableVehicles.length === 0 && selectedClientId && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Este cliente não possui veículos. Mude para a aba de cadastro direto.
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Inline Client & Vehicle Registration (ALTERAÇÃO #3 & #6) */
            <div className="space-y-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-200">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <UserPlus className="w-4 h-4 text-[#8C4580]" /> Dados do Novo Cliente e Veículo
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    value={inlineClient.nome}
                    onChange={(e) => setInlineClient({ ...inlineClient, nome: e.target.value })}
                    placeholder="Ex: Carlos Andrade"
                    className="w-full border rounded p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={inlineClient.telefone}
                    onChange={(e) => setInlineClient({ ...inlineClient, telefone: e.target.value })}
                    placeholder="(11) 99999-7777"
                    className="w-full border rounded p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Placa *</label>
                  <input
                    type="text"
                    required
                    value={inlineVehicle.placa}
                    onChange={(e) => setInlineVehicle({ ...inlineVehicle, placa: e.target.value.toUpperCase() })}
                    placeholder="ABC1D23"
                    className="w-full border rounded p-2 uppercase font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Modelo / Marca *</label>
                  <input
                    type="text"
                    required
                    value={inlineVehicle.modelo}
                    onChange={(e) => setInlineVehicle({ ...inlineVehicle, modelo: e.target.value })}
                    placeholder="Ex: Toyota Corolla 2.0"
                    className="w-full border rounded p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cor *</label>
                  <input
                    type="text"
                    required
                    value={inlineVehicle.cor}
                    onChange={(e) => setInlineVehicle({ ...inlineVehicle, cor: e.target.value })}
                    placeholder="Ex: Prata"
                    className="w-full border rounded p-2 bg-white"
                  />
                </div>
              </div>

              {/* Year range validation 1950 - 2026 (ALTERAÇÃO #7) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ano do Carro (1950 até 2026) *</label>
                <input
                  type="number"
                  min="1950"
                  max="2026"
                  required
                  value={inlineVehicle.ano}
                  onChange={(e) => setInlineVehicle({ ...inlineVehicle, ano: e.target.value })}
                  placeholder="2022"
                  className="w-full border rounded p-2 font-mono bg-white"
                />
              </div>
            </div>
          )}

          {/* Common OS Details */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tipo de Serviço *</label>
              <select
                value={serviceData.tipo_servico}
                onChange={(e) => setServiceData({ ...serviceData, tipo_servico: e.target.value })}
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
                value={serviceData.responsavel_id}
                onChange={(e) => setServiceData({ ...serviceData, responsavel_id: e.target.value })}
                className="w-full border rounded p-2 bg-gray-50"
              >
                {users.map((u) => (
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
                value={serviceData.previsao_entrega}
                onChange={(e) => setServiceData({ ...serviceData, previsao_entrega: e.target.value })}
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
                value={serviceData.mao_de_obra}
                onChange={(e) => setServiceData({ ...serviceData, mao_de_obra: e.target.value })}
                placeholder="0.00"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938] disabled:bg-gray-100 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Observação Técnica Inicial *</label>
            <textarea
              rows={3}
              value={serviceData.observacao_inicial}
              onChange={(e) => setServiceData({ ...serviceData, observacao_inicial: e.target.value })}
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
