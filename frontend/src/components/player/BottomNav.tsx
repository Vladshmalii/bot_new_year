import React from 'react';
import {
  User,
  Flame,
  Backpack,
  Scroll,
  Dices
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
        <User className="nav-icon" size={24} />
        <span className="nav-label">Персонаж</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onTabChange('stats')}
      >
        <Flame className="nav-icon" size={24} />
        <span className="nav-label">Статы</span>
      </button>
      <button
        className={`nav-item dice-center-button ${activeTab === 'dice' ? 'active' : ''}`}
        onClick={() => onTabChange('dice')}
      >
        <Dices className="nav-icon" size={24} />
        <span className="nav-label">Кубики</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => onTabChange('inventory')}
      >
        <Backpack className="nav-icon" size={24} />
        <span className="nav-label">Вещи</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => onTabChange('notes')}
      >
        <Scroll className="nav-icon" size={24} />
        <span className="nav-label">Свитки</span>
      </button>
    </nav>
  );
};

export default BottomNav;
