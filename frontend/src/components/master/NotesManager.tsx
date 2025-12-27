import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Send, Eye, EyeOff, HelpCircle, Archive } from 'lucide-react';

const NotesManager: React.FC = () => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteVisibility, setNoteVisibility] = useState('decide_yourself');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCharacters(); }, []);

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

  if (loading) return <div className="admin-loading">Загрузка мастеров почты...</div>;

  return (
    <div className="notes-manager-modern">
      <div className="admin-form-container">
        <div className="form-header-premium">
          <div className="header-icon"><Send size={24} /></div>
          <div>
            <h3>Отправить Подсказку</h3>
            <p>Прямое сообщение в инвентарь или дневник игрока</p>
          </div>
        </div>

        <div className="premium-form-body">
          <div className="form-item">
            <label>Кому отправить?</label>
            <select
              className="premium-select"
              value={selectedCharacter || ''}
              onChange={(e) => setSelectedCharacter(parseInt(e.target.value) || null)}
            >
              <option value="">Выберите получателя</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>{char.name}</option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label>Содержание записки</label>
            <textarea
              className="premium-textarea"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Шепните что-нибудь важное..."
              rows={8}
            />
          </div>

          <div className="form-item">
            <label>Статус видимости</label>
            <div className="visibility-options">
              {[
                { id: 'tell_all', label: 'Публично', sub: 'Зачитать всем', icon: <Eye size={18} /> },
                { id: 'keep_secret', label: 'Секретно', sub: 'Только игроку', icon: <EyeOff size={18} /> },
                { id: 'decide_yourself', label: 'На выбор', sub: 'Игрок решит сам', icon: <HelpCircle size={18} /> }
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`visibility-btn ${noteVisibility === opt.id ? 'active' : ''}`}
                  onClick={() => setNoteVisibility(opt.id)}
                >
                  <span className="opt-icon">{opt.icon}</span>
                  <div className="opt-text">
                    <span className="opt-label">{opt.label}</span>
                    <span className="opt-sub">{opt.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-footer-premium">
          <button className="admin-btn active full-width large" onClick={sendNote}>
            <Send size={18} /> Отправить записку
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesManager;
