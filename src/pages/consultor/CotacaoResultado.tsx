import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Car, Shield, Check, ChevronRight, Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  buscarCotacaoCRM, 
  recalcularCotacaoCRM,
  type CotacaoCRMResponse
} from "@/services/crmService";

interface VeiculoData {
  placa?: string;
  marca: string;
  modelo: string;
  ano: number;
}

const CotacaoResultado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const veiculo = (location.state as VeiculoData | null | undefined) ?? null;

  // Estado da cotação vindo EXCLUSIVAMENTE do CRM
  const [cotacaoData, setCotacaoData] = useState<CotacaoCRMResponse | null>(null);
  const [beneficiosSelecionados, setBeneficiosSelecionados] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculando, setIsRecalculando] = useState(false);
  const [mensalidadeAtual, setMensalidadeAtual] = useState<number>(0); // SOMENTE LEITURA - vem do CRM
  const [erroCRM, setErroCRM] = useState<string | null>(null);

  // Busca cotação do CRM ao carregar - SEM CACHE, SEM FALLBACK
  useEffect(() => {
    const carregarCotacaoCRM = async () => {
      if (!veiculo) return;
      
      setIsLoading(true);
      setErroCRM(null);
      
      try {
        // Busca dados do CRM - ÚNICA fonte de verdade
        // NÃO há fallback local - se falhar, exibe erro
        const result = await buscarCotacaoCRM({
          placa: veiculo.placa,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: veiculo.ano,
        });

        if (result.ok === false) {
          setErroCRM(result.message);
          toast.error(result.message);
          return;
        }

        const dadosCRM = result.data;
        setCotacaoData(dadosCRM);
        // Mensalidade é SOMENTE LEITURA - valor definido pelo CRM
        setMensalidadeAtual(dadosCRM.mensalidade);
      } catch (error) {
        const mensagemErro =
          error instanceof Error
            ? error.message
            : "Sistema em manutenção. Integração com CRM indisponível.";
        setErroCRM(mensagemErro);
        toast.error(mensagemErro);
      } finally {
        setIsLoading(false);
      }
    };

    carregarCotacaoCRM();
  }, [veiculo]);

  // Recalcula no CRM quando benefícios são alterados
  // O APP NÃO faz cálculo - apenas envia ao CRM e exibe resultado
  const handleToggleBeneficio = useCallback(async (beneficioId: string) => {
    if (!cotacaoData || !veiculo) return;
    
    // Verifica se o benefício pode ser selecionado (definido pelo CRM)
    const beneficio = (cotacaoData.beneficiosAdicionais ?? []).find(
      (b) => b.id === beneficioId
    );
    if (!beneficio?.permitidoSelecao) {
      toast.error("Este benefício não pode ser alterado");
      return;
    }

    const novaSelecao = beneficiosSelecionados.includes(beneficioId)
      ? beneficiosSelecionados.filter(id => id !== beneficioId)
      : [...beneficiosSelecionados, beneficioId];
    
    setBeneficiosSelecionados(novaSelecao);
    setIsRecalculando(true);
    
    try {
      // Envia ao CRM para recálculo
      // O CRM é a ÚNICA fonte de cálculo - o APP não soma valores
      const result = await recalcularCotacaoCRM({
        veiculoPlaca: veiculo.placa,
        veiculoMarca: veiculo.marca,
        veiculoModelo: veiculo.modelo,
        veiculoAno: veiculo.ano,
        beneficiosAdicionaisSelecionados: novaSelecao,
      });

      if (result.ok === false) {
        toast.error(result.message);
        // Reverte seleção em caso de erro - NÃO usa fallback local
        setBeneficiosSelecionados(beneficiosSelecionados);
        return;
      }

      const resultado = result.data;
      // Mensalidade recalculada pelo CRM - SOMENTE LEITURA
      setMensalidadeAtual(resultado.mensalidade);
      toast.success("Valor atualizado pelo CRM");
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Sistema em manutenção. Integração com CRM indisponível.";
      toast.error(mensagemErro);
      // Reverte seleção em caso de erro - NÃO usa fallback local
      setBeneficiosSelecionados(beneficiosSelecionados);
    } finally {
      setIsRecalculando(false);
    }
  }, [cotacaoData, veiculo, beneficiosSelecionados]);

  // Recarrega dados do CRM - SEM CACHE, SEM FALLBACK
  const handleRecarregar = async () => {
    if (!veiculo) return;
    
    setIsLoading(true);
    setErroCRM(null);
    
    try {
      // Busca dados frescos do CRM - ÚNICA fonte de verdade
      const result = await buscarCotacaoCRM({
        placa: veiculo.placa,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
      });

      if (result.ok === false) {
        setErroCRM(result.message);
        toast.error(result.message);
        return;
      }

      const dadosCRM = result.data;
      setCotacaoData(dadosCRM);
      // Mensalidade é SOMENTE LEITURA - definida pelo CRM
      setMensalidadeAtual(dadosCRM.mensalidade);
      setBeneficiosSelecionados([]);
      toast.success("Dados atualizados do CRM");
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Sistema em manutenção. Integração com CRM indisponível.";
      setErroCRM(mensagemErro);
      toast.error(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinuar = () => {
    if (!cotacaoData) return;

    const beneficiosAdicionaisSelecionados = (cotacaoData.beneficiosAdicionais ?? []).filter(
      (b) => beneficiosSelecionados.includes(b.id)
    );
    
    navigate("/consultor/cotacao/dados-cliente", {
      state: {
        veiculo,
        cotacao: {
          valorFipe: cotacaoData.valorFipe,
          faixaFipe: cotacaoData.faixaFipe,
          cotaAplicada: cotacaoData.cotaAplicada,
          mensalidade: mensalidadeAtual,
          beneficiosInclusos: cotacaoData.beneficiosInclusos,
          beneficiosAdicionaisSelecionados,
          validadeDias: cotacaoData.validadeDias,
        },
      },
    });
  };

  if (!veiculo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Dados não encontrados</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Consultando CRM...</p>
      </div>
    );
  }

  // Exibe erro quando CRM não está disponível - SEM FALLBACK
  if (!cotacaoData || erroCRM) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground text-center">
          CRM Indisponível
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {erroCRM || "Não foi possível carregar os dados da cotação do CRM. Todas as cotas e valores são definidos exclusivamente pelo CRM."}
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button onClick={handleRecarregar}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/70 mt-4 text-center">
          O APP não possui dados de cotação locais.<br />
          Configure o endpoint do CRM para continuar.
        </p>
      </div>
    );
  }

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
          <div className="flex-1">
            <h1 className="text-primary-foreground text-lg font-semibold">Dados do CRM</h1>
            <p className="text-primary-foreground/70 text-xs font-medium">Etapa 2 de 4 - Retorno do CRM</p>
          </div>
          <button
            onClick={handleRecarregar}
            disabled={isLoading}
            className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-primary-foreground ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Progresso */}
      <div className="px-5 mt-5 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-muted" />
          <div className="flex-1 h-1.5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Card do Veículo */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {veiculo.marca} {veiculo.modelo}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {veiculo.ano} {veiculo.placa && `• ${veiculo.placa}`}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-success/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores FIPE (retornados pelo CRM) */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Dados retornados pelo CRM
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Valor FIPE</p>
                <p className="text-lg font-bold text-foreground">
                  {typeof cotacaoData.valorFipe === "number"
                    ? `R$ ${cotacaoData.valorFipe.toLocaleString("pt-BR")}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Faixa</p>
                <p className="text-lg font-bold text-foreground">
                  {cotacaoData.faixaFipe}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cota e Mensalidade (somente leitura - valor do CRM) */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Cota Aplicada</p>
                <p className="font-semibold text-foreground">{cotacaoData.cotaAplicada}</p>
              </div>
            </div>
            <div className="bg-card rounded-xl p-4 text-center relative">
              {isRecalculando && (
                <div className="absolute inset-0 bg-card/80 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Mensalidade (calculada pelo CRM)</p>
              <p className="text-3xl font-bold text-primary mt-1">
                R$ {mensalidadeAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios INCLUSOS (fixos - definidos pelo CRM) */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Benefícios Inclusos na Cota
            </h3>
            <div className="space-y-2.5">
              {(cotacaoData.beneficiosInclusos ?? []).map((beneficio) => (
                <div key={beneficio.id} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{beneficio.nome}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              Benefícios fixos definidos pelo CRM para esta cota.
            </p>
          </CardContent>
        </Card>

        {/* Benefícios ADICIONAIS (opcionais - permitidos pelo CRM) */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Benefícios Adicionais (Opcionais)
              </h3>
            </div>
            <div className="space-y-3">
              {(cotacaoData.beneficiosAdicionais ?? []).map((beneficio) => (
                <div
                  key={beneficio.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    !beneficio.permitidoSelecao 
                      ? "opacity-50 cursor-not-allowed bg-muted/20 border-border/20"
                      : beneficiosSelecionados.includes(beneficio.id)
                        ? "bg-primary/5 border-primary/30 cursor-pointer"
                        : "bg-muted/30 border-border/40 hover:border-border cursor-pointer"
                  }`}
                  onClick={() => beneficio.permitidoSelecao && handleToggleBeneficio(beneficio.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={beneficiosSelecionados.includes(beneficio.id)}
                      disabled={isRecalculando || !beneficio.permitidoSelecao}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{beneficio.nome}</p>
                        {beneficio.impactaValor && beneficio.valorAdicional && (
                          <span className="text-xs font-semibold text-primary whitespace-nowrap">
                            +R$ {beneficio.valorAdicional.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{beneficio.descricao}</p>
                      {!beneficio.impactaValor && (
                        <span className="text-[10px] text-success font-medium">Sem custo adicional</span>
                      )}
                      {!beneficio.permitidoSelecao && (
                        <span className="text-[10px] text-destructive font-medium">Não disponível</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              Selecione os benefícios desejados. O valor é recalculado pelo CRM.
            </p>
          </CardContent>
        </Card>

        {/* Aviso de valor controlado pelo CRM */}
        <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-3">
          <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Todos os valores e regras são definidos pelo CRM. O APP apenas exibe e envia seleções.
          </p>
        </div>

        {/* Botão Continuar */}
        <Button
          className="w-full h-14 text-base font-semibold gradient-primary mt-4"
          onClick={handleContinuar}
          disabled={isRecalculando}
        >
          {isRecalculando ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recalculando...
            </>
          ) : (
            <>
              Continuar para Dados do Cliente
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CotacaoResultado;
