'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Restore authentication state when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }

    if (storedToken) {
      setToken(storedToken);
    }

    // for refresh the use effect used for useState function vlaeu persists (reset state result avoidance)
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token and user information on client
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify(data.user)
    );

    // Update React state
    setUser(data.user);
    setToken(data.token);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Store token and user information
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem(
      'auth_user',
      JSON.stringify(data.user)
    );

    setUser(data.user);
    setToken(data.token);
  };

  const logout = async () => {
    // Tell server to remove the authentication cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    // Remove client-side user information and token
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');

    // Clear React state
    setUser(null);
    setToken(null);

    // Go to home page
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}