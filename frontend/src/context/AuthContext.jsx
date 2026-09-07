import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch fresh user data from the DB and update both state and localStorage.
   * Called on mount and after any action that changes membership (join/leave/create).
   */
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("mc_token");
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("mc_user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch {
      // Token expired or invalid — clear session
      localStorage.removeItem("mc_token");
      localStorage.removeItem("mc_user");
      setUser(null);
      return null;
    }
  }, []);

  // On mount: restore from localStorage for immediate render, then verify
  // with the server so we always have fresh joinedCultures etc.
  useEffect(() => {
    const stored = localStorage.getItem("mc_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("mc_user");
      }
    }
    refreshUser().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("mc_token", data.token);
    localStorage.setItem("mc_user", JSON.stringify(data.user));
    setUser(data.user);
    // Refresh to get the full up-to-date user object from DB
    await refreshUser();
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("mc_token", data.token);
    localStorage.setItem("mc_user", JSON.stringify(data.user));
    setUser(data.user);
    await refreshUser();
  }

  function logout() {
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
