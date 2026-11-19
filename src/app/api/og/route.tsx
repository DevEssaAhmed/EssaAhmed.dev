import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Essa Ahmed").slice(0, 110);
  const subtitle = (
    searchParams.get("subtitle") ||
    "Workflow Automation · Supply Chain & Demand Planning · Executive Analytics"
  ).slice(0, 180);
  const badge = (searchParams.get("badge") || "Portfolio").slice(0, 32);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(135deg, #0b1120 0%, #111827 55%, #172554 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              EA
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "22px", fontWeight: 700 }}>
                Essa Ahmed
              </span>
              <span style={{ fontSize: "15px", color: "#94a3b8" }}>
                essaahmed.dev
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              background: "rgba(59, 130, 246, 0.16)",
              border: "1px solid rgba(96, 165, 250, 0.35)",
              color: "#93c5fd",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: title.length > 60 ? "48px" : "58px",
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "24px",
              lineHeight: 1.45,
              color: "#cbd5e1",
              maxWidth: "960px",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(148, 163, 184, 0.22)",
            paddingTop: "24px",
            fontSize: "17px",
            color: "#94a3b8",
          }}
        >
          <span>Automation · Supply Chain S&amp;OP · Analytics &amp; BI</span>
          <span style={{ color: "#60a5fa", fontWeight: 600 }}>
            https://essaahmed.dev
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
