import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const MasterDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [characterDetails, setCharacterDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({
    role: '',
    hp_current: 0,
    hp_max: 0,
    stats: { str: 0, dex: 0, int: 0, wis: 0, cha: 0, con: 0 },
    damage_base: 0
  });

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
    setIsEditing(false);
    try {
      const response = await api.get(`/character/${characterId}`);
      const char = response.data.character;
      setCharacterDetails(response.data);
      setEditData({
        role: char.role || '',
        hp_current: char.hp_current || 0,
        hp_max: char.hp_max || 0,
        stats: char.stats || { str: 0, dex: 0, int: 0, wis: 0, cha: 0, con: 0 },
        damage_base: char.damage_base || 0
      });
    } catch (error) {
      console.error('Failed to load character details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const saveCharacterChanges = async () => {
    try {
      await api.put(`/character/${selectedCharacter}`, editData);
      setIsEditing(false);
      // Reload details and dashboard
      await handleCharacterClick(selectedCharacter);
      await loadDashboard();
      alert('Данные персонажа обновлены!');
    } catch (error) {
      console.error('Failed to save character changes:', error);
      alert('Ошибка при сохранении изменений');
    }
  };

  const closeCharacterModal = () => {
    setSelectedCharacter(null);
    setCharacterDetails(null);
    setIsEditing(false);
  };

  if (loading) {
    return <div className="master-dashboard-loading">Загрузка...</div>;
  }

  return (
    <div className="master-dashboard-new">

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
                <div className="character-modal-header-edit">
                  <h2 className="character-modal-name">{characterDetails.character.name}</h2>
                  <button
                    className={`edit-toggle-button ${isEditing ? 'active' : ''}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'СОХРАНИТЬ' : 'ИЗМЕНИТЬ'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="edit-character-form">
                    <div className="form-group-edit">
                      <label>Роль:</label>
                      <input
                        type="text"
                        value={editData.role || ''}
                        onChange={e => setEditData({ ...editData, role: e.target.value })}
                      />
                    </div>

                    <div className="form-row-edit">
                      <div className="form-group-edit">
                        <label>HP Текущее:</label>
                        <input
                          type="number"
                          value={editData.hp_current || 0}
                          onChange={e => setEditData({ ...editData, hp_current: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="form-group-edit">
                        <label>HP Макс:</label>
                        <input
                          type="number"
                          value={editData.hp_max || 0}
                          onChange={e => setEditData({ ...editData, hp_max: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="form-section-edit">
                      <h4>Характеристики:</h4>
                      <div className="stats-edit-grid">
                        {['str', 'dex', 'int', 'wis', 'cha', 'con'].map(stat => (
                          <div key={stat} className="stat-edit-item">
                            <label>{stat.toUpperCase()}:</label>
                            <input
                              type="number"
                              value={editData.stats[stat] || 0}
                              onChange={e => setEditData({
                                ...editData,
                                stats: { ...editData.stats, [stat]: parseInt(e.target.value) }
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group-edit">
                      <label>Базовый урон:</label>
                      <input
                        type="number"
                        value={editData.damage_base || 0}
                        onChange={e => setEditData({ ...editData, damage_base: parseInt(e.target.value) })}
                      />
                    </div>

                    <button className="save-changes-button" onClick={saveCharacterChanges}>
                      Применить изменения
                    </button>
                  </div>
                ) : (
                  <>
                    {characterDetails.character.role && (
                      <p className="character-modal-role">{characterDetails.character.role}</p>
                    )}

                    <div className="master-character-section">
                      <h3 className="master-section-title">Характеристики персонажа</h3>
                      <div className="character-info-grid">
                        <div className="info-item-hp">
                          <strong>HP:</strong> <span style={{ color: 'var(--accent-cyan)' }}>{characterDetails.character.hp_current}</span> / {characterDetails.character.hp_max}
                        </div>
                        <div className="info-item-stats">
                          <div className="stat-pill-list">
                            {Object.entries(characterDetails.character.stats || {}).map(([s, v]: any) => (
                              <span key={s} className="stat-pill">{s.toUpperCase()}: {v}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="master-character-section master-secret-section">
                      <h3 className="master-section-title">
                        <AlertCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
                        Секреты Мастера
                      </h3>

                      {characterDetails.character.description && (
                        <div className="secret-info-block">
                          <h4>Описание:</h4>
                          <p>{characterDetails.character.description}</p>
                        </div>
                      )}

                      {characterDetails.character.goals?.secret && (
                        <div className="secret-info-block">
                          <h4>Секретная цель:</h4>
                          <p>{characterDetails.character.goals.secret}</p>
                        </div>
                      )}

                      {characterDetails.character.notes_hidden_from_player &&
                        characterDetails.character.notes_hidden_from_player.length > 0 && (
                          <div className="secret-info-block">
                            <h4>Скрытые заметки:</h4>
                            <ul className="hidden-notes-list">
                              {characterDetails.character.notes_hidden_from_player.map((note: any, index: number) => (
                                <li key={index}>{note.text || note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;

