import { ArrowLeft, User, Mail, Phone, LogOut, ChevronRight, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import IndicadorBottomNav from "@/components/indicador/IndicadorBottomNav";

const IndicadorPerfil = () => {
  const navigate = useNavigate();

  // Mock data - será substituído por dados reais
  const usuario = {
    nome: "João Silva",
    email: "joao.silva@email.com",
    telefone: "(11) 99999-0000",
    codigoIndicador: "HARM-2024-001",
  };

  const handleLogout = () => {
    toast({
      title: "Até logo!",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/login");
  };

  const menuItems = [
    {
      icon: User,
      label: "Dados pessoais",
      description: "Editar suas informações",
      onClick: () => {},
    },
    {
      icon: Mail,
      label: "Alterar e-mail",
      description: usuario.email,
      onClick: () => {},
    },
    {
      icon: Phone,
      label: "Alterar telefone",
      description: usuario.telefone,
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/indicador")}
            className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-primary-foreground text-xl font-semibold">Meu Perfil</h1>
            <p className="text-primary-foreground/80 text-sm">Gerencie sua conta</p>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <div className="px-5 -mt-4 relative z-10">
        <Card className="shadow-card border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-lg">{usuario.nome}</h2>
                <p className="text-sm text-muted-foreground">Indicador</p>
                <p className="text-xs text-primary font-medium mt-1">
                  Código: {usuario.codigoIndicador}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <Card className="shadow-card border-0 mt-4">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="shadow-card border-0 mt-4">
          <CardContent className="p-0">
            <button
              onClick={() => navigate("/indicador/aparencia")}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">Aparência</p>
                <p className="text-sm text-muted-foreground">Tema do aplicativo</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 mt-6 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </Button>
      </div>

      <IndicadorBottomNav />
    </div>
  );
};

export default IndicadorPerfil;
