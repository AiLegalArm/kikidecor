/**
 * Safe Supabase client wrapper.
 * Re-exports the auto-generated client directly.
 * The .env file provides VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "ffxlohauqtklstulsjug"}.supabase.co`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_wQiVhONZ3alD6xdOIySkeQ_ZizLfRzn";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
