import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, DollarSign, Tag, Layers, Edit, Save } from 'lucide-react';

export const PartsCatalog = ({ searchTerm }) => {
  const { isAdmin } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Auto-generate code e.g. PEC-005 (Alteração #20)
  const generateNextPartCode = (currentParts) => {
    let maxNum = 0;
    (currentParts || []).forEach(p => {
      const match = String(p.codigo_interno || '').match(/PEC-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `PEC-${String(nextNum).padStart(3, '0')}`;
  };

  const [partForm, setPartForm] = useState({
    codigo_interno: '',
    nome: '',
    modelo_compativel: '',
    preco_min: '',
    preco_max: '',
    preco_medio: '',
    estoque_atual: '10'
  });

  // Editing stock directly (Alteração #11)
  const [editingPartId, setEditingPartId] = useState(null);
  const [editStockValue, setEditStockValue] = useState('');

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    setLoading(true);
    const data = await db.getParts();
    setParts(data || []);
    setLoading(false);
  };

  const handleOpenAddModal = () => {
    const nextCode = generateNextPartCode(parts);
    setPartForm({
      codigo_interno: nextCode,
      nome: '',
      modelo_compativel: 'Gol / Uno / Palio / Corolla / Onix', // Base compatible vehicles suggestion (Alteração #12)
      preco_min: '',
      preco_max: '',
      preco_medio: '',
      estoque_atual: '10'
    });
    setShowModal(true);
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partForm.codigo_interno || !partForm.nome || !partForm.preco_medio) {
      alert('Código, Nome e Preço Médio são obrigatórios.');
      return;
    }

    await db.addPart(partForm);
    setShowModal(false);
    await loadParts();
  };

  const handleSaveStockEdit = async (partId) => {
    if (editStockValue === '' || isNaN(parseInt(editStockValue))) return;
    await db.updatePartStock(partId, parseInt(editStockValue));
    setEditingPartId(null);
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
            <h2 className="text-xl font-bold font-serif">Catálogo de Peças & Controle de Estoque</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Gestão de estoque, alteração manual de unidades e compatibilidade de modelos.
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
            <div key={part.id} className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3 flex flex-col justify-between hover:border-[#125938] transition">
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold bg-[#125938] text-white px-2.5 py-0.5 rounded">
                    {part.codigo_interno}
                  </span>

                  {/* Stock counter with inline editing (Alteração #11) */}
                  {editingPartId === part.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={editStockValue}
                        onChange={(e) => setEditStockValue(e.target.value)}
                        className="w-16 border rounded p-1 text-xs font-bold text-center font-mono"
                      />
                      <button
                        onClick={() => handleSaveStockEdit(part.id)}
                        className="p-1 bg-[#125938] text-white rounded hover:bg-[#06402F]"
                        title="Salvar Novo Estoque"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded font-mono">
                        Estoque: {part.estoque_atual} un
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingPartId(part.id);
                            setEditStockValue(String(part.estoque_atual));
                          }}
                          className="text-gray-400 hover:text-[#8C4580] p-1"
                          title="Alterar/Comprar estoque"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-2 font-serif">{part.nome}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Modelos Compatíveis:{' '}
                  <span className="font-semibold text-gray-800">
                    {part.modelo_compativel || 'Universal / Principais carros'}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Faixa de Preço de Referência</span>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-gray-600">Mín: R$ {part.preco_min || '0'}</span>
                  <span className="font-bold text-[#06402F]">Média: R$ {part.preco_medio}</span>
                  <span className="text-gray-600">Máx: R$ {part.preco_max || '0'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nova Peça */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-[#125938]">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#8C4580]" />
                Cadastrar Peça no Catálogo
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Código Interno (Auto) *</label>
                  <input
                    type="text"
                    required
                    value={partForm.codigo_interno}
                    onChange={(e) => setPartForm({ ...partForm, codigo_interno: e.target.value.toUpperCase() })}
                    placeholder="PEC-005"
                    className="w-full border rounded p-2 uppercase font-mono font-bold text-[#06402F] focus:ring-2 focus:ring-[#125938]"
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5">Gerado automaticamente, mas editável.</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estoque Inicial (un) *</label>
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
                  placeholder="Ex: Amortecedor Dianteiro / Discos de Freio"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Modelos de Carros Compatíveis</label>
                <input
                  type="text"
                  value={partForm.modelo_compativel}
                  onChange={(e) => setPartForm({ ...partForm, modelo_compativel: e.target.value })}
                  placeholder="Ex: Gol / Fox / Voyage / Fit + Adicione mais"
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#125938]"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">Com os principais carros pré-sugeridos, você pode editar e adicionar mais.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Mín.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.preco_min}
                    onChange={(e) => setPartForm({ ...partForm, preco_min: e.target.value })}
                    placeholder="0.00"
                    className="w-full border rounded p-2"
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
                    placeholder="0.00"
                    className="w-full border rounded p-2 font-bold font-mono text-[#06402F]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Máx.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={partForm.preco_max}
                    onChange={(e) => setPartForm({ ...partForm, preco_max: e.target.value })}
                    placeholder="0.00"
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
    </div>
  );
};
