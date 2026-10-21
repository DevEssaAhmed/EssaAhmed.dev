import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

/**
 * Load environment variables from .env.local and .env (favoring .env.local).
 */
function loadEnv() {
  const envFiles = [
    path.join(projectRoot, ".env.local"),
    path.join(projectRoot, ".env"),
  ];

  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, "utf8").split("\n");
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eqIdx = line.indexOf("=");
        if (eqIdx > 0) {
          const key = line.slice(0, eqIdx).trim();
          let val = line.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const config = {
  projectRoot,
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseKey,
  timeoutMs: 15000,
  editorialTokens: {
    baseObsidian: ["#07090e", "#05060a", "#030407", "bg-[#07090e]"],
    champagne: "#f3e8d2",
    champagneDim: "#c2b49c",
    platinum: "#e2e8f0",
    tertiaryEmerald: "#34d399",
    metricBlue: "#60A5FA",
    softSky: "#bfdbfe",
    hairlineBorder: "rgba(255, 255, 255, 0.07)",
    typography: {
      display: "Plus Jakarta Sans",
      sans: "Inter",
      mono: "JetBrains Mono",
    },
  },
};
