import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://cdn.lomadee.com.br/**"),
      new URL("https://ui.awin.com/**"),
      // Objeto explícito (não o atalho `new URL()`) porque as imagens do
      // Pexels sempre vêm com querystring de redimensionamento
      // (?auto=compress&cs=...) — o atalho `new URL()` seta `search: ""`
      // implicitamente, o que BLOQUEIA qualquer URL com querystring. Omitir
      // `search` aqui é o que libera qualquer parâmetro.
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
