import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2.95.0/cors";
import { jsPDF } from "npm:jspdf@2.5.2";

type Body = {
  type: "label" | "packing_slip" | "invoice";
  order_id: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Verify caller
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.order_id || !body?.type) {
      return new Response(JSON.stringify({ error: "Missing order_id or type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders").select("*").eq("id", body.order_id).maybeSingle();
    if (orderErr || !order) throw new Error("Order not found");

    // Authorization: buyer, seller, or admin
    const isBuyer = order.buyer_id === userRes.user.id;
    const isSeller = order.seller_id === userRes.user.id;
    const { data: roleRow } = await supabase
      .from("user_roles").select("role").eq("user_id", userRes.user.id).eq("role", "admin").maybeSingle();
    const isAdmin = !!roleRow;
    if (!isBuyer && !isSeller && !isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: items }, { data: pkg }, { data: shipment }, { data: buyerProfile }, { data: sellerProfile }] = await Promise.all([
      supabase.from("order_items").select("*, products(name)").eq("order_id", order.id),
      supabase.from("packages").select("*").eq("order_id", order.id).maybeSingle(),
      supabase.from("shipments").select("*").eq("order_id", order.id).maybeSingle(),
      supabase.from("profiles").select("full_name, phone").eq("user_id", order.buyer_id).maybeSingle(),
      supabase.from("profiles").select("full_name, business_name, phone").eq("user_id", order.seller_id).maybeSingle(),
    ]);

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    let y = 50;

    const heading = body.type === "label" ? "SHIPPING LABEL" : body.type === "packing_slip" ? "PACKING SLIP" : "INVOICE";
    doc.setFontSize(20); doc.setFont("helvetica", "bold");
    doc.text("ISOKO GROUP", 40, y); y += 22;
    doc.setFontSize(14); doc.text(heading, 40, y); y += 24;

    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Order: #${String(order.id).slice(0, 8)}`, 40, y);
    doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, W - 220, y);
    y += 14;
    if (shipment?.tracking_number) {
      doc.text(`Tracking: ${shipment.tracking_number}`, 40, y); y += 14;
    }
    if (pkg?.barcode) { doc.text(`Barcode: ${pkg.barcode}`, 40, y); y += 14; }
    y += 6;

    // Parties
    doc.setFont("helvetica", "bold"); doc.text("Ship From", 40, y); doc.text("Ship To", W / 2, y); y += 14;
    doc.setFont("helvetica", "normal");
    const sellerLines = [
      sellerProfile?.business_name || "Seller",
      sellerProfile?.full_name || "",
      sellerProfile?.phone || "",
    ].filter(Boolean);
    const buyerLines = [
      buyerProfile?.full_name || "Buyer",
      buyerProfile?.phone || "",
      order.shipping_address || "",
    ].filter(Boolean);
    const maxLines = Math.max(sellerLines.length, buyerLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (sellerLines[i]) doc.text(String(sellerLines[i]).slice(0, 60), 40, y);
      if (buyerLines[i]) doc.text(String(buyerLines[i]).slice(0, 60), W / 2, y);
      y += 13;
    }
    y += 10;

    if (body.type === "label") {
      // Big tracking + barcode-style block
      doc.setDrawColor(0); doc.rect(40, y, W - 80, 120);
      doc.setFontSize(28); doc.setFont("helvetica", "bold");
      doc.text(shipment?.tracking_number || "NO-TRACKING", W / 2, y + 50, { align: "center" });
      doc.setFontSize(11); doc.setFont("helvetica", "normal");
      doc.text(`Courier: ${shipment?.courier || "—"}`, 60, y + 80);
      doc.text(`Weight: ${pkg?.weight_kg ?? 0} kg`, W / 2, y + 80);
      doc.text(`Dimensions: ${pkg ? `${pkg.length_cm}×${pkg.width_cm}×${pkg.height_cm} cm` : "—"}`, 60, y + 100);
      doc.text(`Type: ${pkg?.package_type || "—"}`, W / 2, y + 100);
      y += 140;
    }

    if (body.type === "packing_slip" || body.type === "invoice") {
      doc.setFont("helvetica", "bold");
      doc.text("Item", 40, y);
      doc.text("Qty", W - 220, y);
      if (body.type === "invoice") {
        doc.text("Unit", W - 160, y);
        doc.text("Total", W - 90, y);
      }
      y += 8;
      doc.line(40, y, W - 40, y); y += 14;
      doc.setFont("helvetica", "normal");
      let grand = 0;
      for (const it of items || []) {
        const name = (it as any).products?.name || "Item";
        doc.text(String(name).slice(0, 50), 40, y);
        doc.text(String(it.quantity), W - 220, y);
        if (body.type === "invoice") {
          doc.text(`${it.unit_price.toLocaleString()} RWF`, W - 160, y);
          const lineTotal = it.unit_price * it.quantity;
          grand += lineTotal;
          doc.text(`${lineTotal.toLocaleString()} RWF`, W - 90, y);
        }
        y += 16;
        if (y > 760) { doc.addPage(); y = 50; }
      }
      if (body.type === "invoice") {
        y += 6; doc.line(40, y, W - 40, y); y += 18;
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL", W - 220, y);
        doc.text(`${(order.total_amount || grand).toLocaleString()} RWF`, W - 90, y);
        y += 24;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.text(`Payment: ${order.payment_status} (${order.payment_method || "—"})`, 40, y);
      }
    }

    const pdfBytes = doc.output("arraybuffer");
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${body.type}-${String(order.id).slice(0, 8)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("generate-pdf error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
