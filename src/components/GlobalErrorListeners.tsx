import { useEffect } from "react";
import { toast } from "sonner";

function toMessage(reason: unknown): string {
  if (reason instanceof Error) return reason.message || "Erro inesperado";
  if (typeof reason === "string") return reason;
  try {
    return JSON.stringify(reason);
  } catch {
    return "Erro inesperado";
  }
}

function isAlreadyHandledCRMMessage(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("falha na comunicação com o crm") ||
    m.includes("crm indispon") ||
    m.includes("edge function returned")
  );
}

const GlobalErrorListeners = () => {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const msg = toMessage(event.reason);
      console.error("[GlobalError] Unhandled rejection:", event.reason);

      // Intercepta antes de outros listeners do runtime/dev overlay
      event.stopImmediatePropagation?.();
      event.preventDefault();

      // Se já mostramos toast no fluxo (ex: CRMResult/CRMError), evita duplicar
      if (!isAlreadyHandledCRMMessage(msg)) {
        toast.error(msg);
      }
    };

    const onWindowError = (event: ErrorEvent) => {
      console.error("[GlobalError] Window error:", event.error ?? event.message);
      // Não previne aqui para não mascarar erros de dev; o ErrorBoundary lida com render errors.
    };

    // capture=true para rodar antes do overlay
    window.addEventListener("unhandledrejection", onUnhandledRejection, true);
    window.addEventListener("error", onWindowError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection, true);
      window.removeEventListener("error", onWindowError);
    };
  }, []);

  return null;
};

export default GlobalErrorListeners;
