import { ImageResponse } from "next/og";

export const alt = "Cupom Aplicado — Cupons de desconto e promoções";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
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
          gap: 24,
          backgroundColor: "#04152b",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 20,
              backgroundColor: "#1db761",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 700,
              color: "#04152b",
            }}
          >
            %
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#ffffff" }}>
            Cupom Aplicado
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#9fb3c8" }}>
          Cupons de desconto verificados pela comunidade
        </div>
      </div>
    ),
    { ...size }
  );
}
