import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const NotesManager: React.FC = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('decide_yourself');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const response = await api.get('/master/characters');
      setCharacters(response.data);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNote = async () => {
    if (!selectedCharacter || !noteText.trim()) {
      alert('Выберите персонажа и введите текст записки');
      return;
    }

    try {
      await api.post('/master/notes', {
        character_id: selectedCharacter,
        text: noteText,
        visibility: noteVisibility,
      });
      setNoteText('');
      alert('Записка отправлена!');
    } catch (error) {
      console.error('Failed to send note:', error);
      alert('Ошибка при отправке записки');
    }
  };

  if (loading) {
    return <div className="notes-manager-loading">Загрузка...</div>;
  }

  return (
    <div className="notes-manager">
      <h1 className="notes-manager-title">📝 Управление подсказками</h1>

      <div className="notes-manager-content">
        <div className="send-note-form">
          <h2>Отправить записку</h2>

          <div className="form-group">
            <label>Персонаж:</label>
            <select
              className="character-select"
              value={selectedCharacter || ''}
              onChange={(e) => setSelectedCharacter(parseInt(e.target.value) || null)}
            >
              <option value="">Выберите персонажа</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Текст записки:</label>
            <textarea
              className="note-textarea"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Введите текст подсказки..."
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Видимость:</label>
            <select
              className="visibility-select"
              value={noteVisibility}
              onChange={(e) => setNoteVisibility(e.target.value)}
            >
              <option value="tell_all">Рассказать всем</option>
              <option value="keep_secret">Не рассказывай</option>
              <option value="decide_yourself">Решай сам</option>
            </select>
          </div>

          <button onClick={sendNote} className="send-note-button">
            Отправить записку
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesManager;

