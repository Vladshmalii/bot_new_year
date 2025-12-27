import React from 'react';
import {
  LayoutDashboard,
  Dices,
  Map,
  Scroll,
  Backpack,
  Skull,
  Upload
} from 'lucide-react';

type MasterTab = 'dashboard' | 'dice' | 'locations' | 'notes' | 'inventory' | 'mobs' | 'import';

interface MasterSidebarProps {
  activeTab: MasterTab;
  onTabChange: (tab: MasterTab) => void;
}

const MasterSidebar: React.FC<MasterSidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard' as MasterTab, label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
    { id: 'dice' as MasterTab, label: 'Кубики', icon: <Dices size={20} /> },
    { id: 'locations' as MasterTab, label: 'Локации', icon: <Map size={20} /> },
    { id: 'notes' as MasterTab, label: 'Подсказки', icon: <Scroll size={20} /> },
    { id: 'inventory' as MasterTab, label: 'Инвентарь', icon: <Backpack size={20} /> },
    { id: 'mobs' as MasterTab, label: 'Мобы', icon: <Skull size={20} /> },
    { id: 'import' as MasterTab, label: 'Импорт', icon: <Upload size={20} /> },
  ];

  return (
    <aside className="master-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Система</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};


export default MasterSidebar;

