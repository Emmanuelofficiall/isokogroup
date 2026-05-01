import { supabase } from "@/integrations/supabase/client";

export type ShippingZone = "local" | "regional" | "national";

export type ShippingRate = {
  id: string;
  zone: string;
  min_weight_kg: number;
  max_weight_kg: number;
  base_cost: number;
  per_kg_cost: number;
  per_km_cost: number;
};

export type CalcInput = {
  zone: ShippingZone;
  weight_kg: number;
  distance_km: number;
};

export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const { data, error } = await (supabase as any)
    .from("shipping_rates")
    .select("*")
    .eq("active", true);
  if (error) throw error;
  return (data ?? []) as ShippingRate[];
}

export function calculateShippingCost(
  rates: ShippingRate[],
  { zone, weight_kg, distance_km }: CalcInput
): { total: number; rate: ShippingRate | null; breakdown: { base: number; weight: number; distance: number } } {
  const match = rates.find(
    (r) =>
      r.zone === zone &&
      weight_kg >= Number(r.min_weight_kg) &&
      weight_kg < Number(r.max_weight_kg)
  );
  if (!match) return { total: 0, rate: null, breakdown: { base: 0, weight: 0, distance: 0 } };
  const base = Number(match.base_cost);
  const weight = Math.ceil(weight_kg) * Number(match.per_kg_cost);
  const distance = Math.ceil(distance_km) * Number(match.per_km_cost);
  return { total: base + weight + distance, rate: match, breakdown: { base, weight, distance } };
}
