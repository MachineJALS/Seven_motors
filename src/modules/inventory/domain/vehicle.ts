export type FuelType = "gasoline" | "diesel" | "hybrid" | "electric";
export type Transmission = "automatic" | "manual";

/**
 * A managed image (Supabase Storage-backed), from the new vehicle_images
 * table. sortOrder 0 (the lowest) is the primary/cover image — there is no
 * separate isPrimary flag, to avoid two sources of truth for the same fact.
 */
export interface VehicleImage {
  id: string;
  vehicleId: string;
  storagePath: string;
  url: string;
  altText: string;
  sortOrder: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // in CRC (Costa Rican colones)
  mileage: number; // in km
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  description: string;
  /** Managed photos (vehicle_images table). Empty until re-uploaded through the admin image manager. */
  images: VehicleImage[];
  /** @deprecated legacy manual-URL photos; kept as a fallback until every vehicle has `images`, see .claude/specs/vehicle-image-management/spec.md */
  photos: string[];
  sold?: boolean;
}
