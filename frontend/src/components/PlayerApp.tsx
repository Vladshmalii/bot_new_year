import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import BottomNav from './player/BottomNav';
import CharacterProfile from './player/CharacterProfile';
import CharacterStats from './player/CharacterStats';
import Inventory from './player/Inventory';
import Notes from './player/Notes';
import DicePanel from './player/DicePanel';

type Tab = 'profile' | 'stats' | 'inventory' | 'notes' | 'dice';

interface PlayerAppProps {
  characterId: number;
}

const PlayerApp: React.FC<PlayerAppProps> = ({ characterId }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [characterData, setCharacterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCharacterData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/character/${characterId}`);
      setCharacterData(response.data);
    } catch (error) {
      console.error('Failed to load character:', error);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    loadCharacterData();
  }, [loadCharacterData]);

  if (loading || !characterData) {
    return <div className="player-app-loading">Загрузка персонажа...</div>;
  }

  return (
    <div className="player-app">
      <div className="player-app-header">
        <h1 className="player-app-title">{characterData.character.name}</h1>
        <button className="logout-button" onClick={logout}>
          Выйти
        </button>
      </div>
      <div className="player-app-content">
        {activeTab === 'profile' && <CharacterProfile character={characterData.character} />}
        {activeTab === 'stats' && <CharacterStats character={characterData.character} onUpdate={loadCharacterData} />}
        {activeTab === 'inventory' && <Inventory items={characterData.inventory} character={characterData.character} onUpdate={loadCharacterData} />}
        {activeTab === 'notes' && <Notes notes={characterData.notes} />}
        {activeTab === 'dice' && <DicePanel characterId={characterId} />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default PlayerApp;

