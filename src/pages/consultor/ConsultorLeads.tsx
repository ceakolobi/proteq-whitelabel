import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Phone, Mail, Edit2, Trash2, X, Check, User, ShieldX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConsultorBottomNav from "@/components/consultor/ConsultorBottomNav";

interface Lead {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string | null;
  cliente_cpf: string | null;
  veiculo_modelo: string;
  veiculo_placa: string;
  status: string;
  created_at: string;
  lead_descartado: boolean;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  aberta: { label: "Aberta", variant: "secondary" },
  em_analise: { label: "Em Análise", variant: "default" },
  proposta_enviada: { label: "Proposta Enviada", variant: "default" },
  aprovada: { label: "Aprovada", variant: "default" },
  recusada: { label: "Recusada", variant: "destructive" },
};

const ConsultorLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const { podeVerLeads, podeEditarLeads } = usePermissoes();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [discardingLead, setDiscardingLead] = useState<Lead | null>(null);
  const [discardMotivo, setDiscardMotivo] = useState("");
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    cliente_nome: "",
    cliente_telefone: "",
    cliente_email: "",
    cliente_cpf: "",
  });

  // Fetch leads (cotações não descartadas)
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["consultor-leads", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("cotacoes")
        .select("id, cliente_nome, cliente_telefone, cliente_email, cliente_cpf, veiculo_modelo, veiculo_placa, status, created_at, lead_descartado")
        .eq("consultor_id", session.user.id)
        .eq("lead_descartado", false)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!session?.user?.id,
  });

  // Mutation para editar lead
  const editMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Lead> }) => {
      const { error } = await supabase
        .from("cotacoes")
        .update({
          cliente_nome: data.updates.cliente_nome,
          cliente_telefone: data.updates.cliente_telefone,
          cliente_email: data.updates.cliente_email,
          cliente_cpf: data.updates.cliente_cpf,
        })
        .eq("id", data.id)
        .eq("consultor_id", session?.user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultor-leads"] });
      setEditingLead(null);
      toast({
        title: "Lead atualizado",
        description: "Os dados do lead foram atualizados com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar os dados do lead.",
        variant: "destructive",
      });
    },
  });

  // Mutation para descartar lead (soft delete)
  const discardMutation = useMutation({
    mutationFn: async (data: { id: string; motivo: string }) => {
      const { error } = await supabase
        .from("cotacoes")
        .update({
          lead_descartado: true,
          lead_descartado_em: new Date().toISOString(),
          lead_descartado_motivo: data.motivo || "Descartado pelo consultor",
        })
        .eq("id", data.id)
        .eq("consultor_id", session?.user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultor-leads"] });
      setDiscardingLead(null);
      setDiscardMotivo("");
      toast({
        title: "Lead descartado",
        description: "O lead foi ocultado da sua lista. O CRM mantém o histórico.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao descartar",
        description: "Não foi possível descartar o lead.",
        variant: "destructive",
      });
    },
  });

  const handleOpenEdit = (lead: Lead) => {
    setEditForm({
      cliente_nome: lead.cliente_nome,
      cliente_telefone: lead.cliente_telefone,
      cliente_email: lead.cliente_email || "",
      cliente_cpf: lead.cliente_cpf || "",
    });
    setEditingLead(lead);
  };

  const handleSaveEdit = () => {
    if (!editingLead) return;
    
    if (!editForm.cliente_nome.trim() || !editForm.cliente_telefone.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    editMutation.mutate({
      id: editingLead.id,
      updates: editForm,
    });
  };

  const handleDiscard = () => {
    if (!discardingLead) return;
    discardMutation.mutate({
      id: discardingLead.id,
      motivo: discardMotivo,
    });
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.cliente_telefone.includes(searchTerm) ||
      lead.veiculo_modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Se não tem permissão de ver leads, mostra mensagem
  if (!podeVerLeads) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <ShieldX className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
        <p className="text-muted-foreground text-center">
          Você não tem permissão para visualizar leads.
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
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/consultor")}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Leads</h1>
            <p className="text-primary-foreground/70 text-sm">
              Clientes em prospecção
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum lead encontrado" : "Nenhum lead ainda"}
            </p>
            <p className="text-muted-foreground/70 text-sm mt-1">
              Leads são criados a partir das suas cotações
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-xs">
              {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} encontrado{filteredLeads.length !== 1 ? "s" : ""}
            </p>
            
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="bg-card border-border/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {lead.cliente_nome}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {lead.veiculo_modelo} • {lead.veiculo_placa}
                      </p>
                    </div>
                    <Badge variant={statusLabels[lead.status]?.variant || "secondary"}>
                      {statusLabels[lead.status]?.label || lead.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{lead.cliente_telefone}</span>
                    </div>
                    {lead.cliente_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{lead.cliente_email}</span>
                      </div>
                    )}
                  </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground/70">
                        Criado em {formatDate(lead.created_at)}
                      </span>
                      
                      {/* Só mostra botões de ação se tiver permissão de editar */}
                      {podeEditarLeads && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(lead)}
                            className="h-8 px-3"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDiscardingLead(lead)}
                            className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Descartar
                          </Button>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={editForm.cliente_nome}
                onChange={(e) => setEditForm({ ...editForm, cliente_nome: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={editForm.cliente_telefone}
                onChange={(e) => setEditForm({ ...editForm, cliente_telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={editForm.cliente_email}
                onChange={(e) => setEditForm({ ...editForm, cliente_email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={editForm.cliente_cpf}
                onChange={(e) => setEditForm({ ...editForm, cliente_cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLead(null)}>
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={editMutation.isPending}>
              <Check className="w-4 h-4 mr-1" />
              {editMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={!!discardingLead} onOpenChange={() => setDiscardingLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar Lead</AlertDialogTitle>
            <AlertDialogDescription>
              O lead será ocultado da sua lista, mas o CRM manterá o histórico completo.
              Esta ação pode ser revertida pelo administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="motivo">Motivo (opcional)</Label>
            <Textarea
              id="motivo"
              value={discardMotivo}
              onChange={(e) => setDiscardMotivo(e.target.value)}
              placeholder="Ex: Cliente não tem interesse, número incorreto..."
              className="mt-2"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {discardMutation.isPending ? "Descartando..." : "Descartar Lead"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConsultorBottomNav />
    </div>
  );
};

export default ConsultorLeads;