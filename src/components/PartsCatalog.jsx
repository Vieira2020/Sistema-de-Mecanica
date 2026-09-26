import React, { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

export const PartsCatalog = ({ searchTerm }) => {
  const { isAdmin } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  const [partForm, setPartForm] = useState({
    codigo_interno: '',
    nome: '',
    modelo_compativel: '',
    preco_min: '',
    preco_max: '',
    preco_medio: '',
    estoque_atual: '0'
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

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partForm.codigo_interno || !partForm.nome || !partForm.preco_medio) {
      alert('Código, Nome e Preço Médio são obrigatórios.');
      return;
    }

    if (editingPart) {
      await db.updatePartPrice(
        editingPart.id,
        partForm.preco_min,
        partForm.preco_medio,
        partForm.preco_max,
        partForm.estoque_atual
      );
    } else {
      await db.addPart(partForm);
    }

    setShowModal(false);
    setEditingPart(null);
    setPartForm({
      codigo_interno: '',
      nome: '',
      modelo_compativel: '',
      preco_min: '',
      preco_max: '',
      preco_medio: '',
      estoque_atual: '0'
    });
    loadParts();
  };

  const handleDeletePart = async (partId) => {
    if (confirm('Tem certeza que deseja remover esta peça do catálogo?')) {
      await db.deletePart(partId);
      loadParts();
    }
  };

  const handleEditClick = (part) => {
    setEditingPart(part);
    setPartForm({
      codigo_interno: part.codigo_interno,
      nome: part.nome,
      modelo_compativel: part.modelo_compativel || '',
      preco_min: String(part.preco_min),
      preco_medio: String(part.preco_medio),
      preco_max: String(part.preco_max),
      estoque_atual: String(part.estoque_atual)
    });
    setShowModal(true);
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
            <h2 className="text-xl font-bold font-serif">Catálogo de Peças & Controle de Estoque (RF-016, RF-019)</h2>
          </div>
          <p className="text-xs text-gray-300 font-sans mt-1">
            Gestão de peças, atualização de preços de referência e dedução automática ao vincular em Ordens de Serviço.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setEditingPart(null);
              setPartForm({
                codigo_interno: '',
                nome: '',
                modelo_compativel: '',
                preco_min: '',
                preco_max: '',
                preco_medio: '',
                estoque_atual: '0'
              });
              setShowModal(true);
            }}
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
            <div key={part.id} className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold bg-[#125938] text-white px-2 py-0.5 rounded">
                    {part.codigo_interno}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    part.estoque_atual <= 2
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    Estoque: {part.estoque_atual} un
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 mt-2 font-serif">{part.nome}</h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Modelos Compatíveis: <span className="font-semibold">{part.modelo_compativel || 'Universal'}</span>
                </p>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Faixa de Preço de Referência</span>
                <div className="flex justify-between items-center font-mono">
                  <span className="text-gray-600">Mín: R$ {part.preco_min}</span>
                  <span className="font-bold text-[#06402F]">Média: R$ {part.preco_medio}</span>
                  <span className="text-gray-600">Máx: R$ {part.preco_max}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
                  <button
                    onClick={() => handleEditClick(part)}
                    className="text-gray-600 hover:text-emerald-800 flex items-center gap-1 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Alterar Preços / Estoque
                  </button>
                  <button
                    onClick={() => handleDeletePart(part.id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remover
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Nova / Editar Peça */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-[#125938]">
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8C4580]" />
              {editingPart ? 'Alterar Preços / Estoque' : 'Cadastrar Peça no Catálogo'}
            </h3>

            <form onSubmit={handleAddPart} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Código Interno *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingPart)}
                    value={partForm.codigo_interno}
                    onChange={(e) => setPartForm({ ...partForm, codigo_interno: e.target.value.toUpperCase() })}
                    placeholder="PEC-005"
                    className="w-full border rounded p-2 uppercase font-mono disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estoque Disponível *</label>
                  <input
                    type="number"
                    min="0"
                    value={partForm.estoque_atual}
                    onChange={(e) => setPartForm({ ...partForm, estoque_atual: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome da Peça / Componente *</label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingPart)}
                  value={partForm.nome}
                  onChange={(e) => setPartForm({ ...partForm, nome: e.target.value })}
                  placeholder="Ex: Correia Dentada"
                  className="w-full border rounded p-2 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Modelos Compatíveis</label>
                <input
                  type="text"
                  disabled={Boolean(editingPart)}
                  value={partForm.modelo_compativel}
                  onChange={(e) => setPartForm({ ...partForm, modelo_compativel: e.target.value })}
                  placeholder="Ex: Fiat Uno / Palio / Siena"
                  className="w-full border rounded p-2 disabled:bg-gray-100"
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
                    className="w-full border rounded p-2 font-bold"
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

              <div className="flex justify-end gap-2 pt-3">
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
                  {editingPart ? 'Salvar Alterações' : 'Salvar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
