import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const NEW_EMAIL = "kriskikidecor@kikidecor.ru";
    const NEW_PASSWORD = "Kris777decor";

    // 1) Remove all existing admin role assignments
    const { data: admins } = await admin.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = (admins ?? []).map((r: any) => r.user_id);

    await admin.from("user_roles").delete().eq("role", "admin");

    // 2) Delete those auth users
    for (const id of adminIds) {
      await admin.auth.admin.deleteUser(id);
    }

    // 3) Create new admin user
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
    });
    if (createErr) throw createErr;

    // 4) Assign admin role
    const { error: roleErr } = await admin.from("user_roles").insert({
      user_id: created.user!.id,
      role: "admin",
    });
    if (roleErr) throw roleErr;

    return new Response(
      JSON.stringify({ ok: true, email: NEW_EMAIL, removed: adminIds.length }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});