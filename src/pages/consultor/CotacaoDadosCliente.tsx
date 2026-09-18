import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, FileText, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VeiculoCotacaoData {
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
}

interface ConsultorData {
  id: string;
  regional_id: string | null;
  regional_ativa: boolean;
  regional_nome: string | null;
}

const CotacaoDadosCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as VeiculoCotacaoData;

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [consultorData, setConsultorData] = useState<ConsultorData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateConsultor = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setValidationError("Usuário não autenticado. Faça login novamente.");
          setIsLoading(false);
          return;
        }

        // Check if user has consultor role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "consultor")
          .maybeSingle();

        if (roleError) throw roleError;

        if (!roleData) {
          setValidationError("Apenas consultores podem gerar cotações.");
          setIsLoading(false);
          return;
        }

        // Get consultant profile with regional info
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            regional_id,
            regionais:regional_id (
              id,
              nome,
              ativo
            )
          `)
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profileData.regional_id) {
          setValidationError("Consultor não está vinculado a nenhuma regional. Entre em contato com o administrador.");
          setIsLoading(false);
          return;
        }

        const regional = profileData.regionais as unknown as { id: string; nome: string; ativo: boolean } | null;

        if (!regional) {
          setValidationError("Regional não encontrada. Entre em contato com o administrador.");
          setIsLoading(false);
          return;
        }

        if (!regional.ativo) {
          setValidationError(`A regional "${regional.nome}" está inativa. Não é possível gerar cotações.`);
          setIsLoading(false);
          return;
        }

        setConsultorData({
          id: user.id,
          regional_id: profileData.regional_id,
          regional_ativa: regional.ativo,
          regional_nome: regional.nome,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao validar consultor:", error);
        setValidationError("Erro ao validar permissões. Tente novamente.");
        setIsLoading(false);
      }
    };

    validateConsultor();
  }, []);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleContinuar = () => {
    if (!nome.trim()) {
      toast.error("Digite o nome completo do cliente");
      return;
    }
    if (cpf.replace(/\D/g, "").length !== 11) {
      toast.error("Digite um CPF válido");
      return;
    }
    if (telefone.replace(/\D/g, "").length < 10) {
      toast.error("Digite um telefone válido");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Digite um e-mail válido");
      return;
    }

    navigate("/consultor/cotacao/resumo", {
      state: {
        ...data,
        cliente: {
          nome: nome.trim(),
          cpf: cpf.replace(/\D/g, ""),
          telefone: telefone.replace(/\D/g, ""),
          email: email.trim().toLowerCase(),
        },
        consultor: consultorData,
      },
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Dados não encontrados</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <header className="bg-primary px-5 pt-10 pb-4 rounded-b-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/consultor")}
              className="w-10 h-10 bg-primary-foreground/15 rounded-xl flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div>
              <h1 className="text-primary-foreground text-lg font-semibold">Erro de Validação</h1>
            </div>
          </div>
        </header>

        <div className="px-4 mt-8">
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Não é possível continuar</h2>
              <p className="text-muted-foreground">{validationError}</p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => navigate("/consultor")}
              >
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
        </div>
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
          <div>
            <h1 className="text-primary-foreground text-lg font-semibold">Dados do Cliente</h1>
            <p className="text-primary-foreground/70 text-xs font-medium">Etapa 3 de 4 - Informações do lead</p>
          </div>
        </div>
      </header>

      {/* Progresso */}
      <div className="px-5 mt-5 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Regional Info */}
        {consultorData?.regional_nome && (
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-3">
              <p className="text-sm text-success font-medium text-center">
                Regional: {consultorData.regional_nome}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Formulário */}
        <Card className="bg-card border-border/40">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Informações do Cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados do lead
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="nome" className="text-muted-foreground text-xs font-medium">
                Nome Completo *
              </Label>
              <Input
                id="nome"
                placeholder="Digite o nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-2 h-12 bg-muted border-border/40"
              />
            </div>

            <div>
              <Label htmlFor="cpf" className="text-muted-foreground text-xs font-medium">
                CPF *
              </Label>
              <div className="relative mt-2">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  maxLength={14}
                  className="h-12 bg-muted border-border/40 pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telefone" className="text-muted-foreground text-xs font-medium">
                Telefone *
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  maxLength={15}
                  className="h-12 bg-muted border-border/40 pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-muted-foreground text-xs font-medium">
                E-mail *
              </Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-muted border-border/40 pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Continuar */}
        <Button
          className="w-full h-14 text-base font-semibold gradient-primary mt-4"
          onClick={handleContinuar}
          disabled={!nome || !cpf || !telefone || !email}
        >
          Continuar para Resumo
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default CotacaoDadosCliente;
