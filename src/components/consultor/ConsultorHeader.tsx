import { Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ConsultorHeader = () => {
  const { user } = useAuth();
  const displayName = user?.nome?.split(" ")[0] || "Consultor";

  return (
    <header className="bg-primary px-5 pt-10 pb-4 rounded-b-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-primary-foreground text-lg font-semibold">
              Olá, {displayName} 👋
            </h1>
            <p className="text-primary-foreground/70 text-xs font-medium">Área do Consultor</p>
          </div>
        </div>
        <button className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center transition-colors hover:bg-primary-foreground/25">
          <Bell className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </header>
  );
};

export default ConsultorHeader;