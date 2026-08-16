import { supabase } from "@/shared/infrastructure/supabase-client";
import type { Lead } from "@/modules/leads/domain/lead";
import { toLead, type LeadRow } from "@/modules/leads/infrastructure/supabase-lead-repository";

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data as LeadRow[]).map(toLead);
}
