import { CheckCircle2, ChevronRight } from "lucide-react";

const FinancialStatus = () => {
  return (
    <button 
      className="mx-4 mt-4 bg-success/10 dark:bg-success/15 rounded-xl p-4 flex items-center justify-between animate-fade-in cursor-pointer hover:bg-success/15 dark:hover:bg-success/20 transition-colors border border-success/20 w-[calc(100%-2rem)]"
      style={{ animationDelay: "0.2s" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
        <div className="text-left">
          <p className="text-success font-semibold text-sm">Mensalidade em dia</p>
          <p className="text-muted-foreground text-xs">Visualizar histórico</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-success/60" />
    </button>
  );
};

export default FinancialStatus;
