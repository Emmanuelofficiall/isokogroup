import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const adminClient = createClient(supabaseUrl, serviceKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await adminClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: role } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Admin access required");

    const { liveId, title, link } = await request.json();
    if (!liveId || !title || !link) throw new Error("liveId, title, and link are required");

    const users: { email?: string }[] = [];
    let page = 1;
    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      users.push(...data.users);
      if (data.users.length < 1000) break;
      page += 1;
    }

    const recipients = users.map((item) => item.email).filter((email): email is string => Boolean(email));
    if (!recipients.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("LIVE_EMAIL_FROM") ?? "ISOKO GROUP <onboarding@resend.dev>",
        to: recipients,
        subject: "ISOKO GROUP is Live Now — Join the Live",
        html: `<p>ISOKO GROUP is live now.</p><p><strong>${title}</strong></p><p><a href="${link}">Join the live stream</a></p>`,
      }),
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    return new Response(JSON.stringify({ sent: recipients.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to send live notification" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
