import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MapPin, Plus, UserPlus, Info } from 'lucide-react';

const LocationsPanel: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationDesc, setNewLocationDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [locationsRes, charactersRes] = await Promise.all([
        api.get('/master/locations'),
        api.get('/master/characters'),
      ]);
      setLocations(locationsRes.data);
      setCharacters(charactersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLocation = async () => {
    if (!newLocationName.trim()) return;

    try {
      await api.post('/master/locations', {
        name: newLocationName,
        description: newLocationDesc,
      });
      setNewLocationName('');
      setNewLocationDesc('');
      loadData();
    } catch (error) {
      console.error('Failed to create location:', error);
      alert('Ошибка при создании локации');
    }
  };

  const moveCharacter = async (characterId: number, locationId: number) => {
    try {
      await api.post('/master/move-character', {
        character_id: characterId,
        location_id: locationId,
      });
      loadData();
    } catch (error) {
      console.error('Failed to move character:', error);
      alert('Ошибка при перемещении персонажа');
    }
  };

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  if (loading) {
    return <div className="admin-loading">Загрузка локаций...</div>;
  }

  return (
    <div className="locations-manager">
      <div className="manager-sidebar">
        <div className="sidebar-header">
          <h3>Список Локаций</h3>
          <p>{locations.length} локаций создано</p>
        </div>

        <div className="creation-section">
          <input
            type="text"
            placeholder="Название локации"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
          />
          <textarea
            placeholder="Описание..."
            value={newLocationDesc}
            onChange={(e) => setNewLocationDesc(e.target.value)}
            rows={2}
          />
          <button className="admin-btn active full-width" onClick={createLocation}>
            <Plus size={16} /> Создать локацию
          </button>
        </div>

        <div className="location-nav-list">
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`char-nav-item ${selectedLocationId === loc.id ? 'active' : ''}`}
              onClick={() => setSelectedLocationId(loc.id)}
            >
              <div className="char-nav-header">
                <MapPin size={14} />
                <span className="char-nav-name">{loc.name}</span>
              </div>
              <div className="char-nav-stats">
                <span>{loc.characters?.length || 0} персонажей</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="manager-main-content">
        {selectedLocation ? (
          <div className="location-details-modern">
            <div className="details-header">
              <div className="header-info">
                <MapPin size={32} className="header-icon" />
                <div>
                  <h2>{selectedLocation.name}</h2>
                  <p>{selectedLocation.description || 'Нет описания'}</p>
                </div>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-section">
                <h3><UserPlus size={18} /> Присутствующие</h3>
                <div className="location-characters-list">
                  {selectedLocation.characters && selectedLocation.characters.length > 0 ? (
                    selectedLocation.characters.map((char: any) => (
                      <div key={char.id} className="location-char-tag">
                        {char.name}
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">Локация пуста</p>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3><Info size={18} /> Действия</h3>
                <div className="action-box">
                  <label>Переместить персонажа сюда:</label>
                  <select
                    className="admin-select"
                    onChange={(e) => {
                      const charId = parseInt(e.target.value);
                      if (charId) moveCharacter(charId, selectedLocation.id);
                    }}
                  >
                    <option value="">Выберите персонажа...</option>
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <MapPin size={48} className="empty-icon" />
            <h3>Выберите локацию</h3>
            <p>Выберите местоположение слева для управления персонажами</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPanel;
