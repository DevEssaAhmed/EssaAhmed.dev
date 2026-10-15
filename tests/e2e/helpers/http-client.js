import { config } from "../config.js";

/**
 * Checks if the local web server is currently responding.
 */
export async function isServerReachable(baseUrl = config.baseUrl) {
  try {
    const res = await fetch(baseUrl, {
      signal: AbortSignal.timeout(2500),
      headers: { "User-Agent": "E2E-Opaque-Box-Tester/1.0" },
    });
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Performs an HTTP GET request against a path on baseUrl.
 */
export async function fetchRoute(routePath, options = {}) {
  const url = new URL(routePath, config.baseUrl).toString();
  const timeoutMs = options.timeout || config.timeoutMs;
  const headers = {
    "User-Agent": "E2E-Opaque-Box-Tester/1.0",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    signal: AbortSignal.timeout(timeoutMs),
    redirect: options.redirect || "follow",
  });

  const text = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    headers: response.headers,
    url: response.url,
    body: text,
  };
}
