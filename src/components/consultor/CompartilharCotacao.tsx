import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Check, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CompartilharCotacaoProps {
  token: string;
  veiculoModelo: string;
}

const CompartilharCotacao = ({ token, veiculoModelo }: CompartilharCotacaoProps) => {
  const { toast } = useToast();
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const cotacaoUrl = `${baseUrl}/cotacao/${token}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cotacaoUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link da cotação foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cotação - ${veiculoModelo}`,
          text: `Confira a cotação de proteção veicular para ${veiculoModelo}`,
          url: cotacaoUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Olá! Segue a cotação de proteção veicular para o ${veiculoModelo}:\n\n${cotacaoUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <>
      {/* Share Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-12"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartilhar Cotação
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-11"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-success" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copiado!" : "Copiar Link"}
          </Button>
          
          <Button
            variant="outline"
            className="h-11"
            onClick={() => setShowQRDialog(true)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
        </div>

        <Button
          variant="secondary"
          className="w-full h-11"
          onClick={handleWhatsAppShare}
        >
          <svg 
            className="w-5 h-5 mr-2" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Enviar por WhatsApp
        </Button>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">QR Code da Cotação</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCodeSVG
                value={cotacaoUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Escaneie o QR Code para acessar a cotação
            </p>
            
            <p className="text-xs text-muted-foreground mt-2 font-mono bg-secondary px-3 py-1 rounded">
              {veiculoModelo}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowQRDialog(false)}
            >
              Fechar
            </Button>
            <Button
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompartilharCotacao;