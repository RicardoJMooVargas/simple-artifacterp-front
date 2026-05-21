import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthService } from "../services/AuthService";

const STORAGE_KEY = "artifacterp.session";

const defaultSession = {
  user: {
    name: "Invitado",
  },
  role: 3,
};

const AuthContext = createContext({
  session: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultSession;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return defaultSession;
    }
  });

  const signIn = async (credentials) => {
    try {
      const result = await AuthService.login(
        credentials.username,
        credentials.password,
      );

      if (result.success) {
        const userData = result.data;

        const newSession = {
          user: {
            name:
              userData.user?.name || userData.userName || credentials.username,
            email: userData.user?.email || userData.email,
          },
          role: userData.role ?? 3,
          token: userData.token || null,
          userType: userData.userType || null,
        };

        setSession(newSession);
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Error al iniciar sesión",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: "Error de conexión",
      };
    }
  };

  const signOut = async () => {
    setSession(defaultSession);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      signIn,
      signOut,
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  return useContext(AuthContext);
}
