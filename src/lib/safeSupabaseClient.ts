/**
 * Safe Supabase client wrapper.
 * Re-exports the auto-generated client directly.
 * The .env file provides VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "niaxchwajovdlnralysa"}.supabase.co`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYXhjaHdham92ZGxucmFseXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDU2MDMsImV4cCI6MjA4ODM4MTYwM30.mSqlAdPigZYFJbdzd47yuTYbb-fQ_jBU-n8xVk5Kokg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
