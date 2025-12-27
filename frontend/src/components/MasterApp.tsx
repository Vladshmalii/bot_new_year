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

type MasterTab = 'dashboard' | 'dice' | 'locations' | 'notes' | 'inventory' | 'mobs' | 'import';

const MasterApp: React.FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<MasterTab>('dashboard');

  return (
    <div className="master-app">
      <div className="master-header">
        <h1 className="master-header-title">Панель Мастера</h1>
        <button className="logout-button" onClick={logout}>
          Выйти
        </button>
      </div>
      <MasterSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="master-content">
        {activeTab === 'dashboard' && <MasterDashboard />}
        {activeTab === 'dice' && <DiceMonitor />}
        {activeTab === 'locations' && <LocationsPanel />}
        {activeTab === 'notes' && <NotesManager />}
        {activeTab === 'inventory' && <InventoryManager />}
        {activeTab === 'mobs' && <MobsPanel />}
        {activeTab === 'import' && <ExcelImport />}
      </div>
    </div>
  );
};

export default MasterApp;

