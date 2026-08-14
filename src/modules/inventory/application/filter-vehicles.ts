import type { FuelType, Vehicle } from "@/modules/inventory/domain/vehicle";

export interface VehicleFilters {
  brand: string;
  maxPrice: string;
  yearFrom: string;
  fuelType: string;
}

export const emptyFilters: VehicleFilters = {
  brand: "",
  maxPrice: "",
  yearFrom: "",
  fuelType: "",
};

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (filters.brand && vehicle.brand !== filters.brand) return false;
    if (filters.maxPrice && vehicle.price > Number(filters.maxPrice)) return false;
    if (filters.yearFrom && vehicle.year < Number(filters.yearFrom)) return false;
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType) return false;
    return true;
  });
}

export function listBrands(vehicles: Vehicle[]): string[] {
  return Array.from(new Set(vehicles.map((v) => v.brand))).sort();
}

export function listFuelTypes(vehicles: Vehicle[]): FuelType[] {
  return Array.from(new Set(vehicles.map((v) => v.fuelType))).sort() as FuelType[];
}
