import { supabase } from "@/shared/infrastructure/supabase-client";
import type { Lead, LeadSource } from "@/modules/leads/domain/lead";

export async function recordLead(input: {
  source: LeadSource;
  vehicleId?: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from("leads").insert({
    source: input.source,
    vehicle_id: input.vehicleId ?? null,
    message: input.message,
  });

  // Fire-and-forget from the visitor's point of view: a logging failure
  // must never block or visibly affect the WhatsApp redirect.
  if (error) console.error("Failed to record lead:", error.message);
}

export interface LeadRow {
  id: string;
  source: LeadSource;
  vehicle_id: string | null;
  message: string;
  created_at: string;
}

export function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    source: row.source,
    vehicleId: row.vehicle_id ?? undefined,
    message: row.message,
    createdAt: row.created_at,
  };
}
