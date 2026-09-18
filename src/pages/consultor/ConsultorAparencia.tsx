import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import ConsultorBottomNav from "@/components/consultor/ConsultorBottomNav";

const ConsultorAparencia = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: "light" as const,
      label: "Claro",
      description: "Tema claro padrão",
      icon: Sun,
    },
    {
      id: "dark" as const,
      label: "Escuro",
      description: "Tema escuro premium",
      icon: Moon,
    },
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
          <h1 className="text-xl font-semibold text-foreground">Aparência</h1>
        </div>
      </header>

      <div className="px-5 space-y-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Escolha o tema do aplicativo
          </h2>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {themeOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`w-full flex items-center justify-between p-4 transition-colors hover:bg-muted/50 ${
                    index !== themeOptions.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <option.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-foreground font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                  {theme === option.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Sua preferência será salva automaticamente
        </p>
      </div>

      <ConsultorBottomNav />
    </div>
  );
};

export default ConsultorAparencia;
