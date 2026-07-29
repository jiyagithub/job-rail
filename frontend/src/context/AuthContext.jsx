import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first app load, check if a user was already logged in (saved in localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("jobrail_user");
    const savedToken = localStorage.getItem("jobrail_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const response = await axiosClient.post("/auth/login", { email, password });
    const { user, token } = response.data;
    localStorage.setItem("jobrail_token", token);
    localStorage.setItem("jobrail_user", JSON.stringify(user));
    setUser(user);
    return user;
  }

  async function register(name, email, password) {
    const response = await axiosClient.post("/auth/register", { name, email, password });
    const { user, token } = response.data;
    localStorage.setItem("jobrail_token", token);
    localStorage.setItem("jobrail_user", JSON.stringify(user));
    setUser(user);
    return user;
  }

  function logout() {
    localStorage.removeItem("jobrail_token");
    localStorage.removeItem("jobrail_user");
    setUser(null);
  }

  async function updateName(name) {
  const response = await axiosClient.patch("/auth/name", { name });
  const updatedUser = response.data.user;
  localStorage.setItem("jobrail_user", JSON.stringify(updatedUser));
  setUser(updatedUser);
  return updatedUser;
}

  const value = { user, loading, login, register, logout, updateName };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// This is the hook every page/component will use to access auth state
export function useAuth() {
  return useContext(AuthContext);
}