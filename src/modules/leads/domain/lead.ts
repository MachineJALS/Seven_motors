/**
 * Modeled ahead of persistence: today every lead is a WhatsApp click with no
 * record kept. This shape is what Phase 2 will actually store (see
 * docs/migration-plan.md) once the contact form / WhatsApp click writes to
 * Supabase instead of just opening wa.me.
 */
export type LeadSource = "whatsapp-header" | "whatsapp-vehicle-inquiry";

export interface Lead {
  id: string;
  source: LeadSource;
  vehicleId?: string;
  message: string;
  createdAt: string;
}
