import React, { useState } from 'react';
import { Sword, Shield, Wrench, Apple, Car, Scroll, Package } from 'lucide-react';
import { ItemType } from '../../types/Inventory';
import { api } from '../../services/api';
import { parseUseEffect, getEffectDescription } from '../../utils/parseEffect';
import { canEquip } from '../../utils/deriveStats';

interface InventoryProps {
  items: any[];
  character?: any;
  onUpdate?: () => void;
}

type FilterType = 'all' | ItemType;

const Inventory: React.FC<InventoryProps> = ({ items, character, onUpdate }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [useResult, setUseResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const inventoryItems = character?.inventory || items || [];

  const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'weapon': return <Sword size={16} />;
      case 'armor': return <Shield size={16} />;
      case 'tool': return <Wrench size={16} />;
      case 'consumable': return <Apple size={16} />;
      case 'vehicle': return <Car size={16} />;
      case 'quest': return <Scroll size={16} />;
      default: return <Package size={16} />;
    }
  };

  const filteredItems = filter === 'all'
    ? inventoryItems
    : inventoryItems.filter((item: any) => (item.item_type || 'tool') === filter);

  const handleEquipToggle = async (item: any) => {
    if (!character) return;

    setIsProcessing(true);
    try {
      await api.post('/character/item/equip', {
        character_id: character.id,
        item_name: item.name
      });

      setUseResult(`${item.equipped ? 'Снято' : 'Экипировано'}: ${item.name}`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to toggle equip:', err);
      setUseResult('Ошибка при экипировке');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseItem = async (item: any) => {
    if (!character) return;

    const parsed = parseUseEffect(item.use_effect);
    if (!parsed) {
      setUseResult(`Использовано: ${item.name}`);
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/character/item/use', {
        character_id: character.id,
        item_name: item.name,
        effect_type: parsed.type,
        effect_params: parsed.params
      });

      setUseResult(`${item.name}: ${getEffectDescription(parsed.type)}`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to use item:', err);
      setUseResult('Ошибка при использовании');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVehicleAction = async (vehicle: any, action: string) => {
    if (!character) return;

    setIsProcessing(true);
    try {
      await api.post('/character/vehicle/action', {
        character_id: character.id,
        vehicle_name: vehicle.name,
        action
      });

      setUseResult(`${vehicle.name}: действие выполнено`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed vehicle action:', err);
      setUseResult('Ошибка действия с транспортом');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderModifiers = (item: any) => {
    if (!item.modifiers) return null;

    const mods = item.modifiers;
    const parts: string[] = [];

    if (mods.damage_bonus) parts.push(`Урон: +${mods.damage_bonus}`);
    if (mods.defense_bonus) parts.push(`Защита: +${mods.defense_bonus}`);
    if (mods.hp_bonus) parts.push(`HP: +${mods.hp_bonus}`);

    if (mods.stat_bonus) {
      Object.entries(mods.stat_bonus).forEach(([stat, value]) => {
        if (value) parts.push(`${stat.toUpperCase()}: +${value}`);
      });
    }

    if (parts.length === 0) return null;

    return (
      <div className="item-modifiers">
        <h4>Бонусы:</h4>
        <div className="modifiers-list">
          {parts.map((part, i) => (
            <span key={i} className="modifier-badge">{part}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderVehicleInfo = (vehicle: any) => {
    if (!vehicle.vehicle) return null;

    const v = vehicle.vehicle;
    const fuelPercent = (v.fuel_current / v.fuel_max) * 100;

    return (
      <div className="vehicle-info">
        <h4>Транспорт</h4>
        <div className="vehicle-stats">
          <div className="vehicle-fuel">
            <span>Топливо: {v.fuel_current} / {v.fuel_max}</span>
            <div className="fuel-bar">
              <div className="fuel-bar-fill" style={{ width: `${fuelPercent}%` }} />
            </div>
          </div>
          <div className="vehicle-details">
            <span>Режим: {v.speed_mode === 'fast' ? 'Быстрый' : 'Обычный'}</span>
            <span>Мест: {v.seats}</span>
            <span>Бонус скорости: +{v.speed_bonus}</span>
          </div>
        </div>
        <div className="vehicle-actions">
          <button
            onClick={() => handleVehicleAction(vehicle, 'drive')}
            disabled={v.fuel_current === 0 || isProcessing}
            className="vehicle-btn"
          >
            Ехать
          </button>
          <button
            onClick={() => handleVehicleAction(vehicle, 'speed_toggle')}
            disabled={isProcessing}
            className="vehicle-btn"
          >
            Переключить режим
          </button>
          <button
            onClick={() => handleVehicleAction(vehicle, 'taunt')}
            disabled={isProcessing}
            className="vehicle-btn"
          >
            Сигнал/шум
          </button>
        </div>
      </div>
    );
  };

  if (inventoryItems.length === 0) {
    return (
      <div className="inventory">
        <h2 className="inventory-title">Инвентарь</h2>
        <div className="inventory-empty">
          <p>Инвентарь пуст</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory">
      <h2 className="inventory-title">Инвентарь</h2>

      <div className="inventory-filters">
        {(['all', 'weapon', 'armor', 'tool', 'consumable', 'vehicle', 'quest'] as const).map(f => {
          const labelMap: Record<string, string> = {
            all: 'Все',
            weapon: 'Оружие',
            armor: 'Броня',
            tool: 'Инструменты',
            consumable: 'Еда/Зелья',
            vehicle: 'Транспорт',
            quest: 'Квесты'
          };
          return (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {labelMap[f] || f}
            </button>
          );
        })}
      </div>

      <div className="inventory-list">
        {filteredItems.map((item: any, index: number) => {
          const itemKey = item.name || `item-${index}`;
          const itemType = item.item_type || 'tool';

          return (
            <div
              key={itemKey}
              className={`inventory-item-card ${item.equipped ? 'equipped' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="item-header">
                <div className="item-title-row">
                  <span className="item-type-icon">{getItemTypeIcon(itemType)}</span>
                  <h3 className="item-name">{item.name}</h3>
                </div>
                {item.equipped && <span className="equipped-badge">Экипировано</span>}
              </div>
              <p className="item-short-desc">{item.short_description}</p>
              {item.equip_slot && item.equip_slot !== 'none' && (
                <span className="item-slot">Слот: {item.equip_slot}</span>
              )}
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className="item-modal" onClick={() => { setSelectedItem(null); setUseResult(null); }}>
          <div className="item-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="item-modal-close" onClick={() => { setSelectedItem(null); setUseResult(null); }}>
              ×
            </button>

            <div className="item-modal-header">
              <span className="item-type-icon-large">{getItemTypeIcon(selectedItem.item_type || 'tool')}</span>
              <h2 className="item-modal-name">{selectedItem.name}</h2>
            </div>

            {selectedItem.short_description && (
              <p className="item-modal-description">{selectedItem.short_description}</p>
            )}

            {selectedItem.details && (
              <div className="item-modal-details">
                <h4>Описание:</h4>
                <p>{selectedItem.details}</p>
              </div>
            )}

            {selectedItem.use_description && (
              <div className="item-modal-use-desc">
                <h4>Использование:</h4>
                <p>{selectedItem.use_description}</p>
              </div>
            )}

            {renderModifiers(selectedItem)}

            {selectedItem.durability && selectedItem.durability.max > 0 && (
              <div className="item-durability">
                <span>Прочность: {selectedItem.durability.current} / {selectedItem.durability.max}</span>
              </div>
            )}

            {selectedItem.item_type === 'vehicle' && renderVehicleInfo(selectedItem)}

            <div className="item-modal-buttons">
              {selectedItem.use_effect && (
                <button
                  className="use-button primary"
                  onClick={() => handleUseItem(selectedItem)}
                  disabled={isProcessing}
                >
                  Использовать
                </button>
              )}

              {canEquip(selectedItem) && (
                <button
                  className="use-button secondary"
                  onClick={() => handleEquipToggle(selectedItem)}
                  disabled={isProcessing}
                >
                  {selectedItem.equipped ? 'Снять' : 'Экипировать'}
                </button>
              )}

              <button className="use-button tertiary" onClick={() => { setSelectedItem(null); setUseResult(null); }}>
                Закрыть
              </button>
            </div>

            {useResult && (
              <div className="item-use-result">
                {useResult}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
