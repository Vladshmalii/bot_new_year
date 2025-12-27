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
        <User className="nav-icon" size={24} color={activeTab === 'profile' ? 'var(--accent-gold)' : undefined} />
        <span className="nav-label" style={{ color: activeTab === 'profile' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>Персонаж</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onTabChange('stats')}
      >
        <Flame className="nav-icon" size={24} color={activeTab === 'stats' ? 'var(--accent-cyan)' : undefined} />
        <span className="nav-label" style={{ color: activeTab === 'stats' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>Статы</span>
      </button>
      <button
        className={`nav-item dice-center-button ${activeTab === 'dice' ? 'active' : ''}`}
        onClick={() => onTabChange('dice')}
      >
        <Dices className="nav-icon" size={32} />
      </button>
      <button
        className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
        onClick={() => onTabChange('inventory')}
      >
        <Backpack className="nav-icon" size={24} color={activeTab === 'inventory' ? '#c0a3ff' : undefined} />
        <span className="nav-label" style={{ color: activeTab === 'inventory' ? '#c0a3ff' : 'var(--text-muted)' }}>Вещи</span>
      </button>
      <button
        className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => onTabChange('notes')}
      >
        <Scroll className="nav-icon" size={24} color={activeTab === 'notes' ? 'var(--accent-gold)' : undefined} />
        <span className="nav-label" style={{ color: activeTab === 'notes' ? 'var(--accent-gold)' : 'var(--text-muted)' }}>Свитки</span>
      </button>
    </nav>
  );
};


export default BottomNav;


