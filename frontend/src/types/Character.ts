export interface CharacterStats {
  str: number;
  dex: number;
  int: number;
  wis: number;
  cha: number;
  con: number;
}

export interface CharacterGoals {
  public: string;
  secret: string;
}

export interface InventoryItem {
  name: string;
  short_description: string;
  details: string;
}

export interface Character {
  id: number;
  name: string;
  age: number;
  description: string;
  backstory: string;
  hp_current: number;
  hp_max: number;
  damage_base: number;
  stats: CharacterStats;
  abilities: string[];
  role: string;
  goals: CharacterGoals;
  fears: string[];
  resource_points: Record<string, number>;
  inventory: InventoryItem[];
  notes_visible_to_player: any[];
  notes_hidden_from_player: any[];
  location_id: number;
}

