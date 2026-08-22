import { supabase } from "@/integrations/supabase/client";

export async function increment_live_view(liveId: string) {
  try {
    const key = `isoko_live_viewed_${liveId}`;
    if (sessionStorage.getItem(key)) return null;
    const { data, error } = await supabase.rpc("increment_live_view", { p_live: liveId });
    if (!error) sessionStorage.setItem(key, "1");
    return { data, error };
  } catch (error) {
    console.error("Unable to count live view", error);
    return null;
  }
}
