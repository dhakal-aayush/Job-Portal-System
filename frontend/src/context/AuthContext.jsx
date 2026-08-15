import { createContext, useState, useEffect } from "react";
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  logoutUser as apiLogout,
  getProfile,
} from "../services/authService";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage and verify with backend.
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        setLoading(false);
        return;
      }

      // Optimistically set from cache for instant UI, then verify.
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore parse errors
        }
      }

      try {
        const profile = await getProfile();
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        localStorage.setItem("role", profile.role);
      } catch {
        // Token invalid/expired and refresh failed (handled by axios interceptor)
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    return apiRegister(userData);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
