import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Shield, Key, User, Lock, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  const quickFill = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    login(user, pass);
  };

  return (
    <div className="min-h-screen bg-[#F7F7E6] flex items-center justify-center p-4">
      <div className="bg-[#032326] text-white rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-[#8C4580] p-8 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-[#8C4580] p-3 rounded-2xl shadow-lg mb-1 text-white">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-wide">
            SHIBUYA <span className="text-[#8C4580]">MOTORES</span>
          </h1>
          <p className="text-xs text-gray-300 font-sans tracking-widest uppercase">
            Sistema de Oficina Mecânica & Funilaria
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-900/80 border border-red-500 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-gray-300 mb-1">Usuário / Login</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin ou mecanico"
                className="w-full bg-[#125938] text-white placeholder-gray-400 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8C4580] border border-emerald-800"
              />
              <User className="w-4 h-4 text-gray-300 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#125938] text-white placeholder-gray-400 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8C4580] border border-emerald-800"
              />
              <Lock className="w-4 h-4 text-gray-300 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8C4580] hover:bg-[#723668] text-white font-bold py-3 rounded-lg shadow-lg transition text-sm flex justify-center items-center gap-2"
          >
            {loading ? 'Acessando...' : 'Acessar Sistema'}
          </button>
        </form>

        {/* Teacher/Evaluator Quick Login Access */}
        <div className="pt-4 border-t border-emerald-900/60 text-xs space-y-3">
          <p className="text-center text-gray-300 font-bold uppercase text-[10px] tracking-wider">
            🔑 Acesso Rápido de Teste (Avaliador)
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickFill('admin', 'admin123')}
              className="bg-[#125938] hover:bg-[#308C50] text-white p-2.5 rounded-lg border border-emerald-700 text-left transition flex flex-col"
            >
              <span className="font-bold text-white text-[11px] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#8C4580]" /> Administrador
              </span>
              <span className="text-[10px] text-gray-300 font-mono mt-0.5">admin / admin123</span>
            </button>

            <button
              onClick={() => quickFill('mecanico', 'mecanico123')}
              className="bg-[#125938] hover:bg-[#308C50] text-white p-2.5 rounded-lg border border-emerald-700 text-left transition flex flex-col"
            >
              <span className="font-bold text-white text-[11px] flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Mecânico
              </span>
              <span className="text-[10px] text-gray-300 font-mono mt-0.5">mecanico / mecanico123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
