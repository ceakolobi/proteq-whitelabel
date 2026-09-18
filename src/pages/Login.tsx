import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Shield, User, Briefcase, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, getHomeRouteByRole, type UserRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const profileOptions: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: "associado",
    label: "Associado",
    icon: User,
    description: "Proteção do meu veículo",
  },
  {
    value: "consultor",
    label: "Consultor",
    icon: Briefcase,
    description: "Gerenciar clientes e propostas",
  },
  {
    value: "indicador",
    label: "Indicador",
    icon: UserPlus,
    description: "Indicar novos clientes",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [nome, setNome] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(getHomeRouteByRole(userRole));
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProfile) {
      toast({
        title: "Selecione um perfil",
        description: "Por favor, escolha como deseja acessar o app.",
        variant: "destructive",
      });
      return;
    }

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o e-mail e a senha.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, preencha seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up flow
        const redirectUrl = `${window.location.origin}/`;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              nome: nome.trim(),
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("already registered")) {
            toast({
              title: "E-mail já cadastrado",
              description: "Este e-mail já está em uso. Tente fazer login.",
              variant: "destructive",
            });
          } else {
            throw signUpError;
          }
          setIsLoading(false);
          return;
        }

        if (signUpData.user) {
          // Add role to user_roles table
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: signUpData.user.id,
              role: selectedProfile,
            });

          if (roleError) {
            console.error("Error adding role:", roleError);
          }

          // Login with the context
          login(
            {
              id: signUpData.user.id,
              nome: nome.trim(),
              cpf: "",
              email: email,
            },
            selectedProfile
          );

          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao Harmony!",
          });

          navigate(getHomeRouteByRole(selectedProfile));
        }
      } else {
        // Login flow
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            toast({
              title: "Credenciais inválidas",
              description: "E-mail ou senha incorretos.",
              variant: "destructive",
            });
          } else {
            throw signInError;
          }
          setIsLoading(false);
          return;
        }

        if (signInData.user) {
          // Check if user has the selected role
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", signInData.user.id)
            .eq("role", selectedProfile)
            .maybeSingle();

          if (!roleData) {
            // Add role if doesn't exist
            await supabase
              .from("user_roles")
              .insert({
                user_id: signInData.user.id,
                role: selectedProfile,
              });
          }

          // Get profile data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", signInData.user.id)
            .maybeSingle();

          login(
            {
              id: signInData.user.id,
              nome: profileData?.nome || signInData.user.email || "Usuário",
              cpf: profileData?.cpf || "",
              email: signInData.user.email,
              telefone: profileData?.telefone,
              codigoIndicador: profileData?.codigo_indicador,
            },
            selectedProfile
          );

          toast({
            title: "Login realizado!",
            description: `Bem-vindo de volta!`,
          });

          navigate(getHomeRouteByRole(selectedProfile));
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Erro na autenticação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary">{import.meta.env.VITE_APP_NAME || 'Proteq'}</h1>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {isSignUp ? "Criar Conta" : `Bem-vindo ao ${import.meta.env.VITE_APP_NAME || 'Proteq'}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Preencha seus dados para começar" : "Selecione seu perfil para continuar"}
          </p>
        </div>

        {/* Profile Selection */}
        <div className="w-full max-w-sm mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">
            Acessar como
          </label>
          <div className="grid grid-cols-3 gap-2">
            {profileOptions.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedProfile === profile.value;
              return (
                <button
                  key={profile.value}
                  type="button"
                  onClick={() => setSelectedProfile(profile.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {profile.label}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedProfile && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {profileOptions.find((p) => p.value === selectedProfile)?.description}
            </p>
          )}
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="nome" className="text-sm font-medium text-foreground">
                Nome Completo
              </label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 bg-card border-border/50 rounded-xl text-base"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-card border-border/50 rounded-xl text-base"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-card border-border/50 rounded-xl text-base pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedProfile}
            className="w-full h-14 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              {isSignUp ? "Já tenho conta" : "Criar nova conta"}
            </button>
          </div>

          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
        </form>

        {/* Footer Message */}
        <p className="text-xs text-muted-foreground text-center mt-6 px-4">
          Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  );
};

export default Login;
