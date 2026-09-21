import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Shield, Car, Package, LayoutDashboard, LogOut, Search, Settings, User } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, openSettings }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-[#032326] text-white border-b-4 border-[#8C4580] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('orders')}>
            <div className="bg-[#8C4580] p-2 rounded-lg text-white shadow">
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
              placeholder="Buscar por placa, cliente ou OS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#125938] text-white placeholder-gray-300 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8C4580] border border-emerald-700"
            />
            <Search className="w-4 h-4 text-gray-300 absolute left-2.5 top-2.5" />
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={openSettings}
              title="Configurações do Supabase"
              className="p-1.5 text-gray-300 hover:text-white hover:bg-[#125938] rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-[#125938] px-3 py-1.5 rounded-lg border border-emerald-800">
              <User className="w-4 h-4 text-[#8C4580]" />
              <div className="text-xs">
                <p className="font-semibold text-white leading-none">{user?.nome}</p>
                <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                  isAdmin ? 'bg-[#8C4580] text-white' : 'bg-[#308C50] text-white'
                }`}>
                  {user?.perfil}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs bg-red-900/80 hover:bg-red-800 text-red-100 px-3 py-1.5 rounded-lg font-sans transition"
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
                  ? 'bg-[#125938] text-white border-b-2 border-[#8C4580]'
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
                ? 'bg-[#125938] text-white border-b-2 border-[#8C4580]'
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
                ? 'bg-[#125938] text-white border-b-2 border-[#8C4580]'
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
                  ? 'bg-[#125938] text-white border-b-2 border-[#8C4580]'
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
                  ? 'bg-[#125938] text-white border-b-2 border-[#8C4580]'
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
