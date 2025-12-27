import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { resetCache } from '../services/api';
import { Key, Sparkles, RefreshCw } from 'lucide-react';

const MASTER_PASSWORD = '2365';

const LoginScreen: React.FC = () => {
  const [players, setPlayers] = useState<any[]>([]);
  const [showMasterCode, setShowMasterCode] = useState(false);
  const [masterCode, setMasterCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [resettingCache, setResettingCache] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const response = await api.get('/players');
      console.log('Loaded players:', response.data);
      setPlayers(response.data || []);
    } catch (error) {
      console.error('Failed to load players:', error);
      setPlayers([]);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handlePlayerClick = async (playerName: string) => {
    setError('');
    setLoading(true);

    try {
      await login('player', { player_name: playerName });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleMasterCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!masterCode.trim()) {
      setError('Введите код');
      return;
    }

    setLoading(true);

    try {
      if (masterCode.trim() === MASTER_PASSWORD) {
        await login('master', { password: masterCode.trim() });
      } else {
        setError('Неверный код');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleResetCache = async () => {
    if (!window.confirm('Очистить кэш и перезагрузить данные из JSON? Все изменения (HP, инвентарь и т.д.) будут потеряны.')) {
      return;
    }

    setResettingCache(true);
    setError('');
    try {
      await resetCache();
      await loadPlayers();
      alert('Кэш сброшен. Данные перезагружены из JSON.');
      window.location.reload(); // Перезагружаем страницу для применения изменений
    } catch (err: any) {
      setError('Ошибка при сбросе кэша: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setResettingCache(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-top-buttons">
        <button
          className="master-code-button"
          onClick={() => setShowMasterCode(!showMasterCode)}
          title="Код мастера"
        >
          <Key size={24} color="var(--accent-gold)" />
        </button>
        <button
          className="reset-cache-button"
          onClick={handleResetCache}
          title="Сбросить кэш и перезагрузить данные"
          disabled={resettingCache}
        >
          <RefreshCw size={24} className={resettingCache ? 'spinning' : ''} color="var(--accent-cyan)" />
        </button>
      </div>

      {showMasterCode && (
        <div className="master-code-modal">
          <div className="master-code-content">
            <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--accent-gold)' }}>Тайный Код</h2>
            <form onSubmit={handleMasterCodeSubmit}>
              <input
                type="password"
                value={masterCode}
                onChange={(e) => setMasterCode(e.target.value)}
                placeholder="****"
                autoFocus
                disabled={loading}
              />
              {error && <div className="login-error">{error}</div>}
              <div className="master-code-buttons">
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                  style={{ background: 'var(--accent-mystic)' }}
                >
                  {loading ? 'Проникновение...' : 'Войти'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowMasterCode(false);
                    setMasterCode('');
                    setError('');
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="login-container">
        <div className="login-header">
          <div className="login-title-wrapper">
            <Sparkles className="login-title-icon" size={36} color="var(--accent-gold)" />
            <h1 className="login-title" style={{ fontFamily: 'Cinzel, serif', letterSpacing: '2px' }}>
              Mystic <span style={{ color: 'var(--accent-gold)' }}>2025</span>
            </h1>
          </div>
          <p className="login-subtitle">Выберите свою судьбу</p>
        </div>

        {loadingPlayers ? (
          <div className="players-loading">Призыв героев...</div>
        ) : (
          <div className="players-grid">
            {players.map((player) => (
              <button
                key={player.id}
                className="player-button"
                onClick={() => handlePlayerClick(player.name)}
                disabled={loading}
              >
                {player.name}
              </button>
            ))}
          </div>
        )}

        {error && !showMasterCode && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
};


export default LoginScreen;
