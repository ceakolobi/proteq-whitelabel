import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import type { PerfilCRM } from "@/types/crm";
import { buscarPerfilUsuario } from "@/services/crmService";

export type UserRole = "associado" | "consultor" | "indicador";

export interface UserData {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
  telefone?: string;
  codigoIndicador?: string;
  avatar?: string;
}

interface AuthContextType {
  user: UserData | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  // Perfil do CRM com permissões
  perfilCRM: PerfilCRM | null;
  isLoadingPerfil: boolean;
  // Funções
  login: (userData: UserData, role: UserRole) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  recarregarPerfilCRM: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado do perfil CRM
  const [perfilCRM, setPerfilCRM] = useState<PerfilCRM | null>(null);
  const [isLoadingPerfil, setIsLoadingPerfil] = useState(false);

  // Função para carregar perfil do CRM
  const carregarPerfilCRM = useCallback(async () => {
    setIsLoadingPerfil(true);
    try {
      const result = await buscarPerfilUsuario();

      if (result.ok === false) {
        console.error("Erro ao carregar perfil do CRM:", result);
        setPerfilCRM(null);
        sessionStorage.removeItem("perfilCRM");
        return;
      }

      const perfil = result.data;
      setPerfilCRM(perfil);
      // Salva em sessionStorage para restauração rápida
      sessionStorage.setItem("perfilCRM", JSON.stringify(perfil));
    } catch (error) {
      console.error("Erro ao carregar perfil do CRM:", error);
      setPerfilCRM(null);
      sessionStorage.removeItem("perfilCRM");
    } finally {
      setIsLoadingPerfil(false);
    }
  }, []);

  // Função pública para recarregar perfil
  const recarregarPerfilCRM = useCallback(async () => {
    await carregarPerfilCRM();
  }, [carregarPerfilCRM]);

  useEffect(() => {
    const safeJsonParse = <T,>(value: string): T | null => {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    };

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (session?.user) {
        // Restore user data from sessionStorage if available
        const storedUser = sessionStorage.getItem((import.meta.env.VITE_SESSION_KEY || "proteqUser"));
        const storedRole = sessionStorage.getItem("userRole");
        const storedPerfilCRM = sessionStorage.getItem("perfilCRM");

        if (storedUser) {
          const parsed = safeJsonParse<UserData>(storedUser);
          if (parsed) setUser(parsed);
        }
        if (storedRole) {
          setUserRoleState(storedRole as UserRole);
        }
        if (storedPerfilCRM) {
          const parsed = safeJsonParse<PerfilCRM>(storedPerfilCRM);
          if (parsed) setPerfilCRM(parsed);
        }

        // Carrega perfil fresco do CRM (em background)
        carregarPerfilCRM();
      } else {
        // Clear state on logout
        setUser(null);
        setUserRoleState(null);
        setPerfilCRM(null);
        sessionStorage.removeItem((import.meta.env.VITE_SESSION_KEY || "proteqUser"));
        sessionStorage.removeItem("userRole");
        sessionStorage.removeItem("perfilCRM");
      }

      setIsLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user) {
        const storedUser = sessionStorage.getItem((import.meta.env.VITE_SESSION_KEY || "proteqUser"));
        const storedRole = sessionStorage.getItem("userRole");
        const storedPerfilCRM = sessionStorage.getItem("perfilCRM");

        if (storedUser) {
          const parsed = safeJsonParse<UserData>(storedUser);
          if (parsed) setUser(parsed);
        }
        if (storedRole) {
          setUserRoleState(storedRole as UserRole);
        }
        if (storedPerfilCRM) {
          const parsed = safeJsonParse<PerfilCRM>(storedPerfilCRM);
          if (parsed) setPerfilCRM(parsed);
        }

        // Carrega perfil fresco do CRM
        carregarPerfilCRM();
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [carregarPerfilCRM]);

  const login = (userData: UserData, role: UserRole) => {
    setUser(userData);
    setUserRoleState(role);
    sessionStorage.setItem((import.meta.env.VITE_SESSION_KEY || "proteqUser"), JSON.stringify(userData));
    sessionStorage.setItem("userRole", role);
    // Carrega perfil do CRM após login
    carregarPerfilCRM();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRoleState(null);
    setSession(null);
    setPerfilCRM(null);
    sessionStorage.removeItem((import.meta.env.VITE_SESSION_KEY || "proteqUser"));
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("perfilCRM");
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    sessionStorage.setItem("userRole", role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated: !!session && !!user,
        isLoading,
        session,
        perfilCRM,
        isLoadingPerfil,
        login,
        logout,
        setUserRole,
        recarregarPerfilCRM,
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

export const getHomeRouteByRole = (role: UserRole): string => {
  switch (role) {
    case "associado":
      return "/";
    case "consultor":
      return "/consultor";
    case "indicador":
      return "/indicador";
    default:
      return "/";
  }
};
