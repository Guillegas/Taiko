import { createContext, useContext, useState } from 'react';

/**
 * Contexto de autenticación global de la aplicación.
 *
 * Centraliza el usuario logueado, el JWT y el estado del modal de login,
 * y los expone a toda la app a través del hook `useAuth()`.
 *
 * El token se persiste en `localStorage` para sobrevivir a recargas de
 * página. La caducidad efectiva la controla el backend (claim `exp` del JWT):
 * cuando el token expira, las peticiones devuelven 401 y el frontend pide login.
 */
const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState('login');

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      // data: { token, username, role }
      const userData = { username: data.username, role: data.role, token: data.token };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setIsLoginModalOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (nombre, email, password, telefono) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, telefono }),
      });
      if (!res.ok) {
        const msg = await res.text();
        return { success: false, error: msg };
      }
      const data = await res.json();
      const userData = { username: data.username, role: data.role, token: data.token };
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      setIsLoginModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  const updateUsername = (newUsername) => {
    setUser(prev => {
      const updated = { ...prev, username: newUsername };
      localStorage.setItem('authUser', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUsername, isLoginModalOpen, setIsLoginModalOpen, loginModalTab, setLoginModalTab }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
