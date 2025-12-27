import { InventoryItem, ItemModifiers, Durability } from '../types/Inventory';

const defaultModifiers = (): ItemModifiers => ({
  damage_bonus: 0,
  defense_bonus: 0,
  hp_bonus: 0,
  stat_bonus: { str: 0, dex: 0, int: 0, wis: 0, cha: 0, con: 0 }
});

const defaultDurability = (): Durability => ({
  current: 0,
  max: 0
});

export const migrateInventoryItem = (item: any): InventoryItem => {
  return {
    name: item.name || '',
    short_description: item.short_description || '',
    details: item.details || '',
    use_effect: item.use_effect || '',
    use_description: item.use_description || '',
    
    item_type: item.item_type || 'tool',
    equip_slot: item.equip_slot || 'none',
    equipped: item.equipped || false,
    
    modifiers: item.modifiers || defaultModifiers(),
    durability: item.durability || defaultDurability(),
    
    vehicle: item.vehicle || undefined
  };
};

export const migrateCharacterInventory = (inventory: any[]): InventoryItem[] => {
  if (!Array.isArray(inventory)) return [];
  return inventory.map(migrateInventoryItem);
};


