import type { Vehicle } from "@/modules/inventory/domain/vehicle";

export interface DisplayPhoto {
  url: string;
  alt: string;
}

/**
 * Compatibility strategy (.claude/specs/vehicle-image-management/spec.md,
 * "Data migration strategy"): prefer the managed `images` (already ordered
 * by sortOrder), falling back to the legacy `photos` URLs for vehicles not
 * yet re-uploaded through the image manager. Centralized here so
 * VehicleCard and VehicleDetailPage don't each re-implement the fallback.
 */
export function resolveVehiclePhotos(vehicle: Vehicle): DisplayPhoto[] {
  if (vehicle.images.length > 0) {
    return vehicle.images.map((image) => ({
      url: image.url,
      alt: image.altText || `${vehicle.brand} ${vehicle.model}`,
    }));
  }

  return vehicle.photos.map((url) => ({ url, alt: `${vehicle.brand} ${vehicle.model}` }));
}
