import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shibuya_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const users = await db.getUsers();
      const matched = users.find(
        (u) => u.login.toLowerCase() === username.trim().toLowerCase() && u.senha_hash === password
      );

      if (matched) {
        // Strip sensitive hash before storing in state
        const safeUser = {
          id: matched.id,
          nome: matched.nome,
          login: matched.login,
          perfil: matched.perfil
        };
        setUser(safeUser);
        localStorage.setItem('shibuya_user', JSON.stringify(safeUser));
        setLoading(false);
        return { success: true, user: safeUser };
      } else {
        const msg = 'Usuário ou senha incorretos.';
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = 'Erro ao realizar login: ' + err.message;
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shibuya_user');
  };

  const isAdmin = user?.perfil === 'ADMIN';
  const isMechanic = user?.perfil === 'MECANICO';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isMechanic, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
