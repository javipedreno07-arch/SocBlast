import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const safeGet    = (k) => { try { return localStorage.getItem(k); }    catch { return null; } };
const safeSet    = (k, v) => { try { localStorage.setItem(k, v); }    catch {} };
const safeRemove = (k) => { try { localStorage.removeItem(k); }        catch {} };

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
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