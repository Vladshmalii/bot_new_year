import React from 'react';
import { Megaphone, Lock, HelpCircle, FileText } from 'lucide-react';

interface NotesProps {
  notes: any[];
}

const Notes: React.FC<NotesProps> = ({ notes }) => {
  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'tell_all':
        return <Megaphone size={16} />;
      case 'keep_secret':
        return <Lock size={16} />;
      case 'decide_yourself':
        return <HelpCircle size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'tell_all':
        return 'Расскажи всем';
      case 'keep_secret':
        return 'Тайна';
      case 'decide_yourself':
        return 'Решай сам';
      default:
        return visibility;
    }
  };

  const getVisibilityBadgeClass = (visibility: string) => {
    switch (visibility) {
      case 'tell_all':
        return 'badge-tell-all';
      case 'keep_secret':
        return 'badge-keep-secret';
      case 'decide_yourself':
        return 'badge-decide-yourself';
      default:
        return 'badge-default';
    }
  };

  if (notes.length === 0) {
    return (
      <div className="notes">
        <div className="notes-empty">
          <p>Записок пока нет</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes">
      <h2 className="notes-title">Записки и подсказки</h2>
      
      <div className="notes-list">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <div className="note-header">
              <span className={`note-visibility-badge ${getVisibilityBadgeClass(note.visibility || 'default')}`}>
                <span className="badge-icon">{getVisibilityIcon(note.visibility || 'default')}</span>
                <span className="badge-text">{getVisibilityText(note.visibility || 'default')}</span>
              </span>
              <span className="note-date">
                {new Date(note.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className="note-text">{note.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;

