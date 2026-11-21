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
          position: "relative",
          background:
            "linear-gradient(135deg, #111318 0%, #161922 55%, #0B0D12 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "520px",
            height: "520px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(52,211,153,0.06) 45%, rgba(0,0,0,0) 75%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-160px",
            right: "-100px",
            width: "480px",
            height: "480px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(52,211,153,0.12) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "15px",
                background: "#141720",
                border: "1px solid rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 64 64"
                fill="none"
              >
                <rect width="64" height="64" fill="#141720" />
                <path
                  d="M12 17H27.5V22.2H17.2V29.4H25V34.6H17.2V41.8H27.5V47H12V17Z"
                  fill="#F8FAFC"
                />
                <path
                  d="M38.6 17H43.9L52 47H46.5L41.25 26.8L36 47H30.5L38.6 17Z"
                  fill="#34D399"
                />
                <rect
                  x="38.25"
                  y="39.4"
                  width="6"
                  height="4.4"
                  rx="2.2"
                  fill="#F8FAFC"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "23px", fontWeight: 700, color: "#f8fafc" }}>
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
              background: "rgba(59, 130, 246, 0.14)",
              border: "1px solid rgba(96, 165, 250, 0.35)",
              color: "#93c5fd",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "relative",
          }}
        >
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
            borderTop: "1px solid rgba(148, 163, 184, 0.18)",
            paddingTop: "24px",
            fontSize: "17px",
            color: "#94a3b8",
            position: "relative",
          }}
        >
          <span>Automation · Supply Chain S&amp;OP · Analytics &amp; BI</span>
          <span style={{ color: "#34d399", fontWeight: 600 }}>
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
