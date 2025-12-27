import React, { useState } from 'react';
import { api } from '../../services/api';

interface DicePanelProps {
  characterId: number | null;
}

const DicePanel: React.FC<DicePanelProps> = ({ characterId }) => {
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: string; value: number } | null>(null);

  const diceTypes = [
    { type: 'd4', label: 'd4', sides: 4 },
    { type: 'd6', label: 'd6', sides: 6 },
    { type: 'd8', label: 'd8', sides: 8 },
    { type: 'd10', label: 'd10', sides: 10 },
    { type: 'd12', label: 'd12', sides: 12 },
    { type: 'd20', label: 'd20', sides: 20 },
    { type: 'd100', label: 'd100', sides: 100 },
  ];

  const rollDice = async (diceType: string) => {
    setRolling(true);
    setLastResult(null);

    try {
      const response = await api.post(
        '/dice/roll',
        {
          dice_type: diceType,
          character_id: characterId,
        }
      );

      // Simulate rolling animation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastResult({
        type: diceType,
        value: response.data.value,
      });
    } catch (error) {
      console.error('Failed to roll dice:', error);
      alert('Ошибка при броске кубика');
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="dice-panel">
      <h2 className="dice-title">Броски кубиков</h2>

      <div className="dice-grid">
        {diceTypes.map((dice) => (
          <button
            key={dice.type}
            className={`dice-button ${rolling ? 'rolling' : ''}`}
            onClick={() => rollDice(dice.type)}
            disabled={rolling}
          >
            <span className="dice-label">{dice.label}</span>
            <span className="dice-sides">1-{dice.sides}</span>
          </button>
        ))}
      </div>

      {lastResult && (
        <div className="dice-result">
          <div className="dice-result-animation">
            <div className="dice-result-value">{lastResult.value}</div>
            <div className="dice-result-type">{lastResult.type}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DicePanel;

