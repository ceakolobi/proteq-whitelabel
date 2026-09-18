import React from "react";
import { toast } from "sonner";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export default class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary] Unhandled React error:", error, info);
    toast.error("Ocorreu um erro inesperado. Tente novamente.");
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
          <header className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <TriangleAlert className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground">
                O app encontrou um erro
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Você pode tentar novamente. Se persistir, volte e refaça a ação.
              </p>
            </div>
          </header>

          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recarregar
            </Button>
            <Button onClick={this.handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
