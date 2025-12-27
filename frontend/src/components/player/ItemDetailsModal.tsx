import React from 'react';
import { X, Zap } from 'lucide-react';
import { InventoryItem } from '../../types/Inventory';
import { parseUseEffect, getEffectDescription } from '../../utils/parseEffect';

interface ItemDetailsModalProps {
  item: InventoryItem;
  characterId: number;
  onClose: () => void;
  onUse: (itemName: string, effectType: string, params: Record<string, string>) => void;
}

const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ item, characterId, onClose, onUse }) => {
  const parsedEffect = item.use_effect ? parseUseEffect(item.use_effect) : null;

  const handleUse = () => {
    if (parsedEffect) {
      onUse(item.name, parsedEffect.type, parsedEffect.params);
    }
  };

  return (
    <div className="item-modal" onClick={onClose}>
      <div className="item-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="item-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="item-modal-name">{item.name}</h2>
        
        <div className="item-modal-type">
          <span className="item-type-badge">{item.item_type}</span>
          {item.equip_slot !== 'none' && (
            <span className="item-slot-badge">{item.equip_slot}</span>
          )}
        </div>

        <p className="item-modal-description">{item.details}</p>

        {/* Bonuses Section */}
        {(item.modifiers.damage_bonus !== 0 || 
          item.modifiers.defense_bonus !== 0 || 
          item.modifiers.hp_bonus !== 0 ||
          Object.values(item.modifiers.stat_bonus).some(v => v !== 0)) && (
          <div className="item-modal-bonuses">
            <h3>Пассивные бонусы при экипировке:</h3>
            <ul>
              {item.modifiers.damage_bonus !== 0 && (
                <li>Урон: <span className="bonus-value">+{item.modifiers.damage_bonus}</span></li>
              )}
              {item.modifiers.defense_bonus !== 0 && (
                <li>Защита: <span className="bonus-value">+{item.modifiers.defense_bonus}</span></li>
              )}
              {item.modifiers.hp_bonus !== 0 && (
                <li>HP: <span className="bonus-value">+{item.modifiers.hp_bonus}</span></li>
              )}
              {item.modifiers.stat_bonus.str !== 0 && (
                <li>STR: <span className="bonus-value">+{item.modifiers.stat_bonus.str}</span></li>
              )}
              {item.modifiers.stat_bonus.dex !== 0 && (
                <li>DEX: <span className="bonus-value">+{item.modifiers.stat_bonus.dex}</span></li>
              )}
              {item.modifiers.stat_bonus.int !== 0 && (
                <li>INT: <span className="bonus-value">+{item.modifiers.stat_bonus.int}</span></li>
              )}
              {item.modifiers.stat_bonus.wis !== 0 && (
                <li>WIS: <span className="bonus-value">+{item.modifiers.stat_bonus.wis}</span></li>
              )}
              {item.modifiers.stat_bonus.cha !== 0 && (
                <li>CHA: <span className="bonus-value">+{item.modifiers.stat_bonus.cha}</span></li>
              )}
              {item.modifiers.stat_bonus.con !== 0 && (
                <li>CON: <span className="bonus-value">+{item.modifiers.stat_bonus.con}</span></li>
              )}
            </ul>
          </div>
        )}

        {/* Durability */}
        {item.durability.max > 0 && (
          <div className="item-modal-durability">
            <h4>Прочность:</h4>
            <div className="durability-bar">
              <div 
                className="durability-fill" 
                style={{ width: `${(item.durability.current / item.durability.max) * 100}%` }}
              />
            </div>
            <span>{item.durability.current} / {item.durability.max}</span>
          </div>
        )}

        {/* Vehicle Info */}
        {item.item_type === 'vehicle' && item.vehicle && (
          <div className="item-modal-vehicle">
            <h3>Характеристики транспорта:</h3>
            <ul>
              <li>Топливо: {item.vehicle.fuel_current} / {item.vehicle.fuel_max}</li>
              <li>Режим скорости: {item.vehicle.speed_mode === 'fast' ? 'Быстрый' : 'Обычный'}</li>
              <li>Бонус скорости: +{item.vehicle.speed_bonus}</li>
              <li>Мест: {item.vehicle.seats}</li>
              <li>Радиус привлечения: {item.vehicle.taunt_radius}м</li>
              <li>Уровень шума: {item.vehicle.noise_level}</li>
            </ul>
          </div>
        )}

        {/* Use Effect */}
        {item.use_effect && item.use_effect.trim() !== '' && (
          <div className="item-modal-use-section">
            <h3><Zap size={18} /> Активное использование:</h3>
            {item.use_description && (
              <p className="use-description">{item.use_description}</p>
            )}
            {parsedEffect && (
              <div className="effect-info">
                <span className="effect-type">{parsedEffect.type}</span>
                <span className="effect-desc">{getEffectDescription(parsedEffect.type)}</span>
              </div>
            )}
            <button className="use-item-btn" onClick={handleUse}>
              <Zap size={18} /> Использовать
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailsModal;


