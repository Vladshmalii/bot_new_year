import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import MasterInventoryEditor from './MasterInventoryEditor';
import { computeDerivedStats } from '../../utils/deriveStats';
import { User, Shield, Sword, Package } from 'lucide-react';

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
    return <div className="admin-loading">Загрузка инвентаря...</div>;
  }

  return (
    <div className="inventory-manager-new">
      <div className="inventory-sidebar">
        <h3 className="sidebar-title">Персонажи</h3>
        <div className="character-nav-list">
          {characters.map((char) => {
            const derived = computeDerivedStats(char, char.inventory || []);
            const isSelected = selectedCharacterId === char.id;

            return (
              <button
                key={char.id}
                className={`char-nav-item ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCharacterId(char.id)}
              >
                <div className="char-nav-header">
                  <User size={14} />
                  <span className="char-nav-name">{char.name}</span>
                </div>
                <div className="char-nav-stats">
                  <span title="Урон"><Sword size={10} /> {derived.damage_total}</span>
                  <span title="Защита"><Shield size={10} /> {derived.defense_total}</span>
                  <span title="Предметы"><Package size={10} /> {(char.inventory || []).length}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="inventory-main-content">
        {selectedCharacter ? (
          <MasterInventoryEditor
            character={selectedCharacter}
            onUpdate={loadData}
          />
        ) : (
          <div className="empty-state">
            <Package size={48} className="empty-icon" />
            <h3>Выберите персонажа</h3>
            <p>Выберите героя слева, чтобы просмотреть и отредактировать его инвентарь</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
