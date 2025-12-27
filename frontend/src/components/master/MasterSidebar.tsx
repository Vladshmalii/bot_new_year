import React from 'react';

type MasterTab = 'dashboard' | 'dice' | 'locations' | 'notes' | 'inventory' | 'mobs' | 'import';

interface MasterSidebarProps {
  activeTab: MasterTab;
  onTabChange: (tab: MasterTab) => void;
}

const MasterSidebar: React.FC<MasterSidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard' as MasterTab, label: 'Дашборд', icon: '📊' },
    { id: 'dice' as MasterTab, label: 'Кубики', icon: '🎲' },
    { id: 'locations' as MasterTab, label: 'Локации', icon: '🗺️' },
    { id: 'notes' as MasterTab, label: 'Подсказки', icon: '📝' },
    { id: 'inventory' as MasterTab, label: 'Инвентарь', icon: '🎒' },
    { id: 'mobs' as MasterTab, label: 'Мобы', icon: '👹' },
    { id: 'import' as MasterTab, label: 'Импорт', icon: '📥' },
  ];

  return (
    <aside className="master-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">🎭 Мастер</h2>
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

