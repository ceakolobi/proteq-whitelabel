import ConsultorBottomNav from "@/components/consultor/ConsultorBottomNav";
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  aberta: { label: "Aberta", color: "text-primary", bg: "bg-primary/10", icon: Clock },
  em_analise: { label: "Em Análise", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Clock },
  proposta_enviada: { label: "Proposta Enviada", color: "text-blue-500", bg: "bg-blue-500/10", icon: FileText },
  aprovada: { label: "Aprovada", color: "text-success", bg: "bg-success/10", icon: CheckCircle },
  recusada: { label: "Recusada", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
};

const MinhasCotacoes = () => {
  const navigate = useNavigate();

  // Dados simulados - virão do CRM
  const cotacoes = [
    {
      id: "1",
      cliente: "João Silva",
      veiculo: "VW Gol 1.0",
      placa: "ABC1D23",
      valor: 189.9,
      status: "aberta" as const,
      data: "02/01/2026",
    },
    {
      id: "2",
      cliente: "Maria Santos",
      veiculo: "Fiat Uno",
      placa: "XYZ9F87",
      valor: 159.9,
      status: "proposta_enviada" as const,
      data: "01/01/2026",
    },
    {
      id: "3",
      cliente: "Pedro Costa",
      veiculo: "Honda Civic",
      placa: "QWE4R56",
      valor: 289.9,
      status: "aprovada" as const,
      data: "30/12/2025",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Minhas Cotações</h1>
            <p className="text-sm text-muted-foreground">{cotacoes.length} cotações</p>
          </div>
        </div>
      </header>

      {/* Lista de Cotações */}
      <div className="px-5 space-y-3">
        {cotacoes.map((cotacao) => {
          const status = statusConfig[cotacao.status];
          const StatusIcon = status.icon;
          
          return (
            <Card
              key={cotacao.id}
              className="bg-card border-border cursor-pointer transition-all hover:bg-muted/50"
              onClick={() => navigate(`/consultor/cotacao/${cotacao.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{cotacao.cliente}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cotacao.veiculo} • {cotacao.placa}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      R$ {cotacao.valor.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{cotacao.data}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConsultorBottomNav />
    </div>
  );
};

export default MinhasCotacoes;