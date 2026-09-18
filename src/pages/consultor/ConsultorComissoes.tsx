import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useQuery } from "@tanstack/react-query";
import ConsultorBottomNav from "@/components/consultor/ConsultorBottomNav";

interface Comissao {
  id: string;
  cliente_nome: string;
  tipo: "inicial" | "recorrente";
  valor: number;
  status: "pendente" | "aprovada" | "paga" | "cancelada";
  mes_referencia: string;
  data_pagamento: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  aprovada: { label: "Aprovada", variant: "default", icon: CheckCircle },
  paga: { label: "Paga", variant: "default", icon: DollarSign },
  cancelada: { label: "Cancelada", variant: "destructive", icon: AlertCircle },
};

const tipoLabels: Record<string, string> = {
  inicial: "Inicial",
  recorrente: "Recorrente",
};

const ConsultorComissoes = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { podeVerComissoes } = usePermissoes();
  const [activeTab, setActiveTab] = useState("todas");

  // Fetch comissões do consultor
  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ["consultor-comissoes", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("consultor_comissoes")
        .select("*")
        .eq("consultor_id", session.user.id)
        .order("mes_referencia", { ascending: false });
      
      if (error) throw error;
      return data as Comissao[];
    },
    enabled: !!session?.user?.id,
  });

  // Calcular totais
  const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const totalMes = comissoes
    .filter((c) => c.mes_referencia.startsWith(mesAtual) && c.status !== "cancelada")
    .reduce((sum, c) => sum + Number(c.valor), 0);
  
  const totalRecorrente = comissoes
    .filter((c) => c.tipo === "recorrente" && c.status !== "cancelada")
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const totalPendente = comissoes
    .filter((c) => c.status === "pendente")
    .reduce((sum, c) => sum + Number(c.valor), 0);

  // Filtrar por tab
  const filteredComissoes = comissoes.filter((c) => {
    if (activeTab === "todas") return true;
    if (activeTab === "pendente") return c.status === "pendente";
    if (activeTab === "aprovada") return c.status === "aprovada";
    if (activeTab === "paga") return c.status === "paga";
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Se não tem permissão de ver comissões, mostra mensagem
  if (!podeVerComissoes) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <ShieldX className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground text-center">
          Você não tem permissão para visualizar comissões.
        </p>
        <Button variant="outline" onClick={() => navigate("/consultor")}>
          Voltar para Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/consultor")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Minhas Comissões</h1>
            <p className="text-primary-foreground/70 text-sm">
              Acompanhe seus ganhos
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary-foreground/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-primary-foreground/70" />
                <span className="text-xs text-primary-foreground/70">Este Mês</span>
              </div>
              <p className="text-xl font-bold text-primary-foreground">
                {formatCurrency(totalMes)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary-foreground/10 border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary-foreground/70" />
                <span className="text-xs text-primary-foreground/70">Recorrente</span>
              </div>
              <p className="text-xl font-bold text-primary-foreground">
                {formatCurrency(totalRecorrente)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Alert */}
        {totalPendente > 0 && (
          <div className="mt-3 bg-primary-foreground/5 rounded-lg p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-foreground/70" />
            <div>
              <p className="text-sm text-primary-foreground">
                {formatCurrency(totalPendente)} pendente de aprovação
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="todas" className="text-xs">Todas</TabsTrigger>
            <TabsTrigger value="pendente" className="text-xs">Pendente</TabsTrigger>
            <TabsTrigger value="aprovada" className="text-xs">Aprovada</TabsTrigger>
            <TabsTrigger value="paga" className="text-xs">Paga</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredComissoes.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma comissão encontrada
                </p>
                <p className="text-muted-foreground/70 text-sm mt-1">
                  Suas comissões aparecerão aqui quando forem geradas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs mb-3">
                  {filteredComissoes.length} comiss{filteredComissoes.length !== 1 ? "ões" : "ão"} encontrada{filteredComissoes.length !== 1 ? "s" : ""}
                </p>
                
                {filteredComissoes.map((comissao) => {
                  const StatusIcon = statusConfig[comissao.status]?.icon || Clock;
                  
                  return (
                    <Card key={comissao.id} className="bg-card border-border/40">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">
                              {comissao.cliente_nome}
                            </h3>
                            <p className="text-muted-foreground text-sm capitalize">
                              {formatMonth(comissao.mes_referencia)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground text-lg">
                              {formatCurrency(Number(comissao.valor))}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {tipoLabels[comissao.tipo] || comissao.tipo}
                            </Badge>
                            <Badge variant={statusConfig[comissao.status]?.variant || "secondary"}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[comissao.status]?.label || comissao.status}
                            </Badge>
                          </div>
                          
                          {comissao.data_pagamento && (
                            <span className="text-xs text-muted-foreground">
                              Pago em {formatDate(comissao.data_pagamento)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConsultorBottomNav />
    </div>
  );
};

export default ConsultorComissoes;