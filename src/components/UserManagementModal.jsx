import React, { useState, useEffect } from 'react';
import { db } from '../lib/supabase';
import { Users, UserPlus, Trash2, Shield, Wrench, X, Check } from 'lucide-react';

export const UserManagementModal = ({ onClose, onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({
    nome: '',
    login: '',
    senha_hash: '',
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
    if (!newUser.nome || !newUser.login || !newUser.senha_hash) {
      alert('Preencha Nome, Login e Senha.');
      return;
    }

    await db.addUser(newUser);
    setNewUser({ nome: '', login: '', senha_hash: '', perfil: 'MECANICO' });
    await loadUsers();
    if (onRefresh) onRefresh();
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja remover/desativar o usuário ${userName}?`)) {
      await db.deleteUser(userId);
      await loadUsers();
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5 border-t-8 border-[#125938] my-8 font-sans">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-bold font-serif text-[#06402F] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8C4580]" />
            Gerenciamento de Usuários (Mecânicos & Funileiros)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to Register New Worker / User (Alteração #1) */}
        <form onSubmit={handleAddUser} className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-3 text-xs">
          <h4 className="font-bold text-[#06402F] flex items-center gap-1.5 text-sm font-serif">
            <UserPlus className="w-4 h-4 text-[#8C4580]" />
            Cadastrar Novo Funcionário / Usuário
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={newUser.nome}
                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                placeholder="Ex: Gustavo Funileiro"
                className="w-full border rounded p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Login de Acesso *</label>
              <input
                type="text"
                required
                value={newUser.login}
                onChange={(e) => setNewUser({ ...newUser, login: e.target.value.toLowerCase().trim() })}
                placeholder="Ex: gustavo"
                className="w-full border rounded p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Senha Inicial *</label>
              <input
                type="password"
                required
                value={newUser.senha_hash}
                onChange={(e) => setNewUser({ ...newUser, senha_hash: e.target.value })}
                placeholder="••••••••"
                className="w-full border rounded p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Perfil de Acesso *</label>
              <select
                value={newUser.perfil}
                onChange={(e) => setNewUser({ ...newUser, perfil: e.target.value })}
                className="w-full border rounded p-2 text-xs font-bold bg-white"
              >
                <option value="MECANICO">Mecânico / Funileiro</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#125938] hover:bg-[#06402F] text-white py-2 rounded font-bold shadow text-xs transition"
          >
            Cadastrar Usuário
          </button>
        </form>

        {/* Existing Users List */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">
            Usuários Ativos do Sistema ({users.length})
          </h4>

          {loading ? (
            <p className="text-xs text-gray-500 italic">Carregando usuários...</p>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {users.map((u) => (
                <div key={u.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded bg-emerald-100 text-[#125938]">
                      {u.perfil === 'ADMIN' ? <Shield className="w-4 h-4 text-[#8C4580]" /> : <Wrench className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{u.nome}</p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        login: <strong>{u.login}</strong> | perfil: <span className="font-bold">{u.perfil}</span>
                      </p>
                    </div>
                  </div>

                  {u.login !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.nome)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 border border-red-200"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 text-xs font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
