"use client";

import { useEffect, useState, createContext, useContext, ReactNode, useCallback } from 'react';
import useLocalStorage from './use-local-storage';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);
  // The loading state is crucial for the initial render, before the client-side `useLocalStorage` has a chance to run.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On the client, once this effect runs, we know the value from `useLocalStorage` is hydrated.
    // We can then set loading to false.
    setLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    setUser({ email });
  }, [setUser]);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
