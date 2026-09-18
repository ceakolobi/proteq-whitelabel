import { useState } from "react";
import { ArrowLeft, Send, User, Phone, MapPin, Car, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import IndicadorBottomNav from "@/components/indicador/IndicadorBottomNav";

const tiposVeiculo = [
  { value: "carro", label: "Carro" },
  { value: "moto", label: "Moto" },
  { value: "caminhao", label: "Caminhão" },
  { value: "van", label: "Van/Utilitário" },
];

const NovaIndicacao = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    cidade: "",
    tipoVeiculo: "",
    observacao: "",
  });

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value.slice(0, 15);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      telefone: formatPhone(e.target.value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.telefone || !formData.cidade || !formData.tipoVeiculo) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simula envio para API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Indicação enviada! 🎉",
      description: "Sua indicação foi registrada com sucesso.",
    });

    setIsSubmitting(false);
    navigate("/indicador/minhas-indicacoes");
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
            <h1 className="text-primary-foreground text-xl font-semibold">Nova Indicação</h1>
            <p className="text-primary-foreground/80 text-sm">Preencha os dados do lead</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="px-5 -mt-4 relative z-10">
        <Card className="shadow-card border-0">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-foreground font-medium">
                  Nome do indicado *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    className="pl-10 h-12"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-foreground font-medium">
                  Telefone / WhatsApp *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    className="pl-10 h-12"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              {/* Cidade/Estado */}
              <div className="space-y-2">
                <Label htmlFor="cidade" className="text-foreground font-medium">
                  Cidade / Estado *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo - SP"
                    className="pl-10 h-12"
                    value={formData.cidade}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>
              </div>

              {/* Tipo de Veículo */}
              <div className="space-y-2">
                <Label htmlFor="tipoVeiculo" className="text-foreground font-medium">
                  Tipo de veículo *
                </Label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select
                    value={formData.tipoVeiculo}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, tipoVeiculo: value }))
                    }
                  >
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposVeiculo.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observação */}
              <div className="space-y-2">
                <Label htmlFor="observacao" className="text-foreground font-medium">
                  Observação{" "}
                  <span className="text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Textarea
                    id="observacao"
                    placeholder="Alguma informação adicional..."
                    className="pl-10 min-h-[100px] resize-none"
                    value={formData.observacao}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, observacao: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar indicação
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <IndicadorBottomNav />
    </div>
  );
};

export default NovaIndicacao;
