import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

let clientInstance = null;

export function getSupabaseTestClient() {
  if (!clientInstance) {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error("Supabase credentials missing in config (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)");
    }
    clientInstance = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return clientInstance;
}
