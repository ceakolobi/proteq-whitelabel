import { Calculator, Receipt, MapPin, Users, Gift, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: Calculator, label: "Cotação", description: "Simule seu plano", path: "/cotacao" },
  { icon: Receipt, label: "2ª via de boletos", description: "Acesse seus pagamentos", path: "/boletos" },
  { icon: MapPin, label: "Rastreamento", description: "Localize seu veículo", path: "/rastreamento" },
  { icon: Users, label: "Indicação", description: "Indique e ganhe", path: "/indicacao" },
  { icon: Gift, label: "Vantagens e benefícios", description: "Descontos exclusivos", path: "/vantagens" },
];

const MenuList = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 mt-6 pb-32 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h3 className="text-foreground font-semibold text-sm mb-4 uppercase tracking-wide text-muted-foreground">Serviços</h3>
      <div className="space-y-2.5">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="w-full bg-card hover:bg-secondary/50 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.99] border border-border/40 group"
            style={{ animationDelay: `${0.3 + index * 0.05}s` }}
          >
            <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-foreground font-medium text-sm">{item.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuList;
