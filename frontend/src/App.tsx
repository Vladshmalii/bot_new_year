import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import PlayerApp from './components/PlayerApp';
import MasterApp from './components/MasterApp';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Загрузка...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (user.type === 'master') {
    return <MasterApp />;
  }

  if (!user.character_id) {
    return <div className="app-loading">Ошибка: ID персонажа не найден</div>;
  }

  return <PlayerApp characterId={user.character_id} />;
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
