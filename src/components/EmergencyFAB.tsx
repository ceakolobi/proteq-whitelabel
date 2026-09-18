import { Phone } from "lucide-react";

const EmergencyFAB = () => {
  const handleEmergencyCall = () => {
    // Ação de emergência - pode abrir modal ou ligar diretamente
    window.location.href = "tel:0800123456";
  };

  return (
    <button
      onClick={handleEmergencyCall}
      className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 animate-fade-in"
      aria-label="Assistência 24h - Emergência"
    >
      <Phone className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive-foreground rounded-full animate-pulse" />
    </button>
  );
};

export default EmergencyFAB;
