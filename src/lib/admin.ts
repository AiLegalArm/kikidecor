import { supabase } from "@/integrations/supabase/client";

/**
 * Server-validated admin check via user_roles table + has_role() RPC.
 * Returns true only if the authenticated user has the 'admin' role.
 */
export async function isAdminUser(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    console.error("[isAdminUser] role check failed:", error.message);
    return false;
  }
  return !!data;
}
