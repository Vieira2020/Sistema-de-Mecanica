import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Trash2, Users, Shield, Wrench, X, Key } from 'lucide-react';

export const UserManagementModal = ({ onClose, onRefresh }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nome: '',
    login: '',
    senha: '',
    perfil: 'MECANICO'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await db.getUsers();
    setUsers(data || []);
    setLoading(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.login || !form.senha) {
      alert('Nome, Login e Senha são obrigatórios.');
      return;
    }

    await db.addUser(form);
    setForm({ nome: '', login: '', senha: '', perfil: 'MECANICO' });
    await loadUsers();
    if (onRefresh) onRefresh();
  };

  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === currentUser?.id || userToDelete.login === currentUser?.login) {
      alert('Você não pode excluir o seu próprio usuário atualmente logado.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userToDelete.nome}"?`)) {
      await db.deleteUser(userToDelete.id);
      await loadUsers();
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 border-t-8 border-[#8C4580] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8C4580]" />
              Gerenciamento de Usuários (Administrador)
            </h3>
            <p className="text-xs text-gray-500">
              Cadastre novos mecânicos, funileiros ou administradores e gerencie o acesso do sistema.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add User Form */}
        <form onSubmit={handleAddUser} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3 text-xs">
          <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
            <UserPlus className="w-4 h-4 text-[#125938]" /> Cadastrar Novo Usuário
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Nome Completo e Função *</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Gustavo Mecânico"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Login / Nome de Usuário *</label>
              <input
                type="text"
                required
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder="Ex: gustavo"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Senha de Acesso *</label>
              <input
                type="password"
                required
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="••••••••"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-[#8C4580]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Perfil / Função *</label>
              <select
                value={form.perfil}
                onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                className="w-full border rounded p-2 bg-white font-bold"
              >
                <option value="MECANICO">Mecânico / Técnico</option>
                <option value="FUNILEIRO">Funileiro / Pintor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-[#125938] hover:bg-[#06402F] text-white px-4 py-2 rounded font-bold shadow flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Salvar Usuário
            </button>
          </div>
        </form>

        {/* Existing Users List */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600">
            Usuários Cadastrados ({users.length})
          </h4>

          {loading ? (
            <p className="text-center text-xs text-gray-500 py-4">Carregando usuários...</p>
          ) : (
            <div className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-[#125938]">
                      {u.perfil === 'ADMIN' ? <Shield className="w-4 h-4 text-[#8C4580]" /> : <Wrench className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{u.nome}</p>
                      <p className="text-gray-500">
                        Login: <span className="font-mono font-semibold">{u.login}</span> | Perfil:{' '}
                        <span className="font-bold text-emerald-800">{u.perfil}</span>
                      </p>
                    </div>
                  </div>

                  {u.id !== currentUser?.id && u.login !== currentUser?.login && (
                    <button
                      onClick={() => handleDeleteUser(u)}
                      title="Excluir Usuário"
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 text-xs">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
