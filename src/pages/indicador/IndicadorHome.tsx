import IndicadorHeader from "@/components/indicador/IndicadorHeader";
import IndicadorBottomNav from "@/components/indicador/IndicadorBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus, ClipboardList, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const IndicadorHome = () => {
  const navigate = useNavigate();
  const codigoIndicador = "HARM-2024-001";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigoIndicador);
    toast({
      title: "Código copiado!",
      description: "O código do indicador foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <IndicadorHeader userName="Carlos" />

      {/* Card com código do indicador */}
      <div className="px-5 -mt-4 relative z-10">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Seu código de indicador</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-bold text-primary tracking-wider">
                  {codigoIndicador}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <Copy className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Compartilhe este código com seus indicados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões de ação */}
      <div className="px-5 mt-6 space-y-3">
        {/* Criar Indicação */}
        <Button
          className="w-full h-14 text-lg font-semibold gap-3 rounded-xl"
          onClick={() => navigate("/indicador/nova-indicacao")}
        >
          <UserPlus className="w-6 h-6" />
          Criar Indicação
        </Button>

        {/* Minhas Indicações */}
        <Card
          className="shadow-card border-0 cursor-pointer transition-all duration-200 hover:shadow-md-custom active:scale-[0.99]"
          onClick={() => navigate("/indicador/minhas-indicacoes")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Minhas Indicações</h3>
                <p className="text-sm text-muted-foreground">Acompanhar status dos leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code de Indicação */}
        <Card
          className="shadow-card border-0 cursor-pointer transition-all duration-200 hover:shadow-md-custom active:scale-[0.99]"
          onClick={() => navigate("/indicador/qrcode")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">QR Code de Indicação</h3>
                <p className="text-sm text-muted-foreground">Compartilhar com contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IndicadorBottomNav />
    </div>
  );
};

export default IndicadorHome;
