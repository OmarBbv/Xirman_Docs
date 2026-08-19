import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { queryClient } from "../features/utils/queryClient";
import { PRIVATE_API } from "../features/utils/apiConfig";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  role: string;
  roleDisplayName?: string;
  permissions?: string[];
  allowedDepartments?: string[];
  allowedDocumentTypes?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  /** Rolun icazələrini yoxlayır. Admin həmişə icazəlidir. */
  hasPermission: (...permissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** İcazələr rol dəyişdikdə köhnəlməsin deyə serverdən yenidən oxunur. */
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const { data } = await PRIVATE_API.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (error) {
      console.error("User refresh error:", error);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("User restoration error:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      void refreshUser();
    }
    setIsLoading(false);
  }, [refreshUser]);

  const login = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.clear();
    sessionStorage.clear();
    queryClient.clear();
    setUser(null);
  };

  const hasPermission = useCallback(
    (...permissions: string[]) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      if (permissions.length === 0) return true;
      const granted = user.permissions ?? [];
      return permissions.some((permission) => granted.includes(permission));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        hasPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
