import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MasterSidebar from './master/MasterSidebar';
import MasterDashboard from './master/MasterDashboard';
import DiceMonitor from './master/DiceMonitor';
import LocationsPanel from './master/LocationsPanel';
import NotesManager from './master/NotesManager';
import InventoryManager from './master/InventoryManager';
import MobsPanel from './master/MobsPanel';
import ExcelImport from './master/ExcelImport';
import { LogOut, Menu, X } from 'lucide-react';

type MasterTab = 'dashboard' | 'dice' | 'locations' | 'notes' | 'inventory' | 'mobs' | 'import';

const MasterApp: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MasterTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`master-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <MasterSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="master-main">
        <header className="master-header-new">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="header-title">
              {activeTab === 'dashboard' && 'Дашборд'}
              {activeTab === 'dice' && 'Монитор кубиков'}
              {activeTab === 'locations' && 'Локации'}
              {activeTab === 'notes' && 'Подсказки'}
              {activeTab === 'inventory' && 'Инвентарь игроков'}
              {activeTab === 'mobs' && 'Мобы'}
              {activeTab === 'import' && 'Импорт данных'}
            </h1>
          </div>

          <button className="logout-btn-minimal" onClick={logout} title="Выйти">
            <LogOut size={18} />
            <span>Выйти</span>
          </button>
        </header>

        <section className="master-content-area">
          {activeTab === 'dashboard' && <MasterDashboard />}
          {activeTab === 'dice' && <DiceMonitor />}
          {activeTab === 'locations' && <LocationsPanel />}
          {activeTab === 'notes' && <NotesManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'mobs' && <MobsPanel />}
          {activeTab === 'import' && <ExcelImport />}
        </section>
      </main>
    </div>
  );
};

export default MasterApp;
