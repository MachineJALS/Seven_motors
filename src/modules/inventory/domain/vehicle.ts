export type FuelType = "gasoline" | "diesel" | "hybrid" | "electric";
export type Transmission = "automatic" | "manual";

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
  photos: string[];
  sold?: boolean;
}
