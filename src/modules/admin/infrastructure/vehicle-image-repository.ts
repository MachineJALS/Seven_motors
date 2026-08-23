import { supabase } from "@/shared/infrastructure/supabase-client";
import type { VehicleImage } from "@/modules/inventory/domain/vehicle";
import {
  toVehicleImage,
  type VehicleImageRow,
} from "@/modules/inventory/infrastructure/supabase-vehicle-repository";

const BUCKET = "vehicle-photos";

/**
 * sequenceNumber names the Storage file (vehicle-photos/<vehicleId>/<n>.ext)
 * and seeds the initial sort_order. The two are only linked at upload time
 * -- reordering afterward only ever updates sort_order, never renames the
 * Storage object, so reordering stays a cheap DB-only operation.
 */
export async function uploadVehicleImage(input: {
  vehicleId: string;
  file: File;
  sequenceNumber: number;
  altText: string;
}): Promise<VehicleImage> {
  const ext = input.file.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${input.vehicleId}/${input.sequenceNumber}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, input.file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("vehicle_images")
    .insert({
      vehicle_id: input.vehicleId,
      storage_path: storagePath,
      alt_text: input.altText,
      sort_order: input.sequenceNumber,
    })
    .select()
    .single();
  if (error) throw error;

  return toVehicleImage(data as VehicleImageRow);
}

export async function deleteVehicleImage(image: VehicleImage): Promise<void> {
  // Storage first: a failure here leaves everything unchanged. If the DB
  // delete below fails after a successful Storage delete, the leftover row
  // just points at a missing file (harmless, cleaned up on next load
  // attempt) rather than a dangling reference to an orphaned file.
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([image.storagePath]);
  if (storageError) throw storageError;

  const { error } = await supabase.from("vehicle_images").delete().eq("id", image.id);
  if (error) throw error;
}

export async function updateVehicleImageAltText(id: string, altText: string): Promise<void> {
  const { error } = await supabase.from("vehicle_images").update({ alt_text: altText }).eq("id", id);
  if (error) throw error;
}

export async function reorderVehicleImages(images: VehicleImage[]): Promise<void> {
  const results = await Promise.all(
    images.map((image, index) => supabase.from("vehicle_images").update({ sort_order: index }).eq("id", image.id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}
