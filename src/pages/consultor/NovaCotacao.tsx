import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Car, ChevronRight, Keyboard, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { buscarVeiculoPorPlaca } from "@/services/crmService";
import { usePermissoes } from "@/hooks/usePermissoes";

const NovaCotacao = () => {
  const navigate = useNavigate();
  const { podeCotar } = usePermissoes();
  const [searchType, setSearchType] = useState<"placa" | "manual">("placa");
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleBuscarPlaca = async () => {
    if (!placa || placa.length < 7) {
      toast.error("Digite uma placa válida");
      return;
    }

    setIsSearching(true);

    try {
      // Busca dados do veículo no CRM - ÚNICA fonte de dados
      // NÃO há fallback local - se falhar, exibe erro
      const result = await buscarVeiculoPorPlaca(placa);

      // Nunca acessa propriedades se a chamada falhou
      if (result.ok === false) {
        toast.error(result.message);
        return;
      }

      const veiculoCRM = result.data;

      // Valida resposta antes de navegar
      if (!veiculoCRM?.marca || !veiculoCRM?.modelo) {
        toast.error("Dados do veículo inválidos retornados pelo CRM.");
        return;
      }

      navigate("/consultor/cotacao/resultado", {
        state: {
          placa: veiculoCRM.placa ?? placa,
          marca: veiculoCRM.marca,
          modelo: veiculoCRM.modelo,
          ano: veiculoCRM.ano ?? new Date().getFullYear(),
        },
      });
    } catch (error: unknown) {
      // Proteção extra: não deixa nenhuma exceção escapar para o React
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Erro ao buscar veículo no CRM. Tente novamente.";
      toast.error(mensagemErro);
    } finally {
      setIsSearching(false);
    }
  };


  const handleBuscarManual = async () => {
    if (!marca || !modelo || !ano) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setIsSearching(true);
    // Navega direto para resultado - CRM será consultado na próxima tela
    navigate("/consultor/cotacao/resultado", {
      state: {
        marca,
        modelo,
        ano: parseInt(ano),
      },
    });
    setIsSearching(false);
  };

  // Se não tem permissão de cotar, mostra mensagem
  if (!podeCotar) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <ShieldX className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground text-center">
          Você não tem permissão para criar cotações.
        </p>
        <Button variant="outline" onClick={() => navigate("/consultor")}>
          Voltar para Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Premium */}
      <header className="relative bg-gradient-to-br from-primary via-primary to-primary/90 px-6 pt-14 pb-8 rounded-b-3xl shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50 rounded-b-3xl" />
        
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 border border-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-primary-foreground text-2xl font-bold tracking-tight">
              Nova Cotação
            </h1>
            <p className="text-primary-foreground/70 text-sm font-medium mt-1">
              Etapa 1 de 4 • Dados do Veículo
            </p>
          </div>
        </div>
      </header>

      {/* Barra de Progresso */}
      <div className="px-6 -mt-4">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/30">
          <div className="flex gap-2">
            <div className="flex-1 h-2 rounded-full bg-primary shadow-sm" />
            <div className="flex-1 h-2 rounded-full bg-muted/50" />
            <div className="flex-1 h-2 rounded-full bg-muted/50" />
            <div className="flex-1 h-2 rounded-full bg-muted/50" />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-semibold text-primary">Veículo</span>
            <span className="text-xs text-muted-foreground">CRM</span>
            <span className="text-xs text-muted-foreground">Cliente</span>
            <span className="text-xs text-muted-foreground">Resumo</span>
          </div>
        </div>
      </div>

      {/* Seletor de Tipo de Busca */}
      <div className="px-6 mt-6 mb-5">
        <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/30">
          <button
            onClick={() => setSearchType("placa")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              searchType === "placa"
                ? "bg-card text-foreground shadow-md border border-border/40"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Search className="w-4 h-4" />
            Por Placa
          </button>
          <button
            onClick={() => setSearchType("manual")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              searchType === "manual"
                ? "bg-card text-foreground shadow-md border border-border/40"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-6 pb-8">
        {searchType === "placa" ? (
          <Card className="bg-card border-border/30 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              {/* Ícone + Título */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Consulta por Placa
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Dados buscados diretamente no CRM
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Campo de Placa */}
                <div>
                  <Label htmlFor="placa" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                    Placa do Veículo
                  </Label>
                  <div className="relative mt-3">
                    <Input
                      id="placa"
                      placeholder="ABC1D23"
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                      maxLength={7}
                      className="h-16 text-2xl uppercase bg-muted/50 border-border/40 text-center font-bold tracking-[0.3em] rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                    {placa.length === 7 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-success" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Digite a placa no formato Mercosul ou antigo
                  </p>
                </div>

                {/* Botão Principal */}
                <Button
                  className="w-full h-16 text-base font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                  onClick={handleBuscarPlaca}
                  disabled={isSearching || placa.length < 7}
                >
                  {isSearching ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Consultando CRM...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5" />
                      <span>Buscar no CRM</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border/30 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {/* Campo Marca */}
              <div>
                <Label htmlFor="marca" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Marca
                </Label>
                <Input
                  id="marca"
                  placeholder="Ex: Volkswagen"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="mt-2 h-14 bg-muted/50 border-border/40 rounded-xl font-medium"
                />
              </div>

              {/* Campo Modelo */}
              <div>
                <Label htmlFor="modelo" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Modelo
                </Label>
                <Input
                  id="modelo"
                  placeholder="Ex: Gol 1.0"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="mt-2 h-14 bg-muted/50 border-border/40 rounded-xl font-medium"
                />
              </div>

              {/* Campo Ano */}
              <div>
                <Label htmlFor="ano" className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Ano
                </Label>
                <Input
                  id="ano"
                  type="number"
                  placeholder="Ex: 2022"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="mt-2 h-14 bg-muted/50 border-border/40 rounded-xl font-medium"
                />
              </div>

              {/* Botão Principal */}
              <Button
                className="w-full h-16 text-base font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:shadow-none mt-2"
                onClick={handleBuscarManual}
                disabled={isSearching || !marca || !modelo || !ano}
              >
                {isSearching ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Consultando CRM...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5" />
                    <span>Consultar CRM</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-muted/30 rounded-2xl border border-border/20">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            🔒 Os dados são consultados diretamente no CRM integrado.
            <br />
            Nenhuma informação é armazenada localmente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NovaCotacao;
