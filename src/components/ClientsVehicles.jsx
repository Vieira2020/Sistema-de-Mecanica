import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, Car, Plus, Phone, MapPin, CreditCard, ShieldAlert, FileText, CheckCircle } from 'lucide-react';

export const ClientsVehicles = ({ searchTerm, onCreateOSForVehicle }) => {
  const { isAdmin } = useAuth();
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showClientModal, setShowClientModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');

  const [clientForm, setClientForm] = useState({
    nome: '',
    telefone: '',
    cpf: '',
    endereco: ''
  });

  const [vehicleForm, setVehicleForm] = useState({
    cliente_id: '',
    placa: '',
    modelo: '',
    cor: '',
    ano: '',
    observacoes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [clis, vehs] = await Promise.all([db.getClients(), db.getVehicles()]);
    setClients(clis || []);
    setVehicles(vehs || []);
    setLoading(false);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!clientForm.nome || !clientForm.telefone) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }

    await db.addClient(clientForm);
    setShowClientModal(false);
    setClientForm({ nome: '', telefone: '', cpf: '', endereco: '' });
    loadData();
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.cliente_id || !vehicleForm.placa || !vehicleForm.modelo || !vehicleForm.cor) {
      alert('Preencha os campos obrigatórios do veículo.');
      return;
    }

    await db.addVehicle(vehicleForm);
    setShowVehicleModal(false);
    setVehicleForm({ cliente_id: '', placa: '', modelo: '', cor: '', ano: '', observacoes: '' });
    loadData();
  };

  const openAddVehicleModal = (clientId = '') => {
    setVehicleForm((prev) => ({ ...prev, cliente_id: clientId || (clients[0]?.id || '') }));
    setShowVehicleModal(true);
  };

  // Filter clients and vehicles based on search term
  const term = searchTerm ? searchTerm.toLowerCase().trim() : '';
  const filteredClients = clients.filter((c) => {
    const cVehs = vehicles.filter((v) => v.cliente_id === c.id);
    const matchesClient = c.nome.toLowerCase().includes(term) || (isAdmin && (c.cpf?.includes(term) || c.telefone?.includes(term)));
    const matchesVehicle = cVehs.some((v) => v.placa.toLowerCase().includes(term) || v.modelo.toLowerCase().includes(term));
    return matchesClient || matchesVehicle;
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Carregando lista de clientes e veículos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#032326] text-white p-6 rounded-xl border-l-8 border-[#125938] shadow">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8C4580]" />
            <h2 className="text-xl font-bold font-serif">Clientes & Frota de Veículos</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans mt-1">
            {isAdmin
              ? 'Cadastro completo de clientes e histórico de veículos associados.'
              : 'Visão operacional de veículos (Informações de contato e dados sensíveis restritos ao Admin).'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowClientModal(true)}
              className="bg-[#125938] hover:bg-[#06402F] text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition border border-emerald-600"
            >
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          )}
          <button
            onClick={() => openAddVehicleModal('')}
            className="bg-[#8C4580] hover:bg-[#723668] text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
          >
            <Car className="w-4 h-4" /> Cadastrar Veículo
          </button>
        </div>
      </div>

      {/* Mechanics Privacy Banner */}
      {!isAdmin && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded text-amber-900 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <b>Modo Mecânico:</b> Por regras de privacidade (RF-003), campos como Telefone, CPF e Endereço estão ocultos para seu perfil.
          </span>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500 text-sm">
            Nenhum cliente ou veículo encontrado para a busca.
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientVehicles = vehicles.filter((v) => v.cliente_id === client.id);

            return (
              <div key={client.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {/* Client Bar */}
                <div className="bg-[#06402F] text-white p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-emerald-900">
                  <div>
                    <h3 className="font-bold font-serif text-base text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#8C4580]" />
                      {client.nome}
                    </h3>
                    {isAdmin ? (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-200 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-300" /> {client.telefone}
                        </span>
                        {client.cpf && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-300" /> CPF: {client.cpf}
                          </span>
                        )}
                        {client.endereco && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-300" /> {client.endereco}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-300 mt-0.5">Proprietário Cadastrado</p>
                    )}
                  </div>

                  <button
                    onClick={() => openAddVehicleModal(client.id)}
                    className="text-xs bg-[#125938] hover:bg-[#308C50] text-white px-3 py-1.5 rounded font-sans flex items-center gap-1 border border-emerald-600"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Veículo a este Cliente
                  </button>
                </div>

                {/* Vehicles Grid */}
                <div className="p-4 bg-gray-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-[#8C4580]" /> Veículos do Cliente ({clientVehicles.length})
                  </h4>

                  {clientVehicles.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">Nenhum veículo cadastrado para este cliente ainda.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {clientVehicles.map((veh) => (
                        <div key={veh.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="bg-[#032326] text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
                                {veh.placa}
                              </span>
                              {veh.ano && <span className="text-[11px] text-gray-500 font-mono">Ano: {veh.ano}</span>}
                            </div>
                            <h5 className="font-bold text-sm text-gray-900 mt-2">{veh.modelo}</h5>
                            <p className="text-xs text-gray-600">Cor: <span className="font-semibold">{veh.cor}</span></p>
                            {veh.observacoes && (
                              <p className="text-[11px] text-gray-500 italic mt-1 line-clamp-2">
                                Obs: {veh.observacoes}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex justify-end">
                            <button
                              onClick={() => onCreateOSForVehicle && onCreateOSForVehicle(veh, client)}
                              className="text-xs bg-[#8C4580] hover:bg-[#723668] text-white px-2.5 py-1.5 rounded font-semibold flex items-center gap-1 transition shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" /> Nova OS para este Veículo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-[#125938]">
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8C4580]" />
              Cadastrar Novo Cliente
            </h3>

            <form onSubmit={handleAddClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientForm.nome}
                  onChange={(e) => setClientForm({ ...clientForm, nome: e.target.value })}
                  placeholder="Ex: Roberto Santana"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={clientForm.telefone}
                  onChange={(e) => setClientForm({ ...clientForm, telefone: e.target.value })}
                  placeholder="(11) 99999-8888"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">CPF (Opcional)</label>
                <input
                  type="text"
                  value={clientForm.cpf}
                  onChange={(e) => setClientForm({ ...clientForm, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Endereço (Opcional)</label>
                <input
                  type="text"
                  value={clientForm.endereco}
                  onChange={(e) => setClientForm({ ...clientForm, endereco: e.target.value })}
                  placeholder="Rua, Número, Bairro, Cidade - SP"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#125938] text-white rounded font-bold shadow hover:bg-[#06402F]"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Veículo */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-[#8C4580]">
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Car className="w-5 h-5 text-[#8C4580]" />
              Cadastrar Veículo
            </h3>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Proprietário (Cliente) *</label>
                <select
                  value={vehicleForm.cliente_id}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, cliente_id: e.target.value })}
                  required
                  className="w-full border rounded p-2 bg-gray-50 focus:ring-2 focus:ring-[#8C4580]"
                >
                  <option value="">-- Selecione o Cliente --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {isAdmin && c.cpf ? `(${c.cpf})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Placa do Veículo *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.placa}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, placa: e.target.value.toUpperCase() })}
                    placeholder="ABC1D23 ou ABC1234"
                    className="w-full border rounded p-2 uppercase font-mono focus:ring-2 focus:ring-[#8C4580]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ano (Opcional)</label>
                  <input
                    type="number"
                    value={vehicleForm.ano}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, ano: e.target.value })}
                    placeholder="2021"
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Modelo / Fabricante *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.modelo}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, modelo: e.target.value })}
                    placeholder="Ex: Fiat Toro 2.0"
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cor *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.cor}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, cor: e.target.value })}
                    placeholder="Ex: Vermelho"
                    className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observações do Veículo</label>
                <textarea
                  rows={2}
                  value={vehicleForm.observacoes}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, observacoes: e.target.value })}
                  placeholder="Ex: Detalhes da lataria, pequenos riscos..."
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C4580] text-white rounded font-bold shadow hover:bg-[#723668]"
                >
                  Cadastrar Veículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
