import { supabase } from "@/integrations/supabase/client";

export interface RevalidateOptions {
  paths?: string[];
  tags?: string[];
}

export async function revalidatePortfolioCache(
  options: RevalidateOptions = {}
): Promise<{ ok: boolean; error?: string }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { ok: false, error: "Not authenticated" };
    }

    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(options),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      return {
        ok: false,
        error:
          typeof payload?.error === "string"
            ? payload.error
            : `Revalidation failed (${res.status})`,
      };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
