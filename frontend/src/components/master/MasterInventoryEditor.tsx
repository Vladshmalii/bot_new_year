import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { InventoryItem, ItemType, EquipSlot } from '../../types/Inventory';
import { api } from '../../services/api';

interface MasterInventoryEditorProps {
  character: any;
  onUpdate: () => void;
}

const MasterInventoryEditor: React.FC<MasterInventoryEditorProps> = ({ character, onUpdate }) => {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const inventory: InventoryItem[] = character.inventory || [];

  const defaultItem = (): InventoryItem => ({
    name: '',
    short_description: '',
    details: '',
    use_effect: '',
    use_description: '',
    item_type: 'tool',
    equip_slot: 'none',
    equipped: false,
    modifiers: {
      damage_bonus: 0,
      defense_bonus: 0,
      hp_bonus: 0,
      stat_bonus: { str: 0, dex: 0, int: 0, wis: 0, cha: 0, con: 0 }
    },
    durability: { current: 0, max: 0 }
  });

  const handleSaveItem = async (item: InventoryItem) => {
    try {
      // Find and update item in inventory
      const updatedInventory = [...inventory];
      const existingIndex = updatedInventory.findIndex(i => i.name === item.name);
      
      if (existingIndex >= 0) {
        updatedInventory[existingIndex] = item;
      } else {
        updatedInventory.push(item);
      }

      await api.put(`/character/${character.id}`, {
        inventory: updatedInventory
      });

      setEditingItem(null);
      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Ошибка при сохранении предмета');
    }
  };

  const handleDeleteItem = async (itemName: string) => {
    if (!window.confirm(`Удалить предмет "${itemName}"?`)) return;

    try {
      const updatedInventory = inventory.filter(i => i.name !== itemName);
      await api.put(`/character/${character.id}`, {
        inventory: updatedInventory
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Ошибка при удалении предмета');
    }
  };

  const ItemForm: React.FC<{ item: InventoryItem; onSave: (item: InventoryItem) => void; onCancel: () => void }> = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState<InventoryItem>(item);

    const updateField = (path: string[], value: any) => {
      const updated = { ...formData };
      let current: any = updated;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      setFormData(updated);
    };

    return (
      <div className="master-item-form">
        <h3 className="form-title">{item.name ? `Редактировать: ${item.name}` : 'Новый предмет'}</h3>

        <div className="form-group">
          <label>Название:</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => updateField(['name'], e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Краткое описание:</label>
          <input
            type="text"
            value={formData.short_description}
            onChange={e => updateField(['short_description'], e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Детали:</label>
          <textarea
            value={formData.details}
            onChange={e => updateField(['details'], e.target.value)}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Тип:</label>
            <select
              value={formData.item_type}
              onChange={e => updateField(['item_type'], e.target.value as ItemType)}
              className="form-select"
            >
              <option value="tool">Инструмент</option>
              <option value="weapon">Оружие</option>
              <option value="armor">Броня</option>
              <option value="consumable">Расходник</option>
              <option value="vehicle">Транспорт</option>
              <option value="quest">Квестовый</option>
            </select>
          </div>

          <div className="form-group">
            <label>Слот экипировки:</label>
            <select
              value={formData.equip_slot}
              onChange={e => updateField(['equip_slot'], e.target.value as EquipSlot)}
              className="form-select"
            >
              <option value="none">Нет</option>
              <option value="hand">Рука</option>
              <option value="offhand">Вторая рука</option>
              <option value="body">Тело</option>
              <option value="head">Голова</option>
              <option value="accessory">Аксессуар</option>
              <option value="vehicle">Транспорт</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h4>Модификаторы:</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Урон:</label>
              <input
                type="number"
                value={formData.modifiers.damage_bonus}
                onChange={e => updateField(['modifiers', 'damage_bonus'], Number(e.target.value))}
                className="form-input-small"
              />
            </div>
            <div className="form-group">
              <label>Защита:</label>
              <input
                type="number"
                value={formData.modifiers.defense_bonus}
                onChange={e => updateField(['modifiers', 'defense_bonus'], Number(e.target.value))}
                className="form-input-small"
              />
            </div>
            <div className="form-group">
              <label>HP:</label>
              <input
                type="number"
                value={formData.modifiers.hp_bonus}
                onChange={e => updateField(['modifiers', 'hp_bonus'], Number(e.target.value))}
                className="form-input-small"
              />
            </div>
          </div>
          <div className="form-row">
            {['str', 'dex', 'int', 'wis', 'cha', 'con'].map(stat => (
              <div key={stat} className="form-group">
                <label>{stat.toUpperCase()}:</label>
                <input
                  type="number"
                  value={(formData.modifiers.stat_bonus as any)[stat]}
                  onChange={e => updateField(['modifiers', 'stat_bonus', stat], Number(e.target.value))}
                  className="form-input-small"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h4>Прочность:</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Текущая:</label>
              <input
                type="number"
                value={formData.durability.current}
                onChange={e => updateField(['durability', 'current'], Number(e.target.value))}
                className="form-input-small"
              />
            </div>
            <div className="form-group">
              <label>Максимум (0 = неразрушимый):</label>
              <input
                type="number"
                value={formData.durability.max}
                onChange={e => updateField(['durability', 'max'], Number(e.target.value))}
                className="form-input-small"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Эффект использования (формат: TYPE;param=value):</label>
          <input
            type="text"
            value={formData.use_effect}
            onChange={e => updateField(['use_effect'], e.target.value)}
            className="form-input"
            placeholder="ADVANTAGE_NEXT_ROLL или REVEAL_CLUE"
          />
        </div>

        <div className="form-group">
          <label>Описание использования:</label>
          <textarea
            value={formData.use_description}
            onChange={e => updateField(['use_description'], e.target.value)}
            className="form-textarea"
            rows={2}
          />
        </div>

        {formData.item_type === 'vehicle' && (
          <div className="form-section">
            <h4>Параметры транспорта:</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Топливо (текущее):</label>
                <input
                  type="number"
                  value={formData.vehicle?.fuel_current || 0}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.fuel_current = Number(e.target.value);
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-input-small"
                />
              </div>
              <div className="form-group">
                <label>Топливо (макс):</label>
                <input
                  type="number"
                  value={formData.vehicle?.fuel_max || 100}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.fuel_max = Number(e.target.value);
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-input-small"
                />
              </div>
              <div className="form-group">
                <label>Режим скорости:</label>
                <select
                  value={formData.vehicle?.speed_mode || 'normal'}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.speed_mode = e.target.value as 'normal' | 'fast';
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-select"
                >
                  <option value="normal">Обычный</option>
                  <option value="fast">Быстрый</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Бонус скорости:</label>
                <input
                  type="number"
                  value={formData.vehicle?.speed_bonus || 0}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.speed_bonus = Number(e.target.value);
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-input-small"
                />
              </div>
              <div className="form-group">
                <label>Мест:</label>
                <input
                  type="number"
                  value={formData.vehicle?.seats || 4}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.seats = Number(e.target.value);
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-input-small"
                />
              </div>
              <div className="form-group">
                <label>Радиус привлечения (м):</label>
                <input
                  type="number"
                  value={formData.vehicle?.taunt_radius || 50}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.taunt_radius = Number(e.target.value);
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-input-small"
                />
              </div>
              <div className="form-group">
                <label>Уровень шума:</label>
                <input
                  type="number"
                  value={formData.vehicle?.noise_level || 5}
                  onChange={e => {
                    const vehicle = formData.vehicle || {
                      fuel_current: 0, fuel_max: 100, speed_mode: 'normal' as const,
                      speed_bonus: 0, seats: 4, taunt_radius: 50, noise_level: 5
                    };
                    vehicle.noise_level = Number(e.target.value);
                    updateField(['vehicle'], vehicle);
                  }}
                  className="form-input-small"
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button className="form-btn save-btn" onClick={() => onSave(formData)}>
            <Save size={16} /> Сохранить
          </button>
          <button className="form-btn cancel-btn" onClick={onCancel}>
            <X size={16} /> Отмена
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="master-inventory-editor">
      <div className="editor-header">
        <h3>Инвентарь: {character.name}</h3>
        <button className="add-item-btn" onClick={() => setShowAddForm(true)}>
          <Plus size={18} /> Добавить предмет
        </button>
      </div>

      {showAddForm && (
        <div className="form-overlay">
          <ItemForm 
            item={defaultItem()} 
            onSave={handleSaveItem} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}

      {editingItem && (
        <div className="form-overlay">
          <ItemForm 
            item={editingItem} 
            onSave={handleSaveItem} 
            onCancel={() => setEditingItem(null)} 
          />
        </div>
      )}

      <div className="inventory-table">
        {inventory.length === 0 ? (
          <div className="empty-message">Инвентарь пуст</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Слот</th>
                <th>Экипировано</th>
                <th>Бонусы</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => (
                <tr key={`${item.name}-${index}`}>
                  <td>{item.name}</td>
                  <td>{item.item_type}</td>
                  <td>{item.equip_slot}</td>
                  <td>{item.equipped ? 'Да' : 'Нет'}</td>
                  <td>
                    {item.modifiers.damage_bonus !== 0 && `Урон +${item.modifiers.damage_bonus} `}
                    {item.modifiers.defense_bonus !== 0 && `Защита +${item.modifiers.defense_bonus} `}
                    {item.modifiers.hp_bonus !== 0 && `HP +${item.modifiers.hp_bonus}`}
                  </td>
                  <td>
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => setEditingItem(item)}
                      title="Редактировать"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteItem(item.name)}
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MasterInventoryEditor;

