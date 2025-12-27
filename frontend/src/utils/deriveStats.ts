import { InventoryItem, DerivedStats, StatBlock } from '../types/Inventory';

export const computeDerivedStats = (
  character: any,
  inventory: InventoryItem[]
): DerivedStats => {
  const equippedItems = inventory.filter(item => item.equipped);
  
  let damage_bonus = 0;
  let defense_bonus = 0;
  let hp_bonus = 0;
  const stat_bonus: StatBlock = { str: 0, dex: 0, int: 0, wis: 0, cha: 0, con: 0 };
  
  equippedItems.forEach(item => {
    damage_bonus += item.modifiers.damage_bonus;
    defense_bonus += item.modifiers.defense_bonus;
    hp_bonus += item.modifiers.hp_bonus;
    
    stat_bonus.str += item.modifiers.stat_bonus.str;
    stat_bonus.dex += item.modifiers.stat_bonus.dex;
    stat_bonus.int += item.modifiers.stat_bonus.int;
    stat_bonus.wis += item.modifiers.stat_bonus.wis;
    stat_bonus.cha += item.modifiers.stat_bonus.cha;
    stat_bonus.con += item.modifiers.stat_bonus.con;
  });
  
  const base_stats = character.stats || { str: 0, dex: 0, int: 0, wis: 0, cha: 0, con: 0 };
  const stats_total: StatBlock = {
    str: base_stats.str + stat_bonus.str,
    dex: base_stats.dex + stat_bonus.dex,
    int: base_stats.int + stat_bonus.int,
    wis: base_stats.wis + stat_bonus.wis,
    cha: base_stats.cha + stat_bonus.cha,
    con: base_stats.con + stat_bonus.con
  };
  
  return {
    damage_total: (character.damage_base || 0) + damage_bonus,
    defense_total: defense_bonus,
    hp_max_total: (character.hp_max || 0) + hp_bonus,
    stats_total
  };
};

export const clampHPIfNeeded = (character: any, hp_max_total: number): number => {
  const current = character.hp_current || 0;
  return current > hp_max_total ? hp_max_total : current;
};

export const canEquip = (item: any): boolean => {
  if (!item) return false;
  const slot = item.equip_slot || 'none';
  return slot !== 'none';
};

// Alias for compatibility
export const deriveCharacterStats = computeDerivedStats;
