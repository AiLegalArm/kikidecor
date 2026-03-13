import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

const resolvedSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  (projectId ? `https://${projectId}.supabase.co` : "");

const resolvedPublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

if (!resolvedSupabaseUrl || !resolvedPublishableKey) {
  console.error("[Supabase] Missing frontend env config", {
    hasUrl: Boolean(resolvedSupabaseUrl),
    hasProjectId: Boolean(projectId),
    hasPublishableKey: Boolean(resolvedPublishableKey),
  });
}

export const supabase = createClient<Database>(
  resolvedSupabaseUrl || "https://invalid.local",
  resolvedPublishableKey || "invalid-publishable-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
