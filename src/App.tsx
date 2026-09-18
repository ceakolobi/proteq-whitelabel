import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import GlobalErrorListeners from "@/components/GlobalErrorListeners";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";
import AcessoRestrito from "./pages/AcessoRestrito";
import CotacaoPublica from "./pages/CotacaoPublica";

// Indicador Pages
import IndicadorHome from "./pages/indicador/IndicadorHome";
import NovaIndicacao from "./pages/indicador/NovaIndicacao";
import MinhasIndicacoes from "./pages/indicador/MinhasIndicacoes";
import QRCodePage from "./pages/indicador/QRCodePage";
import IndicadorPerfil from "./pages/indicador/IndicadorPerfil";
import IndicadorAparencia from "./pages/indicador/IndicadorAparencia";

// Consultor Pages
import ConsultorIndex from "./pages/consultor/Index";
import NovaCotacao from "./pages/consultor/NovaCotacao";
import CotacaoResultado from "./pages/consultor/CotacaoResultado";
import CotacaoResumo from "./pages/consultor/CotacaoResumo";
import CotacaoDadosCliente from "./pages/consultor/CotacaoDadosCliente";
import MinhasCotacoes from "./pages/consultor/MinhasCotacoes";
import ConsultorLeads from "./pages/consultor/ConsultorLeads";
import ConsultorComissoes from "./pages/consultor/ConsultorComissoes";
import ConsultorPerfil from "./pages/consultor/ConsultorPerfil";
import ConsultorAparencia from "./pages/consultor/ConsultorAparencia";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <GlobalErrorListeners />
          <AppErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Splash */}
                <Route path="/splash" element={<SplashScreen />} />

                {/* Login - Público */}
                <Route path="/login" element={<Login />} />

                {/* Cotação Pública - Sem autenticação */}
                <Route path="/cotacao/:token" element={<CotacaoPublica />} />
                {/* Associado Routes - Protegidas */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <Index />
                    </ProtectedRoute>
                  }
                />

                {/* Rota /cotacao - Somente Consultor */}
                <Route
                  path="/cotacao"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <NovaCotacao />
                    </ProtectedRoute>
                  }
                />

                {/* Rotas de acesso restrito para Associado */}
                <Route
                  path="/boletos"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/protecao"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rastreamento"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/indicacao"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vantagens"
                  element={
                    <ProtectedRoute allowedRoles={["associado"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />

                {/* Indicador Routes - Protegidas */}
                <Route
                  path="/indicador"
                  element={
                    <ProtectedRoute allowedRoles={["indicador"]}>
                      <IndicadorHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/indicador/nova-indicacao"
                  element={
                    <ProtectedRoute allowedRoles={["indicador"]}>
                      <NovaIndicacao />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/indicador/minhas-indicacoes"
                  element={
                    <ProtectedRoute allowedRoles={["indicador"]}>
                      <MinhasIndicacoes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/indicador/qrcode"
                  element={
                    <ProtectedRoute allowedRoles={["indicador"]}>
                      <QRCodePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/indicador/perfil"
                  element={
                    <ProtectedRoute allowedRoles={["indicador"]}>
                      <IndicadorPerfil />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/indicador/aparencia"
                  element={
                    <ProtectedRoute allowedRoles={["indicador"]}>
                      <IndicadorAparencia />
                    </ProtectedRoute>
                  }
                />

                {/* Acesso Restrito - Público (para qualquer perfil bloqueado) */}
                <Route path="/acesso-restrito" element={<AcessoRestrito />} />

                {/* Consultor Routes - Protegidas */}
                <Route
                  path="/consultor"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <ConsultorIndex />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/nova-cotacao"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <NovaCotacao />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/cotacao/resultado"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <CotacaoResultado />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/cotacao/dados-cliente"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <CotacaoDadosCliente />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/cotacao/resumo"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <CotacaoResumo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/cotacoes"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <MinhasCotacoes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/leads"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <ConsultorLeads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/veiculos"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/comissoes"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <ConsultorComissoes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/perfil"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <ConsultorPerfil />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultor/aparencia"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <ConsultorAparencia />
                    </ProtectedRoute>
                  }
                />

                {/* Rotas bloqueadas para Consultor - Associados não acessível */}
                <Route
                  path="/consultor/associados"
                  element={
                    <ProtectedRoute allowedRoles={["consultor"]}>
                      <AcessoRestrito />
                    </ProtectedRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
