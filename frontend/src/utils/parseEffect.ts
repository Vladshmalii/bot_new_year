export type ParsedEffect = {
  type: string;
  params: Record<string, string>;
};

export const parseUseEffect = (use_effect: string): ParsedEffect | null => {
  if (!use_effect || !use_effect.trim()) {
    return null;
  }
  
  try {
    const parts = use_effect.split(';');
    const type = parts[0]?.trim();
    
    if (!type) return null;
    
    const params: Record<string, string> = {};
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.includes('=')) {
        const [key, value] = part.split('=');
        params[key.trim()] = value.trim();
      }
    }
    
    return { type, params };
  } catch (e) {
    console.error('Failed to parse use_effect:', use_effect, e);
    return null;
  }
};

export const getEffectDescription = (effectType: string): string => {
  const descriptions: Record<string, string> = {
    'ADVANTAGE_NEXT_ROLL': 'Даёт преимущество на следующий бросок',
    'REVEAL_CLUE': 'Раскрывает подсказку от мастера',
    'RESIST': 'Даёт сопротивление негативному эффекту',
    'DEBUFF_TARGET': 'Накладывает негативный эффект на цель',
    'ESCAPE_WINDOW': 'Открывает окно для побега',
    'SIGNAL_PING': 'Посылает сигнал для мастера'
  };
  
  return descriptions[effectType] || 'Неизвестный эффект';
};
