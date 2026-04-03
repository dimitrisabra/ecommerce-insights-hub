import React, { createContext, useContext, useState, useCallback } from 'react';
import { getUsers, type User } from '@/lib/mockData';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string) => {
    const found = getUsers().find(u => u.email === email && u.password === password);
    if (found) { setUser(found); return true; }
    return false;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const switchRole = useCallback((role: 'user' | 'admin') => {
    if (!user) return;
    // Find a user of the target role and switch
    const target = getUsers().find(u => u.role === role);
    if (target) setUser(target);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
