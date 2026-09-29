import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";

// Storage key for auth data
const AUTH_STORAGE_KEY = "vasupay-auth";

// Map backend entity_type to frontend route role
function mapEntityTypeToRole(entityType: string): string {
  switch (entityType) {
    case "superadmin":
      return "admin";
    case "white_label":
      return "white_label";
    case "agency":
      return "agency";
    case "distributor":
      return "distributor";
    case "partner":
      return "partner";
    case "retailer":
      return "retailer";
    case "agent":
      return "agent";
    case "merchant":
    case "customer":
    default:
      return "user";
  }
}

interface AuthUser {
  id: number;
  phone: string;
  full_name: string;
  email: string | null;
  entity_type: string;
  status: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userRole: string | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<{ error: any }>;
  signUp: (phone: string, password: string, fullName?: string, entityType?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

function getStoredAuth(): { accessToken: string; refreshToken: string; user: AuthUser; role: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function storeAuth(accessToken: string, refreshToken: string, user: AuthUser, role: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, user, role }));
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on mount
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.accessToken && stored?.user) {
      setUser(stored.user);
      setUserRole(stored.role);
    }
    setLoading(false);
  }, []);

  const signIn = async (phone: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { phone, password });
      const data = res.data;

      const authUser: AuthUser = data.user;
      const role = mapEntityTypeToRole(authUser.entity_type);

      storeAuth(data.access_token, data.refresh_token, authUser, role);
      setUser(authUser);
      setUserRole(role);

      // Redirect based on role
      if (role === "admin") navigate("/admin");
      else if (role === "white_label") navigate("/white-label");
      else if (role === "agency") navigate("/agency");
      else if (role === "distributor") navigate("/distributor");
      else if (role === "partner") navigate("/partner");
      else if (role === "retailer") navigate("/retailer");
      else if (role === "agent") navigate("/agent");
      else navigate("/user");

      return { error: null };
    } catch (error: any) {
      return { error: { message: error?.message || "Login failed" } };
    }
  };

  const signUp = async (phone: string, password: string, fullName?: string, entityType?: string) => {
    try {
      await api.post("/auth/register", {
        full_name: fullName || "New User",
        phone,
        password,
        entity_type: entityType || "customer",
      });
      return { error: null };
    } catch (error: any) {
      return { error: { message: error?.message || "Registration failed" } };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout API errors, still clear local state
    }
    clearAuth();
    setUser(null);
    setUserRole(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
