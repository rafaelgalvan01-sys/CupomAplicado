import { ImageResponse } from "next/og";
import { getStoreBySlug } from "@/lib/data";

export const alt = "Cupons — Cupom Aplicado";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  const storeName = store?.name ?? "Loja";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          backgroundColor: "#04152b",
          fontFamily: "sans-serif",
        }}
      >
        {store?.logo_url ? (
          <div
            style={{
              display: "flex",
              width: 160,
              height: 160,
              borderRadius: 28,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) não usa next/image */}
            <img
              src={store.logo_url}
              alt=""
              width={112}
              height={112}
              style={{ objectFit: "contain", maxWidth: 112, maxHeight: 112 }}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              width: 160,
              height: 160,
              borderRadius: 28,
              backgroundColor: "#1db761",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 72,
              fontWeight: 700,
              color: "#04152b",
            }}
          >
            {storeName.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{ display: "flex", fontSize: 60, fontWeight: 700, color: "#ffffff" }}>
          Cupons {storeName}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#9fb3c8" }}>
          Verificados pela comunidade — Cupom Aplicado
        </div>
      </div>
    ),
    { ...size }
  );
}
