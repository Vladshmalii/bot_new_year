import { migrateCharacterInventory } from './inventoryMigration';

export const CURRENT_SCHEMA_VERSION = 2;

export interface GameData {
  schemaVersion?: number;
  players?: any[];
  characters: any[];
  locations: any[];
  mobs: any[];
  items: any[];
  character_items: any[];
  notes: any[];
  dice_rolls: any[];
  item_use_logs?: any[];
  vehicle_events?: any[];
  status_effects?: Record<number, any[]>; // character_id -> status effects
}

export const migrateGameData = (data: any): GameData => {
  const version = data.schemaVersion || 1;
  
  let migrated = { ...data };
  
  // Migrate from v1 to v2 (inventory system)
  if (version < 2) {
    migrated = migrateV1ToV2(migrated);
  }
  
  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;
  return migrated;
};

const migrateV1ToV2 = (data: any): GameData => {
  const migrated: GameData = {
    ...data,
    item_use_logs: data.item_use_logs || [],
    vehicle_events: data.vehicle_events || [],
    status_effects: data.status_effects || {}
  };
  
  // Migrate character inventories
  if (Array.isArray(migrated.characters)) {
    migrated.characters = migrated.characters.map(char => ({
      ...char,
      inventory: migrateCharacterInventory(char.inventory || [])
    }));
  }
  
  return migrated;
};
