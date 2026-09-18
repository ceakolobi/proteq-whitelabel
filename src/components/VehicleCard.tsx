import { CheckCircle2 } from "lucide-react";
import carImage from "@/assets/car-vehicle.png";

const VehicleCard = () => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-5 mx-4 -mt-4 relative z-10 animate-fade-in border border-border/50">
      <div className="flex items-center gap-4">
        <div className="w-24 h-18 rounded-xl overflow-hidden bg-secondary/50 flex items-center justify-center">
          <img 
            src={carImage} 
            alt="Seu veículo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Meu veículo</p>
          <h2 className="text-foreground text-base font-semibold mt-1 truncate">Honda HR-V</h2>
          <p className="text-muted-foreground text-sm">2023 • ABC-1234</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-success" />
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
