import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const configPath = join(homedir(), ".gemini", "config", "mcp_config.json");

function fail(message) {
  console.error(`[Stitch MCP auth helper] ${message}`);
  process.exit(1);
}

let config;

try {
  config = JSON.parse(readFileSync(configPath, "utf8"));
} catch {
  fail("Could not read the local Antigravity MCP configuration.");
}

const stitchServer = config.mcpServers?.StitchMCP;
const args = Array.isArray(stitchServer?.args) ? stitchServer.args : [];

if (
  !stitchServer ||
  stitchServer.disabled ||
  !args.includes("mcp-remote") ||
  !args.includes("https://stitch.googleapis.com/mcp")
) {
  fail("The enabled StitchMCP server was not found in Antigravity's local configuration.");
}

const headerIndex = args.indexOf("--header");
const headerValue = args[headerIndex + 1];
const match = typeof headerValue === "string"
  ? headerValue.match(/^X-Goog-Api-Key:\s*(\S.*)$/)
  : null;

if (!match) {
  fail("The StitchMCP API key header was not found in Antigravity's local configuration.");
}

process.stdout.write(`${JSON.stringify({ "X-Goog-Api-Key": match[1].trim() })}\n`);
