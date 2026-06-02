import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Set default backend base URL if running on a separate port
axios.defaults.baseURL = "http://localhost:3000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || null);
  const [loading, setLoading] = useState(true);

  // Sync token to Axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("accessToken", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  // Load user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/users/profile");
        setUser(res.data.user);
      } catch (err) {
        console.error("Session restoration failed:", err.message);
        // If expired/invalid, clear auth
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token: newCtxToken, user: userData } = res.data;
    setToken(newCtxToken);
    setUser(userData);
    return res.data;
  };

  const register = async (username, email, password, avatar) => {
    const res = await axios.post("/api/auth/register", { username, email, password, avatar });
    const { token: newCtxToken, user: userData } = res.data;
    setToken(newCtxToken);
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (err) {
      console.warn("Server logout notification failed:", err.message);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const loginWithGoogle = async (idToken) => {
    const res = await axios.post("/api/auth/google", { idToken });
    const { token: newCtxToken, user: userData } = res.data;
    setToken(newCtxToken);
    setUser(userData);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

