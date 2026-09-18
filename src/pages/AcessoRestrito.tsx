import { ShieldOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth, getHomeRouteByRole } from "@/contexts/AuthContext";

const AcessoRestrito = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const handleVoltar = () => {
    if (userRole) {
      navigate(getHomeRouteByRole(userRole));
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <ShieldOff className="w-10 h-10 text-destructive" />
      </div>
      
      <h1 className="text-xl font-bold text-foreground mb-2 text-center">
        Acesso não permitido
      </h1>
      
      <p className="text-muted-foreground text-sm text-center mb-8 max-w-xs">
        Você não tem permissão para acessar esta funcionalidade. 
        Entre em contato com o suporte se precisar de ajuda.
      </p>

      <Button onClick={handleVoltar} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Início
      </Button>
    </div>
  );
};

export default AcessoRestrito;
