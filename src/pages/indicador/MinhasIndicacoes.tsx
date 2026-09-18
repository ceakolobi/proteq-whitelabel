import { ArrowLeft, Phone, MapPin, Car, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IndicadorBottomNav from "@/components/indicador/IndicadorBottomNav";

type StatusIndicacao = "novo" | "em_contato" | "em_negociacao" | "fechado" | "nao_concluido";

interface Indicacao {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  tipoVeiculo: string;
  status: StatusIndicacao;
  dataIndicacao: string;
}

const statusConfig: Record<StatusIndicacao, { label: string; className: string }> = {
  novo: {
    label: "Novo",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  em_contato: {
    label: "Em contato",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  em_negociacao: {
    label: "Em negociação",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  fechado: {
    label: "Fechado",
    className: "bg-success/10 text-success border-success/20",
  },
  nao_concluido: {
    label: "Não concluído",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

// Mock data - será substituído por dados reais
const mockIndicacoes: Indicacao[] = [
  {
    id: "1",
    nome: "Maria Silva",
    telefone: "(11) 99999-1234",
    cidade: "São Paulo - SP",
    tipoVeiculo: "Carro",
    status: "em_negociacao",
    dataIndicacao: "15/01/2024",
  },
  {
    id: "2",
    nome: "Carlos Santos",
    telefone: "(21) 98888-5678",
    cidade: "Rio de Janeiro - RJ",
    tipoVeiculo: "Moto",
    status: "novo",
    dataIndicacao: "14/01/2024",
  },
  {
    id: "3",
    nome: "Ana Oliveira",
    telefone: "(31) 97777-9012",
    cidade: "Belo Horizonte - MG",
    tipoVeiculo: "Carro",
    status: "fechado",
    dataIndicacao: "10/01/2024",
  },
  {
    id: "4",
    nome: "Pedro Costa",
    telefone: "(41) 96666-3456",
    cidade: "Curitiba - PR",
    tipoVeiculo: "Van/Utilitário",
    status: "em_contato",
    dataIndicacao: "08/01/2024",
  },
  {
    id: "5",
    nome: "Luciana Ferreira",
    telefone: "(51) 95555-7890",
    cidade: "Porto Alegre - RS",
    tipoVeiculo: "Carro",
    status: "nao_concluido",
    dataIndicacao: "05/01/2024",
  },
];

const MinhasIndicacoes = () => {
  const navigate = useNavigate();

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
            <h1 className="text-primary-foreground text-xl font-semibold">Minhas Indicações</h1>
            <p className="text-primary-foreground/80 text-sm">
              {mockIndicacoes.length} leads registrados
            </p>
          </div>
        </div>
      </header>

      {/* Indicações List */}
      <div className="px-5 mt-6 space-y-3">
        {mockIndicacoes.map((indicacao) => (
          <Card key={indicacao.id} className="shadow-card border-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground text-lg">{indicacao.nome}</h3>
                <Badge variant="outline" className={statusConfig[indicacao.status].className}>
                  {statusConfig[indicacao.status].label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{indicacao.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{indicacao.cidade}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="w-4 h-4" />
                  <span className="text-sm">{indicacao.tipoVeiculo}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Indicado em {indicacao.dataIndicacao}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <IndicadorBottomNav />
    </div>
  );
};

export default MinhasIndicacoes;
