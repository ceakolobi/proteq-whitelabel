import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, Car, Check, Clock, Phone, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface CotacaoPublica {
  id: string;
  veiculo_modelo: string;
  veiculo_placa: string;
  veiculo_ano: number | null;
  valor_mensal: number | null;
  validade_cotacao: string;
  status: string;
  cliente_nome: string;
  consultor_id: string;
}

interface ConsultorInfo {
  nome: string;
  telefone: string | null;
}

const beneficios = [
  "Proteção contra roubo e furto",
  "Assistência 24 horas",
  "Carro reserva por 7 dias",
  "Proteção para terceiros",
  "Vidros e retrovisores",
  "Rastreamento veicular",
];

const CotacaoPublica = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [cotacao, setCotacao] = useState<CotacaoPublica | null>(null);
  const [consultor, setConsultor] = useState<ConsultorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expirada, setExpirada] = useState(false);

  useEffect(() => {
    const fetchCotacao = async () => {
      if (!token) {
        setError("Link inválido");
        setLoading(false);
        return;
      }

      try {
        // Buscar cotação pelo token
        const { data: cotacaoData, error: cotacaoError } = await supabase
          .from("cotacoes")
          .select("id, veiculo_modelo, veiculo_placa, veiculo_ano, valor_mensal, validade_cotacao, status, cliente_nome, consultor_id")
          .eq("token_compartilhamento", token)
          .maybeSingle();

        if (cotacaoError) throw cotacaoError;

        if (!cotacaoData) {
          setError("Cotação não encontrada");
          setLoading(false);
          return;
        }

        // Verificar validade
        const validade = new Date(cotacaoData.validade_cotacao);
        if (validade < new Date()) {
          setExpirada(true);
        }

        setCotacao(cotacaoData);

        // Buscar dados do consultor
        const { data: consultorData } = await supabase
          .from("profiles")
          .select("nome, telefone")
          .eq("id", cotacaoData.consultor_id)
          .maybeSingle();

        if (consultorData) {
          setConsultor(consultorData);
        }
      } catch (err) {
        console.error("Erro ao buscar cotação:", err);
        setError("Erro ao carregar cotação");
      } finally {
        setLoading(false);
      }
    };

    fetchCotacao();
  }, [token]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleWhatsApp = () => {
    if (!consultor?.telefone) return;
    const phone = consultor.telefone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá! Vi a cotação do veículo ${cotacao?.veiculo_modelo} e tenho interesse em contratar.`
    );
    window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
  };

  const handleContratar = () => {
    if (!consultor?.telefone) return;
    const phone = consultor.telefone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Olá! Quero contratar a proteção para o veículo ${cotacao?.veiculo_modelo} (${cotacao?.veiculo_placa}). Cotação: ${cotacao?.id?.slice(0, 8)}`
    );
    window.open(`https://wa.me/55${phone}?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">{error}</h1>
        <p className="text-muted-foreground text-center mb-6">
          O link que você acessou é inválido ou expirou.
        </p>
        <Button onClick={() => navigate("/login")}>Ir para o início</Button>
      </div>
    );
  }

  if (!cotacao) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary-foreground mb-1">
            Cotação de Proteção Veicular
          </h1>
          {consultor && (
            <p className="text-primary-foreground/70 text-sm">
              Consultor: {consultor.nome}
            </p>
          )}
        </div>
      </div>

      {/* Alerta de Expiração */}
      {expirada && (
        <div className="mx-4 -mt-4 mb-4">
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Cotação expirada</p>
                <p className="text-sm text-destructive/80">
                  Entre em contato para uma nova cotação
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Veículo */}
      <div className="px-4 -mt-4">
        <Card className="bg-card border-border/40 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center">
                <Car className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-foreground">
                  {cotacao.veiculo_modelo}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Placa: {cotacao.veiculo_placa}
                  {cotacao.veiculo_ano && ` • Ano: ${cotacao.veiculo_ano}`}
                </p>
              </div>
            </div>

            {/* Valor */}
            {cotacao.valor_mensal && !expirada && (
              <div className="bg-primary/5 rounded-xl p-4 text-center border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">
                  Investimento mensal
                </p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(cotacao.valor_mensal)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  /mês
                </p>
              </div>
            )}

            {/* Validade */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                Válida até {formatDate(cotacao.validade_cotacao)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefícios */}
      <div className="px-4 mt-6">
        <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
          Benefícios inclusos
        </h3>
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <div className="space-y-3">
              {beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-foreground text-sm">{beneficio}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Badge */}
      <div className="px-4 mt-4 flex justify-center">
        <Badge variant="outline" className="text-xs">
          Cotação #{cotacao.id.slice(0, 8).toUpperCase()}
        </Badge>
      </div>

      {/* CTAs */}
      {!expirada && (
        <div className="px-4 mt-6 pb-8 space-y-3">
          <Button 
            className="w-full h-14 text-base font-semibold"
            onClick={handleContratar}
          >
            Quero Contratar
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Falar com Consultor
          </Button>
        </div>
      )}

      {expirada && consultor?.telefone && (
        <div className="px-4 mt-6 pb-8">
          <Button 
            className="w-full h-14"
            onClick={handleWhatsApp}
          >
            <Phone className="w-5 h-5 mr-2" />
            Solicitar Nova Cotação
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          Proteção veicular • Segurança para você e sua família
        </p>
      </div>
    </div>
  );
};

export default CotacaoPublica;