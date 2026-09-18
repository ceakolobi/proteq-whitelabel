import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const location = useLocation();

  // Aguarda carregar a sessão antes de decidir redirecionamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota exige perfil e ainda não temos o perfil carregado
  if (allowedRoles && !userRole) {
    return <Navigate to="/login" replace />;
  }

  // Se tem roles permitidas definidas e o usuário não tem a role correta
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redireciona para página de acesso restrito em vez da home
    return <Navigate to="/acesso-restrito" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
