import { supabase } from "@/integrations/supabase/client";

export type NotifyArgs = {
  userId: string;
  title: string;
  body?: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
};

export const notify = async ({ userId, title, body, type = "info", link }: NotifyArgs) => {
  return await (supabase as any).from("notifications").insert({
    user_id: userId,
    title,
    body: body ?? null,
    type,
    link: link ?? null,
  });
};
