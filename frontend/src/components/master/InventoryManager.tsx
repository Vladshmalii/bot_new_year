import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import MasterInventoryEditor from './MasterInventoryEditor';
import { computeDerivedStats } from '../../utils/deriveStats';

const InventoryManager: React.FC = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get('/master/characters');
      setCharacters(response.data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);

  if (loading) {
    return <div className="inventory-manager-loading">Загрузка...</div>;
  }

  return (
    <div className="inventory-manager">
      <h1 className="inventory-manager-title">🎒 Управление инвентарём и экипировкой</h1>

      <div className="inventory-manager-content">
        <div className="character-selector-panel">
          <h2>Выберите персонажа:</h2>
          <div className="character-cards">
            {characters.map((char) => {
              const derived = computeDerivedStats(char, char.inventory || []);
              const isSelected = selectedCharacterId === char.id;
              
              return (
                <div
                  key={char.id}
                  className={`character-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCharacterId(char.id)}
                >
                  <h3>{char.name}</h3>
                  <div className="character-quick-stats">
                    <div>HP: {char.hp_current}/{derived.hp_max_total}</div>
                    <div>Урон: {derived.damage_total}</div>
                    <div>Защита: {derived.defense_total}</div>
                    <div>Предметов: {(char.inventory || []).length}</div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>

        {selectedCharacter && (
          <MasterInventoryEditor 
            character={selectedCharacter} 
            onUpdate={loadData} 
          />
        )}

        {!selectedCharacter && (
          <div className="no-character-selected">
            <p>Выберите персонажа для управления инвентарём</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;

