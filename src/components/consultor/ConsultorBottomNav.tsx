import { Home, FileText, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/consultor" },
  { icon: FileText, label: "Cotações", path: "/consultor/cotacoes" },
  { icon: User, label: "Perfil", path: "/consultor/perfil" },
];

const ConsultorBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-pb z-50">
      <div className="flex justify-around items-center h-16 px-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-200 ${
                isActive ? "bg-primary/10" : ""
              }`}>
                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              </div>
              <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ConsultorBottomNav;