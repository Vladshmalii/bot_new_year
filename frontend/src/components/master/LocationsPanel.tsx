import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const LocationsPanel: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
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

  if (loading) {
    return <div className="locations-panel-loading">Загрузка...</div>;
  }

  return (
    <div className="locations-panel">
      <h1 className="locations-title">🗺️ Локации</h1>

      <div className="locations-content">
        <div className="locations-list">
          <h2>Список локаций</h2>
          
          <div className="create-location-form">
            <input
              type="text"
              placeholder="Название локации"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              className="location-input"
            />
            <textarea
              placeholder="Описание"
              value={newLocationDesc}
              onChange={(e) => setNewLocationDesc(e.target.value)}
              className="location-textarea"
            />
            <button onClick={createLocation} className="create-location-button">
              Создать локацию
            </button>
          </div>

          {locations.map((location) => (
            <div
              key={location.id}
              className={`location-card ${selectedLocation === location.id ? 'selected' : ''}`}
              onClick={() => setSelectedLocation(location.id)}
            >
              <h3>{location.name}</h3>
              {location.description && <p>{location.description}</p>}
              <div className="location-characters-count">
                Персонажей: {location.characters?.length || 0}
              </div>
            </div>
          ))}
        </div>

        {selectedLocation && (
          <div className="location-details">
            <h2>Управление локацией</h2>
            {locations.find((l) => l.id === selectedLocation) && (
              <>
                <h3>{locations.find((l) => l.id === selectedLocation)?.name}</h3>
                <div className="location-characters">
                  <h4>Персонажи в локации:</h4>
                  {locations
                    .find((l) => l.id === selectedLocation)
                    ?.characters?.map((char: any) => (
                      <div key={char.id} className="location-character-item">
                        {char.name}
                      </div>
                    ))}
                </div>
                <div className="move-character-section">
                  <h4>Переместить персонажа:</h4>
                  <select
                    className="character-select"
                    onChange={(e) => {
                      const charId = parseInt(e.target.value);
                      if (charId) {
                        moveCharacter(charId, selectedLocation);
                      }
                    }}
                  >
                    <option value="">Выберите персонажа</option>
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationsPanel;

