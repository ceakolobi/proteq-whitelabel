import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Car, Shield, Check, FileText, CheckCircle2, User, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CompartilharCotacao from "@/components/consultor/CompartilharCotacao";

interface ResumoData {
  veiculo: {
    placa?: string;
    marca: string;
    modelo: string;
    ano: number;
  };
  cotacao: {
    valorFipe: number;
    faixaFipe: string;
    cotaAplicada: string;
    mensalidade: number;
    beneficios: string[];
  };
  cliente: {
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
  };
  consultor: {
    id: string;
    regional_id: string;
    regional_nome: string;
  };
}

interface CotacaoCriada {
  id: string;
  token_compartilhamento: string;
}

const CotacaoResumo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as ResumoData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cotacaoCriada, setCotacaoCriada] = useState<CotacaoCriada | null>(null);

  const handleGerarCotacao = async () => {
    if (!data?.consultor?.id) {
      toast.error("Consultor não identificado. Faça login novamente.");
      return;
    }

    if (!data?.cliente) {
      toast.error("Dados do cliente não encontrados.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: cotacao, error } = await supabase
        .from("cotacoes")
        .insert({
          consultor_id: data.consultor.id,
          cliente_nome: data.cliente.nome,
          cliente_cpf: data.cliente.cpf,
          cliente_telefone: data.cliente.telefone,
          cliente_email: data.cliente.email,
          veiculo_modelo: `${data.veiculo.marca} ${data.veiculo.modelo}`,
          veiculo_placa: data.veiculo.placa || "",
          veiculo_ano: data.veiculo.ano,
          valor_mensal: data.cotacao.mensalidade,
          status: "aberta",
        })
        .select("id, token_compartilhamento")
        .single();

      if (error) throw error;

      toast.success("Cotação gerada com sucesso!", {
        description: `ID: ${cotacao.id.slice(0, 8)}...`,
      });
      
      // Salvar cotação criada para exibir compartilhamento
      setCotacaoCriada(cotacao);
    } catch (error) {
      console.error("Erro ao gerar cotação:", error);
      toast.error("Erro ao gerar cotação. Verifique se você está autenticado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Dados não encontrados</p>
      </div>
    );
  }

  const { veiculo, cotacao, cliente } = data;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-primary px-5 pt-10 pb-4 rounded-b-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-primary-foreground text-lg font-semibold">Resumo</h1>
            <p className="text-primary-foreground/70 text-xs font-medium">Etapa 4 de 4 - Confirmar cotação</p>
          </div>
        </div>
      </header>

      {/* Progresso */}
      <div className="px-5 mt-5 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Card Principal - Valor */}
        <Card className="bg-primary border-0 shadow-glow overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Valor Mensal</p>
            <p className="text-4xl font-bold text-primary-foreground mt-2">
              R$ {cotacao.mensalidade.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground text-sm font-medium">
                {cotacao.cotaAplicada}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Cliente */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <User className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{cliente.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {cliente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cliente.telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")} • {cliente.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Veículo */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Car className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {veiculo.marca} {veiculo.modelo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {veiculo.ano} {veiculo.placa && `• ${veiculo.placa}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Detalhes</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor FIPE</span>
                <span className="text-sm font-semibold text-foreground">
                  R$ {cotacao.valorFipe.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Faixa FIPE</span>
                <span className="text-sm font-semibold text-foreground">{cotacao.faixaFipe}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cota</span>
                <span className="text-sm font-semibold text-foreground">{cotacao.cotaAplicada}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Benefícios Inclusos</h3>
            <div className="space-y-2.5">
              {cotacao.beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{beneficio}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Botão Gerar Cotação ou Compartilhamento */}
        {!cotacaoCriada ? (
          <Button
            className="w-full h-14 text-base font-semibold gradient-primary mt-4"
            onClick={handleGerarCotacao}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Gerar Cotação
              </>
            )}
          </Button>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Sucesso */}
            <Card className="bg-success/10 border-success/30">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-success">Cotação Gerada!</p>
                  <p className="text-sm text-success/80">
                    ID: {cotacaoCriada.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Compartilhamento */}
            <Card className="bg-card border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Share2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Compartilhar Cotação</h3>
                </div>
                <CompartilharCotacao
                  token={cotacaoCriada.token_compartilhamento}
                  veiculoModelo={`${veiculo.marca} ${veiculo.modelo}`}
                />
              </CardContent>
            </Card>

            {/* Próximo passo: adesão + vistoria acontecem no painel */}
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Próximo passo: adesão + vistoria</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Para finalizar a adesão do cliente e enviar o link de vistoria, acesse o painel Harmony.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Voltar para cotações */}
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => navigate("/consultor/cotacoes")}
            >
              Ver Minhas Cotações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CotacaoResumo;
