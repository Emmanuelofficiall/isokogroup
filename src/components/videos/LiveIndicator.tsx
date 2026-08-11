import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

const LiveIndicator = () => {
  const { t } = useI18n();
  const [live, setLive] = useState<{ id: string; title: string } | null>(null);
  const prevLiveId = useRef<string | null>(null);
  const initialized = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("id, title, status, started_at")
        .eq("status", "live")
        .order("started_at", { ascending: false })
        .limit(1);
      if (error) {
        console.error("LiveIndicator load error:", error);
        return;
      }
      const row = Array.isArray(data) && data[0] ? data[0] : null;
      if (mounted) {
        console.debug("LiveIndicator initial load:", row);
        // Only show toast on subsequent detections, not the very first load
        if (initialized.current) {
          if (row && prevLiveId.current !== row.id) {
            toast({ title: "LIVE NOW", description: <Link to={`/videos/${row.id}`}>Watch: {row.title}</Link> });
          }
        }
        setLive(row ? { id: row.id, title: row.title } : null);
        prevLiveId.current = row ? row.id : null;
        initialized.current = true;
      }
    };

    load();

    // Realtime subscription
    const channel = supabase
      .channel("public:live_streams")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        (payload) => {
          console.debug("LiveIndicator realtime payload:", payload);
          const rec = payload.new ?? payload.old;
          if (!rec) return;
          if (rec.status === "live") {
            // avoid duplicate toasts for same live id
            if (prevLiveId.current !== rec.id) {
              toast({ title: "LIVE NOW", description: <Link to={`/videos/${rec.id}`}>Watch: {rec.title}</Link> });
            }
            setLive({ id: rec.id, title: rec.title });
            prevLiveId.current = rec.id;
          } else {
            if (rec.status === "ended" || rec.status === "scheduled") {
              setLive(null);
              prevLiveId.current = null;
            }
          }
        }
      )
      .subscribe();

    // Polling fallback: refetch every 8 seconds in case realtime isn't firing
    const poll = setInterval(() => {
      void load();
    }, 8000);

    return () => {
      mounted = false;
      clearInterval(poll);
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
