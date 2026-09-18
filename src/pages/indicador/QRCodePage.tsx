import { ArrowLeft, Download, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import IndicadorBottomNav from "@/components/indicador/IndicadorBottomNav";
import { APP_NAME, APP_URL } from "@/config/app";

const QRCodePage = () => {
  const navigate = useNavigate();
  const codigoIndicador = "HARM-2024-001";
  const linkIndicacao = `https://${APP_URL}/indicacao/${codigoIndicador}`;

  const handleDownload = () => {
    const svg = document.getElementById("qrcode-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-${codigoIndicador}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "QR Code baixado!",
        description: "O arquivo foi salvo na sua pasta de downloads.",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${APP_NAME} - Meu QR Code`,
          text: `Escaneie meu QR Code e faça parte da ${APP_NAME}! Código: ${codigoIndicador}`,
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/indicador")}
            className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-primary-foreground text-xl font-semibold">Meu QR Code</h1>
            <p className="text-primary-foreground/80 text-sm">Compartilhe com seus contatos</p>
          </div>
        </div>
      </header>

      {/* QR Code Card */}
      <div className="px-5 -mt-4 relative z-10">
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            {/* QR Code Container */}
            <div className="bg-card rounded-2xl p-6 flex flex-col items-center">
              <div className="bg-primary/5 p-4 rounded-2xl mb-4">
                <QRCodeSVG
                  id="qrcode-svg"
                  value={linkIndicacao}
                  size={200}
                  level="H"
                  includeMargin={false}
                  fgColor="hsl(24, 95%, 53%)"
                  bgColor="transparent"
                />
              </div>

              <p className="text-center text-muted-foreground text-sm mb-2">
                Escaneie o código para acessar
              </p>
              <p className="text-center font-bold text-primary text-lg tracking-wide">
                {codigoIndicador}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2 border-primary/30 text-primary hover:bg-primary/10"
                onClick={handleDownload}
              >
                <Download className="w-5 h-5" />
                Baixar QR Code
              </Button>
              <Button className="flex-1 h-12 gap-2" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="shadow-card border-0 mt-4">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Como usar</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compartilhe o QR Code com amigos, familiares ou clientes
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ao escanear, eles acessam diretamente sua página de indicação
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Acompanhe suas indicações na seção "Minhas Indicações"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IndicadorBottomNav />
    </div>
  );
};

export default QRCodePage;
