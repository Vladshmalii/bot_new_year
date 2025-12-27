import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const MasterDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [characterDetails, setCharacterDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/master/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterClick = async (characterId: number) => {
    setSelectedCharacter(characterId);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/character/${characterId}`);
      setCharacterDetails(response.data);
    } catch (error) {
      console.error('Failed to load character details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeCharacterModal = () => {
    setSelectedCharacter(null);
    setCharacterDetails(null);
  };

  if (loading) {
    return <div className="master-dashboard-loading">Загрузка...</div>;
  }

  return (
    <div className="master-dashboard">
      <h1 className="dashboard-title">📊 Дашборд</h1>
      
      <div className="dashboard-grid">
        {dashboardData?.characters?.map((char: any) => (
          <div 
            key={char.id} 
            className="character-card"
            onClick={() => handleCharacterClick(char.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="character-card-header">
              <h3 className="character-card-name">{char.name}</h3>
              {char.player_name && (
                <span className="character-card-player">Игрок: {char.player_name}</span>
              )}
            </div>
            
            <div className="character-card-hp">
              <div className="hp-bar-container">
                <div className="hp-bar-label">
                  <span>HP</span>
                  <span className="hp-values">
                    {char.hp_current} / {char.hp_max}
                  </span>
                </div>
                <div className="hp-bar">
                  <div
                    className="hp-bar-fill"
                    style={{
                      width: `${(char.hp_current / char.hp_max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {char.location && (
              <div className="character-card-location">
                Локация: {char.location}
              </div>
            )}

            {char.last_roll && (
              <div className="character-card-last-roll">
                Последний бросок: {char.last_roll.type} = {char.last_roll.value}
              </div>
            )}
          </div>
        ))}
      </div>

      {(!dashboardData?.characters || dashboardData.characters.length === 0) && (
        <div className="dashboard-empty">
          <p>Персонажей пока нет</p>
        </div>
      )}

      {selectedCharacter && (
        <div className="character-modal-overlay" onClick={closeCharacterModal}>
          <div className="character-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="character-modal-close" onClick={closeCharacterModal}>
              <X size={24} />
            </button>

            {loadingDetails ? (
              <div className="character-modal-loading">Загрузка...</div>
            ) : characterDetails ? (
              <div className="character-modal-body">
                <h2 className="character-modal-name">{characterDetails.character.name}</h2>
                
                {characterDetails.character.role && (
                  <p className="character-modal-role">{characterDetails.character.role}</p>
                )}

                <div className="master-character-section">
                  <h3 className="master-section-title">Видимая игроку информация</h3>
                  <div className="character-info-grid">
                    <div>
                      <strong>HP:</strong> {characterDetails.character.hp_current} / {characterDetails.character.hp_max}
                    </div>
                    <div>
                      <strong>Описание:</strong> {characterDetails.character.description}
                    </div>
                  </div>
                </div>

                <div className="master-character-section master-secret-section">
                  <h3 className="master-section-title">
                    <AlertCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
                    Скрытая информация (только для мастера)
                  </h3>

                  {characterDetails.character.goals?.secret && (
                    <div className="secret-info-block">
                      <h4>Секретная цель:</h4>
                      <p>{characterDetails.character.goals.secret}</p>
                    </div>
                  )}

                  {characterDetails.character.goals?.public && (
                    <div className="secret-info-block">
                      <h4>Публичная цель:</h4>
                      <p>{characterDetails.character.goals.public}</p>
                    </div>
                  )}

                  {characterDetails.character.fears && characterDetails.character.fears.length > 0 && (
                    <div className="secret-info-block">
                      <h4>Страхи:</h4>
                      <ul className="fears-list">
                        {characterDetails.character.fears.map((fear: string, index: number) => (
                          <li key={index}>{fear}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {characterDetails.character.notes_hidden_from_player && 
                   characterDetails.character.notes_hidden_from_player.length > 0 && (
                    <div className="secret-info-block">
                      <h4>Скрытые заметки мастера:</h4>
                      <ul className="hidden-notes-list">
                        {characterDetails.character.notes_hidden_from_player.map((note: any, index: number) => (
                          <li key={index}>{note.text || note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;

