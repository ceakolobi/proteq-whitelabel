import { useEffect } from "react";
import ConsultorHome from "./ConsultorHome";
import { APP_NAME } from "@/config/app";

const ConsultorIndex = () => {
  useEffect(() => {
    document.title = `Consultor ${APP_NAME} | Nova Cotação`;

    const description = `Home do consultor no ${APP_NAME}: acesso rápido às cotações e criação de nova cotação.`;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/consultor";
  }, []);

  return <ConsultorHome />;
};

export default ConsultorIndex;
