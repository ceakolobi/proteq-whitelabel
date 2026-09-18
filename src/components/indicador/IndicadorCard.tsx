import { Copy, QrCode, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { APP_NAME, APP_URL } from "@/config/app";

interface IndicadorCardProps {
  codigoIndicador?: string;
}

const IndicadorCard = ({ codigoIndicador = "HARM-2024-001" }: IndicadorCardProps) => {
  const navigate = useNavigate();
  const linkIndicacao = `https://${APP_URL}/indicacao/${codigoIndicador}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigoIndicador);
    toast({
      title: "Código copiado!",
      description: "O código do indicador foi copiado para a área de transferência.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${APP_NAME} - Indicação`,
          text: `Faça parte da ${APP_NAME}! Use meu código de indicação: ${codigoIndicador}`,
          url: linkIndicacao,
        });
      } catch (error) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkIndicacao);
    toast({
      title: "Link copiado!",
      description: "O link de indicação foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="px-5 -mt-4 relative z-10">
      <Card className="shadow-card border-0 bg-card overflow-hidden">
        <CardContent className="p-5">
          <div className="text-center mb-4">
            <p className="text-muted-foreground text-sm mb-1">Seu código de indicador</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-primary tracking-wide">
                {codigoIndicador}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => navigate("/indicador/qrcode")}
            >
              <QrCode className="w-5 h-5" />
              Ver QR Code
            </Button>
            <Button
              className="flex-1 h-12 gap-2 bg-primary hover:bg-primary/90"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndicadorCard;
