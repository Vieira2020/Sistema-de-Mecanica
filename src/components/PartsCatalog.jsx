import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, DollarSign, Tag, Layers, Edit, AlertCircle, Check } from 'lucide-react';

// Preset common part compatibility suggestions (ALTERAÇÃO #12)
const COMMON_PART_SUGGESTIONS = [
  { name: 'Amortecedor Dianteiro / Traseiro', models: 'Gol / Fox / Voyage / Polo' },
  { name: 'Pastilha de Freio', models: 'Honda Civic / Fit / HR-V' },
  { name: 'Filtro de Óleo do Motor', models: 'Fiat Strada / Palio / Uno / Mobi' },
  { name: 'Correia Dentada / Tensor', models: 'Chevrolet Onix / Prisma / Celta / Corsa' },
  { name: 'Disco de Freio Ventilado', models: 'Toyota Corolla / Etios / Yaris' },
  { name: 'Vela de Ignição', models: 'Hyundai HB20 / Creta / Tucson' },
  { name: 'Tinta Automotiva PU (900ml)', models: 'Universal (Todas as marcas)' },
  { name: 'Filtro de Ar Condicionado', models: 'Jeep Renegade / Compass / Fiat Toro' }
];

export const PartsCatalog = ({ searchTerm }) => {
  const { isAdmin } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  // Form state (ALTERAÇÃO #14: clean resets)
  const [partForm, setPartForm] = useState({
    codigo_interno: '',
    nome: '',
    modelo_compativel: '',
    preco_min: '',
    preco_max: '',
    preco_medio: '',
    estoque_atual: '10'
  });

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    const data = await db.getParts();
    setParts(data || []);
    setLoading(false);
  };

  // Helper to auto-generate next internal code PEC-xxx (ALTERAÇÃO #20)
  const generateNextCode = (existingParts) => {
    if (!existingParts || existingParts.length === 0) return 'PEC-001';

    let maxNum = 0;
    existingParts.forEach((p) => {
      const match = p.codigo_interno?.match(/PEC-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    const next = maxNum + 1;
    return `PEC-${String(next).padStart(3, '0')}`;
  };

  const handleOpenAddModal = () => {
    const nextCode = generateNextCode(parts);
    setPartForm({
      codigo_interno: nextCode,
      nome: '',
      modelo_compativel: '',
      preco_min: '',
      preco_max: '',
      preco_medio: '',
      estoque_atual: '10'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (part) => {
    setEditingPart(part);
    setPartForm({
      codigo_interno: part.codigo_interno || '',
      nome: part.nome || '',
      modelo_compativel: part.modelo_compativel || '',
      preco_min: String(part.preco_min || 0),
      preco_max: String(part.preco_max || 0),
      preco_medio: String(part.preco_medio || 0),
      estoque_atual: String(part.estoque_atual || 0)
    });
    setShowEditModal(true);
  };

  const handleSelectPresetSuggestion = (preset) => {
    setPartForm((prev) => ({
      ...prev,
      nome: prev.nome ? prev.nome : preset.name,
      modelo_compativel: prev.modelo_compativel
        ? `${prev.modelo_compativel} / ${preset.models}`
        : preset.models
    }));
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partForm.codigo_interno || !partForm.nome || !partForm.preco_medio) {
      alert('Código, Nome e Preço Médio são obrigatórios.');
      return;
    }

    await db.addPart(partForm);
    setShowAddModal(false);
    await loadParts();
  };

  // ALTERAÇÃO #11: Directly update stock or part details
  const handleUpdatePart = async (e) => {
    e.preventDefault();
    if (!editingPart) return;

    await db.updatePart(editingPart.id, partForm);
    setShowEditModal(false);
    setEditingPart(null);
    await loadParts();
  };

  const term = searchTerm ? searchTerm.toLowerCase().trim() : '';
  const filteredParts = parts.filter(
    (p) =>
      p.nome.toLowerCase().includes(term) ||
      p.codigo_interno.toLowerCase().includes(term) ||
      (p.modelo_compativel && p.modelo_compativel.toLowerCase().includes(term))
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Carregando catálogo de peças...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#032326] text-white p-6 rounded-xl border-l-8 border-[#8C4580] shadow">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#8C4580]" />
            <h2 className="text-xl font-bold font-serif">Catálogo de Peças & Estoque de Componentes</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Controle de estoque automático em Ordens de Serviço, modelos compatíveis e faixas de preço.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="bg-[#125938] hover:bg-[#06402F] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow transition border border-emerald-600"
          >
            <Plus className="w-4 h-4" /> Cadastrar Peça no Catálogo
          </button>
        )}
      </div>

      {/* Grid of Parts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParts.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl shadow text-center text-gray-500 text-sm">
            Nenhuma peça encontrada para a busca.
          </div>
        ) : (
          filteredParts.map((part) => (
            <div
              key={part.id}
              className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3 flex flex-col justify-between hover:border-[#125938] transition"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold bg-[#125938] text-white px-2 py-0.5 rounded">
                    {part.codigo_interno}
                  </span>

                  {/* Stock badge with warning color if low */}
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                      part.estoque_atual > 3
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    Estoque: {part.estoque_atual} un
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-2 font-serif">{part.nome}</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Modelos Compatíveis: <span className="font-semibold text-gray-800">{part.modelo_compativel || 'Universal'}</span>
                </p>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Valores de Referência</span>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-gray-600">Mín: R$ {part.preco_min}</span>
                  <span className="font-bold text-[#06402F]">Média: R$ {part.preco_medio}</span>
                  <span className="text-gray-600">Máx: R$ {part.preco_max}</span>
                </div>
              </div>

              {/* ALTERAÇÃO #11: Edit details / Modify stock button for Admin */}
              {isAdmin && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleOpenEditModal(part)}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <Edit className="w-3.5 h-3.5" /> Ajustar Peça / Estoque
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Peça (ALTERAÇÃO #12, #20) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 font-serif">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border-t-8 border-[#125938] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#06402F] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8C4580]" />
              Cadastrar Peça no Catálogo
            </h3>

            <form onSubmit={handleAddPart} className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2">
                {/* Internal code auto-generated (ALTERAÇÃO #20) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Código Interno * <span className="text-[10px] font-normal text-emerald-800">(Auto gerado)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partForm.codigo_interno}
                    onChange={(e) => setPartForm({ ...partForm, codigo_interno: e.target.value.toUpperCase() })}
                    placeholder="PEC-005"
                    className="w-full border rounded p-2 uppercase font-mono font-bold bg-emerald-50 text-emerald-900 border-emerald-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estoque Inicial (Unidades) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={partForm.estoque_atual}
                    onChange={(e) => setPartForm({ ...partForm, estoque_atual: e.target.value })}
                    className="w-full border rounded p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome da Peça / Componente *</label>
                <input
                  type="text"
                  required
                  value={partForm.nome}
                  onChange={(e) => setPartForm({ ...partForm, nome: e.target.value })}
                  placeholder="Ex: Amortecedor Dianteiro"
                  className="w-full border rounded p-2"
                />
              </div>

              {/* Suggestions Quick Buttons (ALTERAÇÃO #12) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Sugestões de Carros Compatíveis:</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {COMMON_PART_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetSuggestion(s)}
                      className="bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 text-[10px] px-2 py-1 rounded border border-gray-300 transition"
                    >
                      + {s.name.split(' ')[0]} ({s.models})
                    </button>
                  ))}
                </div>

                <label className="block font-bold text-gray-700 mb-1">Modelos Compatíveis *</label>
                <input
                  type="text"
                  required
                  value={partForm.modelo_compativel}
                  onChange={(e) => setPartForm({ ...partForm, modelo_compativel: e.target.value })}
                  placeholder="Ex: Gol / Fox / Voyage ou Universal"
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Mín. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.preco_min}
                    onChange={(e) => setPartForm({ ...partForm, preco_min: e.target.value })}
                    placeholder="0.00"
                    className="w-full border rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Médio (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={partForm.preco_medio}
                    onChange={(e) => setPartForm({ ...partForm, preco_medio: e.target.value })}
                    placeholder="0.00"
                    className="w-full border rounded p-2 font-mono font-bold text-[#06402F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Máx. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.preco_max}
                    onChange={(e) => setPartForm({ ...partForm, preco_max: e.target.value })}
                    placeholder="0.00"
                    className="w-full border rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#125938] text-white rounded font-bold shadow hover:bg-[#06402F]"
                >
                  Salvar Peça no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar / Ajustar Estoque (ALTERAÇÃO #11) */}
      {showEditModal && editingPart && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 font-serif">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-amber-600 font-sans text-xs">
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-600" />
              Ajustar Estoque ou Dados da Peça
            </h3>

            <form onSubmit={handleUpdatePart} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Código Interno</label>
                  <input
                    type="text"
                    required
                    value={partForm.codigo_interno}
                    onChange={(e) => setPartForm({ ...partForm, codigo_interno: e.target.value.toUpperCase() })}
                    className="w-full border rounded p-2 uppercase font-mono font-bold"
                  />
                </div>

                {/* Direct stock modification (ALTERAÇÃO #11: e.g. 10 to 8 items) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantidade em Estoque *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={partForm.estoque_atual}
                    onChange={(e) => setPartForm({ ...partForm, estoque_atual: e.target.value })}
                    className="w-full border rounded p-2 font-mono font-bold text-amber-900 bg-amber-50 border-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome da Peça *</label>
                <input
                  type="text"
                  required
                  value={partForm.nome}
                  onChange={(e) => setPartForm({ ...partForm, nome: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Modelos Compatíveis</label>
                <input
                  type="text"
                  value={partForm.modelo_compativel}
                  onChange={(e) => setPartForm({ ...partForm, modelo_compativel: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Mín.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.preco_min}
                    onChange={(e) => setPartForm({ ...partForm, preco_min: e.target.value })}
                    className="w-full border rounded p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Médio *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={partForm.preco_medio}
                    onChange={(e) => setPartForm({ ...partForm, preco_medio: e.target.value })}
                    className="w-full border rounded p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Máx.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.preco_max}
                    onChange={(e) => setPartForm({ ...partForm, preco_max: e.target.value })}
                    className="w-full border rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold shadow"
                >
                  Salvar Alterações no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
