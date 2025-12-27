import React from 'react';
import { 
  User, 
  Zap, 
  Package, 
  StickyNote,
  Dice6 
} from 'lucide-react';

type Tab = 'profile' | 'stats' | 'inventory' | 'notes' | 'dice';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <User className="nav-icon" size={22} />
        <span className="nav-label">Персонаж</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onTabChange('stats')}
      >
        <Zap className="nav-icon" size={22} />
        <span className="nav-label">Статы</span>
      </button>
      <button
        className={`nav-item dice-center-button ${activeTab === 'dice' ? 'active' : ''}`}
        onClick={() => onTabChange('dice')}
      >
        <Dice6 className="nav-icon" size={28} />
      </button>
      <button
        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => onTabChange('inventory')}
      >
        <Package className="nav-icon" size={22} />
        <span className="nav-label">Инвентарь</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => onTabChange('notes')}
      >
        <StickyNote className="nav-icon" size={22} />
        <span className="nav-label">Записки</span>
      </button>
    </nav>
  );
};

export default BottomNav;

