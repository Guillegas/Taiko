import { createContext, useContext, useState } from 'react';

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
