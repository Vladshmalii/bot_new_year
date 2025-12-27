import React, { useState } from 'react';
import { Package, Sword, Shield, Pill, Car, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { InventoryItem, ItemType } from '../../types/Inventory';
import ItemDetailsModal from './ItemDetailsModal';

interface InventoryListProps {
  items: InventoryItem[];
  characterId: number;
  onItemAction: (action: string, itemName: string) => Promise<void>;
}

type FilterType = 'all' | ItemType;

const InventoryList: React.FC<InventoryListProps> = ({ items, characterId, onItemAction }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const getItemIcon = (itemType: ItemType) => {
    switch (itemType) {
      case 'weapon': return <Sword size={18} />;
      case 'armor': return <Shield size={18} />;
      case 'consumable': return <Pill size={18} />;
      case 'vehicle': return <Car size={18} />;
      case 'quest': return <FileText size={18} />;
      default: return <Package size={18} />;
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.item_type === filter);

  const toggleExpand = (itemName: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="inventory-list-container">
      <h2 className="inventory-title">Инвентарь</h2>

      <div className="inventory-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({items.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'weapon' ? 'active' : ''}`}
          onClick={() => setFilter('weapon')}
        >
          <Sword size={16} /> Оружие
        </button>
        <button 
          className={`filter-btn ${filter === 'armor' ? 'active' : ''}`}
          onClick={() => setFilter('armor')}
        >
          <Shield size={16} /> Броня
        </button>
        <button 
          className={`filter-btn ${filter === 'tool' ? 'active' : ''}`}
          onClick={() => setFilter('tool')}
        >
          <Package size={16} /> Инструменты
        </button>
        <button 
          className={`filter-btn ${filter === 'consumable' ? 'active' : ''}`}
          onClick={() => setFilter('consumable')}
        >
          <Pill size={16} /> Расходники
        </button>
        <button 
          className={`filter-btn ${filter === 'vehicle' ? 'active' : ''}`}
          onClick={() => setFilter('vehicle')}
        >
          <Car size={16} /> Транспорт
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="inventory-empty">
          <p>Нет предметов</p>
        </div>
      ) : (
        <div className="inventory-list">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedItems.has(item.name);
            const canEquip = item.equip_slot !== 'none';
            const canUse = item.use_effect && item.use_effect.trim() !== '';

            return (
              <div
                key={`${item.name}-${index}`}
                className={`inventory-item-card ${isExpanded ? 'expanded' : ''}`}
              >
                <div className="item-header" onClick={() => toggleExpand(item.name)}>
                  <div className="item-title-row">
                    <span className="item-type-icon">{getItemIcon(item.item_type)}</span>
                    <h3 className="item-name">{item.name}</h3>
                    {item.equipped && <span className="equipped-badge">Экипировано</span>}
                  </div>
                  <button className="expand-icon">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                <p className="item-short-desc">{item.short_description}</p>

                {isExpanded && (
                  <div className="item-details-expanded">
                    <p className="item-details-text">{item.details}</p>

                    {(item.modifiers.damage_bonus !== 0 || 
                      item.modifiers.defense_bonus !== 0 || 
                      item.modifiers.hp_bonus !== 0) && (
                      <div className="item-bonuses">
                        <h4>Бонусы:</h4>
                        {item.modifiers.damage_bonus !== 0 && (
                          <div className="bonus-item">Урон: +{item.modifiers.damage_bonus}</div>
                        )}
                        {item.modifiers.defense_bonus !== 0 && (
                          <div className="bonus-item">Защита: +{item.modifiers.defense_bonus}</div>
                        )}
                        {item.modifiers.hp_bonus !== 0 && (
                          <div className="bonus-item">HP: +{item.modifiers.hp_bonus}</div>
                        )}
                      </div>
                    )}

                    {item.item_type === 'vehicle' && item.vehicle && (
                      <div className="vehicle-info-compact">
                        <h4>Транспорт:</h4>
                        <div className="vehicle-stats">
                          <div>Топливо: {item.vehicle.fuel_current}/{item.vehicle.fuel_max}</div>
                          <div>Режим: {item.vehicle.speed_mode === 'fast' ? 'Быстрый' : 'Обычный'}</div>
                          <div>Мест: {item.vehicle.seats}</div>
                        </div>
                      </div>
                    )}

                    <div className="item-actions">
                      {canEquip && (
                        <button
                          className="item-action-btn equip-btn"
                          onClick={() => onItemAction('equip', item.name)}
                        >
                          {item.equipped ? 'Снять' : 'Экипировать'}
                        </button>
                      )}
                      {canUse && (
                        <button
                          className="item-action-btn use-btn"
                          onClick={() => setSelectedItem(item)}
                        >
                          Использовать
                        </button>
                      )}
                      <button
                        className="item-action-btn details-btn"
                        onClick={() => setSelectedItem(item)}
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          characterId={characterId}
          onClose={() => setSelectedItem(null)}
          onUse={(itemName, effectType, params) => {
            onItemAction('use', itemName);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

export default InventoryList;


