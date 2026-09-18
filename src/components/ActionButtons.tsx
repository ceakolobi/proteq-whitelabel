import { FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActionButtons = () => {
  const navigate = useNavigate();

  const handleViewPlan = () => {
    // TODO: Navegar para página do plano quando implementada
    console.log("Visualizar plano");
  };

  return (
    <div className="px-4 mt-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Ação principal única */}
      <button 
        onClick={handleViewPlan}
        className="w-full bg-card hover:bg-secondary text-foreground rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.99] shadow-card border border-border/50 group"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all">
          <FileText className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-foreground font-semibold text-base">Visualizar meu plano</p>
          <p className="text-muted-foreground text-sm">Confira seus benefícios e coberturas</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </button>
    </div>
  );
};

export default ActionButtons;
