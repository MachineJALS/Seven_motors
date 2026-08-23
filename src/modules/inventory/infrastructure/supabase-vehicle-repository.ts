import { supabase } from "@/shared/infrastructure/supabase-client";
import type { FuelType, Transmission, Vehicle, VehicleImage } from "@/modules/inventory/domain/vehicle";

const PHOTOS_BUCKET = "vehicle-photos";

export interface VehicleImageRow {
  id: string;
  vehicle_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
}

export function toVehicleImage(row: VehicleImageRow): VehicleImage {
  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(row.storage_path);
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    storagePath: row.storage_path,
    url: data.publicUrl,
    altText: row.alt_text,
    sortOrder: row.sort_order,
  };
}

export interface VehicleRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  price_crc: number;
  mileage_km: number;
  fuel_type: FuelType;
  transmission: Transmission;
  color: string;
  description: string;
  photos: string[];
  sold: boolean;
  vehicle_images?: VehicleImageRow[];
}

export function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    price: row.price_crc,
    mileage: row.mileage_km,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    color: row.color,
    description: row.description,
    images: (row.vehicle_images ?? [])
      .map(toVehicleImage)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    photos: row.photos,
    sold: row.sold,
  };
}

export function toVehicleRow(vehicle: Omit<Vehicle, "sold" | "images"> & { sold?: boolean }): Omit<
  VehicleRow,
  "sold" | "vehicle_images"
> & {
  sold?: boolean;
} {
  return {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    price_crc: vehicle.price,
    mileage_km: vehicle.mileage,
    fuel_type: vehicle.fuelType,
    transmission: vehicle.transmission,
    color: vehicle.color,
    description: vehicle.description,
    photos: vehicle.photos,
    sold: vehicle.sold,
  };
}

const VEHICLE_SELECT = "*, vehicle_images(*)";

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as VehicleRow[]).map(toVehicle);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const { data, error } = await supabase.from("vehicles").select(VEHICLE_SELECT).eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? toVehicle(data as VehicleRow) : null;
}
