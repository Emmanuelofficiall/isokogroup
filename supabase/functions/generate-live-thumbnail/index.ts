import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) throw new Error("OPENAI_API_KEY is not configured");

    const authorization = request.headers.get("Authorization");
    if (!authorization) throw new Error("Unauthorized");
    const adminClient = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user } } = await adminClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: role } = await adminClient.from("user_roles")
      .select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Admin access required");

    const { title, description, category } = await request.json();
    if (!title?.trim()) throw new Error("A live title is required");

    const prompt = `Create a polished 16:9 livestream thumbnail for ISOKO GROUP, an African business and community platform. Subject: ${title.trim()}. ${description?.trim() || "Professional business and community discussion."} Category: ${category || "Business"}. Use bold readable visual composition, warm red and dark charcoal brand colors, no logos, no tiny text, no watermark.`;
    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      // gpt-image-1 supports 1536x1024; the thumbnail UI crops this to 16:9.
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1536x1024", quality: "medium" }),
    });
    if (!imageResponse.ok) throw new Error(`Image provider returned ${imageResponse.status}`);
    const image = await imageResponse.json();
    const encoded = image.data?.[0]?.b64_json;
    if (!encoded) throw new Error("Image provider returned no image");

    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const path = `live/${crypto.randomUUID()}.png`;
    const { error: bucketError } = await adminClient.storage.createBucket("thumbnails", { public: true });
    if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) throw bucketError;
    const { error: uploadError } = await adminClient.storage.from("thumbnails").upload(path, bytes, {
      contentType: "image/png", cacheControl: "31536000", upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: urlData } = adminClient.storage.from("thumbnails").getPublicUrl(path);
    return json({ thumbnail_url: urlData.publicUrl });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unable to generate thumbnail" }, 400);
  }
});
