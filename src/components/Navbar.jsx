import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Shield, Car, Package, LayoutDashboard, LogOut, Search, Settings, User, Users } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, openSettings, openUserManagement }) => {
  const { user, logout, isAdmin } = useAuth();

  const getRoleLabel = () => {
    if (!user) return '';
    if (user.perfil === 'ADMIN') return 'Administrador';
    if (user.perfil === 'FUNILEIRO') return 'Funileiro';
    return 'Mecânico';
  };

  return (
    <header className="bg-[#032326] text-white border-b-4 border-[#8C4580] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand (ALTERAÇÃO #19: Goes to dashboard) */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'orders')}
            title="Ir para a Tela Inicial / Dashboard"
          >
            <div className="bg-[#8C4580] p-2 rounded-lg text-white shadow group-hover:scale-105 transition">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white leading-tight">
                SHIBUYA <span className="text-[#8C4580]">MOTORES</span>
              </h1>
              <p className="text-xs text-gray-300 tracking-wider uppercase font-sans">
                Mecânica & Funilaria
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-6 relative">
            <input
              type="text"
              placeholder="Buscar placa, cliente, modelo ou OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#125938] text-white placeholder-gray-300 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8C4580] border border-emerald-700"
            />
            <Search className="w-4 h-4 text-gray-300 absolute left-2.5 top-2.5" />
          </div>

          {/* User Profile & Actions (ALTERAÇÃO #17: User name & function prominently displayed) */}
          <div className="flex items-center gap-3">
            {isAdmin && openUserManagement && (
              <button
                onClick={openUserManagement}
                title="Gerenciar Usuários (Cadastrar/Excluir)"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-[#125938] rounded-lg transition flex items-center gap-1 text-xs border border-emerald-800"
              >
                <Users className="w-4 h-4 text-[#8C4580]" />
                <span className="hidden lg:inline">Usuários</span>
              </button>
            )}

            <button
              onClick={openSettings}
              title="Configurações do Supabase"
              className="p-1.5 text-gray-300 hover:text-white hover:bg-[#125938] rounded-lg transition border border-emerald-800"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Prominent User Badge (ALTERAÇÃO #17) */}
            <div className="flex items-center gap-2 bg-[#125938] px-3 py-1.5 rounded-lg border border-emerald-700 shadow-sm">
              <div className="p-1 bg-[#8C4580] rounded text-white">
                <User className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight flex items-center gap-1">
                  {user?.nome}
                </p>
                <span
                  className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                    isAdmin ? 'bg-[#8C4580] text-white' : 'bg-emerald-900 text-emerald-200'
                  }`}
                >
                  {getRoleLabel()}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs bg-red-900/80 hover:bg-red-800 text-red-100 px-3 py-1.5 rounded-lg font-sans transition border border-red-800"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-emerald-900/50 pt-2 text-xs sm:text-sm">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-[#125938] text-white border-b-2 border-[#8C4580] font-bold'
                  : 'text-gray-300 hover:bg-[#125938]/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#8C4580]" />
              Dashboard
            </button>
          )}

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'orders'
                ? 'bg-[#125938] text-white border-b-2 border-[#8C4580] font-bold'
                : 'text-gray-300 hover:bg-[#125938]/50 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4 text-[#308C50]" />
            Ordens de Serviço
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'clients'
                ? 'bg-[#125938] text-white border-b-2 border-[#8C4580] font-bold'
                : 'text-gray-300 hover:bg-[#125938]/50 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4 text-emerald-400" />
            Clientes & Veículos
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('plates')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
                activeTab === 'plates'
                  ? 'bg-[#125938] text-white border-b-2 border-[#8C4580] font-bold'
                  : 'text-gray-300 hover:bg-[#125938]/50 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              Verificação de Placas (Auditoria)
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('parts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
                activeTab === 'parts'
                  ? 'bg-[#125938] text-white border-b-2 border-[#8C4580] font-bold'
                  : 'text-gray-300 hover:bg-[#125938]/50 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-purple-400" />
              Catálogo de Peças
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
