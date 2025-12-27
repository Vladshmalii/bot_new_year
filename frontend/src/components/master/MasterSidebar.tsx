import React from 'react';
import {
  LayoutDashboard,
  Dices,
  Map,
  Scroll,
  Backpack,
  Skull,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

type MasterTab = 'dashboard' | 'dice' | 'locations' | 'notes' | 'inventory' | 'mobs' | 'import';

interface MasterSidebarProps {
  activeTab: MasterTab;
  onTabChange: (tab: MasterTab) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const MasterSidebar: React.FC<MasterSidebarProps> = ({ activeTab, onTabChange, isOpen, onToggle }) => {
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
    <aside className={`master-sidebar-new ${isOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-brand">
        {isOpen ? <span className="brand-text">GM PANEL</span> : <span className="brand-dot" />}
      </div>

      <nav className="sidebar-nav-new">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-button ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={!isOpen ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-text">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="collapse-toggle" onClick={onToggle}>
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default MasterSidebar;
