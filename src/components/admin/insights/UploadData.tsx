import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Trash2, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/lib/auth";

const parseCSV = (text: string) => {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const cells = l.split(",");
    const row: any = {};
    headers.forEach((h, i) => (row[h] = cells[i]?.trim() ?? ""));
    return row;
  });
};

const UploadData = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [datasetType, setDatasetType] = useState("sales");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [manualJson, setManualJson] = useState("");

  const load = async () => {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, business_name"),
      (supabase as any).from("business_datasets").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setProfiles(p || []);
    setDatasets(d || []);
  };
  useEffect(() => { load(); }, []);

  const save = async (payload: any, source: string) => {
    if (!businessId) { toast.error("Pick a business"); return; }
    const { error } = await (supabase as any).from("business_datasets").insert({
      business_id: businessId, dataset_type: datasetType, source, payload,
      period_start: periodStart || null, period_end: periodEnd || null, uploaded_by: user?.id,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Dataset uploaded");
    load();
  };

  const onCsv = async (file: File) => {
    const text = await file.text();
    const rows = parseCSV(text);
    save({ rows, fileName: file.name, count: rows.length }, "csv");
  };

  const onManual = () => {
    try {
      const data = manualJson.trim() ? JSON.parse(manualJson) : {};
      save(data, "manual");
      setManualJson("");
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const remove = async (id: string) => {
    await (supabase as any).from("business_datasets").delete().eq("id", id);
    load();
  };

  const businessLabel = (id: string) => {
    const p = profiles.find((x) => x.user_id === id);
    return p?.business_name || p?.full_name || id.slice(0, 8);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Business Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <Label>Business</Label>
              <Select value={businessId} onValueChange={setBusinessId}>
                <SelectTrigger><SelectValue placeholder="Choose business…" /></SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.user_id} value={p.user_id}>{p.business_name || p.full_name || p.user_id.slice(0, 8)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dataset type</Label>
              <Select value={datasetType} onValueChange={setDatasetType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">From</Label><Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></div>
              <div><Label className="text-xs">To</Label><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-dashed border-border rounded-lg p-4">
              <Label className="flex items-center gap-2 mb-2"><FileSpreadsheet className="h-4 w-4" /> Upload CSV</Label>
              <Input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onCsv(e.target.files[0])} />
              <p className="text-xs text-muted-foreground mt-1">First row = headers</p>
            </div>
            <div className="border border-dashed border-border rounded-lg p-4">
              <Label className="mb-2 block">Manual entry (JSON)</Label>
              <Textarea rows={3} placeholder='{"sales": 120000, "orders": 45}' value={manualJson} onChange={(e) => setManualJson(e.target.value)} />
              <Button size="sm" className="mt-2" onClick={onManual}>Save manual data</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Uploads ({datasets.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {datasets.length === 0 && <p className="text-sm text-muted-foreground">No datasets yet.</p>}
          {datasets.map((d) => (
            <div key={d.id} className="flex items-center justify-between border border-border rounded-lg p-3 text-sm">
              <div>
                <p className="font-medium">{businessLabel(d.business_id)} · {d.dataset_type}</p>
                <p className="text-xs text-muted-foreground">{d.source} · {new Date(d.created_at).toLocaleString()}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadData;
