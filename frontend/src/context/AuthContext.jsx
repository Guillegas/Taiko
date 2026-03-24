import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();
const API_URL = 'http://localhost:8080/api';

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
    <AuthContext.Provider value={{ user, login, logout, updateUsername, isLoginModalOpen, setIsLoginModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
