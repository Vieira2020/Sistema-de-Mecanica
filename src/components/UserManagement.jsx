import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Trash2, Shield, Wrench, Hammer, User } from 'lucide-react';

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    login: '',
    senha: '',
    perfil: 'MECANICO'
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const list = await db.getUsers();
    setUsers(list || []);
    setLoading(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nome.trim() || !formData.login.trim() || !formData.senha.trim()) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await db.addUser({
        nome: formData.nome.trim(),
        login: formData.login.trim(),
        senha: formData.senha.trim(),
        perfil: formData.perfil
      });

      setFormData({ nome: '', login: '', senha: '', perfil: 'MECANICO' });
      setShowAddModal(false);
      await loadUsers();
    } catch (err) {
      setErrorMsg('Erro ao cadastrar usuário: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId, userNome) => {
    if (userId === currentUser?.id) {
      alert('Você não pode excluir a sua própria conta logada.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userNome}"?`)) {
      await db.deleteUser(userId);
      await loadUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#032326] text-white p-6 rounded-xl shadow-md border-l-8 border-[#8C4580] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8C4580]" />
            Gestão de Usuários & Equipe
          </h2>
          <p className="text-sm text-gray-300 font-sans mt-1">
            Cadastre novos mecânicos, funileiros ou administradores e gerencie os acessos do sistema.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ nome: '', login: '', senha: '', perfil: 'MECANICO' });
            setErrorMsg('');
            setShowAddModal(true);
          }}
          className="bg-[#8C4580] hover:bg-[#6b3361] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow transition"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Novo Usuário
        </button>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#125938] border-t-transparent mb-2"></div>
            <p>Carregando usuários do sistema...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#032326] text-white font-serif uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nome do Funcionário</th>
                  <th className="py-3 px-4">Login de Acesso</th>
                  <th className="py-3 px-4">Função / Perfil</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isFunileiro = u.perfil === 'FUNILEIRO' || u.nome.toLowerCase().includes('funileiro');
                  const isMecanico = u.perfil === 'MECANICO' || u.nome.toLowerCase().includes('mecanico');
                  const isAdminRole = u.perfil === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="py-3.5 px-4 font-bold text-[#06402F] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#8C4580]" />
                        <span>{u.nome}</span>
                        {isCurrent && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono font-normal">
                            (Você)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{u.login}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${
                          isAdminRole ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          isFunileiro ? 'bg-teal-100 text-teal-900 border border-teal-300' :
                          'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {isAdminRole && <Shield className="w-3.5 h-3.5" />}
                          {isFunileiro && <Hammer className="w-3.5 h-3.5" />}
                          {isMecanico && !isAdminRole && !isFunileiro && <Wrench className="w-3.5 h-3.5" />}
                          {u.perfil}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                          ATIVO
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={isCurrent}
                          onClick={() => handleDeleteUser(u.id, u.nome)}
                          title={isCurrent ? "Não é possível excluir seu próprio usuário" : "Excluir Usuário"}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-30 disabled:hover:bg-transparent transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border-t-8 border-[#8C4580]">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#8C4580]" />
                Cadastrar Novo Usuário
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-xs rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome Completo do Funcionário *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gustavo Funileiro / Carlos Mecânico"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Login de Acesso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: gustavo / mecanico2"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                  className="w-full border rounded p-2 font-mono focus:ring-2 focus:ring-[#8C4580]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Senha de Acesso *</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Função / Perfil no Sistema *</label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                  className="w-full border rounded p-2 bg-gray-50 font-semibold focus:ring-2 focus:ring-[#8C4580]"
                >
                  <option value="MECANICO">Mecânico</option>
                  <option value="FUNILEIRO">Funileiro</option>
                  <option value="ADMIN">Administrador (Dono)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8C4580] hover:bg-[#6b3361] text-white rounded font-bold shadow"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
