import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, LogOut, ChevronRight, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ConsultorBottomNav from "@/components/consultor/ConsultorBottomNav";

const ConsultorPerfil = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileItems = [
    { icon: User, label: "Nome", value: user?.nome || "Consultor" },
    { icon: Mail, label: "Email", value: user?.email || "consultor@harmony.com" },
    { icon: Phone, label: "Telefone", value: user?.telefone || "(11) 99999-9999" },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Meu Perfil</h1>
        </div>
      </header>

      <div className="px-5 space-y-6">
        {/* Avatar e Nome */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{user?.nome || "Consultor"}</h2>
          <span className="text-sm text-muted-foreground mt-1 px-3 py-1 bg-primary/10 rounded-full">
            Consultor
          </span>
        </div>

        {/* Informações */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {profileItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 ${
                  index !== profileItems.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-foreground font-medium">{item.value}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="bg-card border-border mt-4">
          <CardContent className="p-0">
            <button
              onClick={() => navigate("/consultor/aparencia")}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Palette className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Aparência</p>
                  <p className="text-xs text-muted-foreground">Tema do aplicativo</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Botão Sair */}
        <Button
          variant="outline"
          className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da Conta
        </Button>
      </div>

      <ConsultorBottomNav />
    </div>
  );
};

export default ConsultorPerfil;