import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { deriveCharacterStats } from '../../utils/deriveStats';

interface CharacterStatsProps {
  character: any;
  onUpdate?: () => void;
}

const CharacterStats: React.FC<CharacterStatsProps> = ({ character, onUpdate }) => {
  const [showDerivedDetails, setShowDerivedDetails] = useState(false);

  const stats = character.stats || {};
  const abilities = character.abilities || [];
  const resources = character.resource_points || {};
  const inventory = character.inventory || [];

  const derived = deriveCharacterStats(character, inventory);
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());
  const [expandedAbilities, setExpandedAbilities] = useState<Set<string>>(new Set());

  const toggleResource = (key: string) => {
    const next = new Set(expandedResources);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedResources(next);
  };

  const toggleAbility = (key: string) => {
    const next = new Set(expandedAbilities);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedAbilities(next);
  };

  const mapResource = (key: string, value: any) => {
    const formatBool = (v: boolean) => (v ? 'Да' : 'Нет');
    const dictionary: Record<
      string,
      { name: string; description: string; valueText: string }
    > = {
      foresight_uses_per_scene: {
        name: 'Передчуття (заряди)',
        description: 'Короткочасне бачення майбутнього.',
        valueText: `${value} раз за сцену`,
      },
      mind_reading_uses_per_scene: {
        name: 'Читання думок (заряди)',
        description: 'Здатність чути поверхневі думки.',
        valueText: `${value} раз за сцену`,
      },
      prediction_uses_per_scene: {
        name: 'Крок наперед',
        description: 'Аналітичне передбачення дій на кілька секунд уперед.',
        valueText: `${value} раз за сцену`,
      },
      verbal_burst_uses_per_scene: {
        name: 'Вербальный нокаут',
        description: 'Фрази з мемів/пісень, що збивають ворога з пантелику.',
        valueText: `${value} раз за сцену`,
      },
      photon_burst_uses_per_scene: {
        name: 'Фотонний викид',
        description: 'Короткий енергетичний імпульс з очей.',
        valueText: `${value} раз за сцену`,
      },
      berserk_state_active: {
        name: 'Берсерк активен',
        description: 'Підсилений стан: більше сили, менше контролю.',
        valueText: formatBool(!!value),
      },
      psy_impulse_uses_per_scene: {
        name: 'Психо-імпульс',
        description: 'Емоційний сплеск, що впливає на простір/предмети.',
        valueText: `${value} раз за сцену`,
      },
      emotion_reading_passive: {
        name: 'Чтение эмоций (пассивно)',
        description: 'Відчуває брехню, страх чи агресію поруч.',
        valueText: formatBool(!!value),
      },
      emotion_shift_uses_per_scene: {
        name: 'Перемикач голів',
        description: 'Керує настроєм/рішеннями цілі коротким імпульсом.',
        valueText: `${value} раз за сцену`,
      },
      defensive_impulse_uses_per_scene: {
        name: 'Імпульс захисту',
        description: 'Змушує супротивника помилитися або вагатися.',
        valueText: `${value} раз за сцену`,
      },
    };

    if (dictionary[key]) {
      return dictionary[key];
    }

    const prettyName = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return {
      name: prettyName,
      description: 'Дополнительный ресурс',
      valueText: typeof value === 'boolean' ? formatBool(value) : `${value}`,
    };
  };

  const abilityDescription = (ability: string) => ability;

  return (
    <div className="character-stats">
      <div className="stats-card">
        <h2 className="stats-title">Характеристики</h2>

        <div className="hp-section">
          <div className="hp-bar-container">
            <div className="hp-bar-label">
              <div>HP</div>
              <div className="hp-values">
                {character.hp_current} / {derived.hp_max_total}
                {derived.hp_max_total !== character.hp_max && (
                  <span className="hp-bonus"> (+{derived.hp_max_total - character.hp_max})</span>
                )}
              </div>
            </div>
            <div className="hp-bar">
              <div
                className="hp-bar-fill"
                style={{
                  width: `${Math.min((character.hp_current / derived.hp_max_total) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="damage-section">
          <div className="stat-item">
            <div className="stat-label">Урон</div>
            <div className="stat-value">{derived.damage_total}</div>
            {derived.damage_total !== character.damage_base && (
              <div className="stat-breakdown">
                ({character.damage_base} + {derived.damage_total - character.damage_base})
              </div>
            )}
          </div>
          <div className="stat-item">
            <div className="stat-label">Защита</div>
            <div className="stat-value">{derived.defense_total}</div>
          </div>
        </div>

        {Object.keys(stats).length > 0 && (
          <>
            <div className="stats-header">
              <h3 className="section-title">Характеристики</h3>
              <button
                className="toggle-details-btn"
                onClick={() => setShowDerivedDetails(!showDerivedDetails)}
              >
                {showDerivedDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {showDerivedDetails ? 'Скрыть детали' : 'Показать детали'}
              </button>
            </div>
            <div className="stats-grid">
              {Object.entries(stats).map(([key, value]) => {
                const derivedValue = (derived.stats_total as any)[key] || (value as number);
                const bonus = derivedValue - (value as number);

                return (
                  <div key={key} className="stat-item">
                    <div className="stat-label">{key.toUpperCase()}</div>
                    <div className="stat-value">{derivedValue}</div>
                    {showDerivedDetails && bonus !== 0 && (
                      <div className="stat-breakdown">
                        {`(${value} + ${bonus})`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {Object.keys(resources).length > 0 && (
          <div className="resources-section">
            <h3 className="section-title">Ресурсы / Заряды</h3>
            <div className="resources-list">
              {Object.entries(resources).map(([key, value]) => {
                const { name, valueText, description } = mapResource(key, value);
                const expanded = expandedResources.has(key);
                return (
                  <div
                    key={key}
                    className={`resource-item clickable ${expanded ? 'expanded' : ''}`}
                    onClick={() => toggleResource(key)}
                  >
                    <div className="resource-row">
                      <span className="resource-name">{name}</span>
                      <span className="resource-value">{valueText}</span>
                    </div>
                    {expanded && description && (
                      <p className="resource-description">{description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {abilities.length > 0 && (
          <div className="abilities-section">
            <h3 className="section-title">Способности</h3>
            <ul className="abilities-list">
              {abilities.map((ability: string, index: number) => (
                <li
                  key={index}
                  className={`ability-item ${expandedAbilities.has(ability) ? 'expanded' : ''}`}
                  onClick={() => toggleAbility(ability)}
                >
                  <div className="ability-name">{ability}</div>
                  {expandedAbilities.has(ability) && (
                    <div className="ability-description">
                      {abilityDescription(ability)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterStats;

