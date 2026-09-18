import { User } from "lucide-react";

interface IndicadorHeaderProps {
  userName?: string;
}

const IndicadorHeader = ({ userName = "Indicador" }: IndicadorHeaderProps) => {
  return (
    <header className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Área do Indicador</p>
            <h1 className="text-primary-foreground text-xl font-semibold">Olá, {userName}!</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-primary-foreground text-lg">🔔</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default IndicadorHeader;
