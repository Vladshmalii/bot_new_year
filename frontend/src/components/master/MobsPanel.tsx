import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const MobsPanel: React.FC = () => {
  const [mobs, setMobs] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedMob, setSelectedMob] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadMobsForLocation();
    }
  }, [selectedLocation]);

  const loadData = async () => {
    try {
      const locationsRes = await api.get('/master/locations');
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMobsForLocation = async () => {
    if (!selectedLocation) return;

    try {
      const response = await api.get(`/master/mobs?location_id=${selectedLocation}`);
      setMobs(response.data);
    } catch (error) {
      console.error('Failed to load mobs:', error);
    }
  };

  const spawnMob = async () => {
    if (!selectedLocation || !selectedMob) {
      alert('Выберите локацию и моба');
      return;
    }

    try {
      const response = await api.post('/master/spawn-mob', {
        mob_id: selectedMob,
        location_id: selectedLocation,
      });
      alert(`Моб создан! HP: ${response.data.hp_current}`);
      loadMobsForLocation();
    } catch (error) {
      console.error('Failed to spawn mob:', error);
      alert('Ошибка при создании моба');
    }
  };

  if (loading) {
    return <div className="mobs-panel-loading">Загрузка...</div>;
  }

  return (
    <div className="mobs-panel">
      <h1 className="mobs-panel-title">👹 Управление мобами</h1>

      <div className="mobs-panel-content">
        <div className="mobs-controls">
          <div className="form-group">
            <label>Локация:</label>
            <select
              className="location-select"
              value={selectedLocation || ''}
              onChange={(e) => setSelectedLocation(parseInt(e.target.value) || null)}
            >
              <option value="">Выберите локацию</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {selectedLocation && (
            <>
              <div className="form-group">
                <label>Моб:</label>
                <select
                  className="mob-select"
                  value={selectedMob || ''}
                  onChange={(e) => setSelectedMob(parseInt(e.target.value) || null)}
                >
                  <option value="">Выберите моба</option>
                  {mobs.map((mob) => (
                    <option key={mob.id} value={mob.id}>
                      {mob.name}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={spawnMob} className="spawn-mob-button">
                Создать моба в локации
              </button>
            </>
          )}
        </div>

        {mobs.length > 0 && (
          <div className="mobs-list">
            <h2>Доступные мобы</h2>
            {mobs.map((mob) => (
              <div key={mob.id} className="mob-card">
                <h3>{mob.name}</h3>
                {mob.description && <p>{mob.description}</p>}
                <div className="mob-stats">
                  <span>HP: {mob.base_hp}</span>
                  <span>Урон: {mob.base_damage}</span>
                  {mob.dice_pattern && <span>Паттерн: {mob.dice_pattern}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobsPanel;

