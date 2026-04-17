import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const safeGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const safeSet = (key, val) => { try { localStorage.setItem(key, val); } catch {} };
const safeRemove = (key) => { try { localStorage.removeItem(key); } catch {} };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = safeGet('token');
      const storedUser  = safeGet('user');
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          setToken(storedToken);
          setUser(parsed);
        } else {
          safeRemove('token');
          safeRemove('user');
        }
      }
    } catch {
      safeRemove('token');
      safeRemove('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    safeSet('token', userToken);
    safeSet('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    safeRemove('token');
    safeRemove('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
