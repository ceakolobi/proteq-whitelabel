import { UserPlus, ClipboardList, Gift, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    icon: UserPlus,
    label: "Nova Indicação",
    description: "Indicar um novo lead",
    route: "/indicador/nova-indicacao",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ClipboardList,
    label: "Minhas Indicações",
    description: "Acompanhar status dos leads",
    route: "/indicador/minhas-indicacoes",
    color: "bg-success/10 text-success",
  },
  {
    icon: Trophy,
    label: "Pontuação",
    description: "Em breve",
    route: "#",
    color: "bg-muted text-muted-foreground",
    disabled: true,
  },
  {
    icon: Gift,
    label: "Premiação",
    description: "Em breve",
    route: "#",
    color: "bg-muted text-muted-foreground",
    disabled: true,
  },
];

const IndicadorMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="px-5 mt-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Funções</h2>
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item, index) => (
          <Card
            key={index}
            className={`shadow-card border-0 cursor-pointer transition-all duration-200 ${
              item.disabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:shadow-md-custom active:scale-[0.98]"
            }`}
            onClick={() => !item.disabled && navigate(item.route)}
          >
            <CardContent className="p-4">
              <div
                className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-3`}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IndicadorMenu;
