import { supabase } from "@/shared/infrastructure/supabase-client";
import type { Vehicle } from "@/modules/inventory/domain/vehicle";
import { toVehicle, toVehicleRow, type VehicleRow } from "@/modules/inventory/infrastructure/supabase-vehicle-repository";

export async function createVehicle(input: Vehicle): Promise<Vehicle> {
  const { data, error } = await supabase.from("vehicles").insert(toVehicleRow(input)).select().single();
  if (error) throw error;
  return toVehicle(data as VehicleRow);
}

export async function updateVehicle(id: string, input: Vehicle): Promise<Vehicle> {
  const { data, error } = await supabase
    .from("vehicles")
    .update(toVehicleRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toVehicle(data as VehicleRow);
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}
