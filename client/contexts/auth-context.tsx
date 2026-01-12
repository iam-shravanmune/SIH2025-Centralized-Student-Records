import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserDTO } from "@shared/api";

interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  login: (user: UserDTO) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "gradfolio_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const sessionUser = JSON.parse(stored) as UserDTO;
        setUser(sessionUser);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: UserDTO) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    // Clear all app data
    try {
      const PREFIX = "gradfolio_store_v1";
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
