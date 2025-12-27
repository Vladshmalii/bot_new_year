import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CharacterProfileProps {
  character: any;
}

const CharacterProfile: React.FC<CharacterProfileProps> = ({ character }) => {
  const [backstoryExpanded, setBackstoryExpanded] = useState(false);

  return (
    <div className="character-profile">
      <div className="profile-card">
        <h1 className="character-name">{character.name}</h1>
        
        {character.role && (
          <p className="character-role">{character.role}</p>
        )}
        
        {character.age && (
          <p className="character-age">Возраст: {character.age}</p>
        )}
        
        {character.description && (
          <div className="character-description">
            <h3>Описание</h3>
            <p>{character.description}</p>
          </div>
        )}
        
        {character.backstory && (
          <div className="character-backstory">
            <button
              className="backstory-toggle"
              onClick={() => setBackstoryExpanded(!backstoryExpanded)}
            >
              <h3>Предыстория</h3>
              {backstoryExpanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {backstoryExpanded && (
              <div className="backstory-content">
                <p>{character.backstory}</p>
              </div>
            )}
          </div>
        )}
        
        {(character.location || character.location_name) && (
          <div className="character-location">
            <h3>Текущая локация</h3>
            <p>{character.location?.name || character.location_name || character.location}</p>
            {character.location?.description && (
              <p className="location-description">{character.location.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterProfile;

