export type ItemType = "tool" | "weapon" | "armor" | "consumable" | "vehicle" | "quest";
export type EquipSlot = "none" | "hand" | "offhand" | "body" | "head" | "accessory" | "vehicle";

export type StatBlock = {
  str: number;
  dex: number;
  int: number;
  wis: number;
  cha: number;
  con: number;
};

export type ItemModifiers = {
  damage_bonus: number;
  defense_bonus: number;
  hp_bonus: number;
  stat_bonus: StatBlock;
};

export type Durability = {
  current: number;
  max: number; // max=0 => unbreakable
};

export type VehicleState = {
  fuel_current: number;
  fuel_max: number;
  speed_mode: "normal" | "fast";
  speed_bonus: number;
  seats: number;
  taunt_radius: number;
  noise_level: number;
};

export type InventoryItem = {
  name: string;
  short_description: string;
  details: string;
  use_effect: string;
  use_description: string;
  
  item_type: ItemType;
  equip_slot: EquipSlot;
  equipped: boolean;
  
  modifiers: ItemModifiers;
  durability: Durability;
  
  vehicle?: VehicleState;
};

export type ItemUseLog = {
  id: number;
  timestamp: number;
  character_id: number;
  character_name: string;
  item_name: string;
  effect_type: string;
  effect_params: Record<string, any>;
  target_id?: number;
};

export type StatusEffect = {
  id: string;
  name: string;
  description: string;
  duration: "scene" | "permanent" | "until_cleared";
  effect_type: string;
  params: Record<string, any>;
};

export type DerivedStats = {
  damage_total: number;
  defense_total: number;
  hp_max_total: number;
  stats_total: StatBlock;
};

export type VehicleEvent = {
  id: number;
  timestamp: number;
  character_id: number;
  character_name: string;
  vehicle_name: string;
  event_type: "drive" | "taunt" | "refuel" | "repair";
  fuel_used?: number;
  distance?: number;
  result?: string;
};
