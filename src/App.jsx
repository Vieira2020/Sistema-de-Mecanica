import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { OSList } from './components/OSList';
import { OSDetail } from './components/OSDetail';
import { ClientsVehicles } from './components/ClientsVehicles';
import { PlateVerification } from './components/PlateVerification';
import { PartsCatalog } from './components/PartsCatalog';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { db } from './lib/supabase';

export const AppContent = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'orders');
  const [selectedOSId, setSelectedOSId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('EM_ABERTO');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Loaded relational data for OS Detail view
  const [currentOS, setCurrentOS] = useState(null);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'dashboard') {
      setActiveTab('orders');
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (selectedOSId) {
      loadOSDetail(selectedOSId);
    }
  }, [selectedOSId]);

  const loadOSDetail = async (osId) => {
    const [ordList, cliList, vehList, prtList, usrList] = await Promise.all([
      db.getOSList(),
      db.getClients(),
      db.getVehicles(),
      db.getParts(),
      db.getUsers()
    ]);

    const os = ordList.find((o) => o.id === osId);
    setCurrentOS(os || null);
    setClients(cliList || []);
    setVehicles(vehList || []);
    setParts(prtList || []);
    setUsers(usrList || []);
  };

  if (!user) {
    return <Login />;
  }

  const handleSelectStatusFilterFromDash = (status) => {
    setStatusFilter(status);
    setActiveTab('orders');
    setSelectedOSId(null);
  };

  const handleOpenOSFromDash = (osId) => {
    setSelectedOSId(osId);
  };

  return (
    <div className="min-h-screen bg-[#F7F7E6] flex flex-col font-serif antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedOSId(null);
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openSettings={() => setShowConfigModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedOSId && currentOS ? (
          <OSDetail
            os={currentOS}
            clients={clients}
            vehicles={vehicles}
            parts={parts}
            users={users}
            onBack={() => setSelectedOSId(null)}
            onRefresh={() => loadOSDetail(selectedOSId)}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && isAdmin && (
              <Dashboard
                onSelectStatusFilter={handleSelectStatusFilterFromDash}
                onNavigateToOS={handleOpenOSFromDash}
              />
            )}

            {activeTab === 'orders' && (
              <OSList
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onSelectOS={(id) => setSelectedOSId(id)}
              />
            )}

            {activeTab === 'clients' && (
              <ClientsVehicles
                searchTerm={searchTerm}
                onCreateOSForVehicle={(veh, cli) => {
                  setActiveTab('orders');
                }}
              />
            )}

            {activeTab === 'plates' && isAdmin && <PlateVerification />}

            {activeTab === 'parts' && isAdmin && (
              <PartsCatalog searchTerm={searchTerm} />
            )}
          </>
        )}
      </main>

      <footer className="bg-[#032326] text-gray-400 text-xs py-4 border-t border-emerald-900 mt-8 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Shibuya Motores — Bragança Paulista, SP</p>
          <p className="font-mono text-gray-300">
            1ª Versão — Sistema Integrado de Mecânica e Funilaria
          </p>
        </div>
      </footer>

      {showConfigModal && (
        <SupabaseConfigModal onClose={() => setShowConfigModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <React.StrictMode>
      <AppContent />
    </React.StrictMode>
  );
}
