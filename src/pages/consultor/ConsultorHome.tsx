import ConsultorHeader from "@/components/consultor/ConsultorHeader";
import ConsultorBottomNav from "@/components/consultor/ConsultorBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileText, Users, DollarSign, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissoes } from "@/hooks/usePermissoes";

const ConsultorHome = () => {
  const navigate = useNavigate();
  const { podeCotar, podeVerLeads, podeVerComissoes, isLoading } = usePermissoes();

  // Itens de acesso rápido filtrados por permissão do CRM
  const quickAccessItems = [
    {
      icon: FileText,
      label: "Minhas Cotações",
      description: "Ver cotações em andamento",
      route: "/consultor/cotacoes",
      visible: true, // Sempre visível para consultores
    },
    {
      icon: Users,
      label: "Leads",
      description: "Clientes em prospecção",
      route: "/consultor/leads",
      visible: podeVerLeads, // Controlado pelo CRM
    },
    {
      icon: DollarSign,
      label: "Comissões",
      description: "Acompanhar seus ganhos",
      route: "/consultor/comissoes",
      visible: podeVerComissoes, // Controlado pelo CRM
    },
  ].filter(item => item.visible); // Remove itens não permitidos

  return (
    <div className="min-h-screen bg-background pb-28">
      <ConsultorHeader />

      {/* Ação Principal - Nova Cotação (só exibe se permissoes.cotar = true) */}
      {podeCotar && (
        <div className="px-4 -mt-4 relative z-10">
          <button
            className="w-full bg-card hover:bg-secondary text-foreground rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 active:scale-[0.99] shadow-card border border-border/50 group"
            onClick={() => navigate("/consultor/nova-cotacao")}
          >
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-all shadow-glow">
              <Plus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-foreground font-semibold text-base">Nova Cotação</p>
              <p className="text-muted-foreground text-sm">Iniciar cotação de veículo</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      )}

      {/* Cards Secundários */}
      <div className="px-4 mt-6">
        <h2 className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-3">Acesso Rápido</h2>
        <div className="space-y-2.5">
          {quickAccessItems.map((item, index) => (
            <button
              key={index}
              className="w-full bg-card hover:bg-secondary/50 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.99] border border-border/40 group"
              onClick={() => navigate(item.route)}
            >
              <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-foreground font-medium text-sm">{item.label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="px-4 mt-6">
        <h2 className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-3">Este Mês</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-border/40">
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs">Cotações</p>
              <p className="text-2xl font-bold text-foreground mt-1">24</p>
              <p className="text-[10px] text-success mt-1">+12% vs anterior</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border/40">
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs">Fechadas</p>
              <p className="text-2xl font-bold text-foreground mt-1">8</p>
              <p className="text-[10px] text-success mt-1">33% conversão</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConsultorBottomNav />
    </div>
  );
};

export default ConsultorHome;