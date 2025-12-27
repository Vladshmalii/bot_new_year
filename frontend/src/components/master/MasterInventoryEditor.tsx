import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, Shield, Sword, Heart, Zap, Truck } from 'lucide-react';
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
      const updatedInventory = [...inventory];
      const existingIndex = updatedInventory.findIndex(i => i.name === item.name);

      if (existingIndex >= 0 && !showAddForm) {
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

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case 'weapon': return <Sword size={16} />;
      case 'armor': return <Shield size={16} />;
      case 'consumable': return <Heart size={16} />;
      case 'vehicle': return <Truck size={16} />;
      default: return <Package size={16} />;
    }
  };

  const ItemForm: React.FC<{ item: InventoryItem; isNew: boolean; onSave: (item: InventoryItem) => void; onCancel: () => void }> = ({ item, isNew, onSave, onCancel }) => {
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
      <div className="admin-modal-card">
        <div className="admin-modal-header">
          <h3>{isNew ? 'Новый предмет' : `Редактирование: ${item.name}`}</h3>
          <button onClick={onCancel} className="close-btn"><X size={20} /></button>
        </div>

        <div className="admin-form-scrollable">
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Название</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => updateField(['name'], e.target.value)}
                placeholder="Меч Ледяного Пламени"
              />
            </div>

            <div className="form-group span-2">
              <label>Описание (кратко)</label>
              <input
                type="text"
                value={formData.short_description}
                onChange={e => updateField(['short_description'], e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Тип</label>
              <select value={formData.item_type} onChange={e => updateField(['item_type'], e.target.value as ItemType)}>
                <option value="tool">Инструмент</option>
                <option value="weapon">Оружие</option>
                <option value="armor">Броня</option>
                <option value="consumable">Расходник</option>
                <option value="vehicle">Транспорт</option>
                <option value="quest">Квест</option>
              </select>
            </div>

            <div className="form-group">
              <label>Слот</label>
              <select value={formData.equip_slot} onChange={e => updateField(['equip_slot'], e.target.value as EquipSlot)}>
                <option value="none">Нет</option>
                <option value="hand">Рука</option>
                <option value="offhand">Вторая рука</option>
                <option value="body">Тело</option>
                <option value="head">Голова</option>
                <option value="accessory">Аксессуар</option>
                <option value="vehicle">Транспорт</option>
              </select>
            </div>

            <div className="form-section-title span-2">Бонусы и Модификаторы</div>

            <div className="form-group">
              <label><Sword size={12} /> Урон</label>
              <input type="number" value={formData.modifiers.damage_bonus} onChange={e => updateField(['modifiers', 'damage_bonus'], Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label><Shield size={12} /> Защита</label>
              <input type="number" value={formData.modifiers.defense_bonus} onChange={e => updateField(['modifiers', 'defense_bonus'], Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label><Heart size={12} /> HP</label>
              <input type="number" value={formData.modifiers.hp_bonus} onChange={e => updateField(['modifiers', 'hp_bonus'], Number(e.target.value))} />
            </div>

            <div className="form-section-title span-2">Характеристики</div>
            <div className="stats-mini-grid span-2">
              {['str', 'dex', 'int', 'wis', 'cha', 'con'].map(s => (
                <div key={s} className="form-group-mini">
                  <label>{s.toUpperCase()}</label>
                  <input type="number" value={(formData.modifiers.stat_bonus as any)[s]} onChange={e => updateField(['modifiers', 'stat_bonus', s], Number(e.target.value))} />
                </div>
              ))}
            </div>

            <div className="form-section-title span-2">Дополнительно</div>
            <div className="form-group span-2">
              <label>Логика использования (TYPE;param=val)</label>
              <input type="text" value={formData.use_effect} onChange={e => updateField(['use_effect'], e.target.value)} />
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn secondary" onClick={onCancel}>Отмена</button>
          <button className="admin-btn primary" onClick={() => onSave(formData)}>
            <Save size={18} /> Сохранить предмет
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="master-inventory-editor-new">
      <div className="editor-top-bar">
        <div className="editor-info">
          <h2>Инвентарь персонажа</h2>
          <p>{character.name} — {character.role || 'Без роли'}</p>
        </div>
        <button className="admin-btn success" onClick={() => setShowAddForm(true)}>
          <Plus size={18} /> Добавить новый предмет
        </button>
      </div>

      <div className="items-list-modern">
        {inventory.length === 0 ? (
          <div className="no-items">Инвентарь пуст</div>
        ) : (
          <div className="items-grid-admin">
            {inventory.map((item, index) => (
              <div key={`${item.name}-${index}`} className="admin-item-card">
                <div className="item-card-icon">
                  {getItemIcon(item.item_type)}
                </div>
                <div className="item-card-main">
                  <div className="item-card-name-row">
                    <h4>{item.name}</h4>
                    {item.equipped && <span className="equipped-badge">Экипировано</span>}
                  </div>
                  <p className="item-card-desc">{item.short_description || 'Нет описания'}</p>
                  <div className="item-card-meta">
                    <span className="type-badge">{item.item_type}</span>
                    <span className="slot-badge">{item.equip_slot !== 'none' ? item.equip_slot : 'Без слота'}</span>
                  </div>
                </div>
                <div className="item-card-actions">
                  <button className="icon-btn" onClick={() => setEditingItem(item)}><Edit size={16} /></button>
                  <button className="icon-btn danger" onClick={() => handleDeleteItem(item.name)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showAddForm || editingItem) && (
        <div className="admin-modal-overlay">
          <ItemForm
            item={editingItem || defaultItem()}
            isNew={!!showAddForm}
            onSave={handleSaveItem}
            onCancel={() => { setShowAddForm(false); setEditingItem(null); }}
          />
        </div>
      )}
    </div>
  );
};

export default MasterInventoryEditor;
