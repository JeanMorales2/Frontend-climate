import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Imagen mínima para Docker: Next.js empaqueta solo lo necesario para ejecutar el servidor.
  output: "standalone",
  // Oculta el indicador de desarrollo y la cabecera X-Powered-By: no aportan nada al usuario final.
  devIndicators: false,
  poweredByHeader: false,
};

export default nextConfig;
