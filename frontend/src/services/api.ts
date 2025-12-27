// JSON-based API - работает без бэкенда
import { migrateGameData } from '../utils/migration';
import { ItemUseLog, VehicleEvent } from '../types/Inventory';

interface GameData {
  players?: any[];
  characters: any[];
  locations: any[];
  mobs: any[];
  items: any[];
  character_items: any[];
  notes: any[];
  dice_rolls: any[];
  item_use_logs?: ItemUseLog[];
  vehicle_events?: VehicleEvent[];
}

// Начальные данные
const defaultData: GameData = {
  players: [],
  characters: [
    {
      id: 1,
      name: "Гэндальф",
      age: 2019,
      description: "Могущественный маг и мудрый советник",
      backstory: "Один из Истари, посланный в Средиземье для помощи в борьбе с Тьмой",
      hp_current: 100,
      hp_max: 100,
      damage_base: 10,
      stats: {
        str: 12,
        dex: 14,
        int: 20,
        wis: 18,
        cha: 16,
        con: 15
      },
      abilities: [
        "Магические заклинания",
        "Свет посоха",
        "Мудрость веков"
      ],
      notes_visible_to_player: [],
      notes_hidden_from_player: [],
      location_id: 1
    }
  ],
  locations: [
    {
      id: 1,
      name: "Хоббитон",
      description: "Уютная деревня хоббитов",
      tags: ["деревня", "мирная"],
      is_active: true
    }
  ],
  mobs: [],
  items: [],
  character_items: [],
  notes: [],
  dice_rolls: [],
  item_use_logs: [],
  vehicle_events: []
};

// Загружаем данные из JSON или используем дефолтные
let gameData: GameData = defaultData;

// Слияние инвентаря: основа — JSON, локальные правки накрывают совпадающие предметы
const mergeInventory = (jsonInv: any[] = [], localInv: any[] = []) => {
  if (!Array.isArray(jsonInv) && !Array.isArray(localInv)) return [];
  const jsonList = Array.isArray(jsonInv) ? jsonInv : [];
  const localList = Array.isArray(localInv) ? localInv : [];
  const byKey = (item: any) => item?.id ?? item?.name ?? item;

  const mergedMap = new Map<string | number, any>();

  jsonList.forEach(item => {
    const key = byKey(item);
    mergedMap.set(key, { ...item });
  });

  localList.forEach(item => {
    const key = byKey(item);
    if (mergedMap.has(key)) {
      mergedMap.set(key, { ...mergedMap.get(key), ...item });
    } else {
      mergedMap.set(key, { ...item });
    }
  });

  return Array.from(mergedMap.values());
};

// Сохраняем в localStorage для персистентности
const STORAGE_KEY = 'dnd_game_data';

// Загружаем из localStorage если есть, иначе используем дефолтные данные
const loadData = (): GameData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return migrateGameData(parsed);
    }
  } catch (e) {
    console.error('Failed to load from localStorage', e);
  }
  return migrateGameData(defaultData);
};

// Получаем базовый URL для GitHub Pages
const getPublicUrl = () => {
  // process.env.PUBLIC_URL устанавливается автоматически на основе homepage в package.json
  // На GitHub Pages это будет '/bot_new_year', локально - пустая строка
  return process.env.PUBLIC_URL || '';
};

// Загружаем JSON из public/data.json если есть
const loadJsonData = async (): Promise<GameData | null> => {
  try {
    const publicUrl = getPublicUrl();
    const response = await fetch(`${publicUrl}/data.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('No data.json found, using default data');
  }
  return null;
};

// Сохраняем в localStorage
const saveData = (data: GameData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    gameData = data;
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// Функция для синхронизации данных с JSON
const syncWithJson = async () => {
  try {
    const rawJsonData = await loadJsonData();
    if (rawJsonData) {
      const jsonData = migrateGameData(rawJsonData);
      const stored = localStorage.getItem(STORAGE_KEY);
      const localData = stored ? migrateGameData(JSON.parse(stored)) : null;
      
      if (!localData) {
        // Первая загрузка - используем JSON полностью
        gameData = jsonData;
        saveData(gameData);
      } else {
        // Обновляем персонажей: берем структуру из JSON, но сохраняем изменения (HP и т.д.) из localStorage
        const updatedCharacters = (jsonData.characters || []).map((jsonChar: any) => {
          const localChar = (localData.characters || []).find((c: any) => c.id === jsonChar.id);
          if (localChar) {
            return {
              ...jsonChar, // Новая структура из JSON
              hp_current: localChar.hp_current,
              hp_max: localChar.hp_max !== jsonChar.hp_max ? localChar.hp_max : jsonChar.hp_max,
              inventory: mergeInventory(jsonChar.inventory, localChar.inventory),
            };
          }
          return jsonChar;
        });
        
        gameData = {
          ...localData,
          players: jsonData.players || localData.players || [],
          characters: updatedCharacters.length > 0 ? updatedCharacters : (jsonData.characters || localData.characters || []),
          locations: jsonData.locations || localData.locations || [],
          items: jsonData.items || localData.items || [],
          mobs: jsonData.mobs || localData.mobs || [],
        };
        saveData(gameData);
      }
    }
  } catch (e) {
    console.error('Failed to sync with JSON:', e);
  }
};

// Инициализация - загружаем из localStorage или дефолтные данные
gameData = loadData();

// Первая синхронизация при загрузке модуля (асинхронно)
syncWithJson().catch(err => console.error('Failed initial sync:', err));

// Генерируем ID
let nextId = Math.max(
  ...(gameData.players || []).map(p => p.id || 0),
  ...gameData.characters.map(c => c.id || 0),
  ...gameData.locations.map(l => l.id || 0),
  ...gameData.mobs.map(m => m.id || 0),
  ...gameData.items.map(i => i.id || 0),
  ...gameData.notes.map(n => n.id || 0),
  ...gameData.dice_rolls.map(d => d.id || 0),
  0
) + 1;

const getNextId = () => nextId++;

// Имитация axios API
export const api = {
  get: async (url: string): Promise<{ data: any }> => {
    // Синхронизируем с JSON перед каждым запросом
    await syncWithJson();
    
    // Небольшая задержка для имитации сети
    await new Promise(resolve => setTimeout(resolve, 100));

    if (url === '/auth/player') {
      throw new Error('Use POST for auth');
    }

    if (url === '/auth/master') {
      throw new Error('Use POST for auth');
    }

    // Character endpoints
    const characterMatch = url.match(/^\/character\/(\d+)$/);
    if (characterMatch) {
      const characterId = parseInt(characterMatch[1]);
      const character = gameData.characters.find(c => c.id === characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Локация из справочника для удобного отображения на клиенте
      const characterLocation = gameData.locations.find(l => l.id === character.location_id);
      const characterWithLocation = {
        ...character,
        location: characterLocation ? { ...characterLocation } : undefined,
        location_name: characterLocation?.name || undefined,
      };
      
      // Используем inventory из персонажа, если есть, иначе из character_items (обратная совместимость)
      let inventory = [];
      if (character.inventory && Array.isArray(character.inventory)) {
        inventory = character.inventory;
      } else {
        inventory = gameData.character_items
          .filter(ci => ci.character_id === characterId)
          .map(ci => {
            const item = gameData.items.find(i => i.id === ci.item_id);
            return { ...item, ...ci };
          });
      }

      const notes = gameData.notes.filter(n => n.character_id === characterId);

      return {
        data: {
          character: characterWithLocation,
          inventory,
          notes
        }
      };
    }

    // Master dashboard
    if (url === '/master/dashboard') {
      const characters = gameData.characters.map(char => {
        const location = gameData.locations.find(l => l.id === char.location_id);
        const lastRoll = gameData.dice_rolls
          .filter(r => r.character_id === char.id)
          .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
        
        return {
          ...char,
          location: location?.name || 'Неизвестно',
          last_roll: lastRoll
        };
      });

      return { data: { characters } };
    }

    // Master characters
    if (url === '/master/characters') {
      return { data: gameData.characters };
    }

    // Get players list
    if (url === '/players') {
      // Всегда загружаем актуальные данные
      const currentData = loadData();
      gameData = currentData;
      
      // Если нет игроков, пробуем загрузить из JSON
      if (!gameData.players || gameData.players.length === 0) {
        try {
          const publicUrl = getPublicUrl();
          const jsonResponse = await fetch(`${publicUrl}/data.json`);
          if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            if (jsonData.players && jsonData.players.length > 0) {
              gameData.players = jsonData.players;
              // Обновляем localStorage
              const updatedData = { ...gameData, players: jsonData.players };
              saveData(updatedData);
              return { data: jsonData.players };
            }
          }
        } catch (e) {
          console.error('Failed to load players from JSON:', e);
        }
      }
      
      return { data: gameData.players || [] };
    }

    // Master locations
    if (url === '/master/locations') {
      return { data: gameData.locations };
    }

    // Master items
    if (url === '/master/items') {
      return { data: gameData.items };
    }

    // Master mobs
    const mobsMatch = url.match(/^\/master\/mobs\?location_id=(\d+)$/);
    if (mobsMatch) {
      const locationId = parseInt(mobsMatch[1]);
      const locationMobs = gameData.mobs.filter(m => m.location_id === locationId);
      return { data: locationMobs };
    }

    if (url === '/master/mobs') {
      return { data: gameData.mobs };
    }

    // Dice rolls
    if (url.startsWith('/dice/rolls')) {
      const limit = parseInt(new URLSearchParams(url.split('?')[1] || '').get('limit') || '50');
      const rolls = gameData.dice_rolls
        .sort((a, b) => (b.created_at || 0) - (a.created_at || 0))
        .slice(0, limit)
        .map(roll => {
          const character = gameData.characters.find(c => c.id === roll.character_id);
          return {
            ...roll,
            character_name: character?.name || 'Неизвестно'
          };
        });
      return { data: rolls };
    }

    throw new Error(`Unknown GET endpoint: ${url}`);
  },

  post: async (url: string, data?: any): Promise<{ data: any }> => {
    // Синхронизируем с JSON перед каждым запросом
    await syncWithJson();
    
    await new Promise(resolve => setTimeout(resolve, 100));

    // Auth endpoints
    if (url === '/auth/player') {
      const playerName = data?.player_name;
      if (!playerName) {
        throw new Error('Player name required');
      }
      
      // Убеждаемся, что данные актуальны
      const currentData = loadData();
      gameData = currentData;
      
      // Загружаем из JSON если нужно
      try {
        const publicUrl = getPublicUrl();
        const jsonResponse = await fetch(`${publicUrl}/data.json`);
        if (jsonResponse.ok) {
          const jsonData = await jsonResponse.json();
          
          // Обновляем игроков из JSON
          if (jsonData.players && jsonData.players.length > 0) {
            gameData.players = jsonData.players;
          }
          
          // Обновляем персонажей из JSON
          if (jsonData.characters && jsonData.characters.length > 0) {
            // Объединяем персонажей: из JSON + существующие в localStorage
            const existingIds = new Set(gameData.characters.map(c => c.id));
            jsonData.characters.forEach((char: any) => {
              if (!existingIds.has(char.id)) {
                gameData.characters.push(char);
              } else {
                // Обновляем существующего персонажа данными из JSON (сохраняя изменения из localStorage)
                const index = gameData.characters.findIndex(c => c.id === char.id);
                if (index !== -1) {
                  const localChar = gameData.characters[index];
                  // Объединяем: новые поля из JSON + динамические изменения из localStorage
                  gameData.characters[index] = {
                    ...char, // Новая структура из JSON (включая role, goals, fears, resource_points, inventory)
                    // Сохраняем только изменяемые поля из localStorage
                    hp_current: localChar.hp_current,
                    hp_max: localChar.hp_max !== char.hp_max ? localChar.hp_max : char.hp_max,
                    inventory: mergeInventory(char.inventory, localChar.inventory),
                  };
                }
              }
            });
          }
          
          // Сохраняем обновленные данные
          saveData(gameData);
        }
      } catch (e) {
        console.error('Failed to load from JSON:', e);
      }
      
      const player = gameData.players?.find(
        p => p.name.toLowerCase() === playerName.toLowerCase()
      );
      if (!player) {
        console.error('Player not found:', playerName, 'Available players:', gameData.players);
        throw new Error('Игрок не найден');
      }
      
      const character = gameData.characters.find(c => c.id === player.character_id);
      if (!character) {
        console.error('Character not found for player:', player, 'character_id:', player.character_id, 'Available characters:', gameData.characters);
        throw new Error('Персонаж не найден');
      }
      return {
        data: {
          type: 'player',
          character_id: character.id,
          character_name: character.name,
          player_name: player.name
        }
      };
    }

    if (url === '/auth/master') {
      if (data?.password !== '2365') {
        throw new Error('Неверный пароль');
      }
      return {
        data: {
          type: 'master'
        }
      };
    }

    // Dice roll
    if (url === '/dice/roll') {
      const diceType = data.dice_type;
      let value = 0;
      
      // Парсим тип кубика
      if (diceType.startsWith('d')) {
        const sides = parseInt(diceType.substring(1));
        value = Math.floor(Math.random() * sides) + 1;
      } else if (diceType.includes('-')) {
        // Кастомный диапазон "min-max"
        const [min, max] = diceType.split('-').map(Number);
        value = Math.floor(Math.random() * (max - min + 1)) + min;
      } else {
        value = Math.floor(Math.random() * 20) + 1;
      }

      const roll = {
        id: getNextId(),
        character_id: data.character_id,
        type: diceType,
        value: value,
        context: data.context || {},
        created_at: Date.now()
      };
      gameData.dice_rolls.push(roll);
      saveData(gameData);
      return { data: roll };
    }

    // Master endpoints
    if (url === '/master/locations') {
      const location = {
        id: getNextId(),
        name: data.name,
        description: data.description || '',
        tags: data.tags || [],
        is_active: true,
        created_at: Date.now()
      };
      gameData.locations.push(location);
      saveData(gameData);
      return { data: location };
    }

    if (url === '/master/move-character') {
      const character = gameData.characters.find(c => c.id === data.character_id);
      if (character) {
        character.location_id = data.location_id;
        saveData(gameData);
      }
      return { data: character };
    }

    if (url === '/master/notes') {
      const note = {
        id: getNextId(),
        character_id: data.character_id,
        from_gm: true,
        text: data.text,
        visibility: data.visibility || 'decide_yourself',
        created_at: Date.now()
      };
      gameData.notes.push(note);
      saveData(gameData);
      return { data: note };
    }

    if (url === '/master/give-item') {
      const charItem = {
        id: getNextId(),
        character_id: data.character_id,
        item_id: data.item_id,
        quantity: data.quantity || 1,
        state: 'active',
        created_at: Date.now()
      };
      gameData.character_items.push(charItem);
      saveData(gameData);
      return { data: charItem };
    }

    if (url === '/master/spawn-mob') {
      const mob = {
        id: getNextId(),
        mob_id: data.mob_id,
        location_id: data.location_id,
        rolled_stats: data.rolled_stats || {},
        hp_current: data.hp_current || 50,
        is_active: true,
        created_at: Date.now()
      };
      gameData.mobs.push(mob);
      saveData(gameData);
      return { data: mob };
    }

    // Item management endpoints
    if (url === '/character/item/equip') {
      const character = gameData.characters.find(c => c.id === data.character_id);
      if (!character || !character.inventory) {
        throw new Error('Character or inventory not found');
      }
      
      const item = character.inventory.find((i: any) => i.name === data.item_name);
      if (!item) {
        throw new Error('Item not found');
      }
      
      // Unequip any item in the same slot
      if (item.equip_slot !== 'none') {
        character.inventory.forEach((i: any) => {
          if (i.equipped && i.equip_slot === item.equip_slot && i.name !== item.name) {
            i.equipped = false;
          }
        });
      }
      
      item.equipped = !item.equipped;
      saveData(gameData);
      
      return { data: { character, item } };
    }

    if (url === '/character/item/use') {
      const character = gameData.characters.find(c => c.id === data.character_id);
      if (!character) {
        throw new Error('Character not found');
      }
      
      // Log the item use
      if (!gameData.item_use_logs) {
        gameData.item_use_logs = [];
      }
      
      const log = {
        id: getNextId(),
        character_id: data.character_id,
        character_name: character.name,
        item_name: data.item_name,
        effect_type: data.effect_type || '',
        effect_params: data.effect_params || {},
        target_id: data.target_id,
        target_name: data.target_name,
        timestamp: Date.now()
      };
      
      gameData.item_use_logs.push(log);
      
      // Handle specific effects
      if (!character.status_effects) {
        character.status_effects = [];
      }
      
      const effectType = data.effect_type;
      
      if (effectType === 'ADVANTAGE_NEXT_ROLL') {
        character.status_effects.push({
          type: 'advantage',
          duration: 'next_roll',
          source: data.item_name,
          timestamp: Date.now()
        });
      } else if (effectType === 'REVEAL_CLUE') {
        const note = {
          id: getNextId(),
          character_id: data.character_id,
          from_gm: true,
          text: `Мастер предоставит подсказку (используя ${data.item_name})`,
          visibility: 'tell_all',
          created_at: Date.now()
        };
        gameData.notes.push(note);
      } else if (effectType === 'RESIST') {
        const resistType = data.effect_params?.type || 'Fear';
        character.status_effects.push({
          type: `resist_${resistType.toLowerCase()}`,
          duration: 'scene',
          source: data.item_name,
          timestamp: Date.now()
        });
      } else if (effectType === 'ESCAPE_WINDOW') {
        character.status_effects.push({
          type: 'escape_available',
          duration: 'scene',
          source: data.item_name,
          timestamp: Date.now()
        });
      } else if (effectType === 'SIGNAL_PING') {
        // Master determines result, just log it
        const note = {
          id: getNextId(),
          character_id: data.character_id,
          from_gm: true,
          text: `Сигнал отправлен (${data.item_name}). Результат: ${data.result || 'ожидает мастера'}`,
          visibility: 'tell_all',
          created_at: Date.now()
        };
        gameData.notes.push(note);
      }
      
      saveData(gameData);
      
      return { data: { log, character } };
    }

    if (url === '/character/vehicle/action') {
      const character = gameData.characters.find(c => c.id === data.character_id);
      if (!character || !character.inventory) {
        throw new Error('Character or inventory not found');
      }
      
      const vehicle = character.inventory.find((i: any) => i.name === data.vehicle_name && i.item_type === 'vehicle');
      if (!vehicle || !vehicle.vehicle) {
        throw new Error('Vehicle not found');
      }
      
      if (!gameData.vehicle_events) {
        gameData.vehicle_events = [];
      }
      
      const action = data.action; // 'drive', 'taunt', 'refuel', 'speed_toggle'
      let details = '';
      
      if (action === 'drive') {
        const fuelCost = vehicle.vehicle.speed_mode === 'fast' ? 2 : 1;
        if (vehicle.vehicle.fuel_current >= fuelCost) {
          vehicle.vehicle.fuel_current -= fuelCost;
          details = `Проехали (режим: ${vehicle.vehicle.speed_mode}, топливо: -${fuelCost})`;
        } else {
          details = 'Недостаточно топлива!';
        }
      } else if (action === 'taunt') {
        details = `Привлечено внимание (радиус: ${vehicle.vehicle.taunt_radius}м, уровень шума: ${vehicle.vehicle.noise_level})`;
      } else if (action === 'refuel') {
        const amount = data.amount || 10;
        vehicle.vehicle.fuel_current = Math.min(vehicle.vehicle.fuel_current + amount, vehicle.vehicle.fuel_max);
        details = `Заправлено: +${amount} топлива`;
      } else if (action === 'speed_toggle') {
        vehicle.vehicle.speed_mode = vehicle.vehicle.speed_mode === 'normal' ? 'fast' : 'normal';
        details = `Режим изменен: ${vehicle.vehicle.speed_mode}`;
      }
      
      const event = {
        id: getNextId(),
        character_id: data.character_id,
        character_name: character.name,
        vehicle_name: vehicle.name,
        event_type: action,
        details,
        timestamp: Date.now()
      };
      
      gameData.vehicle_events.push(event);
      saveData(gameData);
      
      return { data: { event, vehicle } };
    }


    throw new Error(`Unknown POST endpoint: ${url}`);
  },

  put: async (url: string, data?: any): Promise<{ data: any }> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    // Character update
    const updateCharMatch = url.match(/^\/character\/(\d+)$/);
    if (updateCharMatch && data) {
      const characterId = parseInt(updateCharMatch[1]);
      const character = gameData.characters.find(c => c.id === characterId);
      if (character) {
        Object.assign(character, data);
        saveData(gameData);
        return { data: character };
      }
      throw new Error('Character not found');
    }

    throw new Error(`PUT not implemented: ${url}`);
  },

  delete: async (url: string): Promise<{ data: any }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error(`DELETE not implemented: ${url}`);
  }
};

// Экспортируем функцию для скачивания данных (для мастера)
export const downloadGameData = () => {
  const dataStr = JSON.stringify(gameData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dnd_data.json';
  link.click();
  URL.revokeObjectURL(url);
};

// Экспортируем функцию для загрузки данных (для мастера)
export const uploadGameData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        gameData = data;
        saveData(gameData);
        resolve();
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

// Экспортируем функцию для сброса кэша (очистка localStorage и перезагрузка из JSON)
export const resetCache = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const jsonData = await loadJsonData();
    if (jsonData) {
      gameData = jsonData;
      saveData(gameData);
    } else {
      gameData = defaultData;
      saveData(gameData);
    }
  } catch (err) {
    console.error('Failed to reset cache:', err);
    throw err;
  }
};
