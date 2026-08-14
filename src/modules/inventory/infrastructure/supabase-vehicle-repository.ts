import { supabase } from "@/shared/infrastructure/supabase-client";
import type { FuelType, Transmission, Vehicle } from "@/modules/inventory/domain/vehicle";

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
    photos: row.photos,
    sold: row.sold,
  };
}

export function toVehicleRow(vehicle: Omit<Vehicle, "sold"> & { sold?: boolean }): Omit<VehicleRow, "sold"> & {
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

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as VehicleRow[]).map(toVehicle);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? toVehicle(data as VehicleRow) : null;
}
