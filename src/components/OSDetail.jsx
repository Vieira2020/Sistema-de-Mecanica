import React, { useState } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Clock,
  User,
  Car,
  Package,
  Plus,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Send,
  Calendar,
  AlertTriangle,
  Lock,
  Hammer,
  ShieldCheck,
  FileText
} from 'lucide-react';

const STATUS_FLOW = [
  'RECEBIDO',
  'EM_DIAGNOSTICO',
  'AGUARDANDO_APROVACAO',
  'AGUARDANDO_PECAS',
  'EM_FUNILARIA',
  'EM_MECANICA',
  'TESTE_QUALIDADE',
  'PRONTO_PARA_ENTREGA',
  'ENTREGUE'
];

const STATUS_LABELS = {
  RECEBIDO: '1. Recebido',
  EM_DIAGNOSTICO: '2. Em Diagnóstico',
  AGUARDANDO_APROVACAO: '3. Aguardando Aprovação',
  AGUARDANDO_PECAS: '4. Aguardando Peça(s)',
  EM_FUNILARIA: '5. Em Funilaria',
  EM_MECANICA: '6. Em Mecânica',
  TESTE_QUALIDADE: '7. Teste / Qualidade',
  PRONTO_PARA_ENTREGA: '8. Pronto para Entrega',
  ENTREGUE: '9. Entregue'
};

export const OSDetail = ({ os, clients, vehicles, parts, users, onBack, onRefresh }) => {
  const { user, isAdmin } = useAuth();

  const [newStatus, setNewStatus] = useState(os.status);
  const [statusNote, setStatusNote] = useState('');
  const [techNote, setTechNote] = useState('');

  const [showPartModal, setShowPartModal] = useState(false);
  const [partForm, setPartForm] = useState({
    peca_id: parts[0]?.id || '',
    quantidade: '1',
    preco_unitario: parts[0]?.preco_medio ? String(parts[0].preco_medio) : '0',
    fornecedor: ''
  });

  const client = clients.find((c) => c.id === os.cliente_id);
  const vehicle = vehicles.find((v) => v.id === os.veiculo_id);
  const responsibleUser = users.find((u) => u.id === os.responsavel_id);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (newStatus === os.status) {
      alert('Selecione um status diferente do atual.');
      return;
    }

    await db.updateOSStatus(os.id, newStatus, statusNote, user);
    setStatusNote('');
    onRefresh();
  };

  const handleAddTechNote = async (e) => {
    e.preventDefault();
    if (!techNote.trim()) return;

    await db.addOSTimelineNote(os.id, techNote, user);
    setTechNote('');
    onRefresh();
  };

  const handleSelectPart = (pecaId) => {
    const selected = parts.find((p) => p.id === pecaId);
    setPartForm({
      peca_id: pecaId,
      quantidade: '1',
      preco_unitario: selected ? String(selected.preco_medio) : '0',
      fornecedor: ''
    });
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (!partForm.peca_id || !partForm.quantidade) return;

    await db.addPartToOS(
      os.id,
      partForm.peca_id,
      partForm.quantidade,
      partForm.preco_unitario,
      partForm.fornecedor,
      user
    );

    setShowPartModal(false);
    onRefresh();
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(os.status);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#032326] text-white p-5 rounded-xl border-l-8 border-[#8C4580] shadow">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="bg-[#125938] hover:bg-[#308C50] text-white p-2 rounded-lg transition border border-emerald-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xl text-[#8C4580]">OS #{os.numero}</span>
              <span className="text-xs bg-[#125938] px-2 py-0.5 rounded text-emerald-200 font-semibold border border-emerald-700">
                {os.tipo_servico}
              </span>
            </div>
            <p className="text-xs text-gray-300 font-sans mt-0.5">
              Entrada em: {new Date(os.data_entrada).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Financial Badge - Admin Only */}
        {isAdmin ? (
          <div className="bg-[#125938] px-4 py-2 rounded-lg text-right border border-emerald-700">
            <span className="text-[10px] text-emerald-200 uppercase tracking-wider block">Valor Total da OS</span>
            <span className="text-xl font-bold font-mono text-white">
              R$ {parseFloat(os.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ) : (
          <div className="bg-amber-950/80 px-3 py-1.5 rounded-lg text-amber-200 text-xs flex items-center gap-1.5 border border-amber-800">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Valores e dados financeiros restritos ao Admin (RF-003)</span>
          </div>
        )}
      </div>

      {/* Status Progress Stepper */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 className="text-sm font-bold font-serif text-[#06402F] mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8C4580]" />
          Fluxo do Atendimento (9 Etapas)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {STATUS_FLOW.map((st, idx) => {
            const isCurrent = st === os.status;
            const isPassed = idx < currentStatusIndex;

            return (
              <div
                key={st}
                className={`p-2 rounded-lg text-center text-[11px] font-bold border transition ${
                  isCurrent
                    ? 'bg-[#8C4580] text-white border-[#8C4580] shadow-md ring-2 ring-[#8C4580]/40'
                    : isPassed
                    ? 'bg-[#125938] text-white border-emerald-700'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                <div className="text-[10px] opacity-80 uppercase tracking-wider">{idx + 1}</div>
                <div className="leading-tight mt-0.5">{STATUS_LABELS[st].replace(/^\d+\.\s*/, '')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Info, Parts, Status Update */}
        <div className="lg:col-span-1 space-y-6">
          {/* Client & Vehicle Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-[#06402F] text-white p-3 font-bold font-serif text-xs flex items-center gap-2">
              <Car className="w-4 h-4 text-[#8C4580]" />
              Dados do Veículo e Cliente
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Veículo</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-bold text-gray-900 text-sm">{vehicle?.modelo || 'N/A'}</span>
                  <span className="font-mono font-bold bg-[#032326] text-white px-2 py-0.5 rounded">
                    {vehicle?.placa || 'PLACA'}
                  </span>
                </div>
                <p className="text-gray-600 mt-0.5">Cor: {vehicle?.cor} | Ano: {vehicle?.ano || 'N/A'}</p>
              </div>

              <div className="border-t pt-2">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Proprietário</span>
                <p className="font-bold text-gray-900 mt-0.5">{client?.nome || 'Cliente N/A'}</p>

                {isAdmin ? (
                  <div className="text-gray-600 space-y-0.5 mt-1">
                    <p>Telefone: {client?.telefone}</p>
                    {client?.cpf && <p>CPF: {client?.cpf}</p>}
                    {client?.endereco && <p>Endereço: {client?.endereco}</p>}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 italic mt-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                    Telefone, CPF e endereço ocultos para o perfil Mecânico (RF-003).
                  </p>
                )}
              </div>

              <div className="border-t pt-2">
                <span className="text-gray-500 block text-[10px] uppercase font-bold">Responsável Técnico</span>
                <p className="font-semibold text-emerald-800 mt-0.5">{responsibleUser?.nome || 'Não atribuído'}</p>
                <p className="text-gray-500">Previsão Entrega: {os.previsao_entrega || 'Não informada'}</p>
              </div>
            </div>
          </div>

          {/* Update Status Panel */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3">
            <h4 className="font-bold font-serif text-sm text-[#06402F] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8C4580]" />
              Atualizar Status da OS
            </h4>

            <form onSubmit={handleStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Novo Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border rounded p-2 bg-gray-50 font-bold text-[#06402F]"
                >
                  {STATUS_FLOW.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Observação do Status (Opcional)</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Ex: Veículo transferido para o setor de funilaria."
                  className="w-full border rounded p-2"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#125938] hover:bg-[#06402F] text-white py-2 rounded font-bold shadow transition"
              >
                Confirmar Mudança de Status
              </button>
            </form>
          </div>

          {/* Parts Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="bg-[#06402F] text-white p-3 font-bold font-serif text-xs flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#8C4580]" />
                Peças Utilizadas ({os.pecas?.length || 0})
              </span>
              {isAdmin && (
                <button
                  onClick={() => setShowPartModal(true)}
                  className="bg-[#8C4580] hover:bg-[#723668] text-white px-2 py-1 rounded text-[11px] font-sans flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Vincular Peça
                </button>
              )}
            </div>

            <div className="p-3 text-xs space-y-2">
              {!os.pecas || os.pecas.length === 0 ? (
                <p className="text-gray-500 italic text-center py-2">Nenhuma peça vinculada a esta OS.</p>
              ) : (
                os.pecas.map((p, idx) => {
                  const partObj = parts.find((pt) => pt.id === p.peca_id);
                  const subtotal = p.quantidade * p.preco_unitario;

                  return (
                    <div key={idx} className="bg-gray-50 p-2.5 rounded border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900">{partObj?.nome || 'Peça'}</p>
                        <p className="text-gray-500 text-[11px]">
                          Qtd: {p.quantidade} {p.fornecedor ? `| Fornecedor: ${p.fornecedor}` : ''}
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="text-right font-mono font-bold text-emerald-900">
                          R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Timeline Feed (RF-013, RF-014, RF-015) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Technical Note Box */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-3">
            <h4 className="font-bold font-serif text-sm text-[#06402F] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#8C4580]" />
              Registrar Atualização Técnica (Mecânico / Funileiro)
            </h4>
            <p className="text-xs text-gray-500">
              Adicione atualizações e registros do serviço executado sem necessariamente alterar o status da OS (RF-014).
            </p>

            <form onSubmit={handleAddTechNote} className="space-y-2 text-xs">
              <textarea
                rows={3}
                value={techNote}
                onChange={(e) => setTechNote(e.target.value)}
                placeholder="Ex: Motor desmontado. Identificado desgaste nas buchas da suspensão e vazamento no óleo."
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-[#8C4580]"
              ></textarea>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!techNote.trim()}
                  className="bg-[#8C4580] hover:bg-[#723668] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Publicar na Linha do Tempo
                </button>
              </div>
            </form>
          </div>

          {/* Feed / Timeline */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5 space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold font-serif text-[#06402F] text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#8C4580]" />
                  Feed de Atualizações Técnicas (Linha do Tempo Imutável)
                </h3>
                <p className="text-xs text-gray-500">
                  Rastreabilidade completa com autor, data/hora e observações (RF-013, RF-015).
                </p>
              </div>
              <span className="text-xs bg-[#125938] text-white px-2.5 py-1 rounded font-mono font-bold">
                {os.timeline?.length || 0} registros
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200 pt-2">
              {!os.timeline || os.timeline.length === 0 ? (
                <p className="text-gray-500 text-xs italic pl-8">Nenhuma atualização registrada ainda.</p>
              ) : (
                os.timeline.map((item) => {
                  const author = users.find((u) => u.id === item.autor_id);
                  const dt = new Date(item.data_hora).toLocaleString('pt-BR');

                  return (
                    <div key={item.id} className="relative pl-8 space-y-1">
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-[#8C4580] ring-4 ring-white"></div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                        <div className="flex flex-wrap justify-between items-center gap-1 border-b border-gray-200 pb-1.5 mb-2">
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#125938]" />
                            {author?.nome || 'Usuário'}
                            <span className="text-[10px] text-gray-500 font-normal">
                              ({author?.perfil || 'SISTEMA'})
                            </span>
                          </span>
                          <span className="text-[11px] font-mono text-gray-500">{dt}</span>
                        </div>

                        {item.status_anterior !== item.status_novo && item.status_novo && (
                          <div className="mb-2 inline-block bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold text-[11px]">
                            Mudança de Status: {item.status_anterior || 'Início'} → {item.status_novo}
                          </div>
                        )}

                        <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-line">
                          {item.observacao}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Vincular Peça */}
      {showPartModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-[#8C4580]">
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8C4580]" />
              Vincular Peça à OS #{os.numero}
            </h3>

            <form onSubmit={handleAddPart} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Selecione a Peça do Catálogo *</label>
                <select
                  value={partForm.peca_id}
                  onChange={(e) => handleSelectPart(e.target.value)}
                  required
                  className="w-full border rounded p-2 bg-gray-50"
                >
                  <option value="">-- Selecione uma peça --</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_interno} - {p.nome} (Ref: R$ {p.preco_medio})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={partForm.quantidade}
                    onChange={(e) => setPartForm({ ...partForm, quantidade: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Preço Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={partForm.preco_unitario}
                    onChange={(e) => setPartForm({ ...partForm, preco_unitario: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Fornecedor (Opcional)</label>
                <input
                  type="text"
                  value={partForm.fornecedor}
                  onChange={(e) => setPartForm({ ...partForm, fornecedor: e.target.value })}
                  placeholder="Ex: Distribuidora SP Peças"
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPartModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C4580] text-white rounded font-bold shadow hover:bg-[#723668]"
                >
                  Adicionar à OS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
