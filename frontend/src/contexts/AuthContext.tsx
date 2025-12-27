import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  type: 'player' | 'master';
  character_id?: number;
  character_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (type: 'player' | 'master', data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('dnd_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('dnd_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (type: 'player' | 'master', data: any) => {
    try {
      let response;
      if (type === 'player') {
        response = await api.post('/auth/player', {
          player_name: data.player_name
        });
      } else {
        response = await api.post('/auth/master', {
          password: data.password
        });
      }
      
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('dnd_user', JSON.stringify(userData));
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.detail || 'Ошибка авторизации';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dnd_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
