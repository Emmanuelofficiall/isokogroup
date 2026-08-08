import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const LiveIndicator = () => {
  const { t } = useI18n();
  const [live, setLive] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("id, title, status, started_at")
        .eq("status", "live")
        .order("started_at", { ascending: false })
        .limit(1);
      if (error) return;
      const row = Array.isArray(data) && data[0] ? data[0] : null;
      if (mounted) setLive(row ? { id: row.id, title: row.title } : null);
    };

    load();

    const channel = supabase
      .channel("public:live_streams")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        (payload) => {
          const rec = payload.new ?? payload.old;
          if (!rec) return;
          if (rec.status === "live") {
            setLive({ id: rec.id, title: rec.title });
          } else {
            // if a live ended or removed, reload to check if other live exists
            if (rec.status === "ended" || rec.status === "scheduled") {
              setLive(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        void supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  if (live) {
    return (
      <Link to={`/videos/${live.id}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground animate-fade-in">
        <span className="h-3 w-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse-fast" />
        <span className="font-semibold">LIVE NOW • {live.title}</span>
      </Link>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground animate-fade-in">
      <span className="h-2 w-2 rounded-full bg-primary" />
      {t("hero.badge")}
    </div>
  );
};

export default LiveIndicator;
