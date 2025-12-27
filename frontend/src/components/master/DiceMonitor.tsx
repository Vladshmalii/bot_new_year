import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const DiceMonitor: React.FC = () => {
  const [rolls, setRolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRolls();
    const interval = setInterval(loadRolls, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRolls = async () => {
    try {
      const response = await api.get('/dice/rolls?limit=50');
      setRolls(response.data);
    } catch (error) {
      console.error('Failed to load rolls:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dice-monitor-loading">Загрузка...</div>;
  }

  return (
    <div className="dice-monitor">
      <h1 className="dice-monitor-title">🎲 Мониторинг бросков</h1>
      
      <div className="dice-rolls-table">
        <table>
          <thead>
            <tr>
              <th>Время</th>
              <th>Персонаж</th>
              <th>Тип</th>
              <th>Результат</th>
              <th>Контекст</th>
            </tr>
          </thead>
          <tbody>
            {rolls.map((roll) => (
              <tr key={roll.id}>
                <td>{new Date(roll.created_at).toLocaleString('ru-RU')}</td>
                <td>{roll.user_name}</td>
                <td>{roll.character_name || '-'}</td>
                <td className="dice-type">{roll.type}</td>
                <td className="dice-value">{roll.value}</td>
                <td>{JSON.stringify(roll.context || {})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rolls.length === 0 && (
        <div className="dice-monitor-empty">
          <p>Бросков пока нет</p>
        </div>
      )}
    </div>
  );
};

export default DiceMonitor;

